import React from 'react';
import { useDrag } from 'react-dnd';
import { CardContainer, CardTitle, PriorityIndicator } from './TaskCard.styles';

const ItemTypes = {
  CARD: 'card',
};

const TaskCard = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <CardContainer ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <CardTitle>{task.title}</CardTitle>
      <PriorityIndicator priority={task.priority} />
    </CardContainer>
  );
};

export default TaskCard;