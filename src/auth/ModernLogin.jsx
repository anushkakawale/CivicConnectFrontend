import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';
import { Building2, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

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

      try {
        console.log('🚀 Initiating authentication for:', email);
        const response = await authService.login(email, password);
        console.log('✅ Authentication successful. Payload:', response);

        const role = localStorage.getItem('role');
        const dashboardRoute = authService.getDashboardRoute();

        console.log('🎯 Routing defined:', { role, target: dashboardRoute });
        navigate(dashboardRoute);
      } catch (error) {
        console.error('❌ Authentication failed:', error);
        let errorMessage = 'Authentication failed. Please check your credentials.';
        if (error.response?.data) {
          errorMessage = typeof error.response.data === 'string' ? error.response.data : (error.response.data.message || error.response.data.error || errorMessage);
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #112652 0%, #173470 100%)'
    }}>
      {/* Tactical Atmospheric Elements */}
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none">
        <div className="position-absolute top-0 end-0 p-5">
          <Building2 size={400} strokeWidth={0.5} />
        </div>
      </div>

      <div className="container position-relative py-5 animate-zoomIn">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-6 col-xl-5">

            {/* Branding */}
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-premium circ-blue anim-float" style={{
                width: '80px', height: '80px'
              }}>
                <Building2 className="text-white" size={36} />
              </div>
              <h1 className="fw-black mb-1" style={{ color: '#FFFFFF', fontSize: '2.2rem' }}>
                Civic Connect
              </h1>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <span className="text-white fw-bold small opacity-70">Official Municipal Portal</span>
              </div>
            </div>

            {/* Login Box */}
            <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white">
              <div className="px-5 pt-5 pb-4 border-bottom bg-white text-center">
                <h4 className="fw-bold mb-1 text-dark">Welcome back</h4>
                <p className="text-muted small mb-0">Sign in to your account</p>
              </div>

              <div className="card-body p-5">
                {error && (
                  <div className="alert border-0 shadow-sm d-flex align-items-center mb-5 rounded-4 animate-fadeIn" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                    <AlertCircle size={18} className="me-3" />
                    <div className="small fw-bold">{error}</div>
                  </div>
                )}

                <form onSubmit={formik.handleSubmit} className="row g-4">
                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted mb-2 ms-1">Email address</label>
                    <div className="position-relative">
                      <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><Mail size={18} /></div>
                      <input
                        type="email"
                        className={`form-control rounded-pill border-0 bg-light py-4 fw-bold shadow-none ps-11 px-4 ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                        style={{ paddingLeft: '60px !important', fontSize: '1rem' }}
                        placeholder="yourname@email.com"
                        {...formik.getFieldProps('email')}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-danger small mt-2 ms-2">{formik.errors.email}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted mb-2 ms-1">Password</label>
                    <div className="position-relative">
                      <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><Lock size={18} /></div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control rounded-pill border-0 bg-light py-4 fw-bold shadow-none ps-11 px-4 ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                        style={{ paddingLeft: '60px !important', fontSize: '1rem' }}
                        placeholder="Enter your password"
                        {...formik.getFieldProps('password')}
                      />
                      <button
                        className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="text-danger small mt-2 ms-2">{formik.errors.password}</div>
                    )}
                  </div>

                  <div className="col-12 pt-4">
                    <button
                      type="submit"
                      className="btn w-100 py-3 d-flex align-items-center justify-content-center text-white rounded-pill btn-premium transition-all border-0"
                      disabled={isLoading}
                      style={{
                        backgroundColor: '#173470',
                        fontSize: '1.1rem',
                        fontWeight: '700'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-3" role="status"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <LogIn size={20} className="me-3" />
                          Login
                        </>
                      )}
                    </button>
                  </div>

                  <div className="col-12 text-center mt-5">
                    <p className="text-muted small">
                      Need an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="btn btn-link p-0 text-decoration-none fw-bold text-primary ms-1"
                        style={{ color: '#173470' }}
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </form>
              </div>

              <div className="px-5 py-4 bg-light bg-opacity-30 border-top d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-success rounded-circle animate-pulse" style={{ width: '8px', height: '8px' }}></div>
                  <span className="text-muted small">System Online</span>
                </div>
                <span className="text-muted extra-small opacity-30">v2.4.0</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-5 text-muted small px-4">
              <p className="mb-3">© 2026 PMC Municipal Administration</p>
              <div className="d-flex justify-content-center gap-4">
                <span className="pointer">Privacy</span>
                <span className="pointer">Terms</span>
                <span className="pointer">Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
