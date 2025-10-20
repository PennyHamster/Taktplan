import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import App from './App';
import { ThemeContext } from './ThemeContext';
import { getTasks, getUsers } from './api';

// Mock the api and jwt-decode modules
jest.mock('./api');
jest.mock('jwt-decode');

const mockAllTasks = [
  { id: 1, title: 'All Task 1', status: 'in_progress' },
  { id: 2, title: 'All Task 2', status: 'done' },
];

const mockUsers = [{ id: 1, email: 'manager@test.com' }];

describe('App component', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  const renderWithProviders = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);

    return render(
      <MemoryRouter initialEntries={[route]}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: jest.fn() }}>
          {ui}
        </ThemeContext.Provider>
      </MemoryRouter>
    );
  };

  // Test 1: Unauthenticated user should be redirected to the login page
  test('renders Login page for unauthenticated users', () => {
    renderWithProviders(<App />);
    // The Board should not be visible
    expect(screen.queryByText(/In Bearbeitung/i)).not.toBeInTheDocument();
    // The Login page should be visible
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  // Test 2: Authenticated user should see the board
  test('renders Board component for authenticated users', async () => {
    // Set a mock token
    const mockToken = 'fake-token';
    localStorage.setItem('token', mockToken);

    // Mock token decoding
    jwtDecode.mockReturnValue({ role: 'admin' });

    // Mock API calls
    getTasks.mockResolvedValue(mockAllTasks);
    getUsers.mockResolvedValue(mockUsers);

    renderWithProviders(<App />);

    // The Board should be visible
    expect(await screen.findByText(/User Management/i)).toBeInTheDocument();
    expect(await screen.findByText(/In Bearbeitung/i)).toBeInTheDocument();
    expect(await screen.findByText(/All Task 1/i)).toBeInTheDocument();

    // The Login page should not be visible
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });
});
