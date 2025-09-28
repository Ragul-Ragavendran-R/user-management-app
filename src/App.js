// App.js - Main Application Component using separate files
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import UsersList from './components/Users/UserList';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on app load
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      console.log('Token on app load:', token);
      
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    // Small delay to show loading state
    setTimeout(checkAuth, 500);
  }, []);

  const handleLogin = (token) => {
    console.log('Login successful in App component:', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('Logout triggered in App component');
    setIsAuthenticated(false);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>User Management System</h2>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // Render Login or UsersList based on authentication
  return (
    <div className="App">
      {isAuthenticated ? (
        <UsersList onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;