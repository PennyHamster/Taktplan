import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Board from './components/Board';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<Board />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;