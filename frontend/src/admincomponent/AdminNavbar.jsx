import React from 'react';
import './AdminNavbar.css';
const AdminNavbar = ({ user, darkTheme, onThemeToggle, onLogout, onToggleSidebar, sidebarOpen }) => {
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <button 
          className="admin-sidebar-toggle"
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        <h1 className="admin-navbar-title">Admin Panel</h1>
      </div>
      
      <div className="admin-navbar-right">
        <div className="admin-user-info">
          <span className="admin-user-name">{user?.name}</span>
          <span className="admin-user-role">{user?.role}</span>
        </div>
        <button 
          className="admin-theme-toggle"
          onClick={onThemeToggle}
        >
          {darkTheme ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button 
          className="admin-logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;