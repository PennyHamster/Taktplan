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

export const getTasks = () => {
    return request('/tasks');
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