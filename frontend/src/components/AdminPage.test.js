import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';
import * as api from '../api';

// Mock the api module
jest.mock('../api');

const mockUsers = [
    { id: 1, email: 'admin@taktplan.com', role: 'admin' },
    { id: 2, email: 'manager@taktplan.com', role: 'manager' },
    { id: 3, email: 'employee@taktplan.com', role: 'employee' },
];

describe('AdminPage', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user table correctly when API returns a direct array', async () => {
        api.getAdminUsers.mockResolvedValue(mockUsers);

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        // Wait for loading to disappear and table to be populated
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Check for table headers
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();

        // Check for user data
        expect(screen.getByText('admin@taktplan.com')).toBeInTheDocument();
        expect(screen.getByText('manager@taktplan.com')).toBeInTheDocument();
        expect(screen.getByText('employee@taktplan.com')).toBeInTheDocument();
    });

    it('renders the user table correctly when API returns a nested users array', async () => {
        // Mock the API to return data nested under a 'users' key
        api.getAdminUsers.mockResolvedValue({ users: mockUsers });

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.getByText('admin@taktplan.com')).toBeInTheDocument();
        expect(screen.getByText('manager@taktplan.com')).toBeInTheDocument();
        expect(screen.getByText('employee@taktplan.com')).toBeInTheDocument();
    });

    it('displays an error message when the API call fails', async () => {
        const errorMessage = 'Failed to fetch users';
        api.getAdminUsers.mockRejectedValue(new Error(errorMessage));

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
        });
    });

    it('renders an empty table when no users are returned', async () => {
        api.getAdminUsers.mockResolvedValue({ users: [] });

        render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );

        await waitFor(() => {
             expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Check that headers are present but no user rows
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.queryByText('admin@taktplan.com')).not.toBeInTheDocument();
        const rows = screen.getAllByRole('row');
        // There should be only 1 row (the header row)
        expect(rows).toHaveLength(1);
    });
});