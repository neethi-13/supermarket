import React, { useState } from 'react';
import axios from 'axios';

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    shopname: '',
    role: 'customer',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'radio' ? e.target.value : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-auth-form">
      <h2 className="home-form-title">Sign Up</h2>
      
      <form onSubmit={handleSubmit} className="home-form">
        <div className="home-form-group">
          <label className="home-form-label">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="home-form-input"
            required
          />
        </div>

        <div className="home-form-group">
          <label className="home-form-label">Role</label>
          <div className="home-radio-group">
            <label className="home-radio-label">
              <input
                type="radio"
                name="role"
                value="customer"
                checked={formData.role === 'customer'}
                onChange={handleChange}
              />
              Customer
            {/* </label>
            <label className="home-radio-label">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === 'admin'}
                onChange={handleChange}
              />
              Admin */}
            </label>
          </div>
        </div>

        {formData.role === 'customer' && (
          <div className="home-form-group">
            <label className="home-form-label">Shop Name</label>
            <input
              type="text"
              name="shopname"
              value={formData.shopname}
              onChange={handleChange}
              className="home-form-input"
              required={formData.role === 'customer'}
            />
          </div>
        )}

        <div className="home-form-group">
          <label className="home-form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="home-form-input"
            required
          />
        </div>

        <div className="home-form-group">
          <label className="home-form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
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

        <div className="home-form-group">
          <label className="home-form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="home-form-links">
        <button 
          onClick={onSwitchToLogin}
          className="home-form-link"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default SignupForm;