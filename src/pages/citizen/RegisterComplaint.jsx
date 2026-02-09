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

const RegisterComplaint = () => {
    const navigate = useNavigate();
    const { departments: masterDepartments, wards: masterWards } = useMasterData();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const PRIMARY_COLOR = '#173470';
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
                setLocalDepartments(deptRes.value.data || []);
            }
        } catch (err) {
            setError("Failed to load area details.");
        } finally {
            setLoading(false);
        }
    };

    const attemptAutoLocation = () => {
        if (!navigator.geolocation) {
            setError("Location sharing is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                formik.setFieldValue('latitude', pos.coords.latitude.toFixed(6));
                formik.setFieldValue('longitude', pos.coords.longitude.toFixed(6));
                setSuccess("Location updated");
                setTimeout(() => setSuccess(''), 2000);
            },
            () => setError("Please allow location access in your browser"),
            { enableHighAccuracy: true }
        );
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (selectedImages.length + files.length > 5) {
                setError("Maximum 5 images allowed");
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
            try {
                // Unified Data Object
                const complaintData = {
                    title: values.title,
                    description: values.description,
                    departmentId: parseInt(values.departmentId),
                    wardId: parseInt(values.wardId),
                    address: values.location,
                    latitude: values.latitude ? parseFloat(values.latitude) : null,
                    longitude: values.longitude ? parseFloat(values.longitude) : null,
                    images: selectedImages // Pass the FileList/Array of Files
                };

                // Use the Strategic Unified Form Data Generator
                const formData = createComplaintFormData(complaintData);

                // Atomic submission: Details + Image in one request
                await apiService.citizen.createComplaint(formData);

                setSuccess("Strategic report submitted successfully. Officers notified.");
                setTimeout(() => navigate('/citizen/complaints'), 2000);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
            } finally {
                setSubmitting(false);
            }
        }
    });

    const nextStep = () => {
        if (activeStep === 1) {
            if (formik.values.title.length < 10 || formik.values.description.length < 20) {
                setError("Please provide a valid title and description.");
                return;
            }
        }
        if (activeStep === 2) {
            if (!formik.values.departmentId) {
                setError("Please select a category.");
                return;
            }
        }
        if (activeStep === 3) {
            if (!formik.values.location) {
                setError("Please provide a nearest address or location.");
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

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-3" size={40} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-bold text-muted small uppercase tracking-widest">Accessing Profile...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <div className="card border-0 shadow-sm rounded-0 mb-4 position-relative overflow-hidden" style={{ backgroundColor: PRIMARY_COLOR, minHeight: '140px' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                    <div className="d-flex gap-4 position-absolute" style={{ top: '-20px', left: '-20px' }}>
                        <FileText size={100} className="text-white" />
                        <Building2 size={80} className="text-white" style={{ marginTop: '40px' }} />
                    </div>
                </div>
                <div className="card-body p-4 position-relative d-flex align-items-center">
                    <div className="container" style={{ maxWidth: '1200px' }}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <div className="d-flex align-items-center gap-3 text-white">
                                <div className="p-3 rounded-4 bg-white shadow-lg d-flex align-items-center justify-content-center" style={{ color: PRIMARY_COLOR }}>
                                    <span style={{ fontSize: '24px' }}>🚧</span>
                                </div>
                                <div>
                                    <h1 className="h3 fw-bold mb-0">Report an Issue</h1>
                                    <p className="mb-0 opacity-75 small fw-medium">Helping keep our city safe and well-maintained 🏘️</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white bg-opacity-10 rounded-pill border border-white border-opacity-10">
                                <ShieldCheck size={16} className="text-white" />
                                <span className="extra-small fw-bold text-white uppercase-tracking">Secure 🔒</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="row g-4">
                    {/* Progress Sidebar */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-4 p-4 bg-white sticky-top" style={{ top: '2rem' }}>
                            <h6 className="fw-bold text-muted mb-4 small uppercase-tracking">📝 Reporting steps</h6>
                            <div className="d-flex flex-column gap-4">
                                {[
                                    { step: 1, title: 'Details', desc: 'Title and description' },
                                    { step: 2, title: 'Category', desc: 'Select department' },
                                    { step: 3, title: 'Location', desc: 'Where is the issue?' },
                                    { step: 4, title: 'Evidence', desc: 'Photos (optional)' }
                                ].map((s, idx) => (
                                    <div key={idx} className="d-flex gap-3 align-items-start">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm transition-all`}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                minWidth: '32px',
                                                backgroundColor: activeStep === s.step ? PRIMARY_COLOR : activeStep > s.step ? '#10B981' : '#F3F4F6',
                                                color: activeStep >= s.step ? 'white' : '#9CA3AF',
                                                fontSize: '14px'
                                            }}>
                                            {activeStep > s.step ? <CheckCircle size={18} /> : s.step}
                                        </div>
                                        <div>
                                            <h6 className={`mb-0 fw-bold ${activeStep === s.step ? 'text-primary' : 'text-dark'}`} style={activeStep === s.step ? { color: PRIMARY_COLOR } : {}}>{s.title}</h6>
                                            <p className="text-muted small mb-0">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 p-3 rounded-4 bg-light border-start border-4" style={{ borderLeftColor: '#173470' }}>
                                <div className="d-flex gap-2 text-primary mb-2" style={{ color: '#173470' }}>
                                    <Info size={18} />
                                    <span className="fw-bold small">Tip</span>
                                </div>
                                <p className="text-muted small mb-0 lh-base">
                                    Clear photos and accurate locations help us resolve issues faster.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="col-lg-8 animate-fadeIn">
                        {error && (
                            <div className="alert border-0 rounded-4 d-flex align-items-center mb-4 shadow-sm" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                                <AlertCircle className="me-2" size={20} />
                                <span className="fw-bold small">{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="alert border-0 rounded-4 d-flex align-items-center mb-4 shadow-sm" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                                <CheckCircle className="me-2" size={20} />
                                <span className="fw-bold small">{success}</span>
                            </div>
                        )}

                        <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white mb-4">
                            {/* Visual Progress Bar */}
                            <div className="bg-light p-3 d-flex justify-content-between border-bottom px-4">
                                {[1, 2, 3, 4].map(step => (
                                    <div key={step} className="d-flex align-items-center gap-2">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold`}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: activeStep >= step ? '#173470' : '#E5E7EB',
                                                color: activeStep >= step ? 'white' : '#9CA3AF',
                                                fontSize: '11px'
                                            }}>
                                            {step}
                                        </div>
                                        <span className={`small fw-bold d-none d-md-inline ${activeStep >= step ? 'text-dark' : 'text-muted'}`}>
                                            {step === 1 ? 'Details' : step === 2 ? 'Category' : step === 3 ? 'Location' : 'Photos'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {activeStep === 1 && (
                                    <div className="animate-fade-in">
                                        <h5 className="fw-bold text-dark mb-4">Step 1: Describe the issue</h5>
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="form-label small fw-bold text-muted mb-0">Title</label>
                                                <span className={`extra-small fw-bold ${formik.values.title.length > 90 ? 'text-danger' : 'text-muted'}`}>
                                                    {formik.values.title.length}/100
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                className="form-control rounded-4 py-3 fw-medium bg-light border-0 px-4"
                                                placeholder="e.g. Street light repair needed"
                                                {...formik.getFieldProps('title')}
                                            />
                                            {formik.touched.title && formik.errors.title && (
                                                <small className="text-danger fw-bold ms-2">{formik.errors.title}</small>
                                            )}
                                        </div>
                                        <div className="mb-0">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="form-label small fw-bold text-muted mb-0">Details</label>
                                                <span className={`extra-small fw-bold ${formik.values.description.length > 950 ? 'text-danger' : 'text-muted'}`}>
                                                    {formik.values.description.length}/1000
                                                </span>
                                            </div>
                                            <textarea
                                                className="form-control rounded-4 py-3 fw-medium bg-light border-0 px-4"
                                                rows="6"
                                                maxLength={1000}
                                                placeholder="Describe the issue in detail..."
                                                {...formik.getFieldProps('description')}
                                            />
                                            {formik.touched.description && formik.errors.description && (
                                                <small className="text-danger fw-bold ms-2">{formik.errors.description}</small>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeStep === 2 && (
                                    <div className="animate-fade-in">
                                        <h5 className="fw-bold text-dark mb-4">Step 2: Classification</h5>
                                        <div className="text-center mb-5">
                                            <div className="p-4 bg-light rounded-circle mb-3 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                <Building2 size={40} className="text-primary" />
                                            </div>
                                            <p className="text-muted small">Select the category that best fits the issue.</p>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted mb-2">Issue Type</label>
                                            <select
                                                className="form-select rounded-4 py-3 fw-medium bg-light border-0 px-4"
                                                {...formik.getFieldProps('departmentId')}
                                            >
                                                {(masterDepartments.length > 0 ? masterDepartments : localDepartments).length === 0 ? (
                                                    <option value="">Loading...</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select a category</option>
                                                        {(masterDepartments.length > 0 ? masterDepartments : localDepartments).map(dept => (
                                                            <option key={dept.departmentId || dept.id} value={dept.departmentId || dept.id}>
                                                                {(dept.name || dept.departmentName).replace(/_/g, ' ')}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                            {formik.touched.departmentId && formik.errors.departmentId && (
                                                <small className="text-danger fw-bold ms-2">{formik.errors.departmentId}</small>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeStep === 3 && (
                                    <div className="animate-fade-in">
                                        <h5 className="fw-bold text-dark mb-4">Step 3: Location</h5>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted mb-2">Nearest address</label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control rounded-start-4 py-3 fw-medium bg-light border-0 px-4"
                                                    placeholder="Enter nearest building or street"
                                                    {...formik.getFieldProps('location')}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-primary rounded-end-4 px-4 shadow-sm border-0"
                                                    onClick={attemptAutoLocation}
                                                    style={{ backgroundColor: '#173470' }}
                                                    title="Use current location"
                                                >
                                                    <Compass size={20} />
                                                </button>
                                            </div>
                                            {formik.touched.location && formik.errors.location && (
                                                <small className="text-danger fw-bold ms-2">{formik.errors.location}</small>
                                            )}
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-4">
                                                <label className="form-label small fw-bold text-muted mb-2">Latitude</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    className="form-control rounded-4 py-3 fw-medium bg-light border-0 px-4"
                                                    placeholder="18.5204"
                                                    {...formik.getFieldProps('latitude')}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-4">
                                                <label className="form-label small fw-bold text-muted mb-2">Longitude</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    className="form-control rounded-4 py-3 fw-medium bg-light border-0 px-4"
                                                    placeholder="73.8567"
                                                    {...formik.getFieldProps('longitude')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeStep === 4 && (
                                    <div className="animate-fade-in text-center">
                                        <h5 className="fw-bold text-dark mb-4 text-start">Step 4: Evidence</h5>
                                        <div className="mb-4">
                                            <label className="btn btn-outline-primary w-100 py-5 rounded-4 border-2 border-dashed fw-bold d-flex flex-column align-items-center justify-content-center gap-3 transition-all" style={{ borderColor: '#E2E8F0', color: '#1254AF', backgroundColor: '#F8FAFC' }}>
                                                <div className="p-3 rounded-circle bg-white shadow-sm" style={{ color: '#173470' }}>
                                                    <Upload size={32} />
                                                </div>
                                                <div>
                                                    <div className="fs-6">Click to upload photos</div>
                                                    <div className="small opacity-60 fw-normal">Maximum 5 images allowed</div>
                                                </div>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="d-none"
                                                />
                                            </label>
                                        </div>

                                        {imagePreviews.length > 0 && (
                                            <div className="row g-3 mb-4">
                                                {imagePreviews.map((preview, idx) => (
                                                    <div key={idx} className="col-4 col-md-3">
                                                        <div className="position-relative shadow-sm rounded-4 overflow-hidden border">
                                                            <img src={preview} alt="preview" className="w-100" style={{ height: '80px', objectFit: 'cover' }} />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(idx)}
                                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 rounded-circle shadow-sm"
                                                                style={{ width: '22px', height: '22px' }}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="card-footer bg-white p-4 d-flex justify-content-between border-0 px-md-5 pb-5">
                                <button
                                    type="button"
                                    className={`btn btn-light rounded-pill px-4 fw-bold d-flex align-items-center gap-2 border ${activeStep === 1 ? 'invisible' : ''}`}
                                    onClick={prevStep}
                                >
                                    <ChevronLeft size={20} /> Back
                                </button>

                                {activeStep < 4 ? (
                                    <button
                                        type="button"
                                        className="btn btn-primary rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2 shadow-premium border-0"
                                        onClick={nextStep}
                                        style={{ backgroundColor: '#173470' }}
                                    >
                                        Next step <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={submitting || !formik.isValid}
                                        className="btn btn-success rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2 shadow-premium border-0"
                                        onClick={formik.handleSubmit}
                                        style={{ backgroundColor: '#10B981' }}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader size={20} className="animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} /> Submit report
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Area Info Sidebar */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-4 p-4 bg-white mb-4">
                            <h6 className="fw-bold text-muted mb-4 small uppercase-tracking">📍 Your area</h6>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary" style={{ color: '#173470' }}>
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <small className="text-muted d-block fw-bold mb-1 uppercase-tracking-widest" style={{ fontSize: '10px' }}>Current ward</small>
                                    <h5 className="fw-bold text-dark mb-0">{userWard?.areaName || 'Pune City'}</h5>
                                </div>
                            </div>
                            <div className="p-3 rounded-4 bg-light">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small text-muted fw-bold">Ward ID</span>
                                    <span className="small fw-bold text-dark">#{userWard?.number || userWard?.wardId || '0'}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="small text-muted fw-bold">Security</span>
                                    <span className="small fw-bold text-success">Verified</span>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-premium rounded-4 p-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #112652 0%, #173470 100%)' }}>
                            <h6 className="fw-bold mb-4 opacity-75 small uppercase-tracking">Submission info</h6>
                            <ul className="list-unstyled mb-0 small fw-medium">
                                <li className="mb-3 d-flex gap-3">
                                    <CheckCircle size={16} className="mt-1 flex-shrink-0 text-success bg-white rounded-circle p-0" />
                                    <span>Provide a concise title and clear detail for better routing.</span>
                                </li>
                                <li className="mb-3 d-flex gap-3">
                                    <CheckCircle size={16} className="mt-1 flex-shrink-0 text-success bg-white rounded-circle p-0" />
                                    <span>Upload relevant photos to expedite the verification process.</span>
                                </li>
                                <li className="d-flex gap-3">
                                    <CheckCircle size={16} className="mt-1 flex-shrink-0 text-success bg-white rounded-circle p-0" />
                                    <span>You will receive an update as soon as the work is assigned.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .uppercase-tracking { text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; }
            `}} />
        </div>
    );
};

export default RegisterComplaint;
