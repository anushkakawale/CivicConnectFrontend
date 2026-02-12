import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, CheckCircle, Clock, AlertCircle,
    TrendingUp, Building2, MapPin, Eye, RefreshCw, UserPlus, Shield,
    BarChart3, PieChart as PieChartIcon, ChevronRight, Download, Calendar,
    FileJson, FileSpreadsheet, Map as MapIcon, Info, Search, Filter as FilterIcon,
    ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, Crosshair, Globe, Zap,
    Smile, HardHat, TrendingDown, Target, ShieldCheck
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import AdminReports from './AdminReports';
import AdminMap from './AdminMap';
import AssignmentModal from '../../components/complaints/AssignmentModal';

import DashboardHeader from '../../components/layout/DashboardHeader';

/**
 * Professional Strategic Admin Dashboard
 * Tier 1 Command Center: Global Strategy • PMC Headquarters
 */
const ProfessionalAdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [slaAnalytics, setSlaAnalytics] = useState(null);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [unassignedList, setUnassignedList] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [pendingClosures, setPendingClosures] = useState([]);
    const [activeTab, setActiveTab] = useState(new URLSearchParams(window.location.search).get('tab') || 'overview');
    const userName = localStorage.getItem("name") || "PMC Director";
    const PRIMARY_COLOR = '#173470';

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        loadAllData();

        // Real-time synchronization interval (30 seconds for admin)
        const pollInterval = setInterval(() => {
            loadAllData(false); // Silent refresh
        }, 30000);

        return () => clearInterval(pollInterval);
    }, [location.search]);

    const loadAllData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const [dashboardRes, complaintsRes, usersRes, slaRes, unassignedRes, pendingClosuresRes] = await Promise.allSettled([
                apiService.admin.getDashboard(),
                apiService.admin.getComplaints({ page: 0, size: 10 }),
                apiService.admin.getUsers({ page: 0, size: 50 }),
                apiService.admin.getOverallSla(),
                apiService.admin.getUnassignedComplaints({ page: 0, size: 50 }),
                apiService.admin.getPendingClosures()
            ]);

            if (dashboardRes.status === 'fulfilled') {
                setDashboardData(dashboardRes.value?.data || dashboardRes.value);
            }
            if (complaintsRes.status === 'fulfilled') {
                const payload = complaintsRes.value?.data || complaintsRes.value;
                const rawList = payload?.data || payload?.content || (Array.isArray(payload) ? payload : []);
                setComplaints(rawList);
            }
            if (usersRes.status === 'fulfilled') {
                const payload = usersRes.value?.data || usersRes.value;
                const members = payload?.content || payload?.data || (Array.isArray(payload) ? payload : []);
                setOfficers(members.filter(u => {
                    const r = (typeof u.role === 'string' ? u.role : u.role?.name || '');
                    return r !== 'CITIZEN' && r !== 'ROLE_CITIZEN';
                }));
            }
            if (slaRes.status === 'fulfilled') {
                setSlaAnalytics(slaRes.value?.data || slaRes.value);
            }
            if (unassignedRes.status === 'fulfilled') {
                const val = unassignedRes.value?.data || unassignedRes.value;
                setUnassignedCount(val?.totalElements || val?.total || 0);
                if (val?.content) setUnassignedList(val.content);
            }
            if (pendingClosuresRes && pendingClosuresRes.status === 'fulfilled') {
                const val = pendingClosuresRes.value?.data || pendingClosuresRes.value;
                const list = val?.content || (Array.isArray(val) ? val : []);
                setPendingClosures(list);
            }
        } catch (err) {
            console.error('Error loading admin dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const wardData = (dashboardData?.byWard || [])
        .map(w => ({
            name: w.name || 'Ward',
            Total: w.count || 0,
            Fixed: w.resolved || 0
        }));

    const deptData = (dashboardData?.byDepartment || [])
        .map(d => ({ name: d.name || 'Dept', count: d.count || 0 }));

    if (loading && !dashboardData) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted extra-small uppercase animate-pulse">Initializing Administrative Command...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-strategic min-vh-100 pb-5 position-relative overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Tactical Grid Overlay */}
            <div className="tactical-grid-overlay"></div>

            <DashboardHeader
                portalName="PMC COMMAND CENTER"
                userName={`Welcome, ${userName}`}
                wardName="PMC CENTRAL HQ"
                subtitle="High-Fidelity Strategic Management Matrix"
                icon={ShieldCheck}
                showProfileInitials={true}
            />

            <div className="container-fluid px-3 px-lg-5 animate-slideUp position-relative" style={{ maxWidth: '1600px', marginTop: '-45px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '25%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '50%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '75%' }}></div>

                {/* Live Matrix - Top KPIs */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Operations', val: dashboardData?.totalComplaints || 0, icon: Activity, color: PRIMARY_COLOR, trend: 'LIVE MATRIX' },
                        { label: 'Active Breaches', val: (dashboardData?.statusBreakdown?.ESCALATED || 0), icon: ShieldAlert, color: '#EF4444', trend: 'CRITICAL AUDIT' },
                        { label: 'Unassigned', val: unassignedCount, icon: AlertCircle, color: '#F59E0B', trend: 'ATTENTION' },
                        { label: 'Pending Closures', val: (dashboardData?.statusBreakdown?.APPROVED || 0), icon: Clock, color: '#10B981', trend: 'FINAL PHASE' }
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

                {/* Sub-Tabs Navigation */}
                <div className="bg-white p-2 rounded-pill shadow-sm d-inline-flex flex-wrap gap-1 mb-5 border mx-auto">
                    {[
                        { id: 'overview', label: 'Global Feed', icon: Globe },
                        { id: 'complaints', label: 'Operations', icon: Target },
                        { id: 'approvals', label: 'Approvals', icon: CheckCircle },
                        { id: 'unassigned', label: 'Unassigned', icon: AlertCircle },
                        { id: 'officers', label: 'Personnel', icon: Shield },
                        { id: 'reports', label: 'Analytics', icon: BarChart3 },
                        { id: 'map', label: 'City Map', icon: MapIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn rounded-pill px-4 py-2 fw-black extra-small d-flex align-items-center gap-2 transition-all border-0 ${activeTab === tab.id ? 'bg-dark text-white shadow-lg' : 'text-muted hover-bg-light'}`}
                        >
                            <tab.icon size={14} /> {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="operational-viewport">
                    {activeTab === 'overview' && (
                        <div className="row g-4">
                            {/* Strategy Matrix Section */}
                            <div className="col-lg-8">
                                <div className="card b-none shadow-premium p-4 p-lg-5 h-100 bg-white rounded-4">
                                    <div className="d-flex justify-content-between align-items-center mb-5 border-start border-4 ps-4" style={{ borderColor: PRIMARY_COLOR }}>
                                        <div>
                                            <h5 className="fw-black mb-0 text-dark uppercase tracking-tight">Ward Status</h5>
                                            <p className="extra-small text-muted fw-bold mb-0 mt-1 uppercase opacity-50">Total and Fixed issues in each ward</p>
                                        </div>
                                    </div>
                                    <div className="recharts-wrapper" style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                            <BarChart data={wardData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900 }} />
                                                <Bar dataKey="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                                                <Bar dataKey="Fixed" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="row g-4 h-100">
                                    <div className="col-12">
                                        <div className="card b-none shadow-premium p-4 rounded-4 bg-white h-100">
                                            <div className="extra-small fw-black text-muted uppercase tracking-widest mb-4 opacity-40">Operational Integrity</div>
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <div>
                                                    <h6 className="fw-black text-dark mb-1">Overdue Rate</h6>
                                                    <h2 className="fw-black mb-0" style={{ color: '#EF4444' }}>{dashboardData?.overdueRate || 0}%</h2>
                                                </div>
                                                <TrendingDown className="text-danger opacity-20" size={48} />
                                            </div>
                                            <div className="progress rounded-pill bg-light mb-4" style={{ height: '6px' }}>
                                                <div className="progress-bar bg-danger" style={{ width: `${dashboardData?.overdueRate || 2}%` }}></div>
                                            </div>
                                            <div className="p-3 bg-light rounded-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="extra-small fw-black text-muted uppercase">Citizen Happiness</span>
                                                    <span className="extra-small fw-black text-success">84%</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="extra-small fw-black text-muted uppercase">Officer Speed</span>
                                                    <span className="extra-small fw-black text-primary">72%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="card b-none shadow-premium p-4 rounded-4 bg-dark text-white h-100 border-0 overflow-hidden position-relative institutional-dark transition-all hover-scale-xs">
                                            <Zap className="position-absolute end-0 bottom-0 m-n3 opacity-10 text-white" size={120} />
                                            <h6 className="extra-small fw-black uppercase tracking-widest mb-3 opacity-40">System Summary</h6>
                                            <p className="extra-small fw-bold opacity-60 mb-0 leading-relaxed uppercase">
                                                Statistical deviation indicates a 12% throughput enhancement. Sector-specific resolution latency remains within institutional bounds (48H).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="card b-none shadow-premium p-4 p-lg-5 bg-white rounded-4">
                                    <div className="d-flex justify-content-between align-items-center mb-5">
                                        <h5 className="fw-black mb-0 text-dark uppercase tracking-tight">Active Operations • Live Feed</h5>
                                        <button onClick={() => setActiveTab('complaints')} className="btn btn-dark rounded-pill px-4 py-2 extra-small fw-black">VIEW ALL</button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light bg-opacity-50">
                                                <tr>
                                                    <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Reference</th>
                                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Descriptor</th>
                                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Division</th>
                                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Pulse</th>
                                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase tracking-widest">Visual</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {complaints.slice(0, 5).map(c => (
                                                    <tr key={c.complaintId || c.id} className="cursor-pointer transition-all hover-light" onClick={() => navigate(`/admin/complaints/${c.complaintId || c.id}`)}>
                                                        <td className="px-5 py-4 text-center">
                                                            <span className="extra-small fw-black text-primary" style={{ color: PRIMARY_COLOR }}>#{c.complaintId || c.id}</span>
                                                        </td>
                                                        <td>
                                                            <div className="fw-black text-dark small uppercase mb-1">{c.title}</div>
                                                            <div className="extra-small text-muted fw-bold uppercase opacity-40">{new Date(c.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Building2 size={12} className="text-muted opacity-40" />
                                                                <span className="extra-small fw-black text-uppercase opacity-60">{c.departmentName?.replace(/_/g, ' ') || 'General'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <StatusBadge status={c.status} size="sm" />
                                                        </td>
                                                        <td className="px-5 text-end">
                                                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm border hover-up transition-all" style={{ width: '32px', height: '32px', backgroundColor: '#F8FAFC', color: PRIMARY_COLOR }}>
                                                                <ChevronRight size={14} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'complaints' && (
                        <div className="card b-none shadow-premium overflow-hidden bg-white rounded-4 border-0">
                            <div className="card-header bg-white border-bottom p-4 p-lg-5 d-flex justify-content-between align-items-center">
                                <h5 className="fw-black mb-0 text-dark uppercase tracking-tight">Municipal Operation Registry</h5>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light rounded-pill fw-black extra-small px-4 py-2 border"><FilterIcon size={12} className="me-2" /> FILTER</button>
                                    <button className="btn btn-dark rounded-pill fw-black extra-small px-4 py-2">EXPORT LEDGER</button>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase">ID</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Title</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase text-center">Status</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Department</th>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complaints.map(c => (
                                            <tr key={c.complaintId || c.id} className="cursor-pointer" onClick={() => navigate(`/admin/complaints/${c.complaintId || c.id}`)}>
                                                <td className="ps-5">
                                                    <span className="fw-black text-primary extra-small" style={{ color: PRIMARY_COLOR }}>#{c.complaintId || c.id}</span>
                                                </td>
                                                <td>
                                                    <div className="fw-black text-dark small mb-1 uppercase">{c.title}</div>
                                                    <div className="extra-small text-muted fw-bold uppercase opacity-60">{new Date(c.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="text-center"><StatusBadge status={c.status} size="sm" /></td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle border d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}><Building2 size={14} className="text-muted" /></div>
                                                        <span className="extra-small fw-black text-uppercase opacity-80">{(c.departmentName || 'General').replace(/_/g, ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="text-end pe-5">
                                                    <button className="btn btn-light rounded-pill px-3 py-1.5 extra-small fw-black border transition-standard hover-up-small">AUDIT</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'unassigned' && (
                        <div className="card b-none shadow-premium overflow-hidden bg-white rounded-4 border-0">
                            <div className="card-header bg-white border-bottom p-4 p-lg-5 d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-black mb-0 text-dark uppercase tracking-tight">Unassigned Task Force</h5>
                                    <p className="extra-small text-muted fw-bold mb-0 mt-1 uppercase opacity-50">Immediate Action Required</p>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase">ID</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Title</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Department</th>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unassignedList.map(c => (
                                            <tr key={c.complaintId || c.id} className="cursor-pointer" onClick={() => navigate(`/admin/complaints/${c.complaintId || c.id}`)}>
                                                <td className="ps-5">
                                                    <span className="fw-black text-danger extra-small">#{c.complaintId || c.id}</span>
                                                </td>
                                                <td>
                                                    <div className="fw-black text-dark small mb-1 uppercase">{c.title}</div>
                                                    <div className="extra-small text-muted fw-bold uppercase opacity-60">{new Date(c.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle border d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}><Building2 size={14} className="text-muted" /></div>
                                                        <span className="extra-small fw-black text-uppercase opacity-80">{(c.departmentName || 'General').replace(/_/g, ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="text-end pe-5">
                                                    <button
                                                        className="btn btn-primary btn-sm fw-bold px-3 py-1 rounded-pill shadow-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedComplaint(c);
                                                            setShowAssignModal(true);
                                                        }}
                                                    >
                                                        ASSIGN OFFICER
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {unassignedList.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5">
                                                    <p className="extra-small fw-black text-muted uppercase mb-0">No unassigned complaints found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className="card b-none shadow-premium overflow-hidden bg-white rounded-4 border-0">
                            <div className="card-header bg-white border-bottom p-4 p-lg-5 d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-black mb-0 text-dark uppercase tracking-tight">Pending Closures Ledger</h5>
                                    <p className="extra-small text-muted fw-bold mb-0 mt-1 uppercase opacity-50">Verified Resolutions Awaiting Final Shutdown</p>
                                </div>
                                <span className="badge bg-success rounded-pill px-3 py-2 fw-black extra-small">{pendingClosures.length} PENDING</span>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase">ID</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Details</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Status</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Verified By</th>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingClosures.map(c => (
                                            <tr key={c.complaintId || c.id} className="cursor-pointer" onClick={() => navigate(`/admin/complaints/${c.complaintId || c.id}`)}>
                                                <td className="ps-5">
                                                    <span className="fw-black text-success extra-small">#{c.complaintId || c.id}</span>
                                                </td>
                                                <td>
                                                    <div className="fw-black text-dark small mb-1 uppercase">{c.title}</div>
                                                    <div className="extra-small text-muted fw-bold uppercase opacity-60">
                                                        <Clock size={12} className="me-1" />
                                                        Last Update: {new Date(c.updatedAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td><StatusBadge status={c.status} size="sm" /></td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle border d-flex align-items-center justify-content-center bg-light" style={{ width: '30px', height: '30px' }}>
                                                            <ShieldCheck size={14} className="text-secondary" />
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className="extra-small fw-black text-dark uppercase">WARD ADMIN</span>
                                                            <span className="extra-small text-muted opacity-50 uppercase" style={{ fontSize: '9px' }}>APPROVED</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-end pe-5">
                                                    <button
                                                        className="btn btn-dark btn-sm fw-bold px-4 py-2 rounded-pill shadow-sm d-inline-flex align-items-center gap-2 transition-all hover-up-small"
                                                        style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Confirm final closure of this complaint?')) {
                                                                try {
                                                                    await apiService.admin.closeComplaint(c.complaintId || c.id);
                                                                    loadAllData(false);
                                                                    alert('Complaint Closed Successfully');
                                                                } catch (err) {
                                                                    alert('Closure Failed');
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <CheckCircle size={14} /> CLOSE CASE
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingClosures.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5">
                                                    <div className="d-flex flex-column align-items-center opacity-50">
                                                        <CheckCircle size={48} className="text-muted mb-3" />
                                                        <p className="extra-small fw-black text-muted uppercase mb-0">All verified complaints are closed</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'officers' && (
                        <div className="row g-4">
                            <div className="col-12 d-flex justify-content-between align-items-center mb-2">
                                <h5 className="fw-black text-dark uppercase mb-0 ps-3 border-start border-4 border-primary">Registry Ledger</h5>
                                <button
                                    onClick={() => navigate('/admin/register-officer')}
                                    className="btn btn-primary rounded-pill px-4 py-2 extra-small fw-black d-flex align-items-center gap-2 shadow-sm border-0"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    <UserPlus size={14} /> ENROLL NEW OPERATIVE
                                </button>
                            </div>
                            {officers.map(o => (
                                <div key={o.userId || o.id} className="col-md-4 col-lg-3">
                                    <div className="card b-none bg-white shadow-premium p-4 h-100 rounded-4 transition-all hover-up-tiny border-0">
                                        <div className="d-flex align-items-center gap-3 mb-4">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.2rem', fontWeight: 900, backgroundColor: PRIMARY_COLOR }}>{o.name?.charAt(0)}</div>
                                            <div>
                                                <h6 className="fw-black text-dark mb-0 uppercase tracking-tight">{o.name}</h6>
                                                <span className="extra-small fw-black text-muted uppercase opacity-40">{o.role?.replace('ROLE_', '')}</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-light rounded-4 mb-4">
                                            <div className="extra-small fw-black text-muted uppercase mb-1 opacity-50">Deployment</div>
                                            <div className="small fw-black text-dark d-flex align-items-center gap-2 truncate">
                                                <HardHat size={14} className="text-primary" style={{ color: PRIMARY_COLOR }} /> {o.wardName || o.departmentName || 'CENTRAL COMMAND'}
                                            </div>
                                        </div>
                                        <button className="btn btn-outline-dark w-100 py-2.5 rounded-pill fw-black extra-small transition-all border-2">VIEW FILE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'reports' && <AdminReports embedded={true} />}
                    {activeTab === 'map' && <AdminMap embedded={true} />}
                </div>
            </div>

            {showAssignModal && selectedComplaint && (
                <AssignmentModal
                    complaint={selectedComplaint}
                    onClose={() => {
                        setShowAssignModal(false);
                        setSelectedComplaint(null);
                    }}
                    onAssignSuccess={() => {
                        loadAllData(false);
                    }}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-dashboard-strategic { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .b-none { border: none !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-up-tiny:hover { transform: translateY(-4px); }
                .extra-small { font-size: 0.65rem; }
                .transition-all { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .hover-bg-light:hover { background-color: #f8fafc; }
                .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .uppercase { text-transform: uppercase; }
                .tracking-widest { letter-spacing: 0.15em; }

                .tactical-grid-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        linear-gradient(rgba(23, 52, 112, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(23, 52, 112, 0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                    z-index: 0;
                }

                .vertical-divider-guide {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to bottom, transparent, rgba(23, 52, 112, 0.03), transparent);
                    pointer-events: none;
                    z-index: -1;
                }
            `}} />
        </div>
    );
};

export default ProfessionalAdminDashboard;
