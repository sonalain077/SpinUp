import React from 'react';
import { Navigate } from 'react-router-dom';

// roleRequired: e.g. 'agent'
const PrivateRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('authToken');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' && !!token;
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roleRequired && userRole !== roleRequired) return <Navigate to="/" replace />;
  return children;
};

export default PrivateRoute;
