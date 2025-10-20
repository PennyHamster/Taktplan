import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Board from './components/Board';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPage from './components/AdminPage';
import Sidebar from './components/Sidebar';
import { ThemeContext } from './ThemeContext';
import './App.css';

const MainLayout = ({ children, userRole, handleLogout }) => (
  <div className="main-layout">
    <Sidebar userRole={userRole} handleLogout={handleLogout} />
    <main className="content">
      {children}
    </main>
  </div>
);

function App() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    navigate('/login');
  };

  return (
    <div className={`App ${theme}`}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout userRole={userRole} handleLogout={handleLogout}>
              <Board userRole={userRole} />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <MainLayout userRole={userRole} handleLogout={handleLogout}>
              <AdminPage />
            </MainLayout>
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;