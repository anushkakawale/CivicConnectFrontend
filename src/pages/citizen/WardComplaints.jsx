import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/ToastProvider';

export default function WardComplaints() {
    const navigate = useNavigate();
    const toast = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchWardComplaints();
    }, []);

    const fetchWardComplaints = async () => {
        try {
            const response = await apiService.citizen.getWardComplaints();
            // backend returns list of complaints directly or within data
            const data = response.data || response;
            setComplaints(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch ward complaints:', error);
            // toast.error('Failed to load ward complaints');
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = complaints
        .filter(c => filter === 'ALL' || c.status === filter)
        .filter(c =>
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const stats = {
        ALL: complaints.length,
        SUBMITTED: complaints.filter(c => c.status === 'SUBMITTED').length,
        IN_PROGRESS: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        RESOLVED: complaints.filter(c => c.status === 'RESOLVED').length,
    };

    if (loading) return <LoadingSpinner message="Loading ward complaints..." fullScreen />;

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom, #f8f9fc 0%, #e9ecef 100%)' }}>
            {/* Modern Header with Glass Effect */}
            <div className="position-relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                paddingTop: '4rem',
                paddingBottom: '6rem'
            }}>
                <div className="position-absolute w-100 h-100" style={{
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.1
                }}></div>
                <div className="container position-relative">
                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="rounded-0 p-3" style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <i className="bi bi-people-fill text-white" style={{ fontSize: '2rem' }}></i>
                                </div>
                                <div>
                                    <h1 className="display-5 fw-bold text-white mb-0">Ward Complaints</h1>
                                    <p className="text-white opacity-75 mb-0">Community issues in your ward</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-3rem' }}>
                {/* Stats Cards with Modern Design */}
                <div className="row g-3 mb-4">
                    {[
                        { key: 'ALL', label: 'Total', icon: 'grid-3x3-gap', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                        { key: 'SUBMITTED', label: 'Submitted', icon: 'inbox', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                        { key: 'IN_PROGRESS', label: 'In Progress', icon: 'hourglass-split', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                        { key: 'RESOLVED', label: 'Resolved', icon: 'check-circle', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
                    ].map(stat => (
                        <div key={stat.key} className="col-md-3">
                            <div
                                className="card border-0 shadow-sm h-100"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: filter === stat.key ? stat.gradient : 'white',
                                    transform: filter === stat.key ? 'translateY(-4px)' : 'none'
                                }}
                                onClick={() => setFilter(stat.key)}
                                onMouseEnter={(e) => {
                                    if (filter !== stat.key) e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    if (filter !== stat.key) e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className={`small mb-1 ${filter === stat.key ? 'text-white opacity-75' : 'text-muted'}`}>
                                                {stat.label}
                                            </p>
                                            <h2 className={`fw-bold mb-0 ${filter === stat.key ? 'text-white' : ''}`}>
                                                {stats[stat.key]}
                                            </h2>
                                        </div>
                                        <div className="rounded-0 p-3" style={{
                                            background: filter === stat.key ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.1)'
                                        }}>
                                            <i className={`bi bi-${stat.icon} ${filter === stat.key ? 'text-white' : 'text-primary'}`} style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <div className="input-group input-group-lg">
                            <span className="input-group-text bg-transparent border-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-0"
                                placeholder="Search complaints by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Complaints Grid */}
                {filteredComplaints.length === 0 ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-5 text-center">
                            <div className="mb-4">
                                <i className="bi bi-inbox display-1 text-muted opacity-25"></i>
                            </div>
                            <h4 className="fw-bold mb-2">No Complaints Found</h4>
                            <p className="text-muted mb-0">
                                {searchTerm ? `No results for "${searchTerm}"` : 'No complaints in your ward yet'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4 mb-5">
                        {filteredComplaints.map(complaint => (
                            <div key={complaint.complaintId} className="col-md-6 col-lg-4">
                                <div
                                    className="card border-0 shadow-sm h-100"
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => navigate(`/citizen/complaints/${complaint.citizenUserId}/${complaint.complaintId}`)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '';
                                    }}
                                >
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <span className="badge bg-light text-dark">#{complaint.complaintId}</span>
                                            <StatusBadge status={complaint.status} />
                                        </div>
                                        <h5 className="fw-bold mb-2">{complaint.title}</h5>
                                        <p className="text-muted mb-3" style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {complaint.description}
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center text-muted small">
                                            <span><i className="bi bi-calendar3 me-1"></i>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                            {complaint.departmentName && (
                                                <span><i className="bi bi-building me-1"></i>{complaint.departmentName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
