import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../api/apiService';
import { WARDS } from '../constants';
import {
  User, Mail, Phone, Lock, MapPin,
  Building2, ShieldCheck, Check, Eye, EyeOff, AlertCircle, ArrowLeft, ChevronRight
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

        setSuccess('Registration successful! You can now login.');

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
      { strength: 1, label: 'Very weak', color: '#EF4444' },
      { strength: 2, label: 'Weak', color: '#F59E0B' },
      { strength: 3, label: 'So-so', color: '#3B82F6' },
      { strength: 4, label: 'Good', color: '#6366F1' },
      { strength: 5, label: 'Strong', color: '#10B981' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
    }}>
      {/* Tactical Atmospheric Elements */}
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none">
        <div className="position-absolute bottom-0 start-0 p-5">
          <User size={400} strokeWidth={0.5} />
        </div>
      </div>

      <div className="container position-relative py-5 animate-zoomIn">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">

            {/* Branding */}
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-premium circ-blue anim-float" style={{
                width: '80px', height: '80px'
              }}>
                <User className="text-white" size={36} />
              </div>
              <h1 className="fw-black mb-1" style={{ color: '#173470', fontSize: '2.2rem' }}>
                Civic Connect
              </h1>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <span className="text-muted fw-bold small">Citizen Registration</span>
              </div>
            </div>

            {/* Registration Card */}
            <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white">
              <div className="row g-0">
                {/* Form Side */}
                <div className="col-lg-8 border-end bg-white">
                  <div className="p-4 p-md-5">
                    <div className="d-flex justify-content-between align-items-center mb-5">
                      <div>
                        <h4 className="fw-bold mb-1 text-dark">Join the community</h4>
                        <p className="text-muted small mb-0">Fill in your details to get started</p>
                      </div>
                      <button
                        onClick={() => navigate('/')}
                        className="btn btn-light rounded-pill px-4 py-2 small fw-bold d-flex align-items-center gap-2 border shadow-sm transition-all"
                      >
                        <ArrowLeft size={16} /> Back to Login
                      </button>
                    </div>

                    {error && (
                      <div className="alert border-0 shadow-sm d-flex align-items-center mb-5 rounded-4 animate-fadeIn" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                        <AlertCircle size={18} className="me-3" />
                        <div className="small fw-bold">{error}</div>
                      </div>
                    )}

                    {success && (
                      <div className="alert border-0 shadow-sm d-flex align-items-center mb-5 rounded-4 animate-fadeIn" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                        <ShieldCheck size={18} className="me-3" />
                        <div className="small fw-bold">{success}</div>
                      </div>
                    )}

                    <form onSubmit={formik.handleSubmit}>
                      <div className="row g-4">
                        <div className="col-12">
                          <p className="extra-small fw-bold mb-0 uppercase-tracking" style={{ color: '#173470' }}>1. Account Information</p>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Full name</label>
                          <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><User size={18} /></div>
                            <input
                              type="text"
                              className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4 ${formik.touched.name && formik.errors.name ? 'is-invalid border-danger border-2' : ''}`}
                              style={{ paddingLeft: '60px !important' }}
                              placeholder="Enter your full name"
                              {...formik.getFieldProps('name')}
                            />
                          </div>
                          {formik.touched.name && formik.errors.name && (
                            <div className="text-danger extra-small mt-2 ms-3 fw-bold">{formik.errors.name}</div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Email address</label>
                          <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><Mail size={18} /></div>
                            <input
                              type="email"
                              className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4 ${formik.touched.email && formik.errors.email ? 'is-invalid border-danger border-2' : ''}`}
                              style={{ paddingLeft: '60px !important' }}
                              placeholder="yourname@email.com"
                              {...formik.getFieldProps('email')}
                            />
                          </div>
                          {formik.touched.email && formik.errors.email && (
                            <div className="text-danger extra-small mt-2 ms-3 fw-bold">{formik.errors.email}</div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Mobile number</label>
                          <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><Phone size={18} /></div>
                            <input
                              type="tel"
                              className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4 ${formik.touched.mobile && formik.errors.mobile ? 'is-invalid border-danger border-2' : ''}`}
                              style={{ paddingLeft: '60px !important' }}
                              placeholder="10 digit number"
                              maxLength={10}
                              {...formik.getFieldProps('mobile')}
                            />
                          </div>
                          {formik.touched.mobile && formik.errors.mobile && (
                            <div className="text-danger extra-small mt-2 ms-3 fw-bold">{formik.errors.mobile}</div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Select area ward</label>
                          <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><MapPin size={18} /></div>
                            <select
                              className="form-select rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4"
                              style={{ paddingLeft: '60px !important' }}
                              {...formik.getFieldProps('wardNumber')}
                            >
                              <option value="">Select Ward</option>
                              {WARDS.map((ward) => (
                                <option key={ward.wardId} value={ward.number}>
                                  Ward {ward.number} - {ward.area_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Address Line 1 (Home/Building)</label>
                          <div className="position-relative">
                            <div className="position-absolute top-0 start-0 mt-3 ms-4 text-muted opacity-40"><Building2 size={18} /></div>
                            <input
                              type="text"
                              className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4 ${formik.touched.addressLine1 && formik.errors.addressLine1 ? 'is-invalid border-danger border-2' : ''}`}
                              style={{ paddingLeft: '60px !important' }}
                              placeholder="Flat/House No., Building Name"
                              {...formik.getFieldProps('addressLine1')}
                            />
                          </div>
                          {formik.touched.addressLine1 && formik.errors.addressLine1 && (
                            <div className="text-danger extra-small mt-2 ms-3 fw-bold">{formik.errors.addressLine1}</div>
                          )}
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Address Line 2 (Street/Locality)</label>
                          <div className="position-relative">
                            <div className="position-absolute top-0 start-0 mt-3 ms-4 text-muted opacity-40"><MapPin size={18} /></div>
                            <input
                              type="text"
                              className="form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4"
                              style={{ paddingLeft: '60px !important' }}
                              placeholder="Street, Area, Landmark"
                              {...formik.getFieldProps('addressLine2')}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">City</label>
                          <input
                            type="text"
                            className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none px-4 ${formik.touched.city && formik.errors.city ? 'is-invalid border-danger border-2' : ''}`}
                            placeholder="Pune"
                            {...formik.getFieldProps('city')}
                          />
                          {formik.touched.city && formik.errors.city && (
                            <div className="text-danger extra-small mt-2 ms-3 fw-bold">{formik.errors.city}</div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Pincode</label>
                          <input
                            type="text"
                            className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none px-4 ${formik.touched.pincode && formik.errors.pincode ? 'is-invalid border-danger border-2' : ''}`}
                            placeholder="6-digit Pincode"
                            maxLength={6}
                            {...formik.getFieldProps('pincode')}
                          />
                          {formik.touched.pincode && formik.errors.pincode && (
                            <div className="text-danger extra-small mt-2 ms-3 fw-bold">{formik.errors.pincode}</div>
                          )}
                        </div>

                        <div className="col-12 pt-4">
                          <p className="extra-small fw-bold mb-0 uppercase-tracking" style={{ color: '#173470' }}>2. Security Setup</p>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Password</label>
                          <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><Lock size={18} /></div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4 ${formik.touched.password && formik.errors.password ? 'is-invalid border-danger border-2' : ''}`}
                              style={{ paddingLeft: '60px !important' }}
                              placeholder="Min 8 characters"
                              {...formik.getFieldProps('password')}
                            />
                            <button className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none" type="button" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted mb-2 ms-1">Confirm password</label>
                          <div className="position-relative">
                            <div className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40"><ShieldCheck size={18} /></div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              className={`form-control rounded-pill border-0 bg-light py-3 fw-bold shadow-none ps-11 px-4 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid border-danger border-2' : ''}`}
                              style={{ paddingLeft: '60px !important' }}
                              placeholder="Repeat password"
                              {...formik.getFieldProps('confirmPassword')}
                            />
                            <button className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* Password Strength */}
                        {formik.values.password && (
                          <div className="col-12 animate-fadeIn">
                            <div className="px-1 d-flex justify-content-between align-items-center mb-2">
                              <span className="extra-small fw-bold uppercase-tracking" style={{ color: passwordStrength.color }}>Complexity: {passwordStrength.label}</span>
                            </div>
                            <div className="progress rounded-pill bg-light overflow-hidden shadow-sm" style={{ height: '8px' }}>
                              <div className="progress-bar transition-all" style={{ width: `${(passwordStrength.strength / 5) * 100}%`, backgroundColor: passwordStrength.color }}></div>
                            </div>
                          </div>
                        )}

                        <div className="col-12 mt-5">
                          <button
                            type="submit"
                            className="btn w-100 py-3 d-flex align-items-center justify-content-center text-white rounded-pill btn-premium border-0 shadow-premium"
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
                                Creating account...
                              </>
                            ) : (
                              <>
                                Complete Registration <ChevronRight size={20} className="ms-2" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Side Panel */}
                <div className="col-lg-4 bg-light bg-opacity-30 d-none d-lg-block">
                  <div className="p-5 h-100 d-flex flex-column">
                    <h5 className="fw-bold text-dark mb-5">System Features</h5>
                    <div className="d-flex flex-column gap-5">
                      {[
                        { i: ShieldCheck, t: "Identity verification", d: "Accounts are linked to municipal records for secure issue reporting." },
                        { i: MapPin, t: "Localized experience", d: "Issues are automatically routed to your assigned ward officer." },
                        { i: Lock, t: "Encrypted data", d: "Your personal details are stored using government-grade encryption." }
                      ].map((item, idx) => (
                        <div key={idx} className="d-flex gap-4 animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                          <div className="rounded-4 bg-white shadow-sm flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', color: '#173470' }}>
                            <item.i size={20} />
                          </div>
                          <div>
                            <h6 className="fw-bold text-dark small mb-2">{item.t}</h6>
                            <p className="extra-small text-muted mb-0 lh-base fw-medium opacity-75">{item.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-5">
                      <div className="p-4 bg-white border border-dashed rounded-4 text-center shadow-sm">
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                          <div className="bg-success rounded-circle animate-pulse" style={{ width: '8px', height: '8px' }}></div>
                          <span className="extra-small fw-bold text-muted uppercase-tracking">Encryption Active</span>
                        </div>
                        <p className="extra-small text-muted mb-0 opacity-40">Civic Connect v2.4.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-5 text-muted small px-4">
              <p className="mb-3 fw-medium">© 2026 PMC Municipal Administration</p>
              <div className="d-flex justify-content-center gap-4 fw-bold extra-small uppercase-tracking">
                <span className="pointer opacity-50">Support</span>
                <span className="pointer opacity-50">Privacy Policy</span>
                <span className="pointer opacity-50">Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .anim-float { animation: float 6s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .uppercase-tracking { text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; }
                .extra-small { font-size: 11px; }
            `}} />
    </div>
  );
};

export default RegisterCitizen;
