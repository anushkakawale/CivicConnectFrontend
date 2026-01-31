import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Eye,
  CheckSquare,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  Building2
} from 'lucide-react';
import apiService from '../api/apiService';
import './ProfessionalWardOfficerDashboard.css';

const ProfessionalWardOfficerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadDashboard();
    loadComplaints();
  }, [page, filterStatus]);

  const loadDashboard = async () => {
    try {
      console.log('🔄 Loading ward officer dashboard...');
      const [dashboardRes, pendingRes] = await Promise.all([
        apiService.wardOfficer.getDashboard(),
        apiService.wardOfficer.getPendingApprovals()
      ]);

      const dashboard = dashboardRes.data || dashboardRes;
      const pending = pendingRes.data || pendingRes || [];

      console.log('✅ Dashboard data:', dashboard);
      setDashboardData({
        ...dashboard,
        pendingApprovalsList: pending // Store full list if needed
      });

      // If pending count from dashboard stats is missing, use list length
      if (dashboard.pendingApproval === undefined) {
        dashboard.pendingApproval = pending.length;
      }

    } catch (err) {
      console.error('❌ Failed to load dashboard:', err);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading complaints...');

      // Use specific pending approvals if filter is PENDING
      if (filterStatus === 'PENDING') {
        const response = await apiService.wardOfficer.getPendingApprovals();
        const list = response.data || response || [];
        setComplaints(list);
        setTotalPages(1);
      } else {
        // Fallback to normal list
        const response = await apiService.wardOfficer.getAllComplaints(); // Changed from getComplaints which was paginated?
        // Note: apiService.wardOfficer.getAllComplaints() maps to /ward/complaints. 
        // Previous code used getComplaints(page, 10).
        // If getAllComplaints returns list, handle it:
        const list = response.data || response || [];
        setComplaints(list);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('❌ Failed to load complaints:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (complaintId) => {
    if (!window.confirm('Are you sure you want to approve this complaint?')) return;

    try {
      await apiService.wardOfficer.approveComplaint(complaintId);
      alert('✅ Complaint approved successfully!');
      loadDashboard();
      loadComplaints();
    } catch (err) {
      alert('Failed to approve complaint: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (complaintId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await apiService.wardOfficer.rejectComplaint(complaintId, reason);
      alert('✅ Complaint rejected!');
      loadDashboard();
      loadComplaints();
    } catch (err) {
      alert('Failed to reject complaint: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'SUBMITTED': { class: 'status-submitted', icon: Clock, text: 'Pending Approval' },
      'APPROVED': { class: 'status-approved', icon: CheckCircle, text: 'Approved' },
      'ASSIGNED': { class: 'status-assigned', icon: Users, text: 'Assigned' },
      'IN_PROGRESS': { class: 'status-in-progress', icon: RefreshCw, text: 'In Progress' },
      'RESOLVED': { class: 'status-resolved', icon: CheckCircle, text: 'Resolved' },
      'CLOSED': { class: 'status-closed', icon: CheckCircle, text: 'Closed' },
      'REJECTED': { class: 'status-rejected', icon: XCircle, text: 'Rejected' }
    };
    return badges[status] || badges['SUBMITTED'];
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'LOW': 'priority-low',
      'MEDIUM': 'priority-medium',
      'HIGH': 'priority-high',
      'CRITICAL': 'priority-critical'
    };
    return badges[priority] || 'priority-medium';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(c => {
        if (filterStatus === 'PENDING') return c.status === 'SUBMITTED';
        return c.status === filterStatus;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaintId?.toString().includes(searchTerm)
      );
    }

    return filtered;
  };

  const filteredComplaints = filterComplaints();

  // Default dashboard data if not loaded
  const stats = dashboardData || {
    totalComplaints: complaints.length,
    pendingApproval: complaints.filter(c => c.status === 'SUBMITTED').length,
    approved: complaints.filter(c => c.status === 'APPROVED' || c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length
  };

  return (
    <div className="ward-officer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <LayoutDashboard className="w-8 h-8" />
            <div>
              <h1>Ward Officer Dashboard</h1>
              <p>Manage and approve complaints in your ward</p>
            </div>
          </div>
          <button
            onClick={() => { loadDashboard(); loadComplaints(); }}
            className="btn-refresh"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <FileText className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalComplaints || 0}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-trend">
            <TrendingUp className="w-4 h-4" />
            <span>All time</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">
            <Clock className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingApproval || 0}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
          <div className="stat-action">
            <button
              onClick={() => setFilterStatus('PENDING')}
              className="btn-stat-action"
            >
              View All
            </button>
          </div>
        </div>

        <div className="stat-card stat-approved">
          <div className="stat-icon">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved || 0}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-action">
            <button
              onClick={() => setFilterStatus('APPROVED')}
              className="btn-stat-action"
            >
              View All
            </button>
          </div>
        </div>

        <div className="stat-card stat-progress">
          <div className="stat-icon">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress || 0}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-action">
            <button
              onClick={() => setFilterStatus('IN_PROGRESS')}
              className="btn-stat-action"
            >
              View All
            </button>
          </div>
        </div>

        <div className="stat-card stat-resolved">
          <div className="stat-icon">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.resolved || 0}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-trend">
            <TrendingUp className="w-4 h-4" />
            <span>Success rate</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-header">
          <Filter className="w-5 h-5" />
          <span>Filter & Search</span>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status</label>
            <div className="filter-buttons">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('APPROVED')}
                className={`filter-btn ${filterStatus === 'APPROVED' ? 'active' : ''}`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('IN_PROGRESS')}
                className={`filter-btn ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('RESOLVED')}
                className={`filter-btn ${filterStatus === 'RESOLVED' ? 'active' : ''}`}
              >
                Resolved
              </button>
            </div>
          </div>

          <div className="search-group">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="empty-state">
          <FileText className="w-16 h-16" />
          <h3>No Complaints Found</h3>
          <p>
            {filterStatus === 'ALL' && !searchTerm
              ? "No complaints in your ward yet"
              : "No complaints match your filters"}
          </p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filteredComplaints.map((complaint) => {
            const statusInfo = getStatusBadge(complaint.status);
            const StatusIcon = statusInfo.icon;
            const isPending = complaint.status === 'SUBMITTED';

            return (
              <div key={complaint.complaintId} className="complaint-card">
                {/* Card Header */}
                <div className="card-header">
                  <div className="complaint-id">
                    <span className="id-label">CMP-{complaint.complaintId}</span>
                    <span className={`priority-badge ${getPriorityBadge(complaint.priority)}`}>
                      {complaint.priority || 'MEDIUM'}
                    </span>
                  </div>
                  <div className={`status-badge ${statusInfo.class}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{statusInfo.text}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <h3 className="complaint-title">{complaint.title}</h3>
                  <p className="complaint-description">
                    {complaint.description?.length > 120
                      ? complaint.description.substring(0, 120) + '...'
                      : complaint.description}
                  </p>

                  <div className="complaint-meta">
                    <div className="meta-item">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(complaint.createdAt)}</span>
                      <span className="meta-secondary">({getDaysAgo(complaint.createdAt)})</span>
                    </div>
                    <div className="meta-item">
                      <Building2 className="w-4 h-4" />
                      <span>{complaint.department?.departmentName || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <Users className="w-4 h-4" />
                      <span>{complaint.citizenName || 'Anonymous'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <button
                    onClick={() => navigate(`/ward-officer/complaints/${complaint.complaintId}`)}
                    className="btn-view"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  <button
                    onClick={() => navigate('/ward-officer/map')}
                    className="btn-view ms-2"
                    style={{ background: '#f3f4f6', color: '#4b5563' }}
                  >
                    <MapPin className="w-4 h-4" />
                    Map
                  </button>

                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(complaint.complaintId)}
                        className="btn-approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(complaint.complaintId)}
                        className="btn-reject"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalWardOfficerDashboard;
