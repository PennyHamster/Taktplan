import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { jwtDecode } from 'jwt-decode';
import Column from './Column';
import Card from './Card';
import TaskForm from './TaskForm';
import { getTasks, getMyTasks, updateTask, createTask, deleteTask as apiDeleteTask, getUsers } from '../api';

const Board = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ inProgress: [], done: [], later: [] });
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const enrichTasksWithAssignee = (tasks, users) => {
    if (!users.length) return tasks;
    return tasks.map(task => {
      if (task.assigneeId) {
        const assignee = users.find(u => u.id === task.assigneeId);
        return { ...task, assignee: assignee ? { email: assignee.email } : undefined };
      }
      return task;
    });
  };

  const organizeTasks = (tasks) => {
    return tasks.reduce((acc, task) => {
      const statusKey = task.status === 'in_progress' ? 'inProgress' : task.status;
      if (acc[statusKey]) {
        acc[statusKey].push(task);
      }
      return acc;
    }, { inProgress: [], done: [], later: [] });
  };

  const fetchData = useCallback(async (role) => {
    try {
      let fetchedUsers = [];
      if (role === 'manager' || role === 'admin') {
        fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      }

      const fetchedTasks = role === 'manager' || role === 'admin' ? await getTasks() : await getMyTasks();
      const enrichedTasks = enrichTasksWithAssignee(fetchedTasks, fetchedUsers);
      const organizedTasks = organizeTasks(enrichedTasks);
      setTasks(organizedTasks);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message.includes('401')) { // Or any other specific check
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
        fetchData(decodedToken.role);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [fetchData, navigate]);

  const findTask = (taskId) => {
    for (const column of Object.values(tasks)) {
      const task = column.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const findColumnOfTask = (taskId) => {
    for (const columnName in tasks) {
      if (tasks[columnName].some((task) => task.id === taskId)) {
        return columnName;
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(findTask(active.id));
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumnOfTask(activeId);
    let overColumn = findColumnOfTask(overId) || (over.id in tasks ? over.id : null);

    if (!activeColumn || !overColumn) return;

    setTasks(prevTasks => {
      const newTasks = JSON.parse(JSON.stringify(prevTasks)); // Deep copy
      const activeItems = newTasks[activeColumn];
      const activeIndex = activeItems.findIndex(t => t.id === activeId);
      const [movedTask] = activeItems.splice(activeIndex, 1);

      if (activeColumn === overColumn) {
        const overIndex = activeItems.findIndex(t => t.id === overId);
        activeItems.splice(overIndex, 0, movedTask);
      } else {
        const overItems = newTasks[overColumn];
        const overIndex = overItems.findIndex(t => t.id === overId);
        if (overIndex !== -1) {
          overItems.splice(overIndex, 0, movedTask);
        } else {
          overItems.push(movedTask); // Drop on column
        }
      }
      return newTasks;
    });

    const newStatus = overColumn === 'inProgress' ? 'in_progress' : overColumn;
    updateTask(activeId, { status: newStatus }).catch(error => {
      console.error('Error updating task status:', error);
      fetchData(userRole); // Re-fetch to revert
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
      .then(() => fetchData(userRole)) // Re-fetch all data to ensure consistency
      .then(() => handleCloseModal())
      .catch((error) => console.error('Error saving task:', error));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Bist du sicher?')) {
      apiDeleteTask(taskId)
        .then(() => fetchData(userRole)) // Re-fetch
        .catch((error) => console.error('Error deleting task:', error));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Taktplan</h1>
            <div>
                {userRole === 'admin' && (
                    <Link to="/admin" className="new-task-button" style={{ marginRight: '10px', textDecoration: 'none' }}>
                        User Management
                    </Link>
                )}
                <button className="new-task-button" onClick={() => handleOpenModal()} style={{ marginRight: '10px' }}>
                  + Neue Aufgabe
                </button>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </header>
        {isModalOpen && (
          <TaskForm
            onSave={handleSaveTask}
            onCancel={handleCloseModal}
            task={editingTask}
            users={users}
            userRole={userRole}
          />
        )}
        <div className="board" style={{paddingTop: '20px'}}>
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
        <DragOverlay>
            {activeTask ? <Card task={activeTask} onEdit={() => {}} onDelete={() => {}} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Board;