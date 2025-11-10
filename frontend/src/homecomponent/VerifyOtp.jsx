import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VerifyOtp = ({ onSuccess, onSwitchToLogin, emailFromForgot }) => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatically populate email when component mounts
  useEffect(() => {
    if (emailFromForgot) {
      setFormData(prev => ({
        ...prev,
        email: emailFromForgot
      }));
    }
  }, [emailFromForgot]);

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
      await axios.post('http://localhost:5000/api/auth/verify-otp', formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-auth-form">
      <h2 className="home-form-title">Verify OTP & Reset Password</h2>
      
      <form onSubmit={handleSubmit} className="home-form">
        <div className="home-form-group">
          <label className="home-form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="home-form-input"
            required
            readOnly={!!emailFromForgot} // Make it read-only if email is passed from forgot password
            style={emailFromForgot ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
          />
          {emailFromForgot && (
            <small className="home-form-help">
              Email is pre-filled from previous step
            </small>
          )}
        </div>

        <div className="home-form-group">
          <label className="home-form-label">OTP</label>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            className="home-form-input"
            placeholder="Enter 6-digit OTP"
            required
            maxLength={6}
          />
        </div>

        <div className="home-form-group">
          <label className="home-form-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="home-form-input"
            required
            minLength={6}
          />
        </div>

        <div className="home-form-group">
          <label className="home-form-label">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="home-form-input"
            required
            minLength={6}
          />
        </div>

        {error && <div className="home-error">{error}</div>}

        <button 
          type="submit" 
          className="home-form-button"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP & Reset Password'}
        </button>
      </form>

      <div className="home-form-links">
        <button 
          onClick={onSwitchToLogin}
          className="home-form-link"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;