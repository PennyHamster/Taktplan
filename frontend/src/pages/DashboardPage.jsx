import React, { useState } from 'react';
import {
  DashboardContainer,
  Header,
  Title,
  NewTaskButton,
  Board
} from './DashboardPage.styles';
import Column from '../components/Column';
import TaskModal from '../components/TaskModal';

const initialTasks = {
  'In Bearbeitung': [
    { id: '1', title: 'Design the new landing page', priority: 1 },
    { id: '2', title: 'Develop the user authentication', priority: 1 },
  ],
  'Erledigt': [
    { id: '3', title: 'Fix the bug in the payment gateway', priority: 2 },
  ],
  'Später': [
    { id: '4', title: 'Implement the new notification system', priority: 3 },
  ],
};

const DashboardPage = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSaveTask = () => {
    // Logic to save the task will be added here
    setShowModal(false);
  };

  const handleDrop = (taskId, newStatus) => {
    let task, oldStatus;
    for (const status in tasks) {
      const foundTask = tasks[status].find(t => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        oldStatus = status;
        break;
      }
    }

    if (task && oldStatus !== newStatus) {
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        newTasks[oldStatus] = newTasks[oldStatus].filter(t => t.id !== taskId);
        newTasks[newStatus] = [...newTasks[newStatus], task];
        return newTasks;
      });
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Task Board</Title>
        <NewTaskButton onClick={handleOpenModal}>New Task</NewTaskButton>
      </Header>
      <Board>
        {Object.keys(tasks).map(status => (
          <Column
            key={status}
            title={status}
            tasks={tasks[status]}
            onDrop={handleDrop}
          />
        ))}
      </Board>
      <TaskModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveTask}
      />
    </DashboardContainer>
  );
};

export default DashboardPage;