import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = ({ onSuccess, onSwitchToLogin }) => {
  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://supermarket-208b.onrender.com";
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email,
        devReturnOtp: process.env.NODE_ENV === 'development' // For testing
      });
      
      setMessage(response.data.message);
      if (response.data.otp) {
        console.log('OTP for testing:', response.data.otp);
      }
      // Pass the email to VerifyOtp component
      onSuccess(email);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-auth-form">
      <h2 className="home-form-title">Forgot Password</h2>
      
      <form onSubmit={handleSubmit} className="home-form">
        <div className="home-form-group">
          <label className="home-form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="home-form-input"
            required
          />
        </div>

        {message && <div className="home-success">{message}</div>}
        {error && <div className="home-error">{error}</div>}

        <button 
          type="submit" 
          className="home-form-button"
          disabled={loading}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
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

export default ForgotPassword;