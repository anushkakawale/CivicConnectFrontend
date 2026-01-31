import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, MapPin, Calendar, User, Building2, AlertCircle,
    Clock, CheckCircle, XCircle, Image as ImageIcon, MessageSquare,
    Star, RotateCcw, Upload, X
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [rating, setRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            console.log(`🔄 Fetching details for complaint #${id}...`);
            const response = await apiService.complaint.getById(id);
            console.log('✅ Complaint Details Response:', response);

            const data = response.data || response;

            if (data) {
                setComplaint(data);
            } else {
                console.error('❌ No data found in response');
                alert('Failed to load complaint details: No data received');
            }
        } catch (error) {
            console.error('❌ Failed to load complaint details:', error);
            // alert('Failed to load complaint details'); // Suppress alert to avoid spamming if it's a transient issue
        } finally {
            setLoading(false);
        }
    };

    const handleReopen = async () => {
        if (!reopenReason.trim()) {
            alert('Please provide a reason for reopening');
            return;
        }

        try {
            await apiService.complaint.reopen(id, reopenReason);
            alert('✅ Complaint reopened successfully!');
            setShowReopenModal(false);
            fetchComplaintDetails();
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to reopen complaint');
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            await apiService.complaint.submitFeedback(id, rating, feedbackComment);
            alert('✅ Feedback submitted successfully!');
            setShowFeedbackModal(false);
            fetchComplaintDetails();
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to submit feedback');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('stage', 'AFTER_RESOLUTION');

            await apiService.citizen.uploadImage(id, formData);
            alert('✅ Image uploaded successfully!');
            setShowImageUpload(false);
            setSelectedFile(null);
            setImagePreview(null);
            fetchComplaintDetails();
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUBMITTED': return 'secondary';
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'info';
            case 'ASSIGNED': return 'primary';
            case 'IN_PROGRESS': return 'primary';
            case 'RESOLVED': return 'success';
            case 'CLOSED': return 'dark';
            case 'REJECTED': return 'danger';
            default: return 'secondary';
        }
    };



    if (loading) return <LoadingSpinner />;
    if (!complaint) return <div className="alert alert-danger">Complaint not found</div>;

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        <FileText className="me-2" size={32} />
                        Complaint #{complaint.complaintId}
                    </h2>
                    <p className="text-muted mb-0">{complaint.title}</p>
                </div>
                <div className="d-flex gap-2">
                    {complaint.canReopen && (
                        <button
                            className="btn btn-warning"
                            onClick={() => setShowReopenModal(true)}
                        >
                            <RotateCcw size={18} className="me-2" />
                            Reopen
                        </button>
                    )}
                    {complaint.status === 'CLOSED' && !complaint.feedback && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowFeedbackModal(true)}
                        >
                            <Star size={18} className="me-2" />
                            Give Feedback
                        </button>
                    )}
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setShowImageUpload(true)}
                    >
                        <Upload size={18} className="me-2" />
                        Upload Image
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Main Details */}
                <div className="col-lg-8">
                    {/* Status Card */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center">
                                        <div className="me-2 text-muted"><AlertCircle size={20} /></div>
                                        <div>
                                            <small className="text-muted d-block mb-1">Status</small>
                                            <StatusBadge status={complaint.status} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center">
                                        <div className="me-2 text-muted"><AlertCircle size={20} /></div>
                                        <div>
                                            <small className="text-muted d-block mb-1">Priority</small>
                                            <PriorityBadge priority={complaint.priority} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center">
                                        <Clock className="text-muted me-2" size={20} />
                                        <div>
                                            <small className="text-muted d-block">SLA Status</small>
                                            <span className={`badge bg-${complaint.slaStatus === 'BREACHED' ? 'danger' : complaint.slaStatus === 'WARNING' ? 'warning' : 'success'}`}>
                                                {complaint.slaStatus || 'ON_TRACK'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Description */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white">
                            <h5 className="mb-0 fw-semibold">Description</h5>
                        </div>
                        <div className="card-body">
                            <p className="mb-0">{complaint.description}</p>
                        </div>
                    </div>

                    {/* Images Gallery */}
                    {complaint.images && complaint.images.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0 fw-semibold">
                                    <ImageIcon size={20} className="me-2" />
                                    Images ({complaint.images.length})
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    {complaint.images.map((img, index) => {
                                        // Construct URL: strip /api from base if needed, or rely on absolute path from backend
                                        // Backend sends "/api/images/filename". 
                                        // We need "http://localhost:8083/api/images/filename"
                                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
                                        const origin = baseUrl.replace(/\/api$/, '');
                                        const fullUrl = `${origin}${img.imageUrl}`;

                                        return (
                                            <div key={img.id || index} className="col-md-4">
                                                <div className="position-relative group">
                                                    <img
                                                        src={fullUrl}
                                                        alt={`Complaint Evidence ${index + 1}`}
                                                        className="img-fluid rounded shadow-sm hover-zoom"
                                                        style={{
                                                            cursor: 'pointer',
                                                            height: '220px',
                                                            objectFit: 'cover',
                                                            width: '100%',
                                                            transition: 'transform 0.3s ease'
                                                        }}
                                                        onClick={() => window.open(fullUrl, '_blank')}
                                                    />
                                                    <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2 rounded-bottom">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="badge bg-light text-dark">{img.imageStage}</span>
                                                            <small className="ms-2">{new Date(img.uploadedAt).toLocaleDateString()}</small>
                                                        </div>
                                                        <small className="d-block mt-1 text-truncate">
                                                            By {img.uploadedBy} ({img.uploadedByRole})
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    {
                        complaint.timeline && complaint.timeline.length > 0 && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0 fw-semibold">
                                        <Clock size={20} className="me-2" />
                                        Timeline
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="timeline">
                                        {complaint.timeline.map((event, index) => (
                                            <div key={index} className="timeline-item mb-3">
                                                <div className="d-flex">
                                                    <div className="timeline-marker me-3">
                                                        <div className={`rounded-circle bg-${getStatusColor(event.status)} p-2`}>
                                                            <CheckCircle size={16} className="text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between">
                                                            <h6 className="mb-1">{event.status}</h6>
                                                            <small className="text-muted">
                                                                {new Date(event.changedAt).toLocaleString()}
                                                            </small>
                                                        </div>
                                                        <p className="text-muted mb-1">By {event.changedBy}</p>
                                                        {event.remarks && <p className="mb-0 small">{event.remarks}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Feedback */}
                    {
                        complaint.feedback && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0 fw-semibold">
                                        <MessageSquare size={20} className="me-2" />
                                        Feedback
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={20}
                                                className={i < complaint.feedback.rating ? 'text-warning' : 'text-muted'}
                                                fill={i < complaint.feedback.rating ? 'currentColor' : 'none'}
                                            />
                                        ))}
                                    </div>
                                    <p className="mb-0">{complaint.feedback.comment}</p>
                                </div>
                            </div>
                        )
                    }
                </div >

                {/* Sidebar */}
                < div className="col-lg-4" >
                    {/* Citizen Info */}
                    < div className="card border-0 shadow-sm mb-4" >
                        <div className="card-header bg-white">
                            <h6 className="mb-0 fw-semibold">Citizen Information</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <User size={16} className="text-muted me-2" />
                                <strong>{complaint.citizenName}</strong>
                            </div>
                            <div className="mb-3">
                                <span className="text-muted">📧 {complaint.citizenEmail}</span>
                            </div>
                            <div>
                                <Calendar size={16} className="text-muted me-2" />
                                <small className="text-muted">
                                    Registered: {new Date(complaint.createdAt).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                    </div >

                    {/* Location */}
                    < div className="card border-0 shadow-sm mb-4" >
                        <div className="card-header bg-white">
                            <h6 className="mb-0 fw-semibold">Location</h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-2">
                                <MapPin size={16} className="text-muted me-2" />
                                <strong>{complaint.wardName}</strong>
                            </div>
                            <div className="mb-2">
                                <Building2 size={16} className="text-muted me-2" />
                                {complaint.departmentName}
                            </div>
                            {complaint.latitude && complaint.longitude && (
                                <div className="mt-3">
                                    <small className="text-muted">
                                        📍 {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div >

                    {/* Assigned Officer */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white">
                            <h6 className="mb-0 fw-semibold">Assigned Officer</h6>
                        </div>
                        <div className="card-body">
                            <User size={16} className="text-muted me-2" />
                            <strong>{complaint.assignedOfficer || 'Not Assigned'}</strong>
                        </div>
                    </div>
                </div >
            </div >

            {/* Reopen Modal */}
            {
                showReopenModal && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reopen Complaint</h5>
                                    <button className="btn-close" onClick={() => setShowReopenModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <label className="form-label">Reason for Reopening *</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={reopenReason}
                                        onChange={(e) => setReopenReason(e.target.value)}
                                        placeholder="Please explain why you want to reopen this complaint..."
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowReopenModal(false)}>Cancel</button>
                                    <button className="btn btn-warning" onClick={handleReopen}>Reopen Complaint</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Feedback Modal */}
            {
                showFeedbackModal && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Submit Feedback</h5>
                                    <button className="btn-close" onClick={() => setShowFeedbackModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Rating *</label>
                                        <div className="d-flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={32}
                                                    className={star <= rating ? 'text-warning' : 'text-muted'}
                                                    fill={star <= rating ? 'currentColor' : 'none'}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Comment</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={feedbackComment}
                                            onChange={(e) => setFeedbackComment(e.target.value)}
                                            placeholder="Share your experience..."
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleSubmitFeedback}>Submit Feedback</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Image Upload Modal */}
            {
                showImageUpload && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Upload Image</h5>
                                    <button className="btn-close" onClick={() => setShowImageUpload(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="form-control mb-3"
                                    />
                                    {imagePreview && (
                                        <img src={imagePreview} alt="Preview" className="img-fluid rounded" />
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowImageUpload(false)}>Cancel</button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleImageUpload}
                                        disabled={!selectedFile || uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ComplaintDetail;
