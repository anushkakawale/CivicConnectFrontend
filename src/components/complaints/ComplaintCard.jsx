/**
 * Standardized Complaint Card Component
 * Professional PMC design for consistent UI across all feeds
 */

import React from 'react';
import { Calendar, Building2, MapPin, ArrowRight, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import { getImageUrl } from '../../utils/imageUtils';

const ComplaintCard = ({ complaint, onClick, brandColor = '#1254AF' }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const id = complaint.id || complaint.complaintId;

    // Extract first image if available with deep fallbacks
    const mainImage = (complaint.imageUrls && complaint.imageUrls.length > 0)
        ? complaint.imageUrls[0]
        : (complaint.images && complaint.images.length > 0)
            ? (complaint.images[0].imageUrl || complaint.images[0].path || complaint.images[0].fileName || complaint.images[0])
            : (complaint.complaintImage || complaint.imagePath || complaint.imageUrl || complaint.url || null);

    const displayImage = mainImage ? getImageUrl(mainImage, id) : null;

    return (
        <div className="card border-0 shadow-sm rounded-4 bg-white h-100 overflow-hidden transition-all hover-up-premium">
            {/* Image Preview Header */}
            <div className="position-relative" style={{ height: '160px', backgroundColor: '#F1F5F9' }}>
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={complaint.title}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('d-flex', 'align-items-center', 'justify-content-center');
                        }}
                    />
                ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted opacity-20">
                        <ImageIcon size={48} />
                    </div>
                )}
                <div className="position-absolute top-0 end-0 p-3">
                    <StatusBadge status={complaint.status} size="sm" />
                </div>
                <div className="position-absolute bottom-0 start-0 p-3 w-100 bg-gradient-dark-top text-white">
                    <span className="fw-black extra-small tracking-widest opacity-75">#{id}</span>
                </div>
            </div>

            <div className="card-body p-4">
                <h6 className="fw-bold text-dark mb-2 leading-sm line-clamp-1" style={{ fontSize: '1rem' }}>{complaint.title}</h6>
                <p className="text-muted extra-small fw-medium mb-4 opacity-75 line-clamp-2" style={{ height: '32px' }}>{complaint.description}</p>

                <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2 extra-small text-muted fw-bold">
                        <Calendar size={12} className="text-primary" style={{ color: brandColor }} />
                        <span>Filed: {formatDate(complaint.createdAt || complaint.complaintDate)}</span>
                    </div>
                    {(complaint.departmentName || complaint.department?.name) && (
                        <div className="d-flex align-items-center gap-2 extra-small text-muted fw-bold">
                            <Building2 size={12} className="text-secondary" />
                            <span>{(complaint.departmentName || complaint.department?.name).replace(/_/g, ' ')}</span>
                        </div>
                    )}
                    {complaint.wardName && (
                        <div className="d-flex align-items-center gap-2 extra-small text-muted fw-bold">
                            <MapPin size={12} className="text-danger" />
                            <span>{complaint.wardName}</span>
                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
                    <PriorityBadge priority={complaint.priority} size="sm" />
                    <button
                        onClick={onClick}
                        className="btn btn-link p-0 text-decoration-none extra-small fw-bold d-flex align-items-center gap-1"
                        style={{ color: brandColor }}
                    >
                        View details <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-up-premium { transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }
                .hover-up-premium:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .leading-sm { line-height: 1.25; }
                .bg-gradient-dark-top { background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%); }
                .fw-black { font-weight: 900; }
                .object-fit-cover { object-fit: cover; }
            `}} />
        </div>
    );
};

export default ComplaintCard;
