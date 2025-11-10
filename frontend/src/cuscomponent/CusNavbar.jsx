import React, { useState, useEffect } from 'react';
import './CusNavbar.css';
const CusNavbar = ({ user, onThemeToggle, onLogout, onToggleSidebar, sidebarOpen }) => {
  const [darkTheme, setDarkTheme] = useState(true); // 👈 Default to dark

  useEffect(() => {
    onThemeToggle && onThemeToggle(darkTheme);
  }, [darkTheme]);

  return (
    <nav className={`cus-navbar ${darkTheme ? 'dark' : 'light'}`}>
      <div className="cus-navbar-left">
        <button className="cus-sidebar-toggle" onClick={onToggleSidebar}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
        <h1 className="cus-navbar-title">Customer Panel</h1>
      </div>

      <div className="cus-navbar-right">
        <div className="cus-user-info">
          <span className="cus-user-name">{user?.name}</span>
          <span className="cus-user-role">{user?.shopname}</span>
        </div>

        {/* <button
          className="cus-theme-toggle"
          onClick={() => setDarkTheme(prev => !prev)}
        >
          {darkTheme ? '🌙 Dark' : '☀️ Light'}
        </button> */}

        <button className="cus-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default CusNavbar;
