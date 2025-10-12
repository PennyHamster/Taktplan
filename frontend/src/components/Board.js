import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Column from './Column';
import TaskForm from './TaskForm';

const Board = () => {
  const [tasks, setTasks] = useState({
    inProgress: [],
    done: [],
    later: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          if (task.status === 'in_progress') {
            newTasks.inProgress.push(task);
          } else if (task.status === 'done') {
            newTasks.done.push(task);
          } else {
            newTasks.later.push(task);
          }
        });
        setTasks(newTasks);
      })
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((prevTasks) => {
      const newTasks = JSON.parse(JSON.stringify(prevTasks));
      const findColumn = (taskId) => {
        for (const col in newTasks) {
          if (newTasks[col].find((task) => task.id === taskId)) {
            return col;
          }
        }
        return null;
      };

      const activeColumnKey = findColumn(activeId);
      const overColumnKey = findColumn(overId) || overId;

      if (!activeColumnKey || !overColumnKey) return prevTasks;

      const activeItems = newTasks[activeColumnKey];
      const overItems = newTasks[overColumnKey];
      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      const overIndex = overItems ? overItems.findIndex((t) => t.id === overId) : -1;

      const [movedTask] = activeItems.splice(activeIndex, 1);
      movedTask.status = overColumnKey === 'inProgress' ? 'in_progress' : overColumnKey;

      if (activeColumnKey === overColumnKey) {
        activeItems.splice(overIndex, 0, movedTask);
      } else {
        if (overItems) {
          overItems.splice(overIndex > -1 ? overIndex : overItems.length, 0, movedTask);
        } else {
          newTasks[overColumnKey] = [movedTask];
        }
      }

      fetch(`/api/tasks/${activeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: movedTask.status }),
      }).catch((error) => console.error('Error updating task:', error));

      return newTasks;
    });
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveTask = (taskData) => {
    fetch(`/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
      .then((response) => response.json())
      .then((newTask) => {
        setTasks((prevTasks) => {
          const newTasksState = { ...prevTasks };
          const statusKey =
            newTask.status === 'in_progress' ? 'inProgress' : newTask.status;
          if (newTasksState[statusKey]) {
            newTasksState[statusKey] = [
              ...newTasksState[statusKey],
              newTask,
            ];
          }
          return newTasksState;
        });
        handleCloseModal();
      })
      .catch((error) => console.error('Error creating task:', error));
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="board-container">
        <button className="new-task-button" onClick={handleOpenModal}>
          + Neue Aufgabe
        </button>
        {isModalOpen && (
          <TaskForm onSave={handleSaveTask} onCancel={handleCloseModal} />
        )}
        <div className="board">
          <Column id="inProgress" title="In Bearbeitung" tasks={tasks.inProgress} />
          <Column id="done" title="Erledigt" tasks={tasks.done} />
          <Column id="later" title="Später" tasks={tasks.later} />
        </div>
      </div>
    </DndContext>
  );
};

export default Board;