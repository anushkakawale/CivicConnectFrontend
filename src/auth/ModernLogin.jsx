import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';
import { Building2, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

const ModernLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email address is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');

      const email = values.email.trim();
      const password = values.password.trim();

      console.log('🔐 Attempting login with:', { email, passwordLength: password.length });

      try {
        await authService.login(email, password);
        const dashboardRoute = authService.getDashboardRoute();

        // Show success message briefly before navigating
        console.log('🎉 Redirecting to:', dashboardRoute);
        navigate(dashboardRoute);
      } catch (err) {
        // Extract error message from various possible formats
        let errorMessage = 'Authentication failed. Please check your credentials.';

        if (err.response?.data) {
          // Handle string error (like "Bad credentials")
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
          // Handle object error with message property
          else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
          // Handle object error with error property
          else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          }
        }

        console.error('🔴 Login error:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      {/* Background Pattern */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        opacity: 0.05
      }}></div>

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">

            {/* Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient rounded-circle p-3 mb-3 shadow-lg">
                <Building2 className="text-white" size={40} />
              </div>
              <h1 className="display-5 fw-bold text-primary mb-2">CivicConnect</h1>
              <p className="text-muted fs-5">Municipal Complaint Management System</p>
            </div>

            {/* Login Card */}
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <h2 className="card-title text-center mb-2 fw-bold">Welcome Back</h2>
                <p className="text-center text-muted mb-4">Sign in to access your dashboard</p>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Authentication Failed!</strong> {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={formik.handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <Mail size={16} className="me-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''
                        }`}
                      id="email"
                      placeholder="Enter your email"
                      {...formik.getFieldProps('email')}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="invalid-feedback">{formik.errors.email}</div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <Lock size={16} className="me-2" />
                      Password
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''
                          }`}
                        id="password"
                        placeholder="Enter your password"
                        {...formik.getFieldProps('password')}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">{formik.errors.password}</div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3 d-flex align-items-center justify-content-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn size={20} className="me-2" />
                        Sign In
                      </>
                    )}
                  </button>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-muted mb-0">
                      New to CivicConnect?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="btn btn-link p-0 text-decoration-none fw-semibold"
                      >
                        <UserPlus size={16} className="me-1" />
                        Create an account
                      </button>
                    </p>
                  </div>
                </form>
              </div>

              {/* Card Footer */}
              <div className="card-footer bg-light border-0 py-3">
                <div className="d-flex justify-content-center gap-4 text-muted small">
                  <span>🔒 Secure Login</span>
                  <span>🏛️ Government Portal</span>
                  <span>✅ Verified</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                © 2026 CivicConnect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
