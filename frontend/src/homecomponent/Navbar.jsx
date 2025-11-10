import React from 'react';

const Navbar = ({ currentView, onNavigate, user, onLogout }) => {
  return (
    <nav className="home-navbar">
      <div className="home-navbar-brand">
        <h2>Jhansi Super Market</h2>
      </div>
      
      <div className="home-navbar-links">
        {currentView === 'home' && !user && (
          <>
            <button 
              className="home-nav-link"
              onClick={() => onNavigate('login')}
            >
              Login
            </button>
            <button 
              className="home-nav-link home-nav-signup"
              onClick={() => onNavigate('signup')}
            >
              Sign Up
            </button>
          </>
        )}
        
        {user && (
          <div className="home-nav-user">
            <span>Welcome, {user.name}</span>
            <button 
              className="home-nav-link"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}

        {(currentView === 'login' || currentView === 'signup' || 
          currentView === 'forgot' || currentView === 'verify') && (
          <button 
            className="home-nav-link"
            onClick={() => onNavigate('home')}
          >
            Back to Home
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;