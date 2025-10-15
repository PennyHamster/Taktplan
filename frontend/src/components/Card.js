import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Card = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="card">
      <div className="card-header" {...attributes} {...listeners}>
        <h4>{task.title}</h4>
        <div className="card-actions">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="icon-button"
          >
            ✏️
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="icon-button"
          >
            🗑️
          </button>
        </div>
      </div>
      <p>{task.description}</p>
      <div className="card-footer">
        <p>Priority: {task.priority}</p>
        {task.assignee && <p className="assignee"> zugewiesen an: {task.assignee.email}</p>}
      </div>
    </div>
  );
};

export default Card;