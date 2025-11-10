import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPassword from './ForgotPassword';
import VerifyOtp from './VerifyOtp';
import './home.css';

const HomeTot = () => {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // Check for existing user in localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Auto-redirect based on role if user is logged in
        if (userData.role === 'admin') {
          window.location.href = '/admin';
        } else if (userData.role === 'customer') {
          window.location.href = '/customer';
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Redirect based on role
    if (userData.role === 'admin') {
      window.location.href = '/admin';
    } else if (userData.role === 'customer') {
      window.location.href = '/customer';
    }
  };

  const handleForgotPasswordSuccess = (email) => {
    // Store the email and switch to verify OTP view
    setForgotPasswordEmail(email);
    setCurrentView('verify');
  };

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('home');
    setForgotPasswordEmail('');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
    setForgotPasswordEmail(''); // Clear the stored email when going back to login
  };

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <LoginForm 
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setCurrentView('signup')}
          onSwitchToForgotPassword={() => setCurrentView('forgot')}
        />;
      case 'signup':
        return <SignupForm 
          onSuccess={() => setCurrentView('login')}
          onSwitchToLogin={handleSwitchToLogin}
        />;
      case 'forgot':
        return <ForgotPassword 
          onSuccess={handleForgotPasswordSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />;
      case 'verify':
        return <VerifyOtp 
          onSuccess={handleSwitchToLogin}
          onSwitchToLogin={handleSwitchToLogin}
          emailFromForgot={forgotPasswordEmail}
        />;
      default:
        return (
          <div className="home-content">
            <div className="home-hero">
              <div className="home-hero-content">
                <h1 className="home-title">Jhansi Super Market</h1>
                <h2 className="home-subtitle">Supermarket</h2>
                <p className="home-location">Sivakasi, Sivakasi</p>
                
                <div className="home-description">
                  <p>
                    Anything that you would require on an everyday basis, this supermart has it right there with them. 
                    All the products at our store are very pocket-friendly and result in a significant amount of savings!
                  </p>
                </div>

                <div className="home-address">
                  <p>Parasakthi Colony, Parasakthi Colony-626123</p>
                </div>

                <div className="home-features">
                  <div className="home-feature">
                    <h3>Wide Variety</h3>
                    <p>From groceries to household items, we have everything you need</p>
                  </div>
                  <div className="home-feature">
                    <h3>Best Prices</h3>
                    <p>Quality products at the most competitive prices</p>
                  </div>
                  <div className="home-feature">
                    <h3>Fresh Products</h3>
                    <p>Daily fresh stocks to ensure quality and freshness</p>
                  </div>
                </div>

                {!user ? (
                  <div className="home-cta">
                    <button 
                      className="home-login-btn"
                      onClick={() => setCurrentView('login')}
                    >
                      Login to Shop
                    </button>
                  </div>
                ) : (
                  <div className="home-welcome">
                    <p>Welcome back, {user.name}!</p>
                    <button 
                      className="home-dashboard-btn"
                      onClick={() => {
                        if (user.role === 'admin') {
                          window.location.href = '/admin';
                        } else if (user.role === 'customer') {
                          window.location.href = '/customer';
                        }
                      }}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="home-container">
      <Navbar 
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />
      {renderContent()}
    </div>
  );
};

export default HomeTot;