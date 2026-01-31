import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../api/apiService';
import { WARDS } from '../constants';
import {
  User, Mail, Phone, Lock, MapPin,
  Building2, ShieldCheck, Check, Eye, EyeOff
} from 'lucide-react';

const RegisterCitizen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      wardNumber: ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
        .required('Full name is required'),
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email address is required'),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
        .required('Mobile number is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Password must contain uppercase, lowercase, number, and special character'
        )
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      wardNumber: Yup.string()
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const registrationData = {
          name: values.name.trim(),
          email: values.email.toLowerCase().trim(),
          mobile: values.mobile,
          password: values.password,
          wardId: values.wardNumber ? parseInt(values.wardNumber) : null
        };

        await apiService.auth.register(registrationData);

        setSuccess('Registration successful! Redirecting to login...');

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Password strength checker
  const getPasswordStrength = () => {
    const password = formik.values.password;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Very Weak', color: 'danger' },
      { strength: 2, label: 'Weak', color: 'warning' },
      { strength: 3, label: 'Fair', color: 'info' },
      { strength: 4, label: 'Good', color: 'primary' },
      { strength: 5, label: 'Strong', color: 'success' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-7">

            {/* Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient rounded-circle p-3 mb-3 shadow-lg">
                <Building2 className="text-white" size={40} />
              </div>
              <h1 className="display-6 fw-bold text-primary mb-2">Citizen Registration</h1>
              <p className="text-muted fs-5">Join us to make your city better</p>

              <div className="d-inline-flex gap-3 flex-wrap justify-content-center">
                <div className="badge bg-success bg-gradient px-3 py-2">
                  <ShieldCheck size={16} className="me-2" />
                  Secure & Verified
                </div>
                <div className="badge bg-info bg-gradient px-3 py-2">
                  <Building2 size={16} className="me-2" />
                  Government Portal
                </div>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">

                {/* Alerts */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>⚠️ Registration Failed!</strong> {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>✅ Success!</strong> {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                <form onSubmit={formik.handleSubmit}>

                  {/* Personal Information Section */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3 fw-bold">
                      <User size={20} className="me-2" />
                      Personal Information
                    </h5>

                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label fw-semibold">
                          <User size={14} className="me-1" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                          id="name"
                          placeholder="Enter your full name"
                          {...formik.getFieldProps('name')}
                        />
                        {formik.touched.name && formik.errors.name && (
                          <div className="invalid-feedback">{formik.errors.name}</div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <Mail size={14} className="me-1" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          className={`form-control form-control-lg ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          placeholder="your.email@example.com"
                          {...formik.getFieldProps('email')}
                        />
                        {formik.touched.email && formik.errors.email && (
                          <div className="invalid-feedback">{formik.errors.email}</div>
                        )}
                      </div>

                      {/* Mobile */}
                      <div className="col-md-6">
                        <label htmlFor="mobile" className="form-label fw-semibold">
                          <Phone size={14} className="me-1" />
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          className={`form-control form-control-lg ${formik.touched.mobile && formik.errors.mobile ? 'is-invalid' : ''}`}
                          id="mobile"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          {...formik.getFieldProps('mobile')}
                        />
                        {formik.touched.mobile && formik.errors.mobile && (
                          <div className="invalid-feedback">{formik.errors.mobile}</div>
                        )}
                      </div>

                      {/* Ward */}
                      <div className="col-md-6">
                        <label htmlFor="wardNumber" className="form-label fw-semibold">
                          <MapPin size={14} className="me-1" />
                          Ward Number
                        </label>
                        <select
                          className={`form-select form-select-lg ${formik.touched.wardNumber && formik.errors.wardNumber ? 'is-invalid' : ''}`}
                          id="wardNumber"
                          {...formik.getFieldProps('wardNumber')}
                        >
                          <option value="">Select your ward (optional)</option>
                          {WARDS.map((ward) => (
                            <option key={ward.wardId} value={ward.number}>
                              Ward {ward.number} - {ward.area_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Security Information Section */}
                  <div className="mb-4">
                    <h5 className="text-primary mb-3 fw-bold">
                      <Lock size={20} className="me-2" />
                      Security Information
                    </h5>

                    <div className="row g-3">
                      {/* Password */}
                      <div className="col-md-6">
                        <label htmlFor="password" className="form-label fw-semibold">
                          <Lock size={14} className="me-1" />
                          Password *
                        </label>
                        <div className="input-group input-group-lg">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                            id="password"
                            placeholder="Create a strong password"
                            {...formik.getFieldProps('password')}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                          <div className="text-danger small mt-1">{formik.errors.password}</div>
                        )}

                        {/* Password Strength Indicator */}
                        {formik.values.password && (
                          <div className="mt-2">
                            <div className="progress" style={{ height: '6px' }}>
                              <div
                                className={`progress-bar bg-${passwordStrength.color}`}
                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                              ></div>
                            </div>
                            <small className={`text-${passwordStrength.color} fw-semibold`}>
                              Strength: {passwordStrength.label}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label fw-semibold">
                          <Lock size={14} className="me-1" />
                          Confirm Password *
                        </label>
                        <div className="input-group input-group-lg">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            {...formik.getFieldProps('confirmPassword')}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                          <div className="text-danger small mt-1">{formik.errors.confirmPassword}</div>
                        )}
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="card border-primary border-opacity-25 mt-3 mb-0">
                      <div className="card-body p-3">
                        <h6 className="card-subtitle mb-3 text-primary fw-semibold">
                          <ShieldCheck size={16} className="me-2" />
                          Password Requirements
                        </h6>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <div className={`d-flex align-items-center ${formik.values.password.length >= 8 ? 'text-success' : 'text-muted'}`}>
                              <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center ${formik.values.password.length >= 8 ? 'bg-success bg-opacity-10' : 'bg-light'}`} style={{ width: '24px', height: '24px' }}>
                                <Check size={14} />
                              </div>
                              <small className="fw-medium">At least 8 characters</small>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`d-flex align-items-center ${/[A-Z]/.test(formik.values.password) ? 'text-success' : 'text-muted'}`}>
                              <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center ${/[A-Z]/.test(formik.values.password) ? 'bg-success bg-opacity-10' : 'bg-light'}`} style={{ width: '24px', height: '24px' }}>
                                <Check size={14} />
                              </div>
                              <small className="fw-medium">One uppercase letter</small>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`d-flex align-items-center ${/[a-z]/.test(formik.values.password) ? 'text-success' : 'text-muted'}`}>
                              <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center ${/[a-z]/.test(formik.values.password) ? 'bg-success bg-opacity-10' : 'bg-light'}`} style={{ width: '24px', height: '24px' }}>
                                <Check size={14} />
                              </div>
                              <small className="fw-medium">One lowercase letter</small>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`d-flex align-items-center ${/\d/.test(formik.values.password) ? 'text-success' : 'text-muted'}`}>
                              <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center ${/\d/.test(formik.values.password) ? 'bg-success bg-opacity-10' : 'bg-light'}`} style={{ width: '24px', height: '24px' }}>
                                <Check size={14} />
                              </div>
                              <small className="fw-medium">One number</small>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`d-flex align-items-center ${/[@$!%*?&]/.test(formik.values.password) ? 'text-success' : 'text-muted'}`}>
                              <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center ${/[@$!%*?&]/.test(formik.values.password) ? 'bg-success bg-opacity-10' : 'bg-light'}`} style={{ width: '24px', height: '24px' }}>
                                <Check size={14} />
                              </div>
                              <small className="fw-medium">Special character (@$!%*?&)</small>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`d-flex align-items-center ${formik.values.password === formik.values.confirmPassword && formik.values.password !== '' ? 'text-success' : 'text-muted'}`}>
                              <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center ${formik.values.password === formik.values.confirmPassword && formik.values.password !== '' ? 'bg-success bg-opacity-10' : 'bg-light'}`} style={{ width: '24px', height: '24px' }}>
                                <Check size={14} />
                              </div>
                              <small className="fw-medium">Passwords match</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={20} className="me-2" />
                          Create Account
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4 pt-4 border-top">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/')}
                      className="btn btn-link p-0 text-decoration-none fw-semibold"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
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

export default RegisterCitizen;
