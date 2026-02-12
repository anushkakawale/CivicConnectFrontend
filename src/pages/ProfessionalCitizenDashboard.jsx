import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Clock, CheckCircle, AlertCircle, RefreshCw,
  ChevronRight, Activity, MapPin, Bell, User, Star
} from 'lucide-react';
import { StatCard, StatusBadge } from '../components/common';

const ProfessionalCitizenDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    closedComplaints: 0,
    slaBreached: 0,
    recentComplaints: []
  });

  const userName = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).name
    : (localStorage.getItem('email')?.split('@')[0] || 'Citizen');

  const fetchDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const response = await apiService.citizen.getDashboard();
      const data = response.data || response;
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch citizen dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <RefreshCw className="animate-spin text-primary mb-3" size={48} />
        <p className="text-muted fw-bold uppercase tracking-widest extra-small">Synchronizing Citizen Portal...</p>
      </div>
    );
  }

  return (
    <div className="citizen-dashboard-premium pb-5" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Section */}
      <div className="premium-gradient py-5 mb-5 shadow-lg position-relative overflow-hidden" style={{ borderRadius: '0 0 32px 32px' }}>
        <div className="position-absolute top-0 end-0 p-5 opacity-10">
          <Shield size={200} />
        </div>
        <div className="container-fluid px-4 px-lg-5 position-relative z-10">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge-rect-white">Live Operations Hub</span>
                <span className="text-white opacity-40">•</span>
                <span className="extra-small fw-bold text-white opacity-60 uppercase tracking-widest">Citizen Directive</span>
              </div>
              <h1 className="text-white display-5 fw-black mb-3">Welcome, {userName}</h1>
              <p className="text-white opacity-70 mb-5 max-w-lg fw-medium">
                Official Municipal Resource Access Cluster. Track your active missions and regional status updates in real-time.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/register-complaint')}
                  className="btn btn-white bg-white rounded-pill px-5 py-3 fw-black extra-small tracking-widest shadow-lg d-flex align-items-center gap-2 transition-all hover-up"
                  style={{ color: '#173470' }}
                >
                  <Plus size={18} strokeWidth={3} /> NEW COMPLAINT
                </button>
                <button
                  className="btn btn-outline-light rounded-pill px-4 py-3 fw-black extra-small tracking-widest d-flex align-items-center gap-2"
                  onClick={() => fetchDashboardData(true)}
                  disabled={refreshing}
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> REFRESH
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5">
        {/* Stats Overview */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard icon={FileText} value={stats.totalComplaints} label="Total Records" />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard icon={Activity} value={stats.pendingComplaints} label="Active Pipeline" variant="info" />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard icon={CheckCircle} value={stats.resolvedComplaints} label="Mission Success" variant="success" />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard icon={AlertCircle} value={stats.slaBreached} label="SLA Breached" variant="danger" />
          </div>
        </div>

        <div className="row g-5">
          {/* Recent Complaints Table */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-black text-dark mb-1 uppercase tracking-tight">Active Deployments</h4>
                <p className="extra-small text-muted fw-bold uppercase opacity-60 m-0">Latest entries in your personal ledger</p>
              </div>
              <button onClick={() => navigate('/citizen/complaints')} className="btn btn-link text-primary fw-black extra-small tracking-widest uppercase text-decoration-none d-flex align-items-center gap-2">
                FULL REGISTRY <ChevronRight size={14} />
              </button>
            </div>

            <div className="card b-none shadow-premium rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light bg-opacity-50">
                    <tr>
                      <th className="px-4 py-3 text-muted extra-small fw-black uppercase tracking-widest border-0">ID</th>
                      <th className="py-3 text-muted extra-small fw-black uppercase tracking-widest border-0">Service Detail</th>
                      <th className="py-3 text-muted extra-small fw-black uppercase tracking-widest border-0">Status</th>
                      <th className="py-3 text-muted extra-small fw-black uppercase tracking-widest border-0">Sector</th>
                      <th className="px-4 py-3 text-end text-muted extra-small fw-black uppercase tracking-widest border-0">Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentComplaints?.length > 0 ? (
                      stats.recentComplaints.map((item, idx) => (
                        <tr key={idx} className="cursor-pointer" onClick={() => navigate(`/citizen/complaints/${item.complaintId || item.id}`)}>
                          <td className="px-4"><span className="fw-black text-primary">#{item.complaintId || item.id}</span></td>
                          <td>
                            <div className="fw-bold text-dark">{item.title}</div>
                            <div className="extra-small text-muted opacity-60">{new Date(item.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td><StatusBadge status={item.status} size="small" /></td>
                          <td><span className="badge bg-light text-dark rounded-pill px-3 py-1 extra-small fw-bold">{item.wardName || 'N/A'}</span></td>
                          <td className="px-4 text-end">
                            <button className="btn btn-light rounded-circle p-2 text-primary shadow-sm border">
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="rounded-circle bg-light d-inline-flex p-4 mb-3">
                            <FileText size={48} className="text-muted opacity-20" />
                          </div>
                          <h6 className="fw-black text-dark uppercase mb-1">No Active Records</h6>
                          <p className="extra-small text-muted fw-bold">Synchronize with municipal server to update ledger.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Panel: Quick Access */}
          <div className="col-lg-4">
            <h4 className="fw-black text-dark mb-4 uppercase tracking-tight">Tactical Nodes</h4>

            <div className="vstack gap-3 mb-5">
              {[
                { label: 'Intelligence Feed', icon: Bell, path: '/notifications', count: 0, color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Geospatial Map', icon: MapPin, path: '/citizen/map', color: '#10b981', bg: '#ecfdf5' },
                { label: 'Personal Matrix', icon: User, path: '/citizen/profile', color: '#3b82f6', bg: '#eff6ff' }
              ].map((hub, i) => (
                <button
                  key={i}
                  onClick={() => navigate(hub.path)}
                  className="btn text-start p-4 rounded-4 border-0 shadow-sm transition-all hover-up-tiny d-flex align-items-center justify-content-between group"
                  style={{ backgroundColor: hub.bg }}
                >
                  <div className="d-flex align-items-center gap-4">
                    <div className="p-3 rounded-4 bg-white shadow-sm transition-transform scale-hover" style={{ color: hub.color }}>
                      <hub.icon size={22} />
                    </div>
                    <span className="fw-black text-dark uppercase tracking-tight" style={{ fontSize: '0.9rem' }}>{hub.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-muted opacity-40" />
                </button>
              ))}
            </div>

            {/* Support Card */}
            <div className="card b-none bg-dark text-white rounded-4 p-5 position-relative overflow-hidden shadow-2xl border-0">
              <div className="position-absolute top-0 end-0 p-5 mt-n5 me-n5 opacity-10">
                <Shield size={180} />
              </div>
              <div className="position-relative z-10">
                <h3 className="fw-black mb-3 display-6 uppercase tracking-widest">COMMAND SUPPORT</h3>
                <p className="text-white opacity-60 mb-5 fw-medium leading-relaxed" style={{ fontSize: '0.85rem' }}>
                  Encountering operational latency? Our technical command units are ready to assist with your deployment.
                </p>
                <button className="btn btn-white bg-white rounded-pill w-100 py-3 fw-black extra-small tracking-widest shadow-lg border-0" style={{ color: '#0f172a' }}>
                  OPEN SUPPORT TICKET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .citizen-dashboard-premium { font-family: 'Outfit', 'Inter', sans-serif; }
        .fw-black { font-weight: 900; }
        .extra-small { font-size: 0.65rem; }
        .tracking-widest { letter-spacing: 0.15em; }
        .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.01); }
        .premium-gradient { background: linear-gradient(135deg, #173470 0%, #112652 100%); }
        .hover-up:hover { transform: translateY(-8px); shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .hover-up-tiny:hover { transform: translateY(-4px); }
        .scale-hover:hover { transform: scale(1.1); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default ProfessionalCitizenDashboard;
