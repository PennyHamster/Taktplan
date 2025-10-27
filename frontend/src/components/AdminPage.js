import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, updateUserRole } from '../api';

const AdminPage = () => {
    console.log('AdminPage: Component is rendering!');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAdminUsers();
            // Handle both direct array and nested { users: [] } response
            const usersData = Array.isArray(data) ? data : data.users || [];
            setUsers(usersData);
            console.log('AdminPage: Users data received and set in state:', usersData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            // Refresh the user list to show the new role
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    console.log('AdminPage: About to map users:', users);

    return (
        <div style={{ padding: '20px' }}>
            <Link to="/">{'< Back to Board'}</Link>
            <h2 style={{ marginTop: '20px' }}>User Management</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Change Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        console.log('AdminPage: Mapping user:', user);
                        return (
                            <tr key={user.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPage;