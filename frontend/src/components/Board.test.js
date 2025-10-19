import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { jwtDecode } from 'jwt-decode';
import Board from './Board';
import { getTasks, getMyTasks, updateTask, deleteTask, getUsers } from '../api';

// Mock the api and jwt-decode modules
jest.mock('../api');
jest.mock('jwt-decode');

const mockAllTasks = [
  { id: 1, title: 'All Task 1', status: 'in_progress' },
  { id: 2, title: 'All Task 2', status: 'done' },
];

const mockMyTasks = [
  { id: 1, title: 'My Task 1', status: 'in_progress' },
  { id: 3, title: 'My Task 3', status: 'later' },
];

const mockUsers = [{ id: 1, email: 'manager@test.com' }];

const setupMocks = (role) => {
  // Reset mocks before each test
  jest.clearAllMocks();

  // Mock token decoding
  jwtDecode.mockReturnValue({ role });
  localStorage.setItem('token', 'fake-token');

  // Mock API calls
  getTasks.mockResolvedValue(mockAllTasks);
  getMyTasks.mockResolvedValue(mockMyTasks);
  getUsers.mockResolvedValue(mockUsers);
  deleteTask.mockResolvedValue(null);
  updateTask.mockResolvedValue({});
};

describe('Board for all roles', () => {
  test('fetches tasks for manager', async () => {
    setupMocks('manager');
    render(<MemoryRouter><Board /></MemoryRouter>);

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('All Task 1')).toBeInTheDocument();
      expect(screen.getByText('All Task 2')).toBeInTheDocument();
    });
  });

  test('fetches tasks for employee', async () => {
    setupMocks('employee');
    render(<MemoryRouter><Board /></MemoryRouter>);

    await waitFor(() => {
      expect(getMyTasks).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('My Task 1')).toBeInTheDocument();
      expect(screen.getByText('My Task 3')).toBeInTheDocument();
    });
  });
});

describe('General Board functionality', () => {
  beforeEach(() => {
    // Default to employee for general tests
    setupMocks('employee');
  });

  test('deletes a task when delete button is clicked and confirmed', async () => {
    window.confirm = jest.fn(() => true);
    render(<MemoryRouter><Board /></MemoryRouter>);

    // Wait for the task to be visible
    await screen.findByText('My Task 1');

    // After deletion, getMyTasks will be called again and return an empty array
    getMyTasks.mockResolvedValue([]);

    // Find the delete button for "Task 1"
    const taskTitle = screen.getByText('My Task 1');
    const deleteButton = taskTitle.closest('.card').querySelector('button.icon-button:last-child');
    fireEvent.click(deleteButton);

    // Check that confirmation was requested
    expect(window.confirm).toHaveBeenCalledWith('Bist du sicher?');

    // Check that the deleteTask API was called
    expect(deleteTask).toHaveBeenCalledWith(1);

    await waitFor(() => {
      // Task should be removed from the UI
      expect(screen.queryByText('My Task 1')).not.toBeInTheDocument();
    });
  });
});