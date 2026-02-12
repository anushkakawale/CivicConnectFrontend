/**
 * Standardized Complaint Card Component
 * Professional PMC design for consistent UI across all feeds
 */

import React from 'react';
import { Calendar, Building2, MapPin, ArrowRight, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import { getImageUrl } from '../../utils/imageUtils';
import AuthenticatedImage from '../ui/AuthenticatedImage';

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
        <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden transition-all hover-up-premium tactical-light">
            {/* Image Preview Header */}
            <div className="position-relative" style={{ height: '180px', backgroundColor: '#F1F5F9' }}>
                {displayImage ? (
                    <AuthenticatedImage
                        src={displayImage}
                        alt={complaint.title}
                        className="w-100 h-100 object-fit-cover"
                    />
                ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted opacity-20 bg-light">
                        <ImageIcon size={48} />
                    </div>
                )}

                {/* Tactical Overlays */}
                <div className="position-absolute top-0 start-0 p-3">
                    <div className="badge-rect-blue shadow-sm bg-primary bg-opacity-90 backdrop-blur-sm" style={{ fontSize: '0.6rem' }}>
                        ID: {id}
                    </div>
                </div>

                <div className="position-absolute top-0 end-0 p-3">
                    <StatusBadge status={complaint.status} size="sm" />
                </div>

                <div className="position-absolute bottom-0 start-0 p-3 w-100 bg-gradient-dark-top text-white">
                    <div className="d-flex align-items-center gap-2">
                        <PriorityBadge priority={complaint.priority} size="sm" />
                    </div>
                </div>
            </div>

            <div className="card-body p-4 d-flex flex-column">
                <div className="mb-3 d-flex align-items-center gap-2">
                    <div className="icon-wrap p-1 rounded-circle" style={{ width: '24px', height: '24px', backgroundColor: '#F1F5F9' }}>
                        <Building2 size={12} className="text-primary" />
                    </div>
                    <span className="extra-small fw-black text-muted uppercase tracking-widest">{(complaint.departmentName || complaint.department?.name || 'GEN').replace(/_/g, ' ')}</span>
                </div>

                <h6 className="fw-black text-dark mb-2 leading-sm line-clamp-2" style={{ fontSize: '1.05rem', minHeight: '2.5rem' }}>{complaint.title}</h6>
                <p className="text-muted extra-small fw-bold mb-4 opacity-60 line-clamp-2" style={{ height: '32px' }}>{complaint.description}</p>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2 text-muted fw-bold extra-small uppercase">
                        <Calendar size={14} />
                        <span>{formatDate(complaint.createdAt || complaint.complaintDate)}</span>
                    </div>

                    <button
                        onClick={onClick}
                        className="btn btn-outline-primary px-3 py-2 border-0 bg-primary bg-opacity-10 text-primary fw-bold transition-all hover-bg-primary hover-text-white"
                        style={{ fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                        View Details <ArrowRight size={14} className="ms-1" />
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
