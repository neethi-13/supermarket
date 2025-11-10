import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CusNavbar from './CusNavbar';
import CusSidebar from './CusSidebar';
import CusDashboard from './CusDashboard';
import CusProfile from './CusProfile';
import CusApplyOrder from './CusApplyOrder';
import CusOurOrders from './CusOurOrders';
import './Cus.css';

const CusTot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkTheme, setDarkTheme] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is customer
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role !== 'customer') {
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
        return <CusDashboard user={user} />;
      case 'profile':
        return <CusProfile user={user} />;
      case 'apply-order':
        return <CusApplyOrder user={user} />;
      case 'our-orders':
        return <CusOurOrders user={user} />;
      default:
        return <CusDashboard user={user} />;
    }
  };

  if (!user) {
    return <div className="cus-loading">Loading...</div>;
  }

  return (
    <div className={`cus-container ${darkTheme ? 'cus-dark-theme' : ''}`}>
      <CusNavbar 
        user={user}
        darkTheme={darkTheme}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <div className="cus-layout">
        <CusSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sidebarOpen={sidebarOpen}
        />
        <main className={`cus-main-content ${!sidebarOpen ? 'cus-main-expanded' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CusTot;