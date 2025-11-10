import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminProfile from './AdminProfile';
import AdminAddProducts from './AdminAddProducts';
import AdminAddAdmin from './AdminAddAdmin';
import AdminOrder from './AdminOrder';
import AdminEmpDashboard from './AdminEmpDashboard';
import './Admin.css';

const AdminTot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkTheme, setDarkTheme] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is admin
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'profile':
        return <AdminProfile user={user} />;
      case 'add-products':
        return <AdminAddProducts />;
      case 'add-admin':
        return <AdminAddAdmin />;
      case 'emp-dashboard':
        return <AdminEmpDashboard />;
       case 'admin-order': // Add this case
        return <AdminOrder />;
      default:
        return <AdminDashboard />;
    }
  };

  if (!user) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className={`admin-container ${darkTheme ? 'admin-dark-theme' : ''}`}>
      <AdminNavbar 
        user={user}
        darkTheme={darkTheme}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <div className="admin-layout">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sidebarOpen={sidebarOpen}
        />
        <main className={`admin-main-content ${!sidebarOpen ? 'admin-main-expanded' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminTot;