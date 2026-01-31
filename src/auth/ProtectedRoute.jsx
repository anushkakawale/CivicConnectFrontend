import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation()
  
  // Get auth data from localStorage
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const isAuthenticated = token && user
  const userRole = user?.role

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects = {
      'CITIZEN': '/citizen/dashboard',
      'ADMIN': '/admin/dashboard',
      'WARD_OFFICER': '/ward-officer/dashboard',
      'DEPARTMENT_OFFICER': '/department/dashboard',
    }
    
    const redirectPath = roleRedirects[userRole] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
