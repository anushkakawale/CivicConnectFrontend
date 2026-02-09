import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { COMPLAINT_STATUS } from '../../constants';
import DashboardHeader from '../../components/layout/DashboardHeader';
import apiService from '../../api/apiService';

const FeedbackList = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const primaryColor = '#1254AF';

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const data = await apiService.citizen.getMyComplaints();
            // Filter for RESOLVED or CLOSED complaints that might need feedback
            const resolvedComplaints = (Array.isArray(data) ? data : (data.content || []))
                .filter(c => c && (c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'APPROVED'));

            setComplaints(resolvedComplaints);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setError('Failed to load your recent resolutions.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: primaryColor }} />
                <p className="fw-bold text-muted">Checking resolutions...</p>
            </div>
        );
    }

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC Citizen Portal"
                userName="Public feedback"
                wardName="Quality check"
                subtitle="Rate your experience with our complaint resolution process."
                icon={Star}
            />

            <div className="container" style={{ maxWidth: '1200px', marginTop: '-20px' }}>
                {error && <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4">{error}</div>}

                {complaints.length === 0 ? (
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border-dashed border-2">
                        <CheckCircle size={64} className="text-muted opacity-25 mb-4 mx-auto" />
                        <h4 className="fw-bold text-dark mb-2">No feedback needed</h4>
                        <p className="text-muted small">You don't have any recently resolved complaints that require feedback.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {complaints.map(complaint => (
                            <div key={complaint.complaintId || complaint.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm rounded-4 hover-up transition-all bg-white">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge px-3 py-1 rounded-pill fw-bold small bg-success bg-opacity-10 text-success border border-success border-opacity-10">Resolved</span>
                                            <span className="text-muted small fw-bold opacity-50">
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h5 className="fw-bold text-dark mb-2 text-truncate">{complaint.title}</h5>
                                        <p className="text-muted small mb-4 opacity-75" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {complaint.description}
                                        </p>
                                        <button
                                            className="btn btn-primary w-100 rounded-pill py-2 fw-bold small shadow-sm border-0"
                                            style={{ backgroundColor: primaryColor }}
                                            onClick={() => navigate(`/citizen/feedback/${complaint.complaintId || complaint.id}`)}
                                        >
                                            <Star size={16} className="me-2" />
                                            Share experience
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                .hover-up:hover { transform: translateY(-5px); transition: transform 0.2s ease; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default FeedbackList;
