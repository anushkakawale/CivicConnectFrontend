/**
 * Protected Route Component
 * Handles authentication and role-based access control
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const isAuthenticated = authService.isAuthenticated();
    const currentRole = authService.getCurrentRole();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
        // Redirect to user's appropriate dashboard
        const dashboardRoute = authService.getDashboardRoute();
        return <Navigate to={dashboardRoute} replace />;
    }

    // Authorized - render children
    return children;
};

export default ProtectedRoute;
