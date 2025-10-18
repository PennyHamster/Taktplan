const BASE_URL = '/api';

const request = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // You might want to handle errors more gracefully
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }

    if (response.status === 204) { // No Content
        return null;
    }

    return response.json();
};

export const getTasks = () => { // For managers: gets all tasks
    return request('/tasks');
};

export const getMyTasks = () => { // For all users: gets their assigned tasks
    return request('/tasks/my-tasks');
};

export const createTask = (taskData) => {
    return request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
};

export const updateTask = (taskId, taskData) => {
    return request(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
    });
};

export const deleteTask = (taskId) => {
    return request(`/tasks/${taskId}`, {
        method: 'DELETE',
    });
};

export const getUsers = () => {
    return request('/users');
};

export const getAdminUsers = () => {
    return request('/admin/users');
};

export const updateUserRole = (userId, role) => {
    return request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    });
};