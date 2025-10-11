import React from 'react';

const Card = ({ title, priority }) => {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p>Priority: {priority}</p>
    </div>
  );
};

export default Card;