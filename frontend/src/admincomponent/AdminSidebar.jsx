import React from 'react';
import './AdminSidebar.css';
const AdminSidebar = ({ activeSection, onSectionChange, sidebarOpen }) => {
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'add-products', label: 'Add Products', icon: '📦' },
    { key: 'add-admin', label: 'Add Admin', icon: '➕' },
    { key: 'emp-dashboard', label: 'Emp Dashboard', icon: '🏪' },
    { key: 'admin-order', label: 'Admin Order', icon: '🛒' },
  ];

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-collapsed'}`}>
      <div className="admin-sidebar-content">
        <div className="admin-sidebar-header">
          <h3>Menu</h3>
        </div>
        <nav className="admin-sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`admin-sidebar-item ${activeSection === item.key ? 'admin-sidebar-active' : ''}`}
              onClick={() => onSectionChange(item.key)}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              {sidebarOpen && (
                <span className="admin-sidebar-label">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;