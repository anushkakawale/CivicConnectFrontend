import React, { useState } from 'react';
import {
    Clock, User, MapPin, Calendar, Building2, Image as ImageIcon,
    MessageSquare, Mail, Phone, Eye, CheckCircle, TrendingUp, AlertTriangle
} from 'lucide-react';
import { extractImageUrl, getPlaceholderImage } from '../../utils/imageUtils';
import { COMPLAINT_STATUS, IMAGE_STAGES } from '../../constants';

const ComplaintDetailView = ({
    complaint,
    images = [],
    statusHistory = [],
    userRole,
    children // For role-specific actions
}) => {
    const [selectedImage, setSelectedImage] = useState(null);

    // Helpers
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusInfo = COMPLAINT_STATUS[status] || { label: status, color: 'secondary', icon: '📋' };
        return (
            <span className={`badge bg-${statusInfo.color} fs-6 px-3 py-2`}>
                <span className="me-2">{statusInfo.icon}</span>
                {statusInfo.label}
            </span>
        );
    };

    const groupImagesByStage = () => {
        if (!Array.isArray(images)) return {};

        const grouped = {
            BEFORE_WORK: [],
            IN_PROGRESS: [],
            AFTER_RESOLUTION: []
        };

        images.forEach(img => {
            // Normalize stage property
            const stage = img.stage || img.imageType || img.type || 'IN_PROGRESS';
            if (grouped[stage]) {
                grouped[stage].push(img);
            } else {
                grouped.IN_PROGRESS.push(img);
            }
        });
        return grouped;
    };

    const groupedImages = groupImagesByStage();
    const totalImages = images.length;

    return (
        <div className="complaint-detail-view">
            {/* Header Card */}
            <div className="card shadow-sm border-0 mb-4 bg-white">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h2 className="fw-bold mb-2 text-primary">
                                Complaint #{complaint.complaintId || complaint.id}
                            </h2>
                            <h4 className="mb-3 text-dark">{complaint.title}</h4>

                            <div className="d-flex flex-wrap gap-3 text-muted">
                                <div className="d-flex align-items-center">
                                    <Building2 size={16} className="me-2" />
                                    <span>{complaint.departmentName || 'General'}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Calendar size={16} className="me-2" />
                                    <span>{formatDate(complaint.createdAt)}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <MapPin size={16} className="me-2" />
                                    <span>{complaint.ward || 'Ward N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            {getStatusBadge(complaint.status)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Actions Slot (e.g. Approve/Resolve Buttons) */}
            {children && <div className="mb-4">{children}</div>}

            <div className="row g-4">
                {/* Left Column: Details & Images */}
                <div className="col-lg-8">
                    {/* Description */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <MessageSquare size={20} className="me-2 text-primary" />
                                Description
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <p className="mb-0 fs-5 lh-base text-secondary">
                                {complaint.description}
                            </p>
                        </div>
                    </div>

                    {/* Officer Assigned */}
                    {complaint.assignedOfficer && (
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="mb-0 fw-bold d-flex align-items-center">
                                    <User size={20} className="me-2 text-primary" />
                                    Assigned Officer
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                        <User size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">{complaint.assignedOfficer.name}</h6>
                                        <div className="small text-muted">
                                            {complaint.assignedOfficer.role?.replace('_', ' ')}
                                        </div>
                                        <div className="d-flex gap-3 mt-2 small">
                                            {complaint.assignedOfficer.mobile && (
                                                <span className="d-flex align-items-center">
                                                    <Phone size={14} className="me-1" />
                                                    {complaint.assignedOfficer.mobile}
                                                </span>
                                            )}
                                            {complaint.assignedOfficer.email && (
                                                <span className="d-flex align-items-center">
                                                    <Mail size={14} className="me-1" />
                                                    {complaint.assignedOfficer.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Images Section */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <ImageIcon size={20} className="me-2 text-primary" />
                                Progress Images ({totalImages})
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {totalImages > 0 ? (
                                <>
                                    {Object.entries(groupedImages).map(([stage, imgs]) => (
                                        imgs.length > 0 && (
                                            <div key={stage} className="mb-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <span className={`badge bg-${IMAGE_STAGES[stage]?.color || 'secondary'} me-2`}>
                                                        {IMAGE_STAGES[stage]?.icon}
                                                    </span>
                                                    <h6 className="fw-bold mb-0 text-uppercase">
                                                        {IMAGE_STAGES[stage]?.label || stage}
                                                    </h6>
                                                </div>
                                                <div className="row g-3">
                                                    {imgs.map((image, idx) => (
                                                        <div key={idx} className="col-6 col-md-4 col-lg-3">
                                                            <div
                                                                className="position-relative ratio ratio-4x3 rounded overflow-hidden shadow-sm"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => setSelectedImage(image)}
                                                            >
                                                                <img
                                                                    src={extractImageUrl(image)}
                                                                    alt={`${stage} ${idx}`}
                                                                    className="w-100 h-100 object-fit-cover hover-zoom"
                                                                    onError={(e) => e.target.src = getPlaceholderImage('Error')}
                                                                />
                                                                <div className="position-absolute top-0 end-0 p-1">
                                                                    <div className="bg-dark bg-opacity-50 rounded p-1 text-white">
                                                                        <Eye size={12} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}

                                    {/* Fallback if no groups found but images exist */}
                                    {Object.values(groupedImages).every(arr => arr.length === 0) && (
                                        <div className="alert alert-warning">
                                            Images exist but status is unknown.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <ImageIcon size={48} className="opacity-25 mb-2" />
                                    <p>No images uploaded used.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline & Map */}
                <div className="col-lg-4">
                    {/* Status Timeline */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <TrendingUp size={20} className="me-2 text-primary" />
                                Status History
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="gov-timeline">
                                {statusHistory.map((history, idx) => (
                                    <div key={idx} className={`gov-timeline-item ${idx === 0 ? 'active' : 'completed'}`}>
                                        <div className="gov-timeline-title">
                                            {history.status?.replace('_', ' ')}
                                        </div>
                                        <div className="gov-timeline-time">
                                            {formatDate(history.changedAt || history.createdAt)}
                                        </div>
                                        <small className="text-muted d-block mt-1">
                                            {history.remarks || history.comment}
                                        </small>
                                        <small className="text-primary fst-italic">
                                            by {history.changedBy || 'System'}
                                        </small>
                                    </div>
                                ))}
                                {statusHistory.length === 0 && (
                                    <p className="text-muted text-center py-3">No history available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Map Mockup */}
                    {(complaint.latitude && complaint.longitude) && (
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="mb-0 fw-bold d-flex align-items-center">
                                    <MapPin size={20} className="me-2 text-primary" />
                                    Location
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                                    <div className="text-center text-muted">
                                        <MapPin size={32} className="mb-2" />
                                        <p className="mb-0">Map Integration</p>
                                        <small className="d-block">{complaint.latitude}, {complaint.longitude}</small>
                                        <a
                                            href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-sm btn-outline-primary mt-2"
                                        >
                                            Open in Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }} onClick={() => setSelectedImage(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content bg-transparent border-0 text-center">
                            <img
                                src={extractImageUrl(selectedImage)}
                                className="img-fluid rounded shadow-lg"
                                style={{ maxHeight: '90vh' }}
                                alt="Full View"
                            />
                            <button className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle" onClick={() => setSelectedImage(null)}>✕</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintDetailView;
