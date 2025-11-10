import React from 'react';
import './CusProfile.css';
const CusProfile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="cus-profile">
      <div className="cus-profile-header">
        <h2>Profile</h2>
        <p>Manage your shop information</p>
      </div>

      <div className="cus-profile-content">
        <div className="cus-profile-card">
          <div className="cus-profile-avatar">
            <div className="cus-avatar-initials">
              {user.shopname ? user.shopname.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>
          <div className="cus-profile-info">
            <h3>{user.shopname}</h3>
            <p className="cus-profile-owner">Owner: {user.name}</p>
            {user.shopid && <p className="cus-profile-id">Shop ID: {user.shopid}</p>}
          </div>
        </div>

        <div className="cus-profile-details">
          <div className="cus-detail-section">
            <h4>Shop Information</h4>
            <div className="cus-detail-grid">
              <div className="cus-detail-item">
                <label>Shop Name</label>
                <span>{user.shopname}</span>
              </div>
              <div className="cus-detail-item">
                <label>Owner Name</label>
                <span>{user.name}</span>
              </div>
              <div className="cus-detail-item">
                <label>Shop ID</label>
                <span>{user.shopid}</span>
              </div>
              <div className="cus-detail-item">
                <label>Role</label>
                <span>{user.role}</span>
              </div>
            </div>
          </div>

          <div className="cus-detail-section">
            <h4>Contact Details</h4>
            <div className="cus-detail-grid">
              <div className="cus-detail-item">
                <label>Email Address</label>
                <span>{user.email}</span>
              </div>
              <div className="cus-detail-item">
                <label>Phone Number</label>
                <span>{user.phone}</span>
              </div>
              <div className="cus-detail-item">
                <label>Account Type</label>
                <span>Customer Shop</span>
              </div>
              <div className="cus-detail-item">
                <label>Registration Date</label>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CusProfile;