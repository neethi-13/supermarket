import React from 'react';
import './AdminProfile.css';
const AdminProfile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="admin-profile">
      <div className="admin-profile-header">
        <h2>Profile</h2>
        <p>Manage your personal information</p>
      </div>

      <div className="admin-profile-content">
        <div className="admin-profile-card">
          <div className="admin-profile-avatar">
            <div className="admin-avatar-initials">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          <div className="admin-profile-info">
            <h3>{user.name}</h3>
            <p className="admin-profile-role">{user.role}</p>
            {user.adminid && <p className="admin-profile-id">Admin ID: {user.adminid}</p>}
          </div>
        </div>

        <div className="admin-profile-details">
          <div className="admin-detail-section">
            <h4>Personal Information</h4>
            <div className="admin-detail-grid">
              <div className="admin-detail-item">
                <label>Role</label>
                <span>{user.role}</span>
              </div>
              <div className="admin-detail-item">
                <label>Email Address</label>
                <span>{user.email}</span>
              </div>
              <div className="admin-detail-item">
                <label>Mobile Number</label>
                <span>{user.phone}</span>
              </div>
              {user.adminid && (
                <div className="admin-detail-item">
                  <label>Admin ID</label>
                  <span>{user.adminid}</span>
                </div>
              )}
            </div>
          </div>

          <div className="admin-detail-section">
            <h4>Account Details</h4>
            <div className="admin-detail-grid">
              <div className="admin-detail-item">
                <label>Name</label>
                <span>{user.name}</span>
              </div>
              <div className="admin-detail-item">
                <label>Department</label>
                <span>Administration</span>
              </div>
              <div className="admin-detail-item">
                <label>Position</label>
                <span>System Administrator</span>
              </div>
              <div className="admin-detail-item">
                <label>Start Date</label>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;