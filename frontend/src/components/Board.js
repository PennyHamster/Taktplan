import React, { useState, useEffect } from 'react';
import Column from './Column';

const Board = () => {
  const [tasks, setTasks] = useState({
    inProgress: [],
    done: [],
    later: [],
  });

  useEffect(() => {
    fetch('/api/tasks')
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

  return (
    <div className="board-container">
      <button className="new-task-button">+ Neue Aufgabe</button>
      <div className="board">
        <Column title="In Bearbeitung" tasks={tasks.inProgress} />
        <Column title="Erledigt" tasks={tasks.done} />
        <Column title="Später" tasks={tasks.later} />
      </div>
    </div>
  );
};

export default Board;