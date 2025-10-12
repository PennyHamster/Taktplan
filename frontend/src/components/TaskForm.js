import React, { useState, useEffect } from 'react';

const TaskForm = ({ onSave, onCancel, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: task ? task.id : undefined, title, description, priority });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Priorität</label>
            <select
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="button-primary">
              Speichern
            </button>
            <button type="button" onClick={onCancel}>
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;