import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../../api/apiService';
import { Star, ArrowLeft, AlertCircle, Send, RefreshCw, CheckCircle } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';

const SubmitFeedback = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const primaryColor = '#1254AF';

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            const data = await apiService.citizen.getComplaintById(id);
            setComplaint(data);

            // Check if complaint is closed
            if (data.status !== 'CLOSED' && data.status !== 'RESOLVED') {
                setError('Feedback can only be submitted for resolved complaints');
            }
        } catch (err) {
            setError('Failed to load resolution details');
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
                .min(10, 'Details must be at least 10 characters')
                .max(500, 'Details must not exceed 500 characters')
                .required('Please provide some details about your experience')
        }),
        onSubmit: async (values) => {
            setSubmitting(true);
            setError('');

            try {
                await apiService.citizen.submitFeedback(id, values);
                setSuccess('Feedback submitted successfully. Thank you!');
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
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: primaryColor }} />
                <p className="fw-bold text-muted">Loading details...</p>
                <style dangerouslySetInnerHTML={{ __html: `.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
                <DashboardHeader
                    portalName="PMC Citizen Portal"
                    userName="Error"
                    wardName="Not found"
                    subtitle="We couldn't find the complaint resolution you're looking for."
                    icon={AlertCircle}
                />
                <div className="container text-center pt-5">
                    <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm" style={{ backgroundColor: primaryColor, border: '0' }} onClick={() => navigate('/citizen/complaints')}>
                        <ArrowLeft size={18} className="me-2" />
                        Back to complaints
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC Citizen Portal"
                userName="Public feedback"
                wardName="Quality check"
                subtitle="Your feedback helps us improve municipal services and response quality."
                icon={Star}
                actions={
                    <button
                        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow-sm border-0"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => navigate('/citizen/feedback')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                }
            />

            <div className="container" style={{ maxWidth: '800px', marginTop: '-20px' }}>
                {error && (
                    <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4 d-flex align-items-center p-3">
                        <AlertCircle size={20} className="me-3" />
                        <span className="fw-bold small">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success rounded-4 border-0 shadow-sm mb-4 d-flex align-items-center p-3">
                        <CheckCircle size={20} className="me-3" />
                        <span className="fw-bold small">{success}</span>
                    </div>
                )}

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
                    <div className="card-header bg-light border-0 p-4">
                        <h6 className="fw-bold text-dark mb-0 opacity-75 small uppercase">Resolution details</h6>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <small className="text-muted fw-bold d-block mb-1 small uppercase opacity-50">Reference ID</small>
                                <span className="fw-bold text-dark">#{complaint.complaintId}</span>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <small className="text-muted fw-bold d-block mb-1 small uppercase opacity-50">Status</small>
                                <span className="badge px-3 py-1 rounded-pill fw-bold small bg-success bg-opacity-10 text-success border border-success border-opacity-10">
                                    {complaint.status}
                                </span>
                            </div>
                            <div className="col-12 border-top pt-3">
                                <small className="text-muted fw-bold d-block mb-1 small uppercase opacity-50">Issue title</small>
                                <p className="fw-bold text-dark mb-0">{complaint.title}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {(complaint.status === 'CLOSED' || complaint.status === 'RESOLVED') && !success && (
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                        <div className="card-header bg-primary text-white p-4 border-0" style={{ backgroundColor: primaryColor }}>
                            <h6 className="fw-bold mb-0">Share your experience</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-4 text-center">
                                    <label className="fw-bold text-muted mb-3 d-block small uppercase opacity-75">
                                        How would you rate the resolution?
                                    </label>
                                    <div className="d-flex gap-3 align-items-center justify-content-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="btn btn-link p-1 transition-all"
                                                style={{ transform: star <= formik.values.rating ? 'scale(1.1)' : 'scale(1)' }}
                                                onClick={() => formik.setFieldValue('rating', star)}
                                            >
                                                <Star
                                                    size={40}
                                                    fill={star <= formik.values.rating ? '#fbbf24' : 'none'}
                                                    color={star <= formik.values.rating ? '#fbbf24' : '#E2E8F0'}
                                                    strokeWidth={star <= formik.values.rating ? 0 : 2}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <span className="fw-bold text-primary p-2 px-3 rounded-pill bg-primary bg-opacity-10 small" style={{ color: primaryColor }}>
                                            {formik.values.rating} of 5 stars
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4 pt-3 border-top">
                                    <label htmlFor="comments" className="fw-bold text-muted mb-2 d-block small uppercase opacity-75">
                                        Experience details
                                    </label>
                                    <textarea
                                        className={`form-control border-2 shadow-none p-3 rounded-4 bg-light fw-medium ${formik.touched.comments && formik.errors.comments ? 'is-invalid border-danger' : 'border-transparent'}`}
                                        id="comments"
                                        rows="4"
                                        placeholder="Tell us what went well or how we can improve..."
                                        {...formik.getFieldProps('comments')}
                                    ></textarea>
                                    {formik.touched.comments && formik.errors.comments ? (
                                        <div className="invalid-feedback fw-bold small mt-2 ps-2">{formik.errors.comments}</div>
                                    ) : (
                                        <div className="text-muted small mt-2 ps-2 fw-bold opacity-50">{formik.values.comments.length}/500 characters</div>
                                    )}
                                </div>

                                <div className="p-3 rounded-4 bg-light mb-4 border-start border-4 border-primary" style={{ borderLeftColor: primaryColor }}>
                                    <p className="mb-0 small text-muted fw-medium">
                                        <strong>Privacy note:</strong> Your feedback is used for internal quality assessment and service improvement. It will be shared with the relevant department heads.
                                    </p>
                                </div>

                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-pill px-4 py-2 fw-bold small flex-grow-1"
                                        onClick={() => navigate('/citizen/feedback')}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-pill px-4 py-3 fw-bold small flex-grow-2 shadow-sm border-0"
                                        style={{ backgroundColor: primaryColor }}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <RefreshCw className="animate-spin me-2" size={18} />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} className="me-2" />
                                                Send feedback
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
        </div>
    );
};

export default SubmitFeedback;
