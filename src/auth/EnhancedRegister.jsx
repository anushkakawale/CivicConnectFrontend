import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../api/apiService';
import { useMasterData } from '../contexts/MasterDataContext';
import {
    User, Mail, Phone, Lock, MapPin, Building2, ShieldCheck, Check, Eye, EyeOff,
    AlertCircle, ArrowLeft, ChevronRight, CheckCircle2, XCircle, Shield,
    Globe, Database, Cpu, Activity, Layout, Heart
} from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const EnhancedRegister = () => {
    const navigate = useNavigate();
    const { wards, loading: masterLoading, error: masterError } = useMasterData();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (masterError) console.error("Master Data Error:", masterError);
    }, [masterError]);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            wardNumber: '',
            addressLine1: '',
            addressLine2: '',
            city: 'Pune',
            pincode: ''
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
            wardNumber: Yup.string().required('Ward selection is required'),
            addressLine1: Yup.string()
                .min(5, 'Address Line 1 must be at least 5 characters')
                .required('Address Line 1 is required'),
            addressLine2: Yup.string(),
            city: Yup.string().required('City is required'),
            pincode: Yup.string()
                .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
                .required('Pincode is required')
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
                    wardId: values.wardNumber ? parseInt(values.wardNumber) : null,
                    addressLine1: values.addressLine1.trim(),
                    addressLine2: values.addressLine2.trim(),
                    city: values.city.trim(),
                    pincode: values.pincode
                };

                await apiService.auth.register(registrationData);

                setSuccess('✅ Registration successful! Redirecting to login...');

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

    const getPasswordStrength = () => {
        const password = formik.values.password;
        if (!password) return { strength: 0, label: '', color: '#CBD5E1' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        const levels = [
            { strength: 0, label: '', color: '#CBD5E1' },
            { strength: 1, label: 'Very Weak', color: '#EF4444' },
            { strength: 2, label: 'Weak', color: '#F59E0B' },
            { strength: 3, label: 'Fair', color: '#3B82F6' },
            { strength: 4, label: 'Good', color: '#6366F1' },
            { strength: 5, label: 'Strong', color: '#10B981' }
        ];

        return levels[strength];
    };

    const passwordStrength = getPasswordStrength();

    const passwordRequirements = [
        { label: 'At least 8 characters', test: (p) => p.length >= 8 },
        { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'One number', test: (p) => /\d/.test(p) },
        { label: 'One special character', test: (p) => /[@$!%*?&]/.test(p) }
    ];

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)'
        }}>
            {/* Decorative Background Icons */}
            <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none overflow-hidden">
                <div className="position-absolute top-0 end-0 p-5 opacity-05 anim-float" style={{ animationDelay: '0s' }}>
                    <Building2 size={400} strokeWidth={0.5} style={{ color: PRIMARY_COLOR }} />
                </div>
                <div className="position-absolute bottom-0 start-0 p-5 opacity-05 anim-float-slow" style={{ animationDelay: '1s' }}>
                    <Globe size={300} strokeWidth={0.5} style={{ color: PRIMARY_COLOR }} />
                </div>
                <div className="position-absolute top-20 start-10 opacity-10 anim-pulse-slow">
                    <Shield size={120} strokeWidth={0.5} style={{ color: PRIMARY_COLOR }} />
                </div>
                <div className="position-absolute bottom-20 end-10 opacity-10 anim-float">
                    <Database size={150} strokeWidth={0.5} style={{ color: PRIMARY_COLOR }} />
                </div>
            </div>

            {/* Subtle Grid Pattern */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${PRIMARY_COLOR}20 1px, transparent 1px), linear-gradient(90deg, ${PRIMARY_COLOR}20 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }}></div>

            <div className="container position-relative py-5 animate-zoomIn">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-11">

                        {/* Branding Header */}
                        <div className="text-center mb-5">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-premium circ-blue anim-float" style={{
                                width: '90px', height: '90px', backgroundColor: PRIMARY_COLOR, border: `2px solid rgba(255,255,255,0.2)`
                            }}>
                                <User className="text-white" size={42} strokeWidth={2.5} />
                            </div>
                            <h1 className="fw-black mb-2" style={{ color: PRIMARY_COLOR, fontSize: '3rem', letterSpacing: '-0.04em' }}>
                                CivicConnect
                            </h1>
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <div className="px-3 py-1 rounded-pill d-flex align-items-center gap-2" style={{ background: `${PRIMARY_COLOR}10`, border: `1px solid ${PRIMARY_COLOR}20` }}>
                                    <Shield size={14} style={{ color: PRIMARY_COLOR }} />
                                    <span className="fw-bold extra-small text-uppercase tracking-wider" style={{ color: PRIMARY_COLOR }}>Citizen Registration Portal</span>
                                </div>
                            </div>
                        </div>

                        {/* Registration Card */}
                        <div className="card border-0 shadow-premium-lg rounded-4 overflow-hidden bg-white">
                            <div className="row g-0">
                                {/* Form Side */}
                                <div className="col-lg-8 border-end bg-white">
                                    <div className="p-4 p-md-5">
                                        <div className="d-flex justify-content-between align-items-center mb-5">
                                            <div>
                                                <h4 className="fw-bold mb-1 text-dark">Join Our Community</h4>
                                                <p className="text-muted small mb-0">Create your account to get started</p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/')}
                                                className="btn btn-light rounded-pill px-4 py-2 small fw-bold d-flex align-items-center gap-2 border shadow-sm transition-all hover-lift"
                                            >
                                                <ArrowLeft size={16} /> Back to Login
                                            </button>
                                        </div>

                                        {error && (
                                            <div className="alert border-0 shadow-sm d-flex align-items-start mb-4 rounded-4 animate-fadeIn" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                                                <AlertCircle size={20} className="me-3 mt-1 flex-shrink-0" />
                                                <div className="small fw-medium">{error}</div>
                                            </div>
                                        )}

                                        {success && (
                                            <div className="alert border-0 shadow-sm d-flex align-items-start mb-4 rounded-4 animate-fadeIn" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                                                <CheckCircle2 size={20} className="me-3 mt-1 flex-shrink-0" />
                                                <div className="small fw-medium">{success}</div>
                                            </div>
                                        )}

                                        <form onSubmit={formik.handleSubmit}>
                                            <div className="row g-4">
                                                {/* Section 1: Personal Information */}
                                                <div className="col-12">
                                                    <div className="d-flex align-items-center gap-3 mb-1">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: PRIMARY_COLOR }}>
                                                            <User size={16} className="text-white" />
                                                        </div>
                                                        <p className="small fw-bold mb-0 text-uppercase" style={{ color: PRIMARY_COLOR, letterSpacing: '0.15em' }}>Personal Information</p>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <User size={14} /> Full Name
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <User size={20} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.name && formik.errors.name ? 'is-invalid border-danger border-2' : ''}`}
                                                            style={{ paddingLeft: '60px' }}
                                                            placeholder="Enter your full name"
                                                            {...formik.getFieldProps('name')}
                                                        />
                                                    </div>
                                                    {formik.touched.name && formik.errors.name && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.name}</div>
                                                    )}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <Mail size={14} /> Email Address
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <Mail size={20} />
                                                        </div>
                                                        <input
                                                            type="email"
                                                            className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.email && formik.errors.email ? 'is-invalid border-danger border-2' : ''}`}
                                                            style={{ paddingLeft: '60px' }}
                                                            placeholder="yourname@email.com"
                                                            {...formik.getFieldProps('email')}
                                                        />
                                                    </div>
                                                    {formik.touched.email && formik.errors.email && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.email}</div>
                                                    )}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <Phone size={14} /> Mobile Number
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <Phone size={20} />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.mobile && formik.errors.mobile ? 'is-invalid border-danger border-2' : ''}`}
                                                            style={{ paddingLeft: '60px' }}
                                                            placeholder="10-digit mobile number"
                                                            maxLength={10}
                                                            {...formik.getFieldProps('mobile')}
                                                        />
                                                    </div>
                                                    {formik.touched.mobile && formik.errors.mobile && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.mobile}</div>
                                                    )}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <MapPin size={14} /> Select Ward
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <MapPin size={20} />
                                                        </div>
                                                        <select
                                                            className={`form-select rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.wardNumber && formik.errors.wardNumber ? 'is-invalid border-danger border-2' : ''}`}
                                                            style={{ paddingLeft: '60px' }}
                                                            {...formik.getFieldProps('wardNumber')}
                                                            disabled={masterLoading}
                                                        >
                                                            <option value="">{masterLoading ? "Loading Wards..." : "Choose your ward"}</option>
                                                            {wards.map((ward) => (
                                                                <option key={ward.wardId || ward.id} value={ward.wardId || ward.id}>
                                                                    Ward {ward.wardNumber || ward.number || (ward.wardId || ward.id)} - {ward.areaName || ward.wardName || ward.area_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {formik.touched.wardNumber && formik.errors.wardNumber && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.wardNumber}</div>
                                                    )}
                                                </div>

                                                {/* Section 2: Address Details */}
                                                <div className="col-12 pt-3">
                                                    <div className="d-flex align-items-center gap-3 mb-1">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: PRIMARY_COLOR }}>
                                                            <MapPin size={16} className="text-white" />
                                                        </div>
                                                        <p className="small fw-bold mb-0 text-uppercase" style={{ color: PRIMARY_COLOR, letterSpacing: '0.15em' }}>Address Details</p>
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <Building2 size={14} /> Address Line 1
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <Building2 size={20} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.addressLine1 && formik.errors.addressLine1 ? 'is-invalid border-danger border-2' : ''}`}
                                                            style={{ paddingLeft: '60px' }}
                                                            placeholder="Flat/House No., Building Name"
                                                            {...formik.getFieldProps('addressLine1')}
                                                        />
                                                    </div>
                                                    {formik.touched.addressLine1 && formik.errors.addressLine1 && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.addressLine1}</div>
                                                    )}
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <MapPin size={14} /> Address Line 2 (Optional)
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <MapPin size={20} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none"
                                                            style={{ paddingLeft: '60px' }}
                                                            placeholder="Street, Area, Landmark"
                                                            {...formik.getFieldProps('addressLine2')}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <MapPin size={14} /> City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.city && formik.errors.city ? 'is-invalid border-danger border-2' : ''}`}
                                                        placeholder="Pune"
                                                        {...formik.getFieldProps('city')}
                                                    />
                                                    {formik.touched.city && formik.errors.city && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.city}</div>
                                                    )}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <Database size={14} /> Pincode
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.pincode && formik.errors.pincode ? 'is-invalid border-danger border-2' : ''}`}
                                                        placeholder="6-digit pincode"
                                                        maxLength={6}
                                                        {...formik.getFieldProps('pincode')}
                                                    />
                                                    {formik.touched.pincode && formik.errors.pincode && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.pincode}</div>
                                                    )}
                                                </div>

                                                {/* Section 3: Security Setup */}
                                                <div className="col-12 pt-3">
                                                    <div className="d-flex align-items-center gap-3 mb-1">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: PRIMARY_COLOR }}>
                                                            <ShieldCheck size={16} className="text-white" />
                                                        </div>
                                                        <p className="small fw-bold mb-0 text-uppercase" style={{ color: PRIMARY_COLOR, letterSpacing: '0.15em' }}>Security Setup</p>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <Lock size={14} /> Password
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <Lock size={20} />
                                                        </div>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.password && formik.errors.password ? 'is-invalid border-danger border-2' : ''}`}
                                                            style={{ paddingLeft: '60px' }}
                                                            placeholder="Minimum 8 characters"
                                                            {...formik.getFieldProps('password')}
                                                        />
                                                        <button className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none" type="button" onClick={() => setShowPassword(!showPassword)}>
                                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-muted mb-2 ms-1 d-flex align-items-center gap-2">
                                                        <ShieldCheck size={14} /> Confirm Password
                                                    </label>
                                                    <div className="position-relative">
                                                        <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-50">
                                                            <ShieldCheck size={20} />
                                                        </div>
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            className={`form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid border-danger border-2' : ''}`}
                                                            style={{ paddingLeft: '60px' }}
                                                            placeholder="Re-enter password"
                                                            {...formik.getFieldProps('confirmPassword')}
                                                        />
                                                        <button className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                                        <div className="text-danger extra-small mt-2 ms-3 fw-medium">{formik.errors.confirmPassword}</div>
                                                    )}
                                                </div>

                                                {/* Password Strength Indicator */}
                                                {formik.values.password && (
                                                    <div className="col-12 animate-fadeIn">
                                                        <div className="card border-0 bg-light rounded-4 p-4">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                <span className="small fw-bold text-muted">Password Strength</span>
                                                                <span className="small fw-bold" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                                                            </div>
                                                            <div className="progress rounded-pill bg-white overflow-hidden shadow-sm mb-3" style={{ height: '8px' }}>
                                                                <div className="progress-bar transition-all" style={{ width: `${(passwordStrength.strength / 5) * 100}%`, backgroundColor: passwordStrength.color }}></div>
                                                            </div>
                                                            <div className="row g-2">
                                                                {passwordRequirements.map((req, idx) => {
                                                                    const passed = req.test(formik.values.password);
                                                                    return (
                                                                        <div key={idx} className="col-12">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                {passed ? (
                                                                                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                                                                                ) : (
                                                                                    <XCircle size={16} className="text-muted opacity-30 flex-shrink-0" />
                                                                                )}
                                                                                <span className={`extra-small ${passed ? 'text-success fw-medium' : 'text-muted'}`}>
                                                                                    {req.label}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="col-12 mt-5">
                                                    <button
                                                        type="submit"
                                                        className="btn w-100 py-4 d-flex align-items-center justify-content-center text-white rounded-pill btn-premium border-0 shadow-lg transition-all"
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
                                                                Creating Your Account...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Complete Registration <ChevronRight size={22} className="ms-2" />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Right Side Panel */}
                                <div className="col-lg-4 d-none d-lg-block" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #1a3a7a 100%)` }}>
                                    <div className="p-5 h-100 d-flex flex-column text-white">
                                        <div className="d-flex align-items-center gap-3 mb-5">
                                            <div className="rounded-circle bg-white p-3 shadow-sm">
                                                <Activity size={28} style={{ color: PRIMARY_COLOR }} />
                                            </div>
                                            <h5 className="fw-bold mb-0">Citizen Benefits</h5>
                                        </div>
                                        <div className="d-flex flex-column gap-4">
                                            {[
                                                { i: ShieldCheck, t: "Secure Identity", d: "Your account is linked to municipal records for authentic issue reporting.", c: "#60A5FA" },
                                                { i: MapPin, t: "Ward Routing", d: "Complaints are automatically routed to your assigned ward officer.", c: "#34D399" },
                                                { i: Lock, t: "Data Privacy", d: "Your personal data is protected with enterprise-level encryption.", c: "#FBBF24" },
                                                { i: Heart, t: "Community Impact", d: "Track your complaints and receive instant notifications on progress.", c: "#F87171" }
                                            ].map((item, idx) => (
                                                <div key={idx} className="d-flex gap-3 animate-fadeIn hover-lift transition-all p-3 rounded-4" style={{ animationDelay: `${idx * 0.1}s`, background: 'rgba(255,255,255,0.05)' }}>
                                                    <div className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '56px', height: '56px', background: 'white' }}>
                                                        <item.i size={26} style={{ color: item.c }} />
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold small mb-2">{item.t}</h6>
                                                        <p className="extra-small mb-0 opacity-80 lh-base">{item.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-5">
                                            <div className="p-4 bg-white bg-opacity-10 backdrop-blur rounded-4 text-center border overflow-hidden position-relative" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none">
                                                    <Shield size={100} className="position-absolute bottom-n20 end-n20" />
                                                </div>
                                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                                    <div className="bg-success rounded-circle animate-pulse" style={{ width: '8px', height: '8px' }}></div>
                                                    <span className="extra-small fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Secure Connection</span>
                                                </div>
                                                <p className="extra-small mb-0 opacity-75 d-flex align-items-center justify-content-center gap-2">
                                                    <Layout size={10} /> CivicConnect v2.5.0
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="text-center mt-5 px-4">
                            <p className="mb-3 text-muted fw-medium d-flex align-items-center justify-content-center gap-2 small">
                                <Building2 size={14} /> © 2026 PMC Municipal Administration
                            </p>
                            <div className="d-flex justify-content-center gap-4">
                                <Link to="/support" className="text-muted text-decoration-none hover-primary transition-all small fw-medium d-flex align-items-center gap-1">
                                    <Mail size={12} /> Support
                                </Link>
                                <Link to="/privacy" className="text-muted text-decoration-none hover-primary transition-all small fw-medium d-flex align-items-center gap-1">
                                    <Shield size={12} /> Privacy Policy
                                </Link>
                                <Link to="/terms" className="text-muted text-decoration-none hover-primary transition-all small fw-medium d-flex align-items-center gap-1">
                                    <ShieldCheck size={12} /> Terms of Service
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
          .hover-lift { transition: transform 0.2s ease; }
          .hover-lift:hover { transform: translateY(-3px); }
          .hover-primary:hover { color: ${PRIMARY_COLOR} !important; }
          .transition-all { transition: all 0.3s ease; }
          .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15); }
          .pointer-events-none { pointer-events: none; }
          .backdrop-blur { backdrop-filter: blur(10px); }
          .focus-glow:focus { border-color: ${PRIMARY_COLOR} !important; box-shadow: 0 0 0 4px rgba(36, 71, 153, 0.1) !important; background-color: white !important; }
        `}} />
        </div>
    );
};

export default EnhancedRegister;
