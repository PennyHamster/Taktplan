import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggleButton from './ThemeToggleButton';
import './Sidebar.css';

const Sidebar = ({ userRole, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={toggleSidebar} className="toggle-btn">
        {isOpen ? '‹' : '›'}
      </button>
      <nav className="nav-links">
        {userRole === 'admin' && (
          <Link to="/admin" className="nav-link">
            User Management
          </Link>
        )}
        <a href="#" className="nav-link">History (soon)</a>
        <ThemeToggleButton />
        <button onClick={handleLogout} className="nav-link logout-btn">
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;