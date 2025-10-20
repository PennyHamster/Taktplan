import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Board from './components/Board';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPage from './components/AdminPage';
import ThemeToggleButton from './components/ThemeToggleButton';
import { ThemeContext } from './ThemeContext';
import './App.css';

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`App ${theme}`}>
      <ThemeToggleButton />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<Board />} />
        </Route>
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;