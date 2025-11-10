import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onSuccess, onSwitchToSignup, onSwitchToForgotPassword }) => {
  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://supermarket-208b.onrender.com";
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      onSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-auth-form">
      <h2 className="home-form-title">Login</h2>
      
      <form onSubmit={handleSubmit} className="home-form">
        <div className="home-form-group">
          <label className="home-form-label">
            Email, Shop ID, or Shop Name
          </label>
          <input
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            className="home-form-input"
            required
          />
        </div>

        <div className="home-form-group">
          <label className="home-form-label">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="home-form-input"
            required
          />
        </div>

        {error && <div className="home-error">{error}</div>}

        <button 
          type="submit" 
          className="home-form-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="home-form-links">
        <button 
          onClick={onSwitchToForgotPassword}
          className="home-form-link"
        >
          Forgot Password?
        </button>
        <button 
          onClick={onSwitchToSignup}
          className="home-form-link"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};

export default LoginForm;