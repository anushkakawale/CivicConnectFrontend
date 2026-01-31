import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DEPARTMENTS } from '../../constants';
import { X, MapPin, FileText, Building2, AlertCircle } from 'lucide-react';
import citizenService from '../../services/citizenService';

const CreateComplaintModal = ({ show, onHide, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            departmentId: '',
            latitude: '',
            longitude: ''
        },
        validationSchema: Yup.object({
            title: Yup.string()
                .min(10, 'Title must be at least 10 characters')
                .max(100, 'Title must not exceed 100 characters')
                .required('Title is required'),
            description: Yup.string()
                .min(20, 'Description must be at least 20 characters')
                .max(500, 'Description must not exceed 500 characters')
                .required('Description is required'),
            departmentId: Yup.number()
                .required('Please select a department'),
            latitude: Yup.number()
                .required('Location is required'),
            longitude: Yup.number()
                .required('Location is required')
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            setError('');

            try {
                // Create FormData for proper multipart submission
                const formData = new FormData();
                const complaintData = {
                    title: values.title,
                    description: values.description,
                    departmentId: parseInt(values.departmentId),
                    latitude: parseFloat(values.latitude),
                    longitude: parseFloat(values.longitude)
                };

                formData.append('data', new Blob([JSON.stringify(complaintData)], {
                    type: 'application/json'
                }));

                // Images support can be added here if the modal is extended
                // For now, we submit just the data part

                await citizenService.createComplaintWithImages(formData);

                formik.resetForm();
                onSuccess();
                onHide();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to create complaint. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    });

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                formik.setFieldValue('latitude', latitude);
                formik.setFieldValue('longitude', longitude);
                setCurrentLocation({ latitude, longitude });
                setGettingLocation(false);
            },
            (error) => {
                setError('Unable to get your location. Please enter manually.');
                setGettingLocation(false);
            }
        );
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold">
                            <FileText size={20} className="me-2" />
                            Register New Complaint
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                <AlertCircle size={18} className="me-2" />
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                            </div>
                        )}

                        <form onSubmit={formik.handleSubmit}>
                            {/* Title */}
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label fw-semibold">
                                    Complaint Title *
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                                    id="title"
                                    placeholder="Brief summary of the issue"
                                    {...formik.getFieldProps('title')}
                                />
                                {formik.touched.title && formik.errors.title && (
                                    <div className="invalid-feedback">{formik.errors.title}</div>
                                )}
                                <div className="form-text">
                                    {formik.values.title.length}/100 characters
                                </div>
                            </div>

                            {/* Department */}
                            <div className="mb-3">
                                <label htmlFor="departmentId" className="form-label fw-semibold">
                                    <Building2 size={16} className="me-1" />
                                    Department *
                                </label>
                                <select
                                    className={`form-select ${formik.touched.departmentId && formik.errors.departmentId ? 'is-invalid' : ''}`}
                                    id="departmentId"
                                    {...formik.getFieldProps('departmentId')}
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept.department_id} value={dept.department_id}>
                                            {dept.icon} {dept.name}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.departmentId && formik.errors.departmentId && (
                                    <div className="invalid-feedback">{formik.errors.departmentId}</div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label fw-semibold">
                                    Description *
                                </label>
                                <textarea
                                    className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                    id="description"
                                    rows="4"
                                    placeholder="Provide detailed information about the issue"
                                    {...formik.getFieldProps('description')}
                                ></textarea>
                                {formik.touched.description && formik.errors.description && (
                                    <div className="invalid-feedback">{formik.errors.description}</div>
                                )}
                                <div className="form-text">
                                    {formik.values.description.length}/500 characters
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <MapPin size={16} className="me-1" />
                                    Location *
                                </label>
                                <div className="row g-2">
                                    <div className="col-md-5">
                                        <input
                                            type="number"
                                            step="any"
                                            className={`form-control ${formik.touched.latitude && formik.errors.latitude ? 'is-invalid' : ''}`}
                                            placeholder="Latitude"
                                            {...formik.getFieldProps('latitude')}
                                        />
                                    </div>
                                    <div className="col-md-5">
                                        <input
                                            type="number"
                                            step="any"
                                            className={`form-control ${formik.touched.longitude && formik.errors.longitude ? 'is-invalid' : ''}`}
                                            placeholder="Longitude"
                                            {...formik.getFieldProps('longitude')}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary w-100"
                                            onClick={getCurrentLocation}
                                            disabled={gettingLocation}
                                        >
                                            {gettingLocation ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <MapPin size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {currentLocation && (
                                    <div className="form-text text-success">
                                        ✓ Current location captured
                                    </div>
                                )}
                                {(formik.touched.latitude || formik.touched.longitude) &&
                                    (formik.errors.latitude || formik.errors.longitude) && (
                                        <div className="text-danger small mt-1">Location is required</div>
                                    )}
                            </div>

                            {/* Info Alert */}
                            <div className="alert alert-info mb-0">
                                <small>
                                    <strong>📍 Note:</strong> Your complaint will be automatically assigned to the appropriate
                                    department officer based on your ward and department selection. You'll receive notifications
                                    about the progress.
                                </small>
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onHide}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={formik.handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FileText size={18} className="me-2" />
                                    Submit Complaint
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateComplaintModal;
