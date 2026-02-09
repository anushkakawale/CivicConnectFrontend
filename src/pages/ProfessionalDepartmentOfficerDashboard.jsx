import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckCircle, Clock, AlertCircle,
  TrendingUp, Building2, Calendar, Eye, RefreshCw,
  Search, PlayCircle, CheckSquare, Image as ImageIcon,
  Timer, Target, AlertTriangle, Mail, Phone, MapPin, ChevronRight,
  User, Shield, Zap, ArrowRight, ShieldCheck, History as HistoryIcon, List, Smartphone
} from 'lucide-react';
import apiService from '../api/apiService';
import { StatusBadge } from '../components/common';
import DashboardHeader from '../components/layout/DashboardHeader';

/**
 * Premium Strategic Department Officer Dashboard
 * Specialized unit focus for field force operations.
 */
const ProfessionalDepartmentOfficerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ASSIGNED');
  const [searchTerm, setSearchTerm] = useState('');
  const [officerInfo, setOfficerInfo] = useState(null);
  const [colleagues, setColleagues] = useState([]);
  const PRIMARY_COLOR = '#1254AF';

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      if (!dashboardData) setLoading(true);

      const [statsRes, taskRes, membersRes] = await Promise.all([
        apiService.departmentOfficer.getDashboardStats(),
        filterStatus === 'ASSIGNED' ? apiService.departmentOfficer.getPendingWork() : apiService.departmentOfficer.getAssignedComplaints({ status: filterStatus === 'ALL' ? null : filterStatus }),
        apiService.departmentOfficer.getColleagues()
      ]);

      const sData = statsRes.data || statsRes;
      setDashboardData(sData.statistics || sData);
      setOfficerInfo(sData);

      let tData = taskRes.data?.complaints || taskRes.complaints || taskRes.data || taskRes || [];
      if (!Array.isArray(tData)) tData = tData.content || [];
      setComplaints(tData);

      setColleagues(Array.isArray(membersRes) ? membersRes : (membersRes.data || []));

    } catch (err) {
      console.error('Field sync failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (complaintId) => {
    if (!window.confirm('Initiate rectification protocol for this task?')) return;
    try {
      await apiService.departmentOfficer.startWork(complaintId);
      loadData();
    } catch (err) { console.error('Protocol error'); }
  };

  const filteredTasks = complaints.filter(c => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return c.title?.toLowerCase().includes(term) || c.complaintId?.toString().includes(term);
    }
    return true;
  });

  if (loading && !dashboardData) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F0F2F5' }}>
        <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
        <p className="fw-black text-muted text-uppercase tracking-widest small animate-pulse">Syncing Unit Hub...</p>
      </div>
    );
  }

  return (
    <div className="department-dashboard-strategic min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Standard Strategic Header */}
      <DashboardHeader
        portalName="FIELD OPERATIONS HUB"
        userName={localStorage.getItem('name') || 'Officer'}
        wardName={officerInfo?.departmentName || 'PMC DEPARTMENT'}
        subtitle="FIELD FORCE UNIT | TACTICAL RECTIFICATION COMMAND"
        icon={Target}
        showProfileInitials={true}
        actions={
          <button
            onClick={() => loadData()}
            className="btn btn-primary circ-white p-0 shadow-premium"
            style={{ width: '60px', height: '60px', border: 'none' }}
          >
            <RefreshCw size={28} className={loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      <div className="container-fluid px-5 animate-fadeIn">

        {/* Tactical KPI Metrics */}
        <div className="row g-4 mb-5">
          {[
            { label: 'Unit Inventory', val: dashboardData?.totalAssigned || 0, icon: FileText, color: PRIMARY_COLOR, bg: '#EBF2FF' },
            { label: 'Awaiting Action', val: dashboardData?.assigned || 0, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Rectification Active', val: dashboardData?.inProgress || 0, icon: RefreshCw, color: '#6366F1', bg: '#F5F5FF' },
            { label: 'Success Protocols', val: dashboardData?.resolved || 0, icon: CheckCheck, color: '#10B981', bg: '#ECFDF5' }
          ].map((s, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-lg p-4 h-100 bg-white gov-rounded hover-up border-bottom border-4" style={{ borderColor: s.color }}>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="circ-white shadow-sm" style={{ width: '56px', height: '56px', backgroundColor: s.bg, color: s.color }}>
                    <s.icon size={26} />
                  </div>
                  <Zap size={16} className="text-muted opacity-20" />
                </div>
                <h2 className="fw-black mb-1 text-dark display-5" style={{ letterSpacing: '-2px' }}>{s.val}</h2>
                <p className="extra-small fw-black text-muted text-uppercase tracking-widest mb-0 opacity-60">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-5">
          {/* Main Registry feed */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg bg-white overflow-hidden mb-5 gov-rounded elevation-2">
              <div className="card-header bg-white border-bottom p-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="circ-white border" style={{ width: '50px', height: '50px' }}>
                    <HistoryIcon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="fw-black text-dark text-uppercase tracking-tight mb-0">Operational Ledger</h5>
                    <p className="extra-small fw-bold text-muted mb-0 uppercase tracking-widest opacity-60">ACTIVE UNIT QUEUE MONITOR</p>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <div className="position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted opacity-40" size={16} />
                    <input
                      type="text"
                      className="form-control gov-rounded border ps-5 py-3 extra-small fw-black tracking-widest text-uppercase"
                      placeholder="PROTO SEARCH..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '220px' }}
                    />
                  </div>
                  <select className="form-select gov-rounded border py-3 extra-small fw-black tracking-widest text-uppercase px-4" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="ASSIGNED">NEW OPS</option>
                    <option value="IN_PROGRESS">ACTIVE</option>
                    <option value="RESOLVED">COMPLETED</option>
                    <option value="ALL">ALL LOGS</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="premium-table mb-0">
                  <thead>
                    <tr>
                      <th>Dispatch ID</th>
                      <th>Intelligence Subject</th>
                      <th>Locality Unit</th>
                      <th className="text-center">Combat Status</th>
                      <th className="text-end px-5">Unit Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-5">
                        <Smartphone size={48} className="text-muted opacity-10 mb-3 mx-auto" />
                        <p className="extra-small fw-black text-muted tracking-widest uppercase">Registry Empty</p>
                      </td></tr>
                    ) : (
                      filteredTasks.map(c => (
                        <tr key={c.complaintId || c.id} className="cursor-pointer" onClick={() => navigate(`/department/complaints/${c.complaintId || c.id}`)}>
                          <td className="ps-5">
                            <span className="badge-rect-blue font-mono" style={{ backgroundColor: '#F1F5F9', color: PRIMARY_COLOR, border: '1px solid #E2E8F0' }}>
                              #{c.complaintId || c.id}
                            </span>
                          </td>
                          <td>
                            <div className="fw-black text-dark small text-uppercase tracking-tight text-truncate" style={{ maxWidth: '200px' }}>{c.title}</div>
                            <div className="extra-small text-muted fw-bold uppercase tracking-widest opacity-40 mt-1">
                              {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <MapPin size={14} className="text-primary opacity-40" />
                              <span className="extra-small fw-black text-muted uppercase">{c.wardName || 'PMC CENTRAL'}</span>
                            </div>
                          </td>
                          <td className="text-center"><StatusBadge status={c.status} size="sm" /></td>
                          <td className="text-end pe-5">
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-light circ-white border overflow-hidden" style={{ width: '40px', height: '40px' }}><Eye size={18} /></button>
                              {c.status === 'ASSIGNED' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStartWork(c.complaintId || c.id); }}
                                  className="btn btn-primary circ-blue shadow-lg"
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <PlayCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Liaison & Intelligence feed */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '110px' }}>
              {/* Ward Commander Liaison */}
              {officerInfo?.wardOfficer && (
                <div className="card border-0 shadow-lg bg-white p-5 gov-rounded mb-4 elevation-2 border-top border-5 border-primary">
                  <h6 className="fw-black text-muted text-uppercase tracking-[0.2em] extra-small mb-4 text-details opacity-40 pb-3 border-bottom">Command Liaison</h6>
                  <div className="d-flex align-items-center gap-4">
                    <div className="circ-blue shadow-premium" style={{ width: '64px', height: '64px', fontSize: '1.4rem' }}>
                      {officerInfo.wardOfficer.name?.charAt(0)}
                    </div>
                    <div>
                      <h5 className="fw-black text-dark mb-1">{officerInfo.wardOfficer.name}</h5>
                      <span className="badge-rect-blue py-0 extra-small" style={{ fontSize: '0.55rem' }}>WARD COMMANDER: {officerInfo.ward}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-top">
                    <div className="d-flex align-items-center gap-3 text-muted">
                      <Mail size={16} className="text-primary opacity-50" />
                      <span className="extra-small fw-black uppercase tracking-widest">{officerInfo.wardOfficer.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Force Matrix */}
              <div className="card border-0 shadow-lg bg-white p-5 flex-grow-1 gov-rounded elevation-2">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                  <h6 className="fw-black text-muted text-uppercase tracking-[0.2em] extra-small mb-0 opacity-40">Active Force Members</h6>
                  <Users size={18} className="text-primary opacity-40" />
                </div>
                <div className="d-flex flex-column gap-3">
                  {colleagues.slice(0, 5).map((col, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3 p-3 gov-rounded bg-light transition-standard hover-up-small border border-transparent hover-border-primary">
                      <div className="circ-white border shadow-sm fw-black text-primary" style={{ width: '40px', height: '40px', fontSize: '0.8rem' }}>
                        {col.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-truncate">
                        <div className="extra-small fw-black text-dark uppercase tracking-tight">{col.name}</div>
                        <div className="extra-small fw-bold text-muted uppercase tracking-widest opacity-40 mt-1">{col.role?.replace('ROLE_', '')}</div>
                      </div>
                    </div>
                  ))}
                  {colleagues.length === 0 && <p className="extra-small fw-black text-center text-muted opacity-40 uppercase tracking-widest py-4">No other active units detected.</p>}
                </div>
                <button className="btn btn-dark w-100 py-3 mt-4 gov-rounded fw-black tracking-widest extra-small" style={{ backgroundColor: '#1A1A1A' }}>FORCE DIRECTORY</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hover-border-primary:hover { border-color: ${PRIMARY_COLOR} !important; }
      `}} />
    </div>
  );
};

export default ProfessionalDepartmentOfficerDashboard;
