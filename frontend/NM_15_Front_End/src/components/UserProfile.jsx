import React, { useState, useEffect } from 'react';
import { dataAPI } from '../api/apiService';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profile: {
      bio: '',
      avatar: '',
      dateOfBirth: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      preferences: {
        currency: 'USD',
        language: 'en',
        budgetAlerts: true,
        lowBalanceAlerts: false
      }
    }
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password'
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await dataAPI.getProfile();
      setUser(userData);
      setProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        profile: {
          bio: userData.profile?.bio || '',
          avatar: userData.profile?.avatar || '',
          dateOfBirth: userData.profile?.dateOfBirth ? new Date(userData.profile.dateOfBirth).toISOString().split('T')[0] : '',
          phone: userData.profile?.phone || '',
          address: {
            street: userData.profile?.address?.street || '',
            city: userData.profile?.address?.city || '',
            state: userData.profile?.address?.state || '',
            zipCode: userData.profile?.address?.zipCode || '',
            country: userData.profile?.address?.country || ''
          },
          preferences: {
            currency: userData.profile?.preferences?.currency || 'USD',
            language: userData.profile?.preferences?.language || 'en',
            budgetAlerts: userData.profile?.preferences?.budgetAlerts !== undefined ? userData.profile.preferences.budgetAlerts : true,
            lowBalanceAlerts: userData.profile?.preferences?.lowBalanceAlerts !== undefined ? userData.profile.preferences.lowBalanceAlerts : false
          }
        }
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleNestedProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value
      }
    }));
  };
  const handleProfileAddressChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        address: {
          ...prev.profile.address,
          [name]: value
        }
      }
    }));
  };

  const handleProfilePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        preferences: {
          ...prev.profile.preferences,
          [name]: type === 'checkbox' ? checked : value
        }
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.profile.bio,
        avatar: profile.profile.avatar,
        dateOfBirth: profile.profile.dateOfBirth,
        phone: profile.profile.phone,
        address: profile.profile.address,
        preferences: profile.profile.preferences
      };

      const updatedUser = await dataAPI.updateProfile(profileData);
      setUser(updatedUser);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      await dataAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return <div className="user-profile-container">Loading profile...</div>;
  }

  if (error && !user) {
    return (
      <div className="user-profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <h1>User Profile</h1>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {activeTab === 'profile' ? (
        <form onSubmit={handleSubmitProfile} className="profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="disabled-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.profile.phone}
                onChange={handleNestedProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth:</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={profile.profile.dateOfBirth}
                onChange={handleNestedProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.profile.bio}
                onChange={handleNestedProfileChange}
                rows="4"
                maxLength="500"
              />
              <small>{profile.profile.bio.length}/500 characters</small>
            </div>
          </div>

          <div className="form-section">
            <h2>Address Information</h2>
            <div className="form-group">
              <label htmlFor="street">Street Address:</label>
              <input
                type="text"
                id="street"
                name="street"
                value={profile.profile.address.street}
                onChange={handleProfileAddressChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={profile.profile.address.city}
                  onChange={handleProfileAddressChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State:</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={profile.profile.address.state}
                  onChange={handleProfileAddressChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code:</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={profile.profile.address.zipCode}
                  onChange={handleProfileAddressChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="country">Country:</label>
              <input
                type="text"
                id="country"
                name="country"
                value={profile.profile.address.country}
                onChange={handleProfileAddressChange}
              />
            </div>
          </div>

         

          <button type="submit" className="btn btn-primary">
            Update Profile
          </button>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="password-form">
          <div className="form-section">
            <h2>Change Password</h2>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Change Password
          </button>
        </form>
      )}
    </div>
  );
};

export default UserProfile;