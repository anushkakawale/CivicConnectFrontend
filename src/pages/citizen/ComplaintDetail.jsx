import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, RotateCcw, Star, Loader, ShieldAlert, X, Zap, ChevronLeft, FileText, RefreshCw
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ComplaintDetailView from '../../components/complaints/ComplaintDetailView';

/**
 * Strategic Citizen Complaint Detail
 * Unified high-contrast layout for resident case tracking.
 */
const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [slaData, setSlaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [reopenReason, setReopenReason] = useState('');
    const [rating, setRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [userWardId, setUserWardId] = useState(null);
    const PRIMARY_COLOR = '#1254AF';

    useEffect(() => {
        apiService.profile.getProfile().then(res => {
            const p = res.data || res;
            setUserWardId(p.wardId || p.ward?.id || p.ward?.wardId);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [response, slaRes] = await Promise.all([
                apiService.citizen.getComplaintDetails(id),
                apiService.citizen.getSlaCountdown(id).catch(() => null)
            ]);

            const details = response.data || response;

            // Map rich "Gist" data structure from backend
            setComplaint({
                ...details,
                images: details.images || details.imageUrls || []
            });

            // Use history from the rich object as primary timeline
            setTimeline(details.history || details.timeline || []);
            setSlaData(slaRes?.data || slaRes);
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Unable to load report details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReopen = async () => {
        if (!reopenReason.trim()) return;
        try {
            await apiService.complaint.reopen(id, reopenReason);
            showToast('Report reopened successfully.', 'success');
            setShowReopenModal(false);
            fetchData();
        } catch (error) { showToast('Unable to reopen report.', 'error'); }
    };

    const handleSubmitFeedback = async () => {
        try {
            await apiService.complaint.submitFeedback(id, rating, feedbackComment);
            showToast('Thank you for your feedback.', 'success');
            setShowFeedbackModal(false);
            fetchData();
        } catch (error) { showToast('Unable to submit feedback.', 'error'); }
    };

    if (loading && !complaint) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-bold text-muted small">Loading details...</p>
            </div>
        );
    }

    if (!complaint) return null;

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Citizen Service Portal 🏛️"
                userName={`📋 ${complaint.title || "Issue Investigation"}`}
                wardName={`📍 ${complaint.wardByWardId?.areaName || complaint.wardName || "PMC District"}`}
                subtitle={`Report ID: #${complaint.complaintId || id} • Official Municipal Case Trace 🛡️`}
                icon={FileText}
                showProfileInitials={true}
                actions={
                    <div className="d-flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm fw-black extra-small tracking-widest d-flex align-items-center gap-2 border transition-all hover-shadow-md"
                            style={{ color: '#173470' }}
                        >
                            <ArrowLeft size={16} /> RETURN
                        </button>
                        {complaint.status === 'CLOSED' && !complaint.feedback && String(userWardId) === String(complaint.wardId || complaint.ward?.id || complaint.ward?.wardId) && (
                            <button
                                className="btn shadow-premium px-4 py-2 fw-bold rounded-pill d-flex align-items-center gap-2 border-0"
                                style={{ backgroundColor: '#F59E0B', color: 'white' }}
                                onClick={() => setShowFeedbackModal(true)}
                            >
                                <Star size={18} />
                                <span className="small">Share feedback</span>
                            </button>
                        )}
                    </div>
                }
            />

            <div className="container-fluid px-3 px-lg-5 mt-4">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <ComplaintDetailView
                            complaint={complaint}
                            images={complaint.images || []}
                            statusHistory={timeline.length > 0 ? timeline : (complaint.timeline || complaint.statusHistory || [])}
                            slaCountdown={slaData}
                            userRole="CITIZEN"
                            onReopen={() => setShowReopenModal(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Reopen Modal */}
            {showReopenModal && (
                <div className="custom-modal-overlay">
                    <div className="card shadow-premium border-0 rounded-4 overflow-hidden animate-zoomIn" style={{ maxWidth: '450px', width: '90%', background: 'white' }}>
                        <div className="card-header border-0 p-4 bg-light d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0 text-dark">Reopen report</h5>
                            <button
                                onClick={() => setShowReopenModal(false)}
                                className="btn btn-light rounded-circle p-1 border-0"
                            >
                                <X size={20} className="text-muted" />
                            </button>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            <label className="extra-small fw-bold text-muted mb-3 uppercase-tracking d-block">Reason for reopening</label>
                            <textarea
                                className="form-control border-0 p-4 bg-light fw-medium shadow-none rounded-4 mb-4"
                                rows="5"
                                placeholder="Please describe why the resolution was not satisfactory..."
                                value={reopenReason}
                                onChange={e => setReopenReason(e.target.value)}
                            />
                            <div className="d-grid gap-3">
                                <button className="btn btn-danger py-3 fw-bold rounded-pill shadow-premium border-0" onClick={handleReopen}>
                                    Confirm reopening
                                </button>
                                <button className="btn btn-link text-muted py-2 fw-bold text-decoration-none small" onClick={() => setShowReopenModal(false)}>
                                    Keep as resolved
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="custom-modal-overlay">
                    <div className="card shadow-premium border-0 rounded-4 overflow-hidden animate-zoomIn" style={{ maxWidth: '450px', width: '90%', background: 'white' }}>
                        <div className="card-header border-0 p-5 bg-white text-center pb-4">
                            <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                <Star size={40} className="text-warning" fill="#F59E0B" />
                            </div>
                            <h4 className="fw-bold mb-1">How was our service?</h4>
                            <p className="text-muted small fw-medium">Your feedback helps us improve municipal response quality.</p>
                        </div>
                        <div className="card-body p-4 p-md-5 pt-0">
                            <div className="d-flex justify-content-center gap-2 mb-5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        size={32}
                                        className="cursor-pointer transition-all hover-scale"
                                        fill={s <= rating ? '#F59E0B' : 'none'}
                                        stroke={s <= rating ? '#F59E0B' : '#CBD5E1'}
                                        onClick={() => setRating(s)}
                                    />
                                ))}
                            </div>
                            <label className="extra-small fw-bold text-muted mb-3 uppercase-tracking d-block">Additional comments</label>
                            <textarea
                                className="form-control border-0 p-4 bg-light fw-medium shadow-none rounded-4 mb-4"
                                rows="3"
                                placeholder="Any additional thoughts or suggestions? (optional)"
                                value={feedbackComment}
                                onChange={e => setFeedbackComment(e.target.value)}
                            />
                            <div className="d-grid gap-3">
                                <button className="btn btn-primary py-3 fw-bold rounded-pill shadow-premium border-0" style={{ backgroundColor: PRIMARY_COLOR }} onClick={handleSubmitFeedback}>
                                    Submit feedback
                                </button>
                                <button className="btn btn-link text-muted py-2 fw-bold text-decoration-none small" onClick={() => setShowFeedbackModal(false)}>
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes zoomIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
                .shadow-premium { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                .hover-scale:hover { transform: scale(1.1); }
                .uppercase-tracking { text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; }
                .extra-small { font-size: 11px; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default ComplaintDetail;
