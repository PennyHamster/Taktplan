import React, { useState, useEffect } from 'react';
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveTask = (taskData) => {
    fetch(`/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })
      .then((response) => response.json())
      .then((newTask) => {
        setTasks((prevTasks) => {
          const newTasksState = { ...prevTasks };
          if (newTask.status === 'in_progress') {
            newTasksState.inProgress = [...newTasksState.inProgress, newTask];
          } else if (newTask.status === 'done') {
            newTasksState.done = [...newTasksState.done, newTask];
          } else {
            newTasksState.later = [...newTasksState.later, newTask];
          }
          return newTasksState;
        });
        handleCloseModal();
      })
      .catch((error) => console.error('Error creating task:', error));
  };

  return (
    <div className="board-container">
      <button className="new-task-button" onClick={handleOpenModal}>
        + Neue Aufgabe
      </button>
      {isModalOpen && (
        <TaskForm onSave={handleSaveTask} onCancel={handleCloseModal} />
      )}
      <div className="board">
        <Column title="In Bearbeitung" tasks={tasks.inProgress} />
        <Column title="Erledigt" tasks={tasks.done} />
        <Column title="Später" tasks={tasks.later} />
      </div>
    </div>
  );
};

export default Board;