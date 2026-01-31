/**
 * Admin Complaint Detail Page
 * View complete complaint details, images, timeline, and manage status
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Building2, FileText, Image as ImageIcon, Clock, CheckCircle } from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import './AdminComplaintDetail.css';

const AdminComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [complaint, setComplaint] = useState(null);
    const [images, setImages] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            // Fetch complaint details
            const complaintsResponse = await apiService.admin.getAllComplaints();
            const complaintData = complaintsResponse.content?.find(c => c.complaintId === parseInt(id));

            if (complaintData) {
                setComplaint(complaintData);

                // Fetch images if available
                if (complaintData.images && complaintData.images.length > 0) {
                    setImages(complaintData.images);
                }
            } else {
                showToast('Complaint not found', 'error');
                navigate('/admin/complaints');
            }
        } catch (error) {
            console.error('Error fetching complaint details:', error);
            showToast('Failed to load complaint details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: '#ffc107',
            ASSIGNED: '#17a2b8',
            IN_PROGRESS: '#007bff',
            RESOLVED: '#28a745',
            APPROVED: '#20c997',
            CLOSED: '#6c757d',
            REJECTED: '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!complaint) {
        return (
            <div className="complaint-detail-page">
                <div className="error-state">
                    <FileText size={64} />
                    <h2>Complaint Not Found</h2>
                    <button onClick={() => navigate('/admin/complaints')} className="back-btn">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="complaint-detail-page">
            {/* Header */}
            <div className="detail-header">
                <button onClick={() => navigate('/admin/complaints')} className="back-btn">
                    <ArrowLeft size={20} />
                    Back to Complaints
                </button>
                <div className="header-title">
                    <h1>Complaint #{complaint.complaintId}</h1>
                    <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                        {complaint.status}
                    </span>
                </div>
            </div>

            <div className="detail-grid">
                {/* Main Details Card */}
                <div className="detail-card main-details">
                    <h2>
                        <FileText size={24} />
                        Complaint Details
                    </h2>

                    <div className="detail-section">
                        <h3>{complaint.title}</h3>
                        <p className="description">{complaint.description || 'No description provided'}</p>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <MapPin size={18} />
                            <div>
                                <div className="info-label">Ward</div>
                                <div className="info-value">{complaint.wardName || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="info-item">
                            <Building2 size={18} />
                            <div>
                                <div className="info-label">Department</div>
                                <div className="info-value">{complaint.departmentName || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="info-item">
                            <Calendar size={18} />
                            <div>
                                <div className="info-label">Created</div>
                                <div className="info-value">{formatDate(complaint.createdAt)}</div>
                            </div>
                        </div>

                        <div className="info-item">
                            <User size={18} />
                            <div>
                                <div className="info-label">Citizen</div>
                                <div className="info-value">{complaint.citizenName || 'Anonymous'}</div>
                            </div>
                        </div>

                        {complaint.latitude && complaint.longitude && (
                            <div className="info-item">
                                <MapPin size={18} />
                                <div>
                                    <div className="info-label">Location</div>
                                    <div className="info-value">
                                        {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Officer Information */}
                <div className="detail-card">
                    <h2>
                        <User size={24} />
                        Assigned Officers
                    </h2>

                    <div className="officer-list">
                        {complaint.wardOfficerName && (
                            <div className="officer-item">
                                <div className="officer-role">Ward Officer</div>
                                <div className="officer-name">{complaint.wardOfficerName}</div>
                                <div className="officer-contact">{complaint.wardOfficerEmail}</div>
                            </div>
                        )}

                        {complaint.deptOfficerName && (
                            <div className="officer-item">
                                <div className="officer-role">Department Officer</div>
                                <div className="officer-name">{complaint.deptOfficerName}</div>
                                <div className="officer-contact">{complaint.deptOfficerEmail}</div>
                            </div>
                        )}

                        {!complaint.wardOfficerName && !complaint.deptOfficerName && (
                            <div className="empty-state-small">
                                No officers assigned yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Images Section */}
                <div className="detail-card images-card">
                    <h2>
                        <ImageIcon size={24} />
                        Images ({images.length})
                    </h2>

                    {images.length > 0 ? (
                        <div className="images-grid">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="image-item"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={apiService.getImageUrl(image.filename || image)}
                                        alt={`Complaint ${index + 1}`}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                                        }}
                                    />
                                    <div className="image-stage">{image.imageStage || 'Before'}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-small">
                            <ImageIcon size={48} />
                            <p>No images uploaded</p>
                        </div>
                    )}
                </div>

                {/* SLA Information */}
                {complaint.slaDeadline && (
                    <div className="detail-card sla-card">
                        <h2>
                            <Clock size={24} />
                            SLA Information
                        </h2>

                        <div className="sla-info">
                            <div className="sla-item">
                                <div className="sla-label">Deadline</div>
                                <div className="sla-value">{formatDate(complaint.slaDeadline)}</div>
                            </div>
                            <div className="sla-item">
                                <div className="sla-label">Status</div>
                                <div className={`sla-status ${complaint.slaStatus?.toLowerCase()}`}>
                                    {complaint.slaStatus || 'ACTIVE'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {complaint.status === 'RESOLVED' && (
                    <div className="detail-card actions-card">
                        <h2>
                            <CheckCircle size={24} />
                            Actions
                        </h2>

                        <button className="action-btn close-btn">
                            <CheckCircle size={20} />
                            Close Complaint
                        </button>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="image-modal" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedImage(null)}>×</button>
                        <img
                            src={apiService.getImageUrl(selectedImage.filename || selectedImage)}
                            alt="Full size"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaintDetail;
