import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import UserModal from '../UserModal';
import NotificationComponent from './NotificationComponent';
import './UserList.css';

// Redux actions
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  selectFilteredUsers,
  selectUsersLoading,
  selectUsersError,
  setSearchQuery,
  clearError,
} from '../store/slices/usersSlice';

import {
  logout,
} from '../store/slices/authSlices';

import {
  setViewMode,
  openUserModal,
  closeUserModal,
  setDeleteConfirmUser,
  clearDeleteConfirmUser,
  setCurrentPage,
  resetPagination,
  addNotification,
  selectViewMode,
  selectIsUserModalOpen,
  selectModalMode,
  selectSelectedUser,
  selectDeleteConfirmUser,
  selectPaginationData,
} from '../store/slices/uiReducers';

const UsersList = ({ onLogout }) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const users = useSelector(selectFilteredUsers);
  const isLoading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const viewMode = useSelector(selectViewMode);
  const isModalOpen = useSelector(selectIsUserModalOpen);
  const modalMode = useSelector(selectModalMode);
  const selectedUser = useSelector(selectSelectedUser);
  const deleteConfirm = useSelector(selectDeleteConfirmUser);
  const paginationData = useSelector(selectPaginationData);

  // Destructure pagination data
  const { currentPage, totalPages, startIndex, endIndex, itemsPerPage } = paginationData;
  const currentUsers = users.slice(startIndex, endIndex);

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(addNotification({
      type: 'info',
      message: 'You have been logged out successfully'
    }));
    
    if (onLogout) {
      onLogout();
    }
  };

  // User CRUD operations
  const handleAddUser = () => {
    dispatch(openUserModal({ mode: 'create' }));
  };

  const handleEditUser = (user) => {
    dispatch(openUserModal({ mode: 'edit', user }));
  };

  const handleDeleteUser = (user) => {
    dispatch(setDeleteConfirmUser(user));
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await dispatch(deleteUser(deleteConfirm.id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: `${deleteConfirm.first_name} ${deleteConfirm.last_name} deleted successfully`
        }));
        dispatch(resetPagination());
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to delete user: ' + error
        }));
      } finally {
        dispatch(clearDeleteConfirmUser());
      }
    }
  };

  const handleModalSubmit = async (userData) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createUser(userData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'User created successfully'
        }));
        dispatch(resetPagination());
      } else {
        await dispatch(updateUser({ 
          id: selectedUser.id, 
          userData 
        })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'User updated successfully'
        }));
      }
      dispatch(closeUserModal());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: `Failed to ${modalMode} user: ` + error
      }));
    }
  };

  // UI handlers
  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchUsers());
  };

  // Search handler
  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
    dispatch(resetPagination());
  };

  const renderCardView = () => (
    <div className="users-grid view-grid">
      {users.length > 0 ? (
        users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
            </div>
            <div className="user-info">
              <h3 className="user-name">{user.first_name} {user.last_name}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-actions">
                <button 
                  className="btn btn-edit"
                  onClick={() => handleEditUser(user)}
                  title="Edit User"
                >
                  <span>✏️</span>
                  Edit
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={() => handleDeleteUser(user)}
                  title="Delete User"
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-users">
          <div className="no-users-content">
            <div className="no-users-icon">👥</div>
            <h3>No users found</h3>
            <p>Get started by creating your first user</p>
            <button onClick={handleAddUser} className="btn btn-primary">
              Create First User
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="table-container">
      <div className="users-table view-table">
        <table className="table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <img 
                      src={user.avatar} 
                      alt={`${user.first_name} ${user.last_name}`}
                      className="table-avatar"
                    />
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} className="table-email">
                      {user.email}
                    </a>
                  </td>
                  <td>
                    <span className="table-name">{user.first_name}</span>
                  </td>
                  <td>
                    <span className="table-name">{user.last_name}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div className="no-users-content">
                    <div className="no-users-icon">👥</div>
                    <h3>No users found</h3>
                    <p>Get started by creating your first user</p>
                    <button onClick={handleAddUser} className="btn btn-primary">
                      Create First User
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {users.length > itemsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} entries
          </div>
          <div className="pagination">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1;
              const showPage = 
                pageNum === 1 || 
                pageNum === totalPages || 
                Math.abs(pageNum - currentPage) <= 1;
              
              if (!showPage && pageNum === 2 && currentPage > 4) {
                return <span key="dots-start" className="pagination-dots">...</span>;
              }
              
              if (!showPage && pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                return <span key="dots-end" className="pagination-dots">...</span>;
              }
              
              if (!showPage) return null;
              
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="users-container" data-view={viewMode}>
      {/* Notifications */}
      <NotificationComponent />
      
      {/* Header */}
      <div className="users-header">
        <div className="header-content">
          <h1 className="users-title">User Management</h1>
          <div className="header-actions">
            {/* Search */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users..."
                className="search-input"
                onChange={handleSearch}
              />
            </div>
            
            <div className="view-controls">
              <div className="view-toggle">
                <button 
                  className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('table')}
                >
                  Table
                </button>
                <button 
                  className={`view-button ${viewMode === 'card' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('card')}
                >
                  Card
                </button>
              </div>
            </div>
            <button onClick={handleAddUser} className="add-user-button">
              + Add New User
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="users-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={handleRetry} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            {viewMode === 'card' && renderCardView()}
            {viewMode === 'table' && renderTableView()}
          </>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => dispatch(closeUserModal())}
        onSubmit={handleModalSubmit}
        user={selectedUser}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => dispatch(clearDeleteConfirmUser())}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="delete-body">
              <div className="delete-icon">⚠️</div>
              <p>Are you sure you want to delete <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-footer">
              <button 
                className="btn btn-cancel" 
                onClick={() => dispatch(clearDeleteConfirmUser())}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;