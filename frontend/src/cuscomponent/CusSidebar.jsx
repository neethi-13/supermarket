import React from 'react';
import './CusSidebar.css';
const CusSidebar = ({ activeSection, onSectionChange, sidebarOpen }) => {
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'apply-order', label: 'Apply Order', icon: '🛒' },
    { key: 'our-orders', label: 'Our Orders', icon: '📦' },
  ];

  return (
    <aside className={`cus-sidebar ${sidebarOpen ? 'cus-sidebar-open' : 'cus-sidebar-collapsed'}`}>
      <div className="cus-sidebar-content">
        <div className="cus-sidebar-header">
          <h3>Menu</h3>
        </div>
        <nav className="cus-sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`cus-sidebar-item ${activeSection === item.key ? 'cus-sidebar-active' : ''}`}
              onClick={() => onSectionChange(item.key)}
            >
              <span className="cus-sidebar-icon">{item.icon}</span>
              {sidebarOpen && (
                <span className="cus-sidebar-label">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default CusSidebar;