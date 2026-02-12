import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService, { createComplaintFormData } from '../../api/apiService';
import { useMasterData } from '../../contexts/MasterDataContext';
import {
    Plus, FileText, Building2, Upload, AlertCircle, Loader,
    MapPin, X, CheckCircle, Send, Image as ImageIcon,
    ChevronRight, ChevronLeft, ShieldCheck, Info, Clock, Shield, Search, Zap, Compass
} from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const RegisterComplaintEnhanced = () => {
    const navigate = useNavigate();
    const { departments: masterDepartments, wards: masterWards } = useMasterData();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userWard, setUserWard] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(1);
    const [localDepartments, setLocalDepartments] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Verify authentication first
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');

            if (!token || role !== 'CITIZEN') {
                setError("⚠️ Authentication required. Please log in as a citizen.");
                setTimeout(() => navigate('/'), 2000);
                return;
            }

            // Parallel fetch for speed
            const [profileRes, deptRes] = await Promise.allSettled([
                apiService.profile.getProfile(),
                apiService.masterData.getDepartments()
            ]);

            // Handle Profile
            if (profileRes.status === 'fulfilled') {
                const profileData = profileRes.value.data || profileRes.value;
                if (profileData) {
                    const wId = profileData.wardId || profileData.wardNumber;
                    if (wId) {
                        formik.setFieldValue('wardId', String(wId));
                        const ward = masterWards.find(w =>
                            (w.wardId === parseInt(wId)) || (w.number === parseInt(wId))
                        );
                        setUserWard(ward || { number: wId, areaName: profileData.areaName || profileData.wardName || 'Local Area' });
                    }
                }
            }

            // Handle Departments (Fallback if Context fails)
            if (deptRes.status === 'fulfilled' && (!masterDepartments || masterDepartments.length === 0)) {
                const raw = deptRes.value;
                const dData = Array.isArray(raw) ? raw : (raw.data || []);
                setLocalDepartments(dData);
            }
        } catch (err) {
            console.error('Failed to load initial data:', err);
            setError("⚠️ Failed to load area details. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const attemptAutoLocation = () => {
        if (!navigator.geolocation) {
            setError("📍 Location sharing is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                formik.setFieldValue('latitude', pos.coords.latitude.toFixed(6));
                formik.setFieldValue('longitude', pos.coords.longitude.toFixed(6));
                setSuccess("✅ Location updated successfully");
                setTimeout(() => setSuccess(''), 2000);
            },
            () => setError("📍 Please allow location access in your browser"),
            { enableHighAccuracy: true }
        );
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (selectedImages.length + files.length > 5) {
                setError("📸 Maximum 5 images allowed");
                return;
            }
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setSelectedImages([...selectedImages, ...files]);
            setImagePreviews([...imagePreviews, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        URL.revokeObjectURL(imagePreviews[index]);
        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            departmentId: '',
            wardId: '',
            location: '',
            latitude: '',
            longitude: ''
        },
        validationSchema: Yup.object({
            title: Yup.string()
                .required('Title is required')
                .min(10, 'Title must be at least 10 characters')
                .max(100, 'Title must be under 100 characters'),
            description: Yup.string()
                .required('Description is required')
                .min(20, 'Please provide more detail (min 20 chars)')
                .max(1000, 'Description must be under 1000 characters'),
            departmentId: Yup.string().required('Please select a category'),
            location: Yup.string().required('Please provide a location')
        }),
        onSubmit: async (values) => {
            setSubmitting(true);
            setError('');
            setSuccess('');

            try {
                // Double-check authentication before submission
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');

                if (!token) {
                    setError("🔑 Session expired. Please log in again.");
                    setTimeout(() => {
                        localStorage.clear();
                        navigate('/');
                    }, 2000);
                    return;
                }

                if (role !== 'CITIZEN') {
                    setError("🔒 Only citizens can submit complaints. Current role: " + role);
                    return;
                }

                // Unified Data Object
                const complaintData = {
                    title: values.title.trim(),
                    description: values.description.trim(),
                    departmentId: parseInt(values.departmentId),
                    wardId: parseInt(values.wardId),
                    address: values.location.trim(),
                    latitude: values.latitude ? parseFloat(values.latitude) : null,
                    longitude: values.longitude ? parseFloat(values.longitude) : null,
                    images: selectedImages
                };

                // Enhanced Security Diagnostics
                console.group('🔐 Security Diagnostics');
                console.log('📤 Submitting complaint:', {
                    ...complaintData,
                    images: `${selectedImages.length} file(s)`
                });
                console.log('🔑 Token Present:', token ? 'Yes' : 'No');
                console.log('👤 Role:', role);

                // Decode and verify JWT token
                if (token) {
                    try {
                        const tokenParts = token.split('.');
                        if (tokenParts.length === 3) {
                            const payload = JSON.parse(atob(tokenParts[1]));
                            console.log('🎫 Token Payload:', {
                                sub: payload.sub,
                                role: payload.role,
                                authorities: payload.authorities,
                                exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A',
                                iat: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'
                            });

                            // Check if token has expired
                            if (payload.exp && payload.exp * 1000 < Date.now()) {
                                console.error('⚠️ TOKEN EXPIRED! Please log out and log back in.');
                                setError("🔑 Your session has expired. Please log out and log back in.");
                                setSubmitting(false);
                                return;
                            }

                            // Verify CITIZEN role
                            const hasCitizenRole =
                                payload.role === 'CITIZEN' ||
                                payload.role === 'ROLE_CITIZEN' ||
                                (payload.authorities && (
                                    payload.authorities.includes('ROLE_CITIZEN') ||
                                    payload.authorities.includes('CITIZEN')
                                ));

                            if (!hasCitizenRole) {
                                console.error('❌ ROLE MISMATCH! Token does not have CITIZEN role.');
                                console.error('Expected: ROLE_CITIZEN or CITIZEN');
                                console.error('Actual:', payload.role || payload.authorities);
                                setError("🔒 Invalid role. Please log out and log back in as a citizen.");
                                setSubmitting(false);
                                return;
                            }

                            console.log('✅ Token is valid and has CITIZEN role');
                        }
                    } catch (e) {
                        console.error('⚠️ Failed to decode token:', e);
                    }
                }
                console.groupEnd();

                // Use the Strategic Unified Form Data Generator
                const formData = createComplaintFormData(complaintData);

                // Atomic submission: Details + Image in one request
                const response = await apiService.citizen.createComplaint(formData);

                console.log('✅ Complaint submitted successfully:', response);

                setSuccess("✅ Complaint submitted successfully! Redirecting...");

                // Redirect after showing success message
                setTimeout(() => {
                    navigate('/citizen/complaints');
                }, 2000);
            } catch (err) {
                console.error('❌ Complaint submission error:', err);
                console.error('Error details:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });

                // Enhanced error handling
                if (err.response?.status === 403) {
                    const errorMsg = err.response?.data?.message || err.response?.data;
                    setError(`🔒 Access Denied: ${typeof errorMsg === 'string' ? errorMsg : 'You don\'t have permission to submit complaints'}. Please log out and log back in, or contact support if the issue persists.`);
                } else if (err.response?.status === 401) {
                    setError("🔑 Session Expired: Please log in again to submit your complaint.");
                    setTimeout(() => {
                        localStorage.clear();
                        navigate('/');
                    }, 2000);
                } else if (err.response?.status === 400) {
                    const errorMsg = err.response?.data?.message || err.response?.data;
                    setError(`⚠️ Invalid Data: ${typeof errorMsg === 'string' ? errorMsg : 'Please check your input and try again'}.`);
                } else {
                    setError(err.response?.data?.message || err.message || "❌ Something went wrong. Please try again or contact support.");
                }
            } finally {
                setSubmitting(false);
            }
        }
    });

    const nextStep = () => {
        if (activeStep === 1) {
            if (formik.values.title.length < 10 || formik.values.description.length < 20) {
                setError("⚠️ Please provide a valid title and description.");
                return;
            }
        }
        if (activeStep === 2) {
            if (!formik.values.departmentId) {
                setError("⚠️ Please select a category.");
                return;
            }
        }
        if (activeStep === 3) {
            if (!formik.values.location) {
                setError("⚠️ Please provide a nearest address or location.");
                return;
            }
        }
        setError('');
        setActiveStep(prev => prev + 1);
    };

    const prevStep = () => {
        setError('');
        setActiveStep(prev => prev - 1);
    };

    const departments = masterDepartments.length > 0 ? masterDepartments : localDepartments;

    const steps = [
        { num: 1, label: 'Details', icon: FileText },
        { num: 2, label: 'Category', icon: Building2 },
        { num: 3, label: 'Location', icon: MapPin },
        { num: 4, label: 'Images', icon: ImageIcon },
        { num: 5, label: 'Review', icon: CheckCircle }
    ];

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
                <div className="text-center">
                    <Loader size={48} className="animate-spin mb-3" style={{ color: PRIMARY_COLOR }} />
                    <p className="text-muted fw-medium">Loading complaint form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
            <div className="container">
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-lg" style={{ width: '80px', height: '80px', backgroundColor: PRIMARY_COLOR }}>
                        <Plus className="text-white" size={36} strokeWidth={2.5} />
                    </div>
                    <h2 className="fw-black mb-2" style={{ color: PRIMARY_COLOR }}>Register New Complaint</h2>
                    <p className="text-muted">Report civic issues in your area</p>
                </div>

                {/* Progress Steps */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center position-relative">
                        {/* Progress Line */}
                        <div className="position-absolute top-50 start-0 translate-middle-y w-100" style={{ height: '2px', backgroundColor: '#E2E8F0', zIndex: 0 }}>
                            <div className="h-100 transition-all" style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`, backgroundColor: PRIMARY_COLOR }}></div>
                        </div>

                        {/* Steps */}
                        {steps.map((step) => {
                            const StepIcon = step.icon;
                            const isActive = activeStep === step.num;
                            const isCompleted = activeStep > step.num;

                            return (
                                <div key={step.num} className="text-center position-relative" style={{ zIndex: 1 }}>
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 transition-all ${isActive || isCompleted ? 'shadow-sm' : ''}`}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: isActive || isCompleted ? PRIMARY_COLOR : '#FFFFFF',
                                            border: `2px solid ${isActive || isCompleted ? PRIMARY_COLOR : '#CBD5E1'}`
                                        }}
                                    >
                                        <StepIcon
                                            size={20}
                                            className={isActive || isCompleted ? 'text-white' : 'text-muted'}
                                        />
                                    </div>
                                    <div className={`small fw-bold ${isActive ? '' : 'text-muted'}`} style={{ color: isActive ? PRIMARY_COLOR : undefined }}>
                                        {step.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert border-0 shadow-sm d-flex align-items-start rounded-4 mb-4 animate-fadeIn" style={{ backgroundColor: '#FEF2F2' }}>
                        <AlertCircle size={20} className="me-3 mt-1 flex-shrink-0" style={{ color: '#EF4444' }} />
                        <div className="small fw-medium" style={{ color: '#EF4444' }}>{error}</div>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="alert border-0 shadow-sm d-flex align-items-start rounded-4 mb-4 animate-fadeIn" style={{ backgroundColor: '#ECFDF5' }}>
                        <CheckCircle size={20} className="me-3 mt-1 flex-shrink-0" style={{ color: '#10B981' }} />
                        <div className="small fw-medium" style={{ color: '#10B981' }}>{success}</div>
                    </div>
                )}

                {/* Form Card */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="card-body p-5">
                            {/* Step 1: Details */}
                            {activeStep === 1 && (
                                <div className="animate-fadeIn">
                                    <h5 className="fw-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                                        <FileText size={24} className="me-2" />
                                        Complaint Details
                                    </h5>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark mb-2">Title *</label>
                                        <input
                                            type="text"
                                            className={`form-control rounded-3 border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.title && formik.errors.title ? 'border-danger border-2' : ''}`}
                                            placeholder="Brief summary of the issue (min 10 characters)"
                                            {...formik.getFieldProps('title')}
                                        />
                                        {formik.touched.title && formik.errors.title && (
                                            <div className="text-danger small mt-2 fw-medium">{formik.errors.title}</div>
                                        )}
                                        <div className="text-muted extra-small mt-1">{formik.values.title.length}/100 characters</div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark mb-2">Description *</label>
                                        <textarea
                                            className={`form-control rounded-3 border-0 bg-light py-3 fw-medium shadow-none ${formik.touched.description && formik.errors.description ? 'border-danger border-2' : ''}`}
                                            rows="6"
                                            placeholder="Provide detailed information about the issue (min 20 characters)"
                                            {...formik.getFieldProps('description')}
                                        ></textarea>
                                        {formik.touched.description && formik.errors.description && (
                                            <div className="text-danger small mt-2 fw-medium">{formik.errors.description}</div>
                                        )}
                                        <div className="text-muted extra-small mt-1">{formik.values.description.length}/1000 characters</div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Category */}
                            {activeStep === 2 && (
                                <div className="animate-fadeIn">
                                    <h5 className="fw-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                                        <Building2 size={24} className="me-2" />
                                        Select Category
                                    </h5>

                                    <div className="row g-3">
                                        {departments.map((dept) => (
                                            <div key={dept.departmentId || dept.id} className="col-md-6">
                                                <div
                                                    className={`card border-2 rounded-3 p-4 cursor-pointer transition-all hover-lift ${formik.values.departmentId === String(dept.departmentId || dept.id) ? 'shadow-sm' : ''}`}
                                                    style={{
                                                        borderColor: formik.values.departmentId === String(dept.departmentId || dept.id) ? PRIMARY_COLOR : '#E2E8F0',
                                                        backgroundColor: formik.values.departmentId === String(dept.departmentId || dept.id) ? `${PRIMARY_COLOR}10` : '#FFFFFF'
                                                    }}
                                                    onClick={() => formik.setFieldValue('departmentId', String(dept.departmentId || dept.id))}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                backgroundColor: formik.values.departmentId === String(dept.departmentId || dept.id) ? PRIMARY_COLOR : `${PRIMARY_COLOR}15`
                                                            }}
                                                        >
                                                            <Building2
                                                                size={24}
                                                                className={formik.values.departmentId === String(dept.departmentId || dept.id) ? 'text-white' : ''}
                                                                style={{ color: formik.values.departmentId === String(dept.departmentId || dept.id) ? undefined : PRIMARY_COLOR }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <h6 className="fw-bold mb-1 text-dark">
                                                                {dept.name || dept.departmentName || dept.department_name || 'Department Service'}
                                                            </h6>
                                                            <p className="text-muted small mb-0">{dept.description || 'Civic Services'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Location */}
                            {activeStep === 3 && (
                                <div className="animate-fadeIn">
                                    <h5 className="fw-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                                        <MapPin size={24} className="me-2" />
                                        Location Details
                                    </h5>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark mb-2">Select Ward Area *</label>
                                        <div className="input-group border rounded-3 bg-light overflow-hidden">
                                            <span className="input-group-text border-0 bg-transparent text-primary"><MapPin size={18} style={{ color: PRIMARY_COLOR }} /></span>
                                            <select
                                                {...formik.getFieldProps('wardId')}
                                                className="form-select border-0 bg-transparent py-3 fw-medium shadow-none text-dark"
                                            >
                                                <option value="">Select Ward</option>
                                                {masterWards.map(w => (
                                                    <option key={w.wardId || w.id} value={w.wardId || w.id}>
                                                        Ward {w.wardNumber || (w.wardId || w.id)} - {w.areaName}
                                                        {(userWard && (String(w.wardId || w.id) === String(userWard.wardId || userWard.id))) ? ' (Your Home Ward)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {formik.touched.wardId && formik.errors.wardId && (
                                            <div className="text-danger small mt-2 fw-medium">{formik.errors.wardId}</div>
                                        )}
                                        {userWard && (
                                            <div className="d-flex align-items-center gap-2 mt-2 px-2">
                                                <Info size={14} className="text-muted" />
                                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    Defaulted to your registered home ward. You can change this if the issue is elsewhere.
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark mb-2">Address / Nearest Landmark *</label>
                                        <textarea
                                            className={`form-control rounded-3 border-0 bg-light py-3 fw-medium shadow-none text-dark ${formik.touched.location && formik.errors.location ? 'border-danger border-2' : ''}`}
                                            rows="3"
                                            placeholder="e.g., Near City Hospital, Main Road, Sector 5"
                                            {...formik.getFieldProps('location')}
                                        ></textarea>
                                        {formik.touched.location && formik.errors.location && (
                                            <div className="text-danger small mt-2 fw-medium">{formik.errors.location}</div>
                                        )}
                                    </div>

                                    {/* Auto-Detect Button */}
                                    <div className="mb-4">
                                        <button
                                            type="button"
                                            className="btn rounded-pill px-4 py-3 fw-black d-flex align-items-center gap-2 shadow-premium w-100 transition-all hover-up-tiny"
                                            onClick={attemptAutoLocation}
                                            style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
                                        >
                                            <Compass size={20} className="animate-pulse" />
                                            USE CURRENT LOCATION
                                        </button>
                                        <div className="d-flex align-items-center gap-2 mt-2 px-2">
                                            <Info size={14} className="text-muted" />
                                            <small className="text-muted fw-bold uppercase" style={{ fontSize: '0.6rem' }}>
                                                Detects your current coordinates for accurate location
                                            </small>
                                        </div>
                                    </div>

                                    {/* Manual Coordinates Entry / Visualization */}
                                    <div className={`card border-0 shadow-premium rounded-4 p-4 mb-4 transition-all ${formik.values.latitude ? 'bg-success bg-opacity-5 border border-success border-opacity-10' : 'bg-light bg-opacity-50'}`} style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-dashed">
                                            <div className="d-flex align-items-center gap-2">
                                                <Compass size={18} className={formik.values.latitude ? 'text-success' : 'text-primary'} />
                                                <label className="form-label fw-black text-dark mb-0 extra-small uppercase tracking-widest">Location Coordinates</label>
                                            </div>
                                            {formik.values.latitude && formik.values.longitude ? (
                                                <span className="badge bg-success rounded-pill px-3 py-2 extra-small fw-black uppercase shadow-sm">
                                                    <CheckCircle size={14} className="me-1" />
                                                    Locked
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary bg-opacity-10 text-muted rounded-pill px-3 py-2 extra-small fw-black uppercase">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="extra-small fw-black text-muted mb-2 uppercase opacity-40">Latitude</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    className="form-control rounded-3 border-0 bg-white py-3 fw-bold shadow-sm extra-small text-dark"
                                                    placeholder="0.000000"
                                                    {...formik.getFieldProps('latitude')}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="extra-small fw-black text-muted mb-2 uppercase opacity-40">Longitude</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    className="form-control rounded-3 border-0 bg-white py-3 fw-bold shadow-sm extra-small text-dark"
                                                    placeholder="0.000000"
                                                    {...formik.getFieldProps('longitude')}
                                                />
                                            </div>
                                        </div>
                                        {formik.values.latitude && (
                                            <div className="mt-4 p-3 rounded-4 bg-white border shadow-sm d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-success bg-opacity-10 p-2 text-success"><MapPin size={16} /></div>
                                                <div>
                                                    <div className="extra-small text-muted fw-bold uppercase opacity-50" style={{ fontSize: '0.55rem' }}>Selected Location</div>
                                                    <div className="extra-small fw-black text-dark">{formik.values.latitude}, {formik.values.longitude}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Images */}
                            {activeStep === 4 && (
                                <div className="animate-fadeIn">
                                    <h5 className="fw-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                                        <ImageIcon size={24} className="me-2" />
                                        Upload Images (Optional)
                                    </h5>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark mb-2">Add Photos (Max 5)</label>
                                        <div className="border-2 border-dashed rounded-3 p-5 text-center" style={{ borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' }}>
                                            <Upload size={48} className="mb-3 text-muted" />
                                            <p className="text-muted mb-3">Drag and drop images here, or click to browse</p>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="d-none"
                                                id="imageUpload"
                                            />
                                            <label htmlFor="imageUpload" className="btn rounded-pill px-4 py-2 fw-bold text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                <Plus size={18} className="me-2" />
                                                Choose Images
                                            </label>
                                        </div>
                                    </div>

                                    {imagePreviews.length > 0 && (
                                        <div className="row g-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="col-md-4">
                                                    <div className="position-relative rounded-3 overflow-hidden shadow-sm">
                                                        <img src={preview} alt={`Preview ${index + 1}`} className="w-100" style={{ height: '200px', objectFit: 'cover' }} />
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 m-2"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {activeStep === 5 && (
                                <div className="animate-fadeIn">
                                    <h5 className="fw-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                                        <CheckCircle size={24} className="me-2" />
                                        Review & Submit
                                    </h5>

                                    <div className="card border-0 bg-light rounded-3 p-4 mb-3">
                                        <h6 className="fw-bold text-dark mb-3">Complaint Summary</h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <div className="small text-muted mb-1">Title</div>
                                                <div className="fw-bold text-dark">{formik.values.title}</div>
                                            </div>
                                            <div className="col-12">
                                                <div className="small text-muted mb-1">Description</div>
                                                <div className="text-dark">{formik.values.description}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="small text-muted mb-1">Category</div>
                                                <div className="fw-bold text-dark">
                                                    {departments.find(d => String(d.departmentId || d.id) === formik.values.departmentId)?.name || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="small text-muted mb-1">Ward</div>
                                                <div className="fw-bold text-dark">Ward {userWard?.number} - {userWard?.areaName}</div>
                                            </div>
                                            <div className="col-12">
                                                <div className="small text-muted mb-1">Location</div>
                                                <div className="text-dark">{formik.values.location}</div>
                                            </div>
                                            <div className="col-12">
                                                <div className="small text-muted mb-1">Images</div>
                                                <div className="fw-bold text-dark">{selectedImages.length} image(s) attached</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="alert border-0 shadow-sm rounded-3" style={{ backgroundColor: '#FEF3C7' }}>
                                        <div className="d-flex align-items-start gap-2">
                                            <Info size={18} className="mt-1 flex-shrink-0" style={{ color: '#F59E0B' }} />
                                            <div className="small" style={{ color: '#92400E' }}>
                                                <strong>Please review carefully.</strong> Once submitted, you cannot edit the complaint details.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Footer */}
                        <div className="card-footer bg-light border-0 p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
                                    onClick={prevStep}
                                    disabled={activeStep === 1 || submitting}
                                >
                                    <ChevronLeft size={18} />
                                    Previous
                                </button>

                                {activeStep < 5 ? (
                                    <button
                                        type="button"
                                        className="btn rounded-pill px-4 py-2 fw-bold text-white d-flex align-items-center gap-2"
                                        onClick={nextStep}
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                    >
                                        Next
                                        <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn rounded-pill px-5 py-3 fw-bold text-white d-flex align-items-center gap-2 shadow-sm"
                                        disabled={submitting}
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Submit Complaint
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .hover-lift { transition: all 0.3s ease; }
                    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .cursor-pointer { cursor: pointer; }
                    .transition-all { transition: all 0.3s ease; }
                    .extra-small { font-size: 11px; }
                `}} />
        </div>
    );
};

export default RegisterComplaintEnhanced;
