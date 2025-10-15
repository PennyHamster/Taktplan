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
    // The payload is { "role": "manager" }
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoibWFuYWdlciJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    localStorage.setItem('token', mockToken);

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