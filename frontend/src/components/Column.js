import React from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card';

const Column = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="column">
      <h3>{title}</h3>
      <SortableContext id={id} items={tasks.map((task) => task.id)}>
        {tasks.map((task) => (
          <Card
            key={task.id}
            id={task.id}
            title={task.title}
            priority={task.priority}
          />
        ))}
      </SortableContext>
    </div>
  );
};

export default Column;