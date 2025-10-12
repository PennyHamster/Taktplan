import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import Column from './Column';
import TaskForm from './TaskForm';

const Board = () => {
  const [tasks, setTasks] = useState({
    inProgress: [],
    done: [],
    later: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetch(`/api/tasks`)
      .then((response) => response.json())
      .then((data) => {
        const newTasks = {
          inProgress: [],
          done: [],
          later: [],
        };
        data.forEach((task) => {
          const statusKey = task.status === 'in_progress' ? 'inProgress' : task.status;
          if (newTasks[statusKey]) {
            newTasks[statusKey].push(task);
          }
        });
        setTasks(newTasks);
      })
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

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

      fetch(`/api/tasks/${activeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: movedTask.status }),
      }).catch((error) => {
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
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/tasks/${id}` : '/api/tasks';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((savedTask) => {
        setTasks((prevTasks) => {
          const newTasks = { ...prevTasks };
          const statusKey = savedTask.status === 'in_progress' ? 'inProgress' : savedTask.status;

          if (method === 'POST') {
            if (newTasks[statusKey]) {
              newTasks[statusKey] = [...newTasks[statusKey], savedTask];
            }
          } else {
            // Remove from old column
            for (const col in newTasks) {
              newTasks[col] = newTasks[col].filter(
                (task) => task.id !== savedTask.id
              );
            }
            // Add to new column
            if (newTasks[statusKey]) {
              newTasks[statusKey].push(savedTask);
            }
          }
          return newTasks;
        });
        handleCloseModal();
      })
      .catch((error) => console.error('Error saving task:', error));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Bist du sicher?')) {
      fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
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