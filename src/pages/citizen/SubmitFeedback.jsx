import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import citizenService from '../../services/citizenService';
import { Star, ArrowLeft, AlertCircle, Send } from 'lucide-react';

const SubmitFeedback = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            const data = await citizenService.getComplaintById(id);
            setComplaint(data);

            // Check if complaint is closed
            if (data.status !== 'CLOSED') {
                setError('Feedback can only be submitted for closed complaints');
            }
        } catch (err) {
            setError('Failed to load complaint details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            rating: 5,
            comments: ''
        },
        validationSchema: Yup.object({
            rating: Yup.number()
                .min(1, 'Rating must be at least 1')
                .max(5, 'Rating must not exceed 5')
                .required('Rating is required'),
            comments: Yup.string()
                .min(10, 'Comments must be at least 10 characters')
                .max(500, 'Comments must not exceed 500 characters')
                .required('Comments are required')
        }),
        onSubmit: async (values) => {
            setSubmitting(true);
            setError('');

            try {
                await citizenService.submitFeedback(id, values);
                setSuccess('✅ Feedback submitted successfully!');
                setTimeout(() => {
                    navigate('/citizen/complaints');
                }, 2000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
            } finally {
                setSubmitting(false);
            }
        }
    });

    if (loading) {
        return (
            <div className="container-fluid py-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading complaint details...</p>
                </div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-danger">Complaint not found</div>
                <button className="btn btn-primary" onClick={() => navigate('/citizen/complaints')}>
                    <ArrowLeft size={18} className="me-2" />
                    Back to Complaints
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    {/* Header */}
                    <div className="mb-4">
                        <button
                            className="btn btn-link text-decoration-none p-0 mb-2"
                            onClick={() => navigate('/citizen/complaints')}
                        >
                            <ArrowLeft size={18} className="me-2" />
                            Back to Complaints
                        </button>
                        <h2 className="fw-bold mb-1">
                            <Star size={28} className="me-2 text-warning" />
                            Submit Feedback
                        </h2>
                        <p className="text-muted mb-0">Share your experience about the complaint resolution</p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <AlertCircle size={18} className="me-2" />
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            {success}
                            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                        </div>
                    )}

                    {/* Complaint Info Card */}
                    <div className="card shadow-sm border-0 mb-3">
                        <div className="card-header bg-light border-bottom">
                            <h5 className="mb-0 fw-bold">Complaint Details</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <small className="text-muted d-block">Complaint ID</small>
                                    <span className="fw-semibold">#{complaint.complaintId}</span>
                                </div>
                                <div className="col-md-6">
                                    <small className="text-muted d-block">Status</small>
                                    <span className="badge bg-dark">{complaint.status}</span>
                                </div>
                                <div className="col-12">
                                    <small className="text-muted d-block">Title</small>
                                    <span className="fw-semibold">{complaint.title}</span>
                                </div>
                                <div className="col-12">
                                    <small className="text-muted d-block">Description</small>
                                    <p className="mb-0 text-muted">{complaint.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    {complaint.status === 'CLOSED' && (
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0 fw-bold">Your Feedback</h5>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={formik.handleSubmit}>
                                    {/* Rating */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <Star size={16} className="me-2" />
                                            Rating *
                                        </label>
                                        <div className="d-flex gap-2 align-items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className="btn btn-link p-0"
                                                    onClick={() => formik.setFieldValue('rating', star)}
                                                >
                                                    <Star
                                                        size={32}
                                                        fill={star <= formik.values.rating ? '#fbbf24' : 'none'}
                                                        color={star <= formik.values.rating ? '#fbbf24' : '#d1d5db'}
                                                    />
                                                </button>
                                            ))}
                                            <span className="ms-2 fw-semibold text-primary">
                                                {formik.values.rating} / 5
                                            </span>
                                        </div>
                                        {formik.touched.rating && formik.errors.rating && (
                                            <div className="text-danger small mt-1">{formik.errors.rating}</div>
                                        )}
                                    </div>

                                    {/* Comments */}
                                    <div className="mb-4">
                                        <label htmlFor="comments" className="form-label fw-semibold">
                                            Comments *
                                        </label>
                                        <textarea
                                            className={`form-control ${formik.touched.comments && formik.errors.comments ? 'is-invalid' : ''}`}
                                            id="comments"
                                            rows="5"
                                            placeholder="Share your experience about the complaint resolution process..."
                                            {...formik.getFieldProps('comments')}
                                        ></textarea>
                                        {formik.touched.comments && formik.errors.comments && (
                                            <div className="invalid-feedback">{formik.errors.comments}</div>
                                        )}
                                        <div className="form-text">{formik.values.comments.length}/500 characters</div>
                                    </div>

                                    {/* Info */}
                                    <div className="alert alert-info mb-4">
                                        <small>
                                            <strong>📝 Note:</strong> Your feedback helps us improve our services.
                                            It will be visible to officers and administrators for quality assessment.
                                        </small>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => navigate('/citizen/complaints')}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-grow-1"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={18} className="me-2" />
                                                    Submit Feedback
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitFeedback;
