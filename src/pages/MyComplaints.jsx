import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import StatusBadge from '../components/ui/StatusBadge';
import SlaTimer from '../components/ui/SlaTimer';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/ToastProvider';

export default function MyComplaints() {
  const navigate = useNavigate();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('my');

  useEffect(() => {
    fetchComplaints();
  }, [viewMode]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = viewMode === 'my'
        ? await apiService.complaint.getMyComplaints()
        : await apiService.complaint.getWardComplaints();

      // Handle paginated response
      const data = response.data?.content || response.data || [];
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      toast.error('Could not load complaints');
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

  if (loading) return <LoadingSpinner message="Loading complaints..." fullScreen />;

  return (
    <div className="min-vh-100 bg-gov-light">
      {/* Government Stripe */}
      <div className="gov-stripe"></div>

      {/* Official Header */}
      <div className="gov-header animate-fade-in">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="gov-title mb-1">
                {viewMode === 'my' ? 'My Complaints' : 'Ward Complaints'}
              </h1>
              <p className="gov-subtitle mb-0">
                {viewMode === 'my' ? 'Track your submitted complaints' : 'View all complaints in your area'}
              </p>
            </div>
            <button onClick={() => navigate('/citizen/complaints/new')} className="btn btn-gov-primary ripple">
              <i className="bi bi-plus-lg me-2"></i>New Complaint
            </button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* View Toggle */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="btn-group w-100 shadow-gov animate-scale-in" role="group">
              <button
                className={`btn btn-lg ${viewMode === 'my' ? 'btn-gov-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('my')}
                style={{ borderRadius: '8px 0 0 8px', transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-person me-2"></i>My Complaints
              </button>
              <button
                className={`btn btn-lg ${viewMode === 'ward' ? 'btn-gov-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('ward')}
                style={{ borderRadius: '0 8px 8px 0', transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-geo-alt me-2"></i>Ward/Area Complaints
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {Object.entries(stats).map(([status, count], index) => (
            <div key={status} className={`col-md-3 animate-fade-in stagger-${index + 1}`}>
              <div
                className={`gov-stat-card card-hover ${filter === status ? 'glow' : ''}`}
                style={{
                  cursor: 'pointer',
                  borderLeftColor: filter === status ? 'var(--gov-primary)' : 'var(--gov-border)',
                  borderLeftWidth: '4px'
                }}
                onClick={() => setFilter(status)}
              >
                <div className="gov-stat-value">{count}</div>
                <div className="gov-stat-label">{status.replace(/_/g, ' ')}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="gov-card p-3 animate-slide-in">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-transparent border-0">
                  <i className="bi bi-search text-gov-primary"></i>
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
        </div>

        {/* Complaints Grid */}
        {filteredComplaints.length === 0 ? (
          <div className="gov-card p-5 text-center animate-scale-in">
            <i className="bi bi-inbox display-1 text-muted mb-3" style={{ opacity: 0.3 }}></i>
            <h5 className="fw-bold mb-2">No Complaints Found</h5>
            <p className="text-muted mb-4">
              {searchTerm ? `No results for "${searchTerm}"` :
                viewMode === 'my' ? "You haven't submitted any complaints yet" :
                  "No complaints in your ward yet"}
            </p>
            {viewMode === 'my' && (
              <button onClick={() => navigate('/citizen/complaints/new')} className="btn btn-gov-primary btn-lg ripple">
                <i className="bi bi-plus-lg me-2"></i>Submit Your First Complaint
              </button>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {filteredComplaints.map((complaint, index) => (
              <div key={complaint.complaintId} className={`col-md-6 col-lg-4 animate-fade-in stagger-${(index % 5) + 1}`}>
                <div
                  className="gov-card p-4 h-100 card-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/citizen/complaints/${complaint.citizenUserId || complaint.citizen?.userId}/${complaint.complaintId}`)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge-gov">#{complaint.complaintId}</span>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <h5 className="fw-bold text-gov-primary mb-2">{complaint.title}</h5>
                  <p className="text-muted mb-3" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {complaint.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center text-muted small border-top pt-3">
                    <span>
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    {complaint.slaDeadline && complaint.status !== 'CLOSED' && complaint.status !== 'RESOLVED' && (
                      <SlaTimer deadline={complaint.slaDeadline} status={complaint.status} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Government Footer */}
      <div className="gov-footer mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1 fw-semibold">CivicConnect - Smart City Initiative</p>
              <p className="small opacity-75 mb-0">© 2024 Government of India. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="small mb-0">
                <i className="bi bi-telephone me-2"></i>Helpline: 1800-XXX-XXXX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
