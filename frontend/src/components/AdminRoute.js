import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        return userRole === 'admin' ? <Outlet /> : <Navigate to="/" />;
    } catch (error) {
        console.error("Invalid token:", error);
        return <Navigate to="/login" />;
    }
};

export default AdminRoute;