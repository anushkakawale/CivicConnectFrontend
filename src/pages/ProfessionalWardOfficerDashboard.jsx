import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckCircle, Clock,
  MapPin, Eye, CheckSquare, RefreshCw,
  Search, Building2, AlertCircle,
  User, Map as MapIcon, ClipboardList, Shield, ShieldCheck,
  ArrowRight, Activity, Zap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import wardOfficerService from '../services/wardOfficerService';
import { StatusBadge } from '../components/common';

const ProfessionalWardOfficerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('PENDING_APPROVAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [wardChanges, setWardChanges] = useState([]);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadDashboard();
    loadComplaints();
  }, [filterStatus]);

  const loadDashboard = async () => {
    try {
      const response = await wardOfficerService.getDashboardAnalytics();
      setDashboardData(response.data || response);
      const wardChangesRes = await wardOfficerService.getPendingWardChanges();
      setWardChanges(wardChangesRes.data || wardChangesRes || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadComplaints = async (pageNum = 0) => {
    try {
      setLoading(true);
      const params = { page: pageNum, size: 50 };

      if (filterStatus !== 'ALL') {
        if (filterStatus === 'PENDING_APPROVAL') {
          params.status = 'RESOLVED';
        } else if (filterStatus === 'IN_PROGRESS') {
          // For IN_PROGRESS view, we might want both ASSIGNED and IN_PROGRESS, 
          // but backend likely takes one. Let's start with IN_PROGRESS or handled by backend logic if custom.
          // If backend only assumes one status, let's send 'IN_PROGRESS' for now.
          params.status = 'IN_PROGRESS';
        } else {
          params.status = filterStatus;
        }
      }

      const response = await wardOfficerService.getWardComplaints(params);
      const payload = response.data || response;
      const list = payload.content || (Array.isArray(payload) ? payload : []);
      setComplaints(list);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWardChange = async (requestId, action) => {
    try {
      if (action === 'approve') {
        await wardOfficerService.approveWardChange(requestId, 'Approved by Ward Command');
      } else {
        await wardOfficerService.rejectWardChange(requestId, 'Protocol rejection by Ward Command');
      }
      loadDashboard();
    } catch (err) {
      console.error('Error handling ward change:', err);
    }
  };

  const stats = dashboardData?.cards || dashboardData?.overallStatistics || {
    totalComplaints: 0, pendingApprovals: 0, approved: 0, pending: 0, closed: 0
  };

  const deptData = (dashboardData?.departmentPerformance || []).map(d => ({
    name: d.departmentName || d.name,
    count: d.total || d.count || 0
  }));

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'PENDING_APPROVAL') if (c.status !== 'RESOLVED') return false;
      else if (filterStatus === 'IN_PROGRESS') if (c.status !== 'IN_PROGRESS' && c.status !== 'ASSIGNED') return false;
      else if (c.status !== filterStatus) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return c.title?.toLowerCase().includes(term) || c.complaintId?.toString().includes(term);
    }
    return true;
  });

  /* Removed broken client-side pagination slicing */
  const paginatedComplaints = filteredComplaints;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading && !dashboardData) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F5F7FA' }}>
        <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: '#1254AF' }} />
        <p className="fw-bold text-primary text-uppercase tracking-widest" style={{ color: '#1254AF' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#F5F7FA', padding: '2rem' }}>
      {/* Header Section */}
      <div className="card border-0 shadow-lg rounded-0 overflow-hidden mb-4" style={{
        background: 'linear-gradient(135deg, #1254AF 0%, #0D4291 100%)'
      }}>
        <div className="card-body p-4 position-relative">
          <div className="position-absolute top-50 end-0 translate-middle-y p-3 opacity-10">
            <ShieldCheck size={180} color="white" />
          </div>
          <div className="row align-items-center position-relative z-1">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="p-2 rounded-0 bg-white bg-opacity-20 shadow-sm border border-white border-opacity-10 text-white">
                  <Shield size={28} />
                </div>
                <div>
                  <h2 className="fw-bold text-white mb-0" style={{ fontSize: '1.75rem' }}>Ward Dashboard</h2>
                  <p className="text-white opacity-90 small mb-0 font-medium">Overview of your ward's complaints and performance.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
                <button
                  onClick={() => navigate('/ward-officer/map')}
                  className="btn btn-white rounded-0 px-3 py-2 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  <MapIcon size={16} /> Map View
                </button>
                <button
                  onClick={() => { loadDashboard(); loadComplaints(); }}
                  className="btn btn-outline-light rounded-0 px-3 py-2 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="row g-4 mb-4">
        {[
          { label: 'Total Complaints', val: stats.totalComplaints, icon: FileText, color: '#1254AF', trend: '+5.2%' },
          { label: 'Pending Approval', val: stats.pendingApprovals, icon: AlertCircle, color: '#F59E0B', highlight: true },
          { label: 'In Progress', val: stats.pending, icon: Zap, color: '#3B82F6' },
          { label: 'Closed', val: stats.closed, icon: CheckSquare, color: '#10B981' }
        ].map((s, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div className={`card border-0 shadow-sm rounded-0 p-3 h-100 bg-white transition-all hover-up ${s.highlight ? 'border-start border-4 border-warning' : ''}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 rounded-0" style={{ backgroundColor: s.color + '15', color: s.color }}>
                  <s.icon size={20} />
                </div>
                {s.trend && <span className="extra-small fw-bold text-success">{s.trend}</span>}
              </div>
              <h3 className="fw-bold text-dark mb-0">{s.val}</h3>
              <span className="extra-small fw-bold text-muted text-uppercase tracking-wider">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-1 rounded-0 shadow-sm mb-4 d-inline-flex gap-1 border border-light">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'complaints', label: 'Complaints', icon: ClipboardList },
          { id: 'ward-changes', label: 'Ward Transfers', icon: MapPin, count: wardChanges.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`btn d-flex align-items-center gap-2 px-4 py-2 border-0 rounded-0 fw-bold small transition-all ${activeView === tab.id ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
            style={{ backgroundColor: activeView === tab.id ? '#1254AF' : undefined }}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count > 0 && <span className="badge bg-danger ms-2 rounded-0 px-2">{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-0 overflow-hidden h-100 bg-white">
              <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Activity className="text-primary" style={{ color: '#1254AF' }} size={20} />
                  Recent Activity
                </h5>
                <button onClick={() => setActiveView('complaints')} className="btn btn-link p-0 text-primary fw-bold small text-decoration-none" style={{ color: '#1254AF' }}>View All</button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3 small fw-bold text-muted text-uppercase">ID</th>
                        <th className="py-3 small fw-bold text-muted text-uppercase">Title</th>
                        <th className="py-3 small fw-bold text-muted text-uppercase">Status</th>
                        <th className="py-3 text-end px-4 small fw-bold text-muted text-uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedComplaints.slice(0, 5).map(c => (
                        <tr key={c.complaintId} className="border-bottom border-light">
                          <td className="px-4 fw-bold text-primary" style={{ color: '#1254AF' }}>#{c.complaintId}</td>
                          <td>
                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '250px' }}>{c.title}</div>
                            <div className="small text-muted mt-1">{c.department?.departmentName || 'General'}</div>
                          </td>
                          <td><StatusBadge status={c.status} size="small" /></td>
                          <td className="text-end px-4">
                            <button
                              onClick={() => navigate(`/ward-officer/complaints/${c.complaintId}`)}
                              className="btn btn-light rounded-0 p-2 text-primary"
                              style={{ color: '#1254AF', backgroundColor: '#F0F9FF' }}
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-0 bg-white h-100 p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <Building2 className="text-primary" style={{ color: '#1254AF' }} size={20} />
                Department Load
              </h5>
              <div style={{ height: '300px', minHeight: '300px', minWidth: '0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EBF6F6" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600 }} width={80} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '0', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#1254AF" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'complaints' && (
        <div className="card border-0 shadow-sm rounded-0 overflow-hidden bg-white">
          <div className="card-header bg-white border-0 p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <h5 className="fw-bold mb-0">All Complaints</h5>
            <div className="d-flex gap-2 align-items-center">
              <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input
                  type="text"
                  className="form-control rounded-0 border bg-light ps-5 py-2 small"
                  placeholder="Search ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '200px' }}
                />
              </div>
              <select className="form-select rounded-0 border bg-light small px-3 py-2 shadow-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 small fw-bold text-muted">ID</th>
                    <th className="py-3 small fw-bold text-muted">Title</th>
                    <th className="py-3 small fw-bold text-muted text-center">Status</th>
                    <th className="py-3 small fw-bold text-muted text-end px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.map(c => (
                    <tr key={c.complaintId} className="border-bottom border-light">
                      <td className="px-4 fw-bold text-primary" style={{ color: '#1254AF' }}>#{c.complaintId}</td>
                      <td>
                        <div className="fw-semibold text-dark">{c.title}</div>
                        <div className="small text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="text-center"><StatusBadge status={c.status} size="small" /></td>
                      <td className="text-end px-4">
                        <button onClick={() => navigate(`/ward-officer/complaints/${c.complaintId}`)} className="btn btn-light rounded-0 p-2 text-primary" style={{ backgroundColor: '#F0F9FF', color: '#1254AF' }}>
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'ward-changes' && (
        <div className="animate-fadeIn">
          <div className="d-flex align-items-center gap-3 mb-4">
            <h4 className="fw-bold mb-0">Transfer Requests</h4>
            <span className="badge bg-primary rounded-0 px-3 py-2 small" style={{ backgroundColor: '#1254AF' }}>{wardChanges.length} Pending</span>
          </div>

          <div className="row g-4">
            {wardChanges.length === 0 ? (
              <div className="col-12 text-center py-5">
                <div className="card border-0 shadow-sm rounded-0 p-5 bg-white border-dashed">
                  <MapPin size={60} className="text-muted opacity-25 mb-3 mx-auto" />
                  <h5 className="fw-bold text-muted">No Requests</h5>
                  <p className="text-muted small">No jurisdictional transfer requests found.</p>
                </div>
              </div>
            ) : (
              wardChanges.map(request => (
                <div key={request.id} className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-0 bg-white p-4 h-100">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="p-3 rounded-0 bg-primary bg-opacity-10 text-primary" style={{ backgroundColor: '#F0F9FF', color: '#1254AF' }}>
                        <User size={24} />
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="fw-bold text-dark mb-0">{request.userName || 'Citizen'}</h5>
                        <div className="d-flex align-items-center gap-2 small text-muted">
                          <Clock size={14} /> {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-0 bg-light border mb-3 d-flex align-items-center justify-content-center gap-3">
                      <div className="text-center">
                        <span className="extra-small fw-bold text-muted d-block mb-1">Current</span>
                        <div className="badge bg-white text-dark rounded-0 px-3 border">Ward {user?.wardId || 'X'}</div>
                      </div>
                      <ArrowRight size={18} className="text-muted" />
                      <div className="text-center">
                        <span className="extra-small fw-bold text-muted d-block mb-1">Target</span>
                        <div className="badge bg-primary text-white rounded-0 px-3" style={{ backgroundColor: '#1254AF' }}>Ward {request.requestedWardId}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-0 bg-white border border-dashed mb-3">
                      <p className="extra-small fw-bold text-muted mb-1 text-uppercase">Reason</p>
                      <p className="mb-0 small fst-italic text-dark">"{request.reason || 'No reason provided'}"</p>
                    </div>

                    <div className="d-flex gap-2">
                      <button onClick={() => handleWardChange(request.id, 'approve')} className="btn btn-primary flex-grow-1 rounded-0 py-2 small fw-bold text-white shadow-sm" style={{ backgroundColor: '#1254AF' }}>Approve</button>
                      <button onClick={() => handleWardChange(request.id, 'reject')} className="btn btn-light flex-grow-1 rounded-0 py-2 small fw-bold shadow-sm text-secondary">Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .fw-black { font-weight: 800; }
        .text-primary { color: #1254AF !important; }
        .bg-primary { background-color: #1254AF !important; }
        .extra-small { font-size: 0.75rem; }
        .tracking-widest { letter-spacing: 0.1em; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .hover-up:hover { transform: translateY(-3px); }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default ProfessionalWardOfficerDashboard;
