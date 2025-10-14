import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Test 1: Unauthenticated user should be redirected to the login page
  test('renders Login page for unauthenticated users', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    // The Board should not be visible
    expect(screen.queryByText(/In Bearbeitung/i)).not.toBeInTheDocument();
    // The Login page should be visible
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  // Test 2: Authenticated user should see the board
  test('renders Board component for authenticated users', () => {
    // Set a mock token
    localStorage.setItem('token', 'fake-jwt-token');

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // The Board should be visible
    const boardElement = screen.getByText(/In Bearbeitung/i);
    expect(boardElement).toBeInTheDocument();

    // The Login page should not be visible
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });
});