import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from './Board';
import { getTasks, updateTask, deleteTask } from '../api';

// Mock the api module
jest.mock('../api');

const mockTasks = [
  { id: 1, title: 'Task 1', description: 'Desc 1', priority: 1, status: 'in_progress' },
  { id: 2, title: 'Task 2', description: 'Desc 2', priority: 2, status: 'done' },
];

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  // Mock the implementation of getTasks for each test
  getTasks.mockResolvedValue(mockTasks);
});

test('renders board and fetches tasks', async () => {
  render(<Board />);

  // Check that getTasks was called
  expect(getTasks).toHaveBeenCalledTimes(1);

  // Wait for the tasks to be rendered
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});

test('opens edit modal with task data when edit button is clicked', async () => {
  render(<Board />);

  // Wait for tasks to appear
  await screen.findByText('Task 1');

  // Find the edit button for "Task 1"
  // Note: The Card component which renders the button is not shown, assuming it has a unique way to be identified.
  // We will assume the Card for Task 1 is rendered and contains an edit button.
  // This part of the test might need adjustment if the Card component structure is different.
  // For now, let's assume there's an edit button associated with "Task 1".
  // A better approach would be to add a test-id to the button.
  const cardElement = screen.getByText('Task 1').closest('.card');
  const editButton = cardElement.querySelector('button.edit-btn'); // Assuming a class name

  // If the button isn't found, this test will fail here.
  // This is a common issue when tests are not co-designed with components.
  // For this exercise, we'll assume the button exists and can be clicked.
  // Since the original test was looking for '✏️', let's assume it's there.
  // The Card component must be rendering this. Let's find it.
  const editButtons = await screen.findAllByText('✏️');
  fireEvent.click(editButtons[0]);

  // Check if the modal opens with the correct data
  await waitFor(() => {
    expect(screen.getByText('Aufgabe bearbeiten')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Task 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });
});

test('deletes a task when delete button is clicked and confirmed', async () => {
  // Mock for the DELETE request
  deleteTask.mockResolvedValue(null);
  window.confirm = jest.fn(() => true);

  render(<Board />);

  // Wait for the task to be visible
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  // Find the delete button for "Task 1"
  const deleteButtons = screen.getAllByText('🗑️');
  fireEvent.click(deleteButtons[0]);

  // Check that confirmation was requested
  expect(window.confirm).toHaveBeenCalledWith('Bist du sicher?');

  // Check that the deleteTask API was called
  expect(deleteTask).toHaveBeenCalledWith(1);

  // Wait for the task to be removed from the UI
  await waitFor(() => {
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });
});