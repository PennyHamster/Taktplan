import React from 'react';
import Column from './Column';

const Board = () => {
  const tasks = {
    inProgress: [
      { id: 1, title: 'UI für Kanban-Board erstellen', priority: 'Hoch' },
      { id: 2, title: 'API-Endpunkt für Tasks hinzufügen', priority: 'Mittel' },
    ],
    done: [
      { id: 3, title: 'Projekt initialisieren', priority: 'Hoch' },
      { id: 4, title: 'Datenbank-Schema entwerfen', priority: 'Niedrig' },
    ],
    later: [
      { id: 5, title: 'Authentifizierung implementieren', priority: 'Mittel' },
    ],
  };

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