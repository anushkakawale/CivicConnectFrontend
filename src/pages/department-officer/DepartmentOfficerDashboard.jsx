import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import SlaTimer from '../../components/ui/SlaTimer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DepartmentOfficerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, breached: 0 });
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await apiService.department.getAssignedComplaints();
            const data = response.data || [];
            setComplaints(data.slice(0, 5));
            setStats({
                total: data.length,
                active: data.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length,
                resolved: data.filter(c => c.status === 'RESOLVED').length,
                breached: data.filter(c => c.slaBreached).length
            });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="min-vh-100" style={{ background: '#f8f9fc' }}>
            {/* Modern Navbar */}
            <nav className="navbar navbar-dark shadow-sm" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}>
                <div className="container-fluid px-4">
                    <span className="navbar-brand fw-bold">
                        <i className="bi bi-tools me-2"></i>
                        Department Officer Portal
                    </span>
                    <div className="d-flex gap-2">
                        <span className="text-white fw-medium">
                            <i className="bi bi-person-circle me-2"></i>
                            {localStorage.getItem('email')}
                        </span>
                        <button onClick={handleLogout} className="btn btn-light btn-sm">
                            <i className="bi bi-box-arrow-right me-2"></i>Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="position-relative overflow-hidden py-5" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}>
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="display-4 fw-bold text-white mb-2 animate-fade-in">Field Operations Center</h1>
                            <p className="lead text-white opacity-75 mb-0">Manage and resolve assigned complaints</p>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-strong glass">
                                <div className="card-body p-4 text-white text-center">
                                    <i className="bi bi-exclamation-triangle-fill display-4 mb-2"></i>
                                    <h2 className="fw-bold mb-0">{stats.breached}</h2>
                                    <small>SLA Breached</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                {/* Stats Cards */}
                <div className="row g-4 mb-4" style={{ marginTop: '-3rem' }}>
                    {[
                        { label: 'Total Assigned', value: stats.total, icon: 'clipboard-check', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                        { label: 'Active Work', value: stats.active, icon: 'hourglass-split', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
                        { label: 'Resolved', value: stats.resolved, icon: 'check-circle', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                        { label: 'SLA Breached', value: stats.breached, icon: 'exclamation-triangle', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
                    ].map((stat, idx) => (
                        <div key={idx} className="col-md-6 col-xl-3">
                            <div className="card border-0 shadow-sm hover-lift h-100" style={{ background: stat.gradient }}>
                                <div className="card-body p-4 text-white">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <p className="small mb-0 opacity-75 text-uppercase fw-bold">{stat.label}</p>
                                        <i className={`bi bi-${stat.icon} fs-4`}></i>
                                    </div>
                                    <h1 className="display-5 fw-bold mb-0">{stat.value}</h1>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="row g-4 mb-4">
                    {[
                        { title: 'Assigned Complaints', icon: 'list-task', color: '#667eea', path: '/department-officer/complaints' },
                        { title: 'SLA Analytics', icon: 'graph-up', color: '#10b981', path: '/department-officer/analytics' },
                        { title: 'My Profile', icon: 'person-circle', color: '#f59e0b', path: '/department-officer/profile' }
                    ].map((action, idx) => (
                        <div key={idx} className="col-md-4">
                            <div
                                className="card border-0 shadow-sm hover-lift h-100"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(action.path)}
                            >
                                <div className="card-body p-4 text-center">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{
                                        width: '70px',
                                        height: '70px',
                                        backgroundColor: action.color + '20'
                                    }}>
                                        <i className={`bi bi-${action.icon}`} style={{ fontSize: '2rem', color: action.color }}></i>
                                    </div>
                                    <h5 className="fw-bold mb-0">{action.title}</h5>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Complaints */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0 p-4">
                        <h5 className="fw-bold mb-0">Recent Assigned Complaints</h5>
                    </div>
                    <div className="card-body p-4">
                        {complaints.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-inbox display-1 text-muted opacity-25"></i>
                                <h5 className="mt-3 text-muted">No complaints assigned</h5>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {complaints.map(complaint => (
                                    <div key={complaint.complaintId} className="col-12">
                                        <div className="card border-0 bg-light hover-lift" style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/department-officer/complaints/${complaint.complaintId}`)}>
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <span className="badge bg-secondary">#{complaint.complaintId}</span>
                                                            <StatusBadge status={complaint.status} />
                                                            {complaint.slaDeadline && (
                                                                <SlaTimer deadline={complaint.slaDeadline} status={complaint.status} />
                                                            )}
                                                        </div>
                                                        <h6 className="fw-bold mb-1">{complaint.title}</h6>
                                                        <p className="text-muted small mb-0">{complaint.description?.substring(0, 100)}...</p>
                                                    </div>
                                                    <button className="btn btn-primary btn-sm">
                                                        View <i className="bi bi-arrow-right ms-1"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
