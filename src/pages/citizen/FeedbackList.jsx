import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import citizenService from '../../services/citizenService';
import { Star, AlertCircle, CheckCircle } from 'lucide-react';
import { COMPLAINT_STATUS } from '../../constants';

const FeedbackList = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const data = await citizenService.getMyComplaints();
            // Filter for RESOLVED or CLOSED complaints that might need feedback
            const resolvedComplaints = (Array.isArray(data) ? data : (data.content || []))
                .filter(c => c && (c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'APPROVED'));

            setComplaints(resolvedComplaints);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setError('Failed to load complaints.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-4">Pending Feedback</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {complaints.length === 0 ? (
                <div className="card shadow-sm border-0 text-center py-5">
                    <div className="card-body">
                        <CheckCircle size={48} className="text-success mb-3" />
                        <h5>No complaints require feedback</h5>
                        <p className="text-muted">You have no resolved complaints at the moment.</p>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {complaints.map(complaint => (
                        <div key={complaint.complaintId || complaint.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="badge bg-success">Resolved</span>
                                        <span className="text-muted small">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h5 className="card-title text-truncate">{complaint.title}</h5>
                                    <p className="card-text text-muted small text-truncate">
                                        {complaint.description}
                                    </p>
                                    <button
                                        className="btn btn-outline-primary w-100 mt-3"
                                        onClick={() => navigate(`/citizen/feedback/${complaint.complaintId || complaint.id}`)}
                                    >
                                        <Star size={16} className="me-2" />
                                        Give Feedback
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackList;
