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
  Building2,
  Calendar,
  Eye,
  RefreshCw,
  Filter,
  Search,
  PlayCircle,
  CheckSquare,
  Image as ImageIcon
} from 'lucide-react';
import apiService from '../api/apiService';
import './ProfessionalDepartmentOfficerDashboard.css';

const ProfessionalDepartmentOfficerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ASSIGNED');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadDashboard();
    loadComplaints();
  }, [page, filterStatus]);

  const loadDashboard = async () => {
    try {
      console.log('🔄 Loading department officer dashboard...');
      // Use generic dashboard or analytics dashboard
      const dashboardRes = await apiService.analytics.department.getDashboard();
      const data = dashboardRes.data || dashboardRes;

      console.log('✅ Dashboard data:', data);

      // Transform new analytics data to match component expectation
      // Expected: { totalAssigned, assigned, inProgress, resolved }
      // Incoming: { statistics: { totalAssigned... }, sla: {...} }

      if (data.statistics) {
        setDashboardData({
          totalAssigned: data.statistics.totalAssigned,
          assigned: data.statistics.assigned, // pending 
          inProgress: data.statistics.inProgress,
          resolved: data.statistics.resolved,
          sla: data.sla
        });
      } else {
        setDashboardData(data); // Fallback if format is different
      }

    } catch (err) {
      console.error('❌ Failed to load dashboard:', err);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading complaints...');

      // For "Assigned" tab (default), use getPendingWork for prioritized list
      if (filterStatus === 'ASSIGNED') {
        const response = await apiService.analytics.department.getPendingWork();
        // This returns { complaints: [...] } usually
        const list = response.data?.complaints || response.complaints || response.data || [];
        setComplaints(list);
        setTotalPages(1);
      } else {
        // Fallback / other statuses
        const response = await apiService.departmentOfficer.getAssignedComplaints();
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

  const handleStartWork = async (complaintId) => {
    if (!window.confirm('Start working on this complaint?')) return;

    try {
      await apiService.departmentOfficer.updateStatus(complaintId, 'IN_PROGRESS', 'Started working on the complaint');
      alert('✅ Status updated to In Progress!');
      loadDashboard();
      loadComplaints();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResolve = (complaintId) => {
    // Navigate to details page where Resolve action is available
    navigate(`/department/complaints/${complaintId}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'ASSIGNED': { class: 'status-assigned', icon: Users, text: 'Assigned to You' },
      'IN_PROGRESS': { class: 'status-in-progress', icon: RefreshCw, text: 'In Progress' },
      'RESOLVED': { class: 'status-resolved', icon: CheckCircle, text: 'Resolved' },
      'CLOSED': { class: 'status-closed', icon: CheckSquare, text: 'Closed' }
    };
    return badges[status] || badges['ASSIGNED'];
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
      filtered = filtered.filter(c => c.status === filterStatus);
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
    totalAssigned: complaints.length,
    assigned: complaints.filter(c => c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length
  };

  return (
    <div className="dept-officer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <LayoutDashboard className="w-8 h-8" />
            <div>
              <h1>Department Officer Dashboard</h1>
              <p>Manage and resolve assigned complaints</p>
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
            <div className="stat-value">{stats.totalAssigned || 0}</div>
            <div className="stat-label">Total Assigned</div>
          </div>
          <div className="stat-trend">
            <TrendingUp className="w-4 h-4" />
            <span>All time</span>
          </div>
        </div>

        <div className="stat-card stat-assigned">
          <div className="stat-icon">
            <Users className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.assigned || 0}</div>
            <div className="stat-label">Pending Work</div>
          </div>
          <div className="stat-action">
            <button
              onClick={() => setFilterStatus('ASSIGNED')}
              className="btn-stat-action"
            >
              Start Working
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
            <CheckCircle className="w-6 h-6" />
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
                onClick={() => setFilterStatus('ASSIGNED')}
                className={`filter-btn ${filterStatus === 'ASSIGNED' ? 'active' : ''}`}
              >
                Assigned
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
              ? "No complaints assigned to you yet"
              : "No complaints match your filters"}
          </p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filteredComplaints.map((complaint) => {
            const statusInfo = getStatusBadge(complaint.status);
            const StatusIcon = statusInfo.icon;
            const isAssigned = complaint.status === 'ASSIGNED';
            const isInProgress = complaint.status === 'IN_PROGRESS';

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
                      <span>{complaint.ward?.wardName || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <Users className="w-4 h-4" />
                      <span>{complaint.citizenName || 'Anonymous'}</span>
                    </div>
                    {complaint.imageCount > 0 && (
                      <div className="meta-item">
                        <ImageIcon className="w-4 h-4" />
                        <span>{complaint.imageCount} image(s)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <button
                    onClick={() => navigate(`/department-officer/complaints/${complaint.complaintId}`)}
                    className="btn-view"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  {isAssigned && (
                    <button
                      onClick={() => handleStartWork(complaint.complaintId)}
                      className="btn-start"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Start Work
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      onClick={() => handleResolve(complaint.complaintId)}
                      className="btn-resolve"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Resolved
                    </button>
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

export default ProfessionalDepartmentOfficerDashboard;
