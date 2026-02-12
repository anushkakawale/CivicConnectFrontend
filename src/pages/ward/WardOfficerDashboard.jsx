import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CheckCircle, Clock, Users, AlertTriangle, FileText,
    TrendingUp, MapPin, Activity, Calendar, Shield, ArrowRight,
    Briefcase, Building2, Eye, Map as MapIcon, RefreshCw, UserCheck,
    Search, Loader, ShieldAlert, Camera, ChevronRight, CheckCheck,
    Bell, Zap, Layers, Info, UserPlus, List, ShieldCheck, Target, Smartphone,
    AlertCircle
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { useToast } from '../../hooks/useToast';
import WardMap from './WardMap';
import AssignmentModal from '../../components/complaints/AssignmentModal';

/**
 * Premium Strategic Ward Officer Dashboard
 * High-contrast, tactical command center for city operations.
 */
const WardOfficerDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [allComplaints, setAllComplaints] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('approvals');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const BRAND_PRIMARY = '#173470';
    const BRAND_SUCCESS = '#10B981';
    const BRAND_WARNING = '#F59E0B';
    const BRAND_DANGER = '#EF4444';

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setRefreshing(true);
            if (!summary) setLoading(true);

            // Fetch core data: analytics and ALL active complaints for current ward
            const [analyticsRes, complaintsRes] = await Promise.all([
                apiService.wardOfficer.getDashboardAnalytics().catch(() => ({ summary: { total: 0, active: 0, resolved: 0 } })),
                apiService.wardOfficer.getComplaints({ page: 0, size: 200 }).catch(() => ({ data: { content: [] } }))
            ]);

            // Process Analytics
            const analytics = analyticsRes.data || analyticsRes;
            const stats = analytics.cards || analytics.summary || { total: 0, active: 0, resolved: 0, pendingApproval: 0 };

            // Process Complaints List
            let cData = complaintsRes.data?.content || complaintsRes.data || [];
            if (!Array.isArray(cData)) cData = [];
            setAllComplaints(cData);

            // Categorize locally for absolute UI consistency
            const approvals = cData.filter(c => c.status === 'RESOLVED' || c.status === 'PENDING_APPROVAL');
            const unassigned = cData.filter(c => (c.status === 'SUBMITTED' || c.status === 'RECEIVED') && (!c.assignedOfficerId && !c.assignedOfficerName));

            setSummary({
                total: stats.totalComplaints || stats.total || cData.length,
                active: stats.inProgress || stats.active || cData.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length,
                resolved: stats.closed || stats.resolved || cData.filter(c => c.status === 'CLOSED' || c.status === 'APPROVED').length,
                pendingApproval: approvals.length
            });

        } catch (error) {
            console.error('Tactical sync failure:', error);
            showToast('Operational sync failed. Check secure connection.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Derived lists for tabs
    const categories = useMemo(() => {
        return {
            approvals: allComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'PENDING_APPROVAL'),
            unassigned: allComplaints.filter(c => (c.status === 'SUBMITTED' || c.status === 'RECEIVED') && !c.assignedOfficerId),
            all: allComplaints,
            priority: allComplaints.filter(c => c.priority === 'HIGH' || c.priority === 'URGENT')
        };
    }, [allComplaints]);

    if (loading && !summary) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
            <div className="position-relative mb-4">
                <Shield size={64} className="text-primary opacity-10" />
                <RefreshCw size={32} className="text-primary animate-spin position-absolute top-50 start-50 translate-middle" />
            </div>
            <h6 className="fw-black text-uppercase tracking-widest text-muted extra-small">Initializing Ward Command Node...</h6>
        </div>
    );

    const activeList = activeTab === 'map' ? [] : categories[activeTab] || [];

    return (
        <div className="ward-officer-matrix min-vh-100 pb-5 position-relative overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Tactical Grid Overlay */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${BRAND_PRIMARY} 1px, transparent 1px), linear-gradient(90deg, ${BRAND_PRIMARY} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                zIndex: 0
            }}></div>

            <DashboardHeader
                portalName="WARD COMMAND HUB"
                userName={user?.name || "Operations Manager"}
                wardName={localStorage.getItem('wardName') || 'PMC WARD'}
                subtitle="STRATEGIC OPERATIONS OVERVIEW | REAL-TIME JURISDICTION MONITOR"
                icon={LayoutDashboard}
                actions={
                    <div className="d-flex gap-2">
                        <button
                            onClick={() => navigate('/ward-officer/register-officer')}
                            className="btn btn-primary rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-lg border-0 d-flex align-items-center gap-2 hover-up"
                            style={{ backgroundColor: BRAND_PRIMARY }}
                        >
                            <UserPlus size={16} /> ENROLL STAFF
                        </button>
                        <button
                            onClick={loadData}
                            className={`btn btn-white bg-white shadow-sm border rounded-circle p-0 d-flex align-items-center justify-content-center transition-all ${refreshing ? 'animate-spin' : 'hover-up'}`}
                            style={{ width: '45px', height: '45px' }}
                        >
                            <RefreshCw size={20} className="text-primary" />
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-4 px-lg-5 position-relative" style={{ marginTop: '-40px', zIndex: 1 }}>
                {/* Tactical KPI Grid */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Registry', val: summary?.total || 0, icon: Layers, color: BRAND_PRIMARY, trend: 'TOTAL LOAD' },
                        { label: 'Urgent Ops', val: categories.priority.length, icon: Zap, color: BRAND_DANGER, trend: 'HIGH PRIO' },
                        { label: 'Pending Verification', val: categories.approvals.length, icon: ShieldAlert, color: BRAND_WARNING, trend: 'ACTION REQD' },
                        { label: 'Unassigned', val: categories.unassigned.length, icon: AlertCircle, color: '#6366F1', trend: 'QUEUE' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-sm-6 col-lg-3">
                            <div className="card b-none shadow-premium p-4 h-100 rounded-4 border-0 transition-all hover-up-tiny bg-white overflow-hidden position-relative border-top border-4" style={{ borderTopColor: s.color }}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="rounded-4 d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale"
                                        style={{ width: '46px', height: '46px', backgroundColor: s.color, color: '#FFFFFF' }}>
                                        <s.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <span className="extra-small fw-black px-2 py-0.5 rounded-pill text-muted opacity-40 lowercase tracking-widest">{s.trend}</span>
                                </div>
                                <h1 className="fw-black mb-0 text-dark" style={{ fontSize: '2.4rem', letterSpacing: '-1.5px' }}>{s.val}</h1>
                                <p className="extra-small fw-black text-muted text-uppercase mb-0 opacity-40">{s.label}</p>
                                <div className="position-absolute end-0 bottom-0 opacity-05 mb-n2 me-n2">
                                    <s.icon size={80} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Operations Control Center */}
                <div className="row g-4 mb-5">
                    {/* Operational Feed */}
                    {/* Operational Feed */}
                    <div className="col-xl-8">
                        <div className="card border-0 shadow-premium bg-white rounded-4 overflow-hidden mb-5">
                            <div className="card-header bg-white border-bottom p-0 d-flex border-0 scroll-x-mobile">
                                {[
                                    { id: 'approvals', label: 'Verification Queue', icon: ShieldCheck, count: categories.approvals.length },
                                    { id: 'unassigned', label: 'Unassigned', icon: AlertTriangle, count: categories.unassigned.length },
                                    { id: 'all', label: 'Operational Feed', icon: Activity, count: allComplaints.length },
                                    { id: 'map', label: 'Tactical Map', icon: MapIcon }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-grow-1 p-4 border-0 fw-black extra-small tracking-widest text-uppercase transition-all d-flex align-items-center justify-content-center gap-3 ${activeTab === tab.id ? 'bg-light text-primary border-bottom border-4' : 'text-muted bg-transparent opacity-40'}`}
                                        style={activeTab === tab.id ? { borderBottomColor: BRAND_PRIMARY, color: BRAND_PRIMARY } : {}}
                                    >
                                        <tab.icon size={18} /> {tab.label}
                                        {tab.count !== undefined && <span className={`ms-2 px-2 py-0.5 rounded-pill extra-small ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ fontSize: '10px' }}>{tab.count}</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="card-body p-0">
                                {activeTab !== 'map' ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead>
                                                <tr className="bg-light bg-opacity-50">
                                                    <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Incident Record</th>
                                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Assigned Unit</th>
                                                    <th className="py-4 border-0 text-center extra-small fw-black text-muted uppercase tracking-widest">Status</th>
                                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase tracking-widest">Vector</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-5">
                                                            <div className="p-5 d-flex flex-column align-items-center opacity-20">
                                                                <ShieldCheck size={64} className="mb-3" />
                                                                <h6 className="fw-black text-uppercase tracking-widest">All Clear • No Pending Intel</h6>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    activeList.map(c => (
                                                        <tr key={c.id || c.complaintId} className="cursor-pointer transition-all hover-bg-light" onClick={() => navigate(`/ward-officer/complaints/${c.complaintId || c.id}`)}>
                                                            <td className="px-5 py-4">
                                                                <div className="d-flex align-items-center gap-3 mb-1">
                                                                    <div className="badge bg-light text-dark fw-black font-mono extra-small border">#{c.complaintId || c.id}</div>
                                                                    <div className="fw-black text-dark text-uppercase tracking-tight h6 mb-0">{c.title}</div>
                                                                </div>
                                                                <div className="extra-small text-muted fw-bold uppercase tracking-widest opacity-40 ps-1">
                                                                    Reported {new Date(c.createdAt || c.complaintDate).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="p-1.5 rounded bg-light border"><Building2 size={12} className="text-primary" /></div>
                                                                    <span className="extra-small fw-black text-dark uppercase">{c.departmentName || 'SYSTEM_GENERAL'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-center"><StatusBadge status={c.status} size="sm" /></td>
                                                            <td className="px-5 py-4 text-end">
                                                                {activeTab === 'unassigned' ? (
                                                                    <button
                                                                        className="btn btn-primary btn-sm rounded-pill px-4 fw-black extra-small tracking-widest py-2 shadow-sm border-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedComplaint(c);
                                                                            setShowAssignModal(true);
                                                                        }}
                                                                        style={{ backgroundColor: BRAND_PRIMARY }}
                                                                    >
                                                                        DEPLOY UNIT
                                                                    </button>
                                                                ) : (
                                                                    <div className="btn btn-outline-light text-muted rounded-circle p-2 border hover-bg-primary hover-text-white">
                                                                        <ChevronRight size={16} />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4" style={{ height: '600px' }}>
                                        <div className="h-100 rounded-4 overflow-hidden border shadow-inner">
                                            <WardMap />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Support Tactical Feed */}
                    <div className="col-xl-4">
                        <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
                            {/* Command Links */}
                            <div className="card border-0 shadow-premium bg-white p-4 p-lg-5 mb-5 rounded-4 border-start border-5" style={{ borderStartColor: BRAND_PRIMARY }}>
                                <h6 className="fw-black text-dark mb-4 uppercase tracking-widest opacity-60 d-flex align-items-center gap-3">
                                    <Target size={18} className="text-primary" />
                                    COMMAND NODES
                                </h6>
                                <div className="vstack gap-3">
                                    {[
                                        { label: 'Approval Queue', path: '/ward-officer/approvals', icon: ShieldCheck, color: BRAND_SUCCESS, sub: 'Audit Resolution Proofs' },
                                        { label: 'Personnel Registry', path: '/ward-officer/officers', icon: UserCheck, color: BRAND_PRIMARY, sub: 'Manage Ward Operatives' },
                                        { label: 'Strategic Analytics', path: '/ward-officer/analytics', icon: TrendingUp, color: '#6366F1', sub: 'Performance Intelligence' },
                                        { label: 'Ward Complaints', path: '/ward-officer/complaints', icon: List, color: BRAND_WARNING, sub: 'Comprehensive History' }
                                    ].map((link, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => navigate(link.path)}
                                            className="btn btn-light bg-white p-3 border-0 shadow-sm transition-all rounded-4 hover-up-small d-flex align-items-center gap-3 text-start border border-light"
                                        >
                                            <div className="rounded-3 shadow-sm border d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: '42px', height: '42px', color: link.color, backgroundColor: `${link.color}10` }}>
                                                <link.icon size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <span className="fw-black text-dark extra-small tracking-widest text-uppercase d-block mb-0.5">{link.label}</span>
                                                <span className="extra-small fw-bold text-muted uppercase tracking-wider opacity-60 text-truncate d-block" style={{ fontSize: '0.55rem' }}>{link.sub}</span>
                                            </div>
                                            <ChevronRight size={14} className="ms-auto opacity-30" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Threat Alert Panel */}
                            <div className="card border-0 shadow-premium bg-dark p-5 rounded-4 position-relative overflow-hidden border-top border-5 border-warning animate-pulse-slow">
                                <div className="position-absolute bottom-0 end-0 p-3 opacity-10 rotate-12 scale-150">
                                    <ShieldAlert size={120} strokeWidth={1} className="text-white" />
                                </div>
                                <div className="position-relative z-1">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="bg-warning rounded-circle" style={{ width: '10px', height: '10px', boxShadow: '0 0 15px #F59E0B' }}></div>
                                        <h6 className="fw-black text-white extra-small tracking-widest uppercase mb-0">Operational Directive</h6>
                                    </div>
                                    <p className="extra-small text-white fw-bold mb-0 opacity-80 leading-relaxed uppercase tracking-widest">
                                        Strategic audit of all 'RESOLVED' cases is required within the 4-hour SLA window to maintain ward integrity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.68rem; }
                .tracking-widest { letter-spacing: 0.18em; }
                .hover-up { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important; }
                .hover-up-small:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important; }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-pulse-slow { animation: pulse 4s infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
                .rotate-12 { transform: rotate(-12deg); }
                .scroll-x-mobile { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
                .scroll-x-mobile::-webkit-scrollbar { display: none; }
            `}} />

            {
                showAssignModal && selectedComplaint && (
                    <AssignmentModal
                        complaint={selectedComplaint}
                        onClose={() => {
                            setShowAssignModal(false);
                            setSelectedComplaint(null);
                        }}
                        onAssignSuccess={() => {
                            loadData();
                        }}
                    />
                )
            }
        </div >
    );
};

export default WardOfficerDashboard;
