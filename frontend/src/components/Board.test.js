import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from './Board';

// Mock fetch
global.fetch = jest.fn();

const mockTasks = [
  { id: 1, title: 'Task 1', description: 'Desc 1', priority: 1, status: 'in_progress' },
  { id: 2, title: 'Task 2', description: 'Desc 2', priority: 2, status: 'done' },
];

beforeEach(() => {
  fetch.mockClear();
});

test('renders board and fetches tasks', async () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve(mockTasks),
  });

  render(<Board />);

  expect(fetch).toHaveBeenCalledWith('/api/tasks');
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});

test('opens edit modal with task data when edit button is clicked', async () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve(mockTasks),
  });

  render(<Board />);

  await waitFor(() => {
    // Find the edit button for "Task 1"
    const editButton = screen.getAllByText('✏️')[0];
    fireEvent.click(editButton);
  });

  await waitFor(() => {
    expect(screen.getByText('Aufgabe bearbeiten')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Task 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });
});

test('deletes a task when delete button is clicked and confirmed', async () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve(mockTasks),
  });
  // For the DELETE request
  fetch.mockResolvedValueOnce({ ok: true });

  window.confirm = jest.fn(() => true);

  render(<Board />);

  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  const deleteButton = screen.getAllByText('🗑️')[0];
  fireEvent.click(deleteButton);

  expect(window.confirm).toHaveBeenCalledWith('Bist du sicher?');
  expect(fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });

  await waitFor(() => {
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });
});