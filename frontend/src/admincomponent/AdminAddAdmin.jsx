import React, { useState } from 'react';
import axios from 'axios';
import './AdminAddAdmin.css';
const AdminAddAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'admin',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setMessage('Admin user created successfully!');
      setFormData({
        name: '',
        role: 'admin',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-admin">
      <div className="admin-add-admin-header">
        <h2>Add New Admin</h2>
        <p>Create a new administrator account</p>
      </div>
      <div className="admin-form">
      <form onSubmit={handleSubmit} className="admin-admin-form">
        <div className="admin-form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="admin-form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        {message && <div className="admin-success-message">{message}</div>}
        {error && <div className="admin-error-message">{error}</div>}

        <button 
          type="submit" 
          className="admin-submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating Admin...' : 'Create Admin'}
        </button>
      </form></div>
    </div>
  );
};

export default AdminAddAdmin;