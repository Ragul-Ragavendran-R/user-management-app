import React, { useState, useEffect } from 'react';
import './UserModal.css';

const UserModal = ({ isOpen, onClose, onSubmit, user, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load user data when editing
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        avatar: ''
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Avatar is optional - if provided, validate URL
    if (formData.avatar && !isValidUrl(formData.avatar)) {
      newErrors.avatar = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare user data - generate avatar if not provided
      const userData = {
        ...formData,
        avatar: formData.avatar || `https://reqres.in/img/faces/${Math.floor(Math.random() * 12) + 1}-image.jpg`
      };
      
      console.log(`Submitting ${mode} user:`, userData);
      
      // Call the onSubmit function passed from parent (UsersList)
      // This will trigger the Redux actions
      await onSubmit(userData);
      
      // The parent component (UsersList) handles closing the modal
      // and showing notifications through Redux
    } catch (error) {
      console.error(`Error ${mode} user:`, error);
      setErrors({ 
        general: `Failed to ${mode} user. Please try again.` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`form-input ${errors.first_name ? 'error' : ''}`}
                placeholder="Please enter first name"
                disabled={isLoading}
                required
              />
              {errors.first_name && (
                <span className="error-text">{errors.first_name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`form-input ${errors.last_name ? 'error' : ''}`}
                placeholder="Please enter last name"
                disabled={isLoading}
                required
              />
              {errors.last_name && (
                <span className="error-text">{errors.last_name}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Please enter email"
              disabled={isLoading}
              required
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Profile Image Link (Optional)
            </label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className={`form-input ${errors.avatar ? 'error' : ''}`}
              placeholder="https://example.com/image.jpg (optional)"
              disabled={isLoading}
            />
            {errors.avatar && (
              <span className="error-text">{errors.avatar}</span>
            )}
            
            {/* Image Preview */}
            {formData.avatar && isValidUrl(formData.avatar) && (
              <div className="image-preview">
                <img 
                  src={formData.avatar} 
                  alt="Profile preview"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block';
                  }}
                />
              </div>
            )}
          </div>
        </form>

        <div className="modal-footer">
          <button 
            type="button"
            className="btn btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn btn-submit" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="btn-loading">
                <div className="spinner-small"></div>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </div>
            ) : (
              mode === 'create' ? 'Create User' : 'Update User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;