import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';
import {
    Building2, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle,
    Shield, CheckCircle2, ShieldCheck, Activity, Database,
    Users, Globe, Cpu, Layout
} from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const EnhancedLogin = () => {
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
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{
            background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #1a3a7a 100%)`
        }}>
            {/* Decorative Background Icons */}
            <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none overflow-hidden">
                <div className="position-absolute top-0 end-0 p-5 opacity-05 anim-float" style={{ animationDelay: '0s' }}>
                    <Building2 size={400} strokeWidth={0.5} className="text-white" />
                </div>
                <div className="position-absolute bottom-0 start-0 p-5 opacity-05 anim-float-slow" style={{ animationDelay: '1s' }}>
                    <Globe size={300} strokeWidth={0.5} className="text-white" />
                </div>
                <div className="position-absolute top-20 start-10 opacity-10 anim-pulse-slow">
                    <Shield size={120} strokeWidth={0.5} className="text-white" />
                </div>
                <div className="position-absolute bottom-20 end-10 opacity-10 anim-float">
                    <Database size={150} strokeWidth={0.5} className="text-white" />
                </div>
                <div className="position-absolute top-50 start-50 translate-middle opacity-05">
                    <Cpu size={500} strokeWidth={0.2} className="text-white" />
                </div>
            </div>

            {/* Animated Grid Pattern Overlay */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }}></div>

            <div className="container position-relative py-5 animate-zoomIn">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-6 col-xl-5">

                        {/* Branding Header */}
                        <div className="text-center mb-5">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-premium" style={{
                                width: '100px', height: '100px', background: 'white', border: '4px solid rgba(255,255,255,0.3)'
                            }}>
                                <Building2 style={{ color: PRIMARY_COLOR }} size={48} strokeWidth={2.5} />
                            </div>
                            <h1 className="fw-black mb-2 text-white" style={{ fontSize: '3rem', letterSpacing: '-0.04em', textShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                CivicConnect
                            </h1>
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <div className="px-3 py-1 rounded-pill d-flex align-items-center gap-2" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <ShieldCheck size={14} className="text-white opacity-75" />
                                    <span className="text-white fw-bold extra-small text-uppercase tracking-wider opacity-90">Official Municipal Portal</span>
                                </div>
                            </div>
                        </div>

                        {/* Login Card */}
                        <div className="card border-0 shadow-premium-lg rounded-4 overflow-hidden bg-white" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="px-5 pt-5 pb-4 border-bottom bg-white text-center position-relative">
                                <h4 className="fw-bold mb-1 text-dark">Welcome Back</h4>
                                <p className="text-muted small mb-0 d-flex align-items-center justify-content-center gap-2">
                                    <Activity size={14} className="text-primary opacity-50" />
                                    Sign in to access your secure dashboard
                                </p>
                            </div>

                            <div className="card-body p-5">
                                {error && (
                                    <div className="alert border-0 shadow-sm d-flex align-items-start mb-4 rounded-4 animate-fadeIn" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                                        <AlertCircle size={20} className="me-3 mt-1 flex-shrink-0" />
                                        <div className="small fw-medium">{error}</div>
                                    </div>
                                )}

                                <form onSubmit={formik.handleSubmit} className="row g-4">
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                            <Mail size={14} /> Email Address
                                        </label>
                                        <div className="position-relative">
                                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                <Mail size={20} />
                                            </div>
                                            <input
                                                type="email"
                                                className={`form-control rounded-pill border-0 bg-light py-4 fw-medium shadow-none transition-all ${formik.touched.email && formik.errors.email ? 'is-invalid border-danger border-2' : 'focus-glow'}`}
                                                style={{ paddingLeft: '60px', fontSize: '1rem', border: '2px solid transparent' }}
                                                placeholder="yourname@email.com"
                                                {...formik.getFieldProps('email')}
                                            />
                                        </div>
                                        {formik.touched.email && formik.errors.email && (
                                            <div className="text-danger small mt-2 ms-2 fw-medium animate-fadeIn">{formik.errors.email}</div>
                                        )}
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                            <Lock size={14} /> Password
                                        </label>
                                        <div className="position-relative">
                                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                <Lock size={20} />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className={`form-control rounded-pill border-0 bg-light py-4 fw-medium shadow-none transition-all ${formik.touched.password && formik.errors.password ? 'is-invalid border-danger border-2' : 'focus-glow'}`}
                                                style={{ paddingLeft: '60px', fontSize: '1rem', border: '2px solid transparent' }}
                                                placeholder="Enter your password"
                                                {...formik.getFieldProps('password')}
                                            />
                                            <button
                                                className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none hover-scale"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="text-danger small mt-2 ms-2 fw-medium animate-fadeIn">{formik.errors.password}</div>
                                        )}
                                    </div>

                                    <div className="col-12 pt-3">
                                        <button
                                            type="submit"
                                            className="btn w-100 py-4 d-flex align-items-center justify-content-center text-white rounded-pill btn-premium transition-all border-0 shadow-lg"
                                            disabled={isLoading}
                                            style={{
                                                backgroundColor: PRIMARY_COLOR,
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                letterSpacing: '0.02em'
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-3" role="status"></span>
                                                    Authenticating...
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn size={22} className="me-3" />
                                                    Sign In
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="col-12 text-center mt-5">
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <div className="flex-grow-1 border-bottom opacity-10"></div>
                                            <span className="text-muted extra-small fw-bold text-uppercase">New User?</span>
                                            <div className="flex-grow-1 border-bottom opacity-10"></div>
                                        </div>
                                        <p className="text-muted small mb-0 mt-3">
                                            Don't have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={() => navigate('/register')}
                                                className="btn btn-link p-0 text-decoration-none fw-bold ms-1 hover-lift"
                                                style={{ color: PRIMARY_COLOR }}
                                            >
                                                Register Now
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </div>

                            <div className="px-5 py-4 bg-light bg-opacity-50 border-top d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-success rounded-circle animate-pulse" style={{ width: '8px', height: '8px' }}></div>
                                    <span className="text-muted small fw-medium d-flex align-items-center gap-2">
                                        <Shield size={12} /> System Online
                                    </span>
                                </div>
                                <span className="text-muted extra-small opacity-50 fw-medium d-flex align-items-center gap-1">
                                    <Layout size={10} /> v2.5.0
                                </span>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="text-center mt-5 px-4">
                            <p className="mb-3 text-white opacity-75 fw-medium d-flex align-items-center justify-content-center gap-2 small">
                                <Building2 size={14} /> © 2026 PMC Municipal Administration
                            </p>
                            <div className="d-flex justify-content-center gap-4">
                                <Link to="/privacy" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-all small fw-medium d-flex align-items-center gap-1">
                                    <Shield size={12} /> Privacy
                                </Link>
                                <Link to="/terms" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-all small fw-medium d-flex align-items-center gap-1">
                                    <ShieldCheck size={12} /> Terms
                                </Link>
                                <Link to="/support" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-all small fw-medium d-flex align-items-center gap-1">
                                    <Mail size={12} /> Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
          .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
          .shadow-premium-lg { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
          .anim-float { animation: float 6s ease-in-out infinite; }
          .anim-float-slow { animation: float 10s ease-in-out infinite; }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
          .animate-pulse { animation: pulse 2s infinite; }
          .anim-pulse-slow { animation: pulse 4s infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          .animate-zoomIn { animation: zoomIn 0.4s ease-out; }
          @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .extra-small { font-size: 11px; }
          .hover-opacity-100:hover { opacity: 1 !important; }
          .transition-all { transition: all 0.3s ease; }
          .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15); }
          .pointer-events-none { pointer-events: none; }
          .hover-lift:hover { transform: translateY(-2px); }
          .hover-scale:hover { transform: scale(1.1); }
          .focus-glow:focus { border-color: ${PRIMARY_COLOR} !important; box-shadow: 0 0 0 4px rgba(36, 71, 153, 0.1) !important; background-color: white !important; }
        `}} />
        </div>
    );
};

export default EnhancedLogin;
