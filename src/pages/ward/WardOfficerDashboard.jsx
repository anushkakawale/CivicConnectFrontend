import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CheckCircle, Clock, Users, AlertTriangle, FileText,
    TrendingUp, MapPin, Activity, Calendar, Shield, ArrowRight,
    Briefcase, Building2, Eye, Map as MapIcon, RefreshCw, UserCheck,
    Search, Loader, ShieldAlert, Camera, ChevronRight, CheckCheck,
    Bell, Zap, Layers, Info, UserPlus, List, ShieldCheck, Target, Smartphone
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { useToast } from '../../hooks/useToast';
import WardMap from './WardMap';

/**
 * Premium Strategic Ward Officer Dashboard
 * High-contrast, tactical command center for city operations.
 */
const WardOfficerDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('approvals');
    const [wardComplaints, setWardComplaints] = useState([]);
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            if (!summary) setLoading(true);

            const [analyticsRes, approvalsRes, complaintsRes] = await Promise.all([
                apiService.wardOfficer.getDashboardAnalytics().catch(() => ({ summary: { total: 0, active: 0, resolved: 0 } })),
                apiService.wardOfficer.getPendingApprovals().catch(() => []),
                apiService.wardOfficer.getComplaints({ page: 0, size: 100 }).catch(() => ({ data: { content: [] } }))
            ]);

            const analytics = analyticsRes.data || analyticsRes;
            const stats = analytics.cards || analytics.summary || { total: 0, active: 0, resolved: 0, pendingApproval: 0 };
            setSummary({
                total: stats.totalComplaints || stats.total || 0,
                active: stats.inProgress || stats.active || 0,
                resolved: stats.closed || stats.resolved || 0,
                pendingApproval: stats.pendingApproval || 0
            });

            let approvalsData = approvalsRes.data || approvalsRes || [];
            if (approvalsData && approvalsData.content) approvalsData = approvalsData.content;
            setPendingApprovals(Array.isArray(approvalsData) ? approvalsData : []);

            let cData = complaintsRes.data?.content || complaintsRes.data || [];
            if (!Array.isArray(cData)) cData = cData.content || [];
            setWardComplaints(cData.slice(0, 50));

        } catch (error) {
            console.error('Operational sync failed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading && !summary) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="circ-white shadow-premium mb-4" style={{ width: '80px', height: '80px', color: PRIMARY_COLOR }}>
                <RefreshCw className="animate-spin" size={36} />
            </div>
            <p className="fw-black text-muted text-uppercase tracking-widest small">Syncing Ward Command...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Ward Dashboard"
                userName="Operations Manager"
                wardName={localStorage.getItem('wardName') || 'PMC WARD'}
                subtitle="Manage ward complaints and approvals"
                icon={LayoutDashboard}
                actions={
                    <div className="d-flex gap-3">
                        <button
                            onClick={() => navigate('/ward-officer/register-officer')}
                            className="btn btn-white bg-white shadow-premium border-0 rounded-circle d-flex align-items-center justify-content-center p-0 transition-all hover-up"
                            style={{ width: '54px', height: '54px' }}
                            title="Add Officer"
                        >
                            <UserPlus size={24} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                        </button>
                        <button
                            onClick={() => { setRefreshing(true); loadData(); }}
                            className="btn btn-white bg-white shadow-premium border-0 rounded-circle d-flex align-items-center justify-content-center p-0 transition-all hover-up"
                            style={{ width: '54px', height: '54px' }}
                        >
                            <RefreshCw size={24} className={`text-primary ${refreshing ? 'animate-spin' : ''}`} style={{ color: PRIMARY_COLOR }} />
                        </button>
                    </div>
                }
            />

            <div className="container" style={{ maxWidth: '1400px', marginTop: '-30px' }}>
                {/* Strategic KPI matrix */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Complaints', val: summary?.total || 0, icon: Layers, color: PRIMARY_COLOR },
                        { label: 'Pending Approvals', val: pendingApprovals.length, icon: ShieldAlert, color: '#F59E0B' },
                        { label: 'In Progress', val: summary?.active || 0, icon: Activity, color: '#6366F1' },
                        { label: 'Resolved Cases', val: summary?.resolved || 0, icon: CheckCheck, color: '#10B981' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 h-100 bg-white border-top border-4 transition-all hover-up" style={{ borderColor: s.color }}>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="circ-white border shadow-sm" style={{ width: '48px', height: '48px', backgroundColor: `${s.color}10`, color: s.color }}>
                                        <s.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <Zap size={14} className="text-muted opacity-20" />
                                </div>
                                <h2 className="fw-black mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>{s.val}</h2>
                                <p className="extra-small fw-black text-muted text-uppercase tracking-widest mb-0 opacity-40">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-5">
                    {/* Operational Viewports */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-premium bg-white rounded-4 overflow-hidden mb-5">
                            <div className="card-header bg-white border-bottom p-0 d-flex border-0">
                                {[
                                    { id: 'approvals', label: 'Pending Approvals', icon: ShieldCheck, count: pendingApprovals.length },
                                    { id: 'all', label: 'All Complaints', icon: List, count: wardComplaints.length },
                                    { id: 'map', label: 'Map View', icon: MapIcon }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-grow-1 p-4 border-0 fw-black extra-small tracking-[0.2em] text-uppercase transition-all d-flex align-items-center justify-content-center gap-3 ${activeTab === tab.id ? 'bg-light text-primary' : 'text-muted bg-transparent opacity-40'}`}
                                        style={activeTab === tab.id ? { color: PRIMARY_COLOR, borderBottom: `5px solid ${PRIMARY_COLOR}` } : {}}
                                    >
                                        <tab.icon size={18} /> {tab.label.split(' ')[0]}
                                        {tab.count !== undefined && <span className="ms-2 px-2 py-0 rounded-pill bg-light text-dark opacity-80" style={{ fontSize: '10px' }}>{tab.count}</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="card-body p-0">
                                {activeTab !== 'map' ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead>
                                                <tr className="bg-light bg-opacity-50">
                                                    <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Description</th>
                                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Department</th>
                                                    <th className="py-4 border-0 text-center extra-small fw-black text-muted uppercase tracking-widest">Status</th>
                                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase tracking-widest">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(Array.isArray(activeTab === 'approvals' ? pendingApprovals : wardComplaints) ? (activeTab === 'approvals' ? pendingApprovals : wardComplaints) : []).map(c => (
                                                    <tr key={c.id || c.complaintId} className="cursor-pointer transition-all" onClick={() => navigate(`/ward-officer/complaints/${c.complaintId || c.id}`)}>
                                                        <td className="px-5 py-4 border-light">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <span className="extra-small fw-black text-muted bg-light px-2 py-1 rounded-pill">#{c.complaintId || c.id}</span>
                                                                <div className="fw-black text-dark uppercase tracking-tight">{c.title}</div>
                                                            </div>
                                                            <div className="extra-small text-muted fw-bold uppercase tracking-widest mt-1 opacity-40 px-5">{new Date(c.createdAt || c.complaintDate).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="py-4 border-light">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="p-2 rounded-3 bg-light border"><Building2 size={12} className="text-primary" /></div>
                                                                <span className="extra-small fw-black text-dark text-uppercase uppercase">{(c.departmentName || 'GENERAL')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 border-light text-center"><StatusBadge status={c.status} size="sm" /></td>
                                                        <td className="px-5 py-4 border-light text-end">
                                                            <button className="btn btn-light rounded-circle shadow-sm border p-0 hover-up" style={{ width: '36px', height: '36px' }}><ArrowRight size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(activeTab === 'approvals' ? pendingApprovals : wardComplaints).length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-5">
                                                            <div className="p-4 rounded-circle bg-light d-inline-block mb-3 border-dashed border-2">
                                                                <Shield size={48} className="text-muted opacity-20" />
                                                            </div>
                                                            <p className="extra-small fw-black text-muted tracking-widest uppercase mb-0">No pending work found</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <div className="rounded-4 overflow-hidden border shadow-inner" style={{ height: '500px' }}>
                                            <WardMap />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Support Tactical Feed */}
                    <div className="col-lg-4">
                        <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
                            <div className="card border-0 shadow-premium bg-white p-5 mb-5 rounded-4 border-top border-5" style={{ borderTopColor: PRIMARY_COLOR }}>
                                <h6 className="fw-black text-dark mb-4 uppercase tracking-[0.2em] opacity-40 border-bottom pb-4 d-flex align-items-center gap-3">
                                    <Target size={18} className="text-primary" />
                                    Actions
                                </h6>
                                <div className="d-grid gap-3">
                                    {[
                                        { label: 'View Analytics', path: '/ward-officer/analytics', icon: TrendingUp, color: PRIMARY_COLOR },
                                        { label: 'Search Officers', path: '/ward-officer/officers', icon: UserCheck, color: '#10B981' },
                                        { label: 'Map Overview', path: '/ward-officer/map', icon: MapIcon, color: '#6366F1' }
                                    ].map((link, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => navigate(link.path)}
                                            className="btn btn-light bg-white p-4 d-flex align-items-center gap-4 border shadow-sm transition-all rounded-4 hover-up-small mb-1"
                                        >
                                            <div className="circ-white shadow-sm border" style={{ width: '48px', height: '48px', color: link.color, backgroundColor: `${link.color}10` }}>
                                                <link.icon size={20} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-start">
                                                <span className="fw-black text-dark extra-small tracking-widest text-uppercase d-block mb-1">{link.label}</span>
                                                <span className="extra-small fw-bold text-muted uppercase tracking-widest opacity-40">Access Secure Node</span>
                                            </div>
                                            <ChevronRight size={14} className="ms-auto opacity-30" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="card border-0 shadow-premium bg-dark p-5 rounded-4 position-relative overflow-hidden border-top border-5 border-warning">
                                <div className="position-absolute bottom-0 end-0 p-3 opacity-10 rotate-12">
                                    <ShieldAlert size={120} strokeWidth={1} className="text-white" />
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-warning rounded-circle animate-pulse" style={{ width: '10px', height: '10px', boxShadow: '0 0 15px #F59E0B' }}></div>
                                    <h6 className="fw-black text-white extra-small tracking-[0.2em] uppercase mb-0">Management Notice</h6>
                                </div>
                                <p className="extra-small text-white fw-black mb-0 opacity-80 leading-relaxed uppercase tracking-widest">
                                    Please review and approve complaints within 4 hours. All actions are recorded.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05) !important; }
                .hover-up-small:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .circ-white { border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .rotate-12 { transform: rotate(-12deg); }
                .table-hover tbody tr:hover { background-color: #F8FAFC !important; }
            `}} />
        </div>
    );
};

export default WardOfficerDashboard;
