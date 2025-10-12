import React from 'react';
import { SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card';

const Column = ({ id, title, tasks, onEdit, onDelete }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="column">
      <h3>{title}</h3>
      <SortableContext id={id} items={tasks.map((task) => task.id)}>
        {tasks.map((task) => (
          <Card
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </div>
  );
};

export default Column;