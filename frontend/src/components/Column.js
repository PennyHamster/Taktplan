import React from 'react';
import Card from './Card';

const Column = ({ title, tasks }) => {
  return (
    <div className="column">
      <h3>{title}</h3>
      {tasks.map(task => (
        <Card key={task.id} title={task.title} priority={task.priority} />
      ))}
    </div>
  );
};

export default Column;