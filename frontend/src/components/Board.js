import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { jwtDecode } from 'jwt-decode';
import Column from './Column';
import TaskForm from './TaskForm';
import { getTasks, updateTask, createTask, deleteTask as apiDeleteTask, getUsers } from '../api';


const Board = () => {
  const [tasks, setTasks] = useState({
    inProgress: [],
    done: [],
    later: [],
  });
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [initialLoad, setInitialLoad] = useState({ tasks: false, users: false });

  // Decode token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  // Fetch users if manager
  useEffect(() => {
    if (userRole === 'manager') {
      getUsers()
        .then(data => {
          setUsers(data);
          setInitialLoad(prev => ({ ...prev, users: true }));
        })
        .catch((error) => console.error('Error fetching users:', error));
    } else {
      // If not a manager, we don't need to wait for users
      setInitialLoad(prev => ({ ...prev, users: true }));
    }
  }, [userRole]);

  // Fetch and process tasks
  useEffect(() => {
    getTasks()
      .then((data) => {
        const newTasks = { inProgress: [], done: [], later: [] };
        data.forEach((task) => {
          const statusKey = task.status === 'in_progress' ? 'inProgress' : task.status;
          if (newTasks[statusKey]) {
            newTasks[statusKey].push(task);
          }
        });
        setTasks(newTasks);
        setInitialLoad(prev => ({ ...prev, tasks: true }));
      })
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

  // Enrich tasks with assignee info once all data is loaded
  useEffect(() => {
    if (initialLoad.tasks && initialLoad.users && users.length > 0) {
      const enrichTasks = (taskArray) => {
        return taskArray.map(task => {
          if (task.assigneeId) {
            const assignee = users.find(u => u.id === task.assigneeId);
            if (assignee) {
              return { ...task, assignee: { email: assignee.email } };
            }
          }
          return task;
        });
      };

      setTasks(prevTasks => ({
        inProgress: enrichTasks(prevTasks.inProgress),
        done: enrichTasks(prevTasks.done),
        later: enrichTasks(prevTasks.later),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, users]);

  const findColumnOfTask = (taskId) => {
    for (const columnName in tasks) {
      if (tasks[columnName].some((task) => task.id === taskId)) {
        return columnName;
      }
    }
    return null;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumnOfTask(activeId);
    let overColumn = findColumnOfTask(overId);
    if (!overColumn) {
      // It's a column ID
      overColumn = overId;
    }

    if (!activeColumn || !overColumn) return;

    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      const activeItems = [...newTasks[activeColumn]];
      const [movedTask] = activeItems.splice(
        activeItems.findIndex((task) => task.id === activeId),
        1
      );
      movedTask.status = overColumn === 'inProgress' ? 'in_progress' : overColumn;

      if (activeColumn === overColumn) {
        const overIndex = activeItems.findIndex((task) => task.id === overId);
        activeItems.splice(overIndex, 0, movedTask);
        newTasks[activeColumn] = activeItems;
      } else {
        const overItems = [...(newTasks[overColumn] || [])];
        const overIndex = overItems.findIndex((task) => task.id === overId);
        overItems.splice(overIndex >= 0 ? overIndex : overItems.length, 0, movedTask);
        newTasks[activeColumn] = activeItems;
        newTasks[overColumn] = overItems;
      }

      updateTask(activeId, { status: movedTask.status }).catch((error) => {
        console.error('Error updating task status:', error);
        setTasks(prevTasks); // Revert on error
      });

      return newTasks;
    });
  };

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleSaveTask = (taskData) => {
    const { id, ...data } = taskData;
    const savePromise = id ? updateTask(id, data) : createTask(data);

    savePromise
      .then((savedTask) => {
        // Enrich the saved task with assignee info before updating the state
        if (savedTask.assigneeId && users.length > 0) {
          const assignee = users.find(u => u.id === savedTask.assigneeId);
          if (assignee) {
            savedTask.assignee = { email: assignee.email };
          }
        }

        setTasks((prevTasks) => {
          const newTasks = { ...prevTasks };
          const statusKey = savedTask.status === 'in_progress' ? 'inProgress' : savedTask.status;

          // If updating, remove the old task from its column
          if (id) {
            for (const col in newTasks) {
              newTasks[col] = newTasks[col].filter(task => task.id !== id);
            }
          }

          // Add the new or updated task to the correct column
          if (newTasks[statusKey]) {
            newTasks[statusKey].push(savedTask);
          }

          return newTasks;
        });
        handleCloseModal();
      })
      .catch((error) => console.error('Error saving task:', error));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Bist du sicher?')) {
      apiDeleteTask(taskId)
        .then(() => {
          setTasks((prevTasks) => {
            const newTasks = { ...prevTasks };
            for (const col in newTasks) {
              newTasks[col] = newTasks[col].filter(
                (task) => task.id !== taskId
              );
            }
            return newTasks;
          });
        })
        .catch((error) => console.error('Error deleting task:', error));
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="board-container">
        <button className="new-task-button" onClick={() => handleOpenModal()}>
          + Neue Aufgabe
        </button>
        {isModalOpen && (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={handleCloseModal}
            task={editingTask}
            users={users}
            userRole={userRole}
          />
        )}
        <div className="board">
          <Column
            id="inProgress"
            title="In Bearbeitung"
            tasks={tasks.inProgress}
            onEdit={handleOpenModal}
            onDelete={handleDeleteTask}
          />
          <Column
            id="done"
            title="Erledigt"
            tasks={tasks.done}
            onEdit={handleOpenModal}
            onDelete={handleDeleteTask}
          />
          <Column
            id="later"
            title="Später"
            tasks={tasks.later}
            onEdit={handleOpenModal}
            onDelete={handleDeleteTask}
          />
        </div>
      </div>
    </DndContext>
  );
};

export default Board;