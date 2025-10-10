import React from 'react';
import { useDrop } from 'react-dnd';
import { ColumnContainer, ColumnTitle } from './Column.styles';
import TaskCard from './TaskCard';

const ItemTypes = {
  CARD: 'card',
};

const Column = ({ title, tasks, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item) => onDrop(item.id, title),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <ColumnContainer ref={drop} style={{ backgroundColor: isOver ? '#e6f7ff' : '#f4f4f4' }}>
      <ColumnTitle>{title}</ColumnTitle>
      {tasks && tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </ColumnContainer>
  );
};

export default Column;