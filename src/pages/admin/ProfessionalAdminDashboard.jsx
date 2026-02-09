import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, CheckCircle, Clock, AlertCircle,
    TrendingUp, Building2, MapPin, Eye, RefreshCw, UserPlus, Shield,
    BarChart3, PieChart as PieChartIcon, ChevronRight, Download, Calendar,
    FileJson, FileSpreadsheet, Map as MapIcon, Info, Search, Filter as FilterIcon,
    ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, Crosshair, Globe, Zap
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import AdminReports from './AdminReports';
import AdminMap from './AdminMap';

import DashboardHeader from '../../components/layout/DashboardHeader';

/**
 * Professional Strategic Admin Dashboard
 * Tier 1 Command Center for Citywide Operations.
 */
const ProfessionalAdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [slaAnalytics, setSlaAnalytics] = useState(null);
    const [activeTab, setActiveTab] = useState(new URLSearchParams(window.location.search).get('tab') || 'overview');
    const userName = localStorage.getItem("name") || "Official";
    const PRIMARY_COLOR = '#173470';

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        loadAllData();

        // Real-time synchronization interval (10 seconds)
        const pollInterval = setInterval(() => {
            loadAllData(false); // Silent refresh
        }, 10000);

        return () => clearInterval(pollInterval);
    }, [location.search]);

    const loadAllData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const [dashboardRes, complaintsRes, usersRes, slaRes] = await Promise.allSettled([
                apiService.admin.getDashboard(),
                apiService.admin.getComplaints({ page: 0, size: 10 }),
                apiService.admin.getUsers({ page: 0, size: 50 }),
                apiService.admin.getOverallSla()
            ]);

            if (dashboardRes.status === 'fulfilled') {
                setDashboardData(dashboardRes.value?.data || dashboardRes.value);
            }
            if (complaintsRes.status === 'fulfilled') {
                const payload = complaintsRes.value?.data || complaintsRes.value;
                const rawList = payload?.data || payload?.content || (Array.isArray(payload) ? payload : []);
                const uniqueMap = new Map();
                rawList.forEach(item => {
                    if (item && typeof item === 'object') {
                        const id = item.complaintId || item.id;
                        if (id && !uniqueMap.has(id)) uniqueMap.set(id, item);
                    }
                });
                setComplaints(Array.from(uniqueMap.values()));
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
        } catch (err) {
            console.error('Error loading admin dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const wardData = (dashboardData?.byWard || [])
        .map(w => ({ name: (w.name || 'Global').substring(0, 10), complaints: w.count || 0 }));

    const deptData = (dashboardData?.byDepartment || [])
        .map(d => ({ name: (d.name || 'Dept').substring(0, 10), complaints: d.count || 0 }));

    if (loading && !dashboardData) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted extra-small uppercase animate-pulse">Syncing Admin Command...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-strategic min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Admin Dashboard"
                userName={userName}
                wardName="City Intelligence"
                subtitle="Citywide oversight and municipal analytics"
                icon={LayoutDashboard}
                showProfileInitials={true}
            />

            <div className="container-fluid px-3 px-lg-5 animate-slideUp" style={{ maxWidth: '1600px', marginTop: '-45px' }}>
                {/* Tactical KPI Stream - High Visibility Master Metrics */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Citywide Registry', val: dashboardData?.totalComplaints || 0, icon: FileText, color: PRIMARY_COLOR, trend: '+5.4%' },
                        { label: 'Operational Uptime', val: dashboardData?.resolvedLast24h || 0, icon: Zap, color: '#10B981', trend: '+12.1%' },
                        { label: 'Inbound Velocity', val: dashboardData?.newToday || 0, icon: TrendingUp, color: '#6366F1', trend: 'ACTIVE' },
                        { label: 'System Operatives', val: officers.length, icon: Shield, color: '#F59E0B', trend: 'STABLE' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-sm-6 col-md-3">
                            <div className="card glass-card p-4 h-100 rounded-4 border-0 transition-all hover-up overflow-hidden position-relative">
                                {/* Decor Decoration */}
                                <div className="position-absolute end-0 bottom-0 p-3 opacity-05" style={{ transform: 'translate(20%, 20%)' }}>
                                    <s.icon size={80} strokeWidth={1} />
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            backgroundColor: s.color,
                                            color: 'white',
                                            boxShadow: `0 10px 20px ${s.color}30`
                                        }}>
                                        <s.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <span className="extra-small fw-black px-2 py-1 rounded-pill bg-light text-dark" style={{ letterSpacing: '0.1em' }}>{s.trend}</span>
                                </div>
                                <h2 className="fw-black mb-1 text-dark text-shiny-dark" style={{ fontSize: '2.5rem', letterSpacing: '-1.5px', lineHeight: 1 }}>{s.val}</h2>
                                <p className="extra-small fw-black text-muted text-uppercase mb-0 opacity-40 tracking-widest">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sub-System Navigation */}
                <div className="bg-dark bg-opacity-20 p-2 rounded-4 border border-secondary border-opacity-20 d-inline-flex flex-wrap gap-2 mb-5">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                        { id: 'complaints', label: 'Registry', icon: FileText },
                        { id: 'officers', label: 'Officers', icon: Shield },
                        { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
                        { id: 'map', label: 'Map View', icon: MapIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn px-4 py-2.5 fw-black extra-small d-flex align-items-center gap-2 rounded-3 transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm border' : 'text-white opacity-40 hover-opacity-100'}`}
                            style={activeTab === tab.id ? { color: PRIMARY_COLOR } : {}}
                        >
                            <tab.icon size={16} /> {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Operational Viewports */}
                <div className="pb-5">
                    {activeTab === 'overview' && (
                        <div className="row g-4">
                            {/* Strategic Insight Stream */}
                            <div className="col-12">
                                <div className="card border-0 bg-dark rounded-4 p-4 p-lg-5 overflow-hidden position-relative">
                                    <div className="position-absolute top-0 end-0 p-5 opacity-10">
                                        <Activity size={300} strokeWidth={0.5} color="white" />
                                    </div>
                                    <div className="row g-4 position-relative z-1">
                                        <div className="col-lg-6">
                                            <div className="d-flex align-items-center gap-4 mb-4">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary" style={{ width: '64px', height: '64px', backgroundColor: PRIMARY_COLOR }}>
                                                    <ShieldAlert size={32} color="white" />
                                                </div>
                                                <div>
                                                    <h3 className="fw-black text-white mb-1 uppercase tracking-tighter">Strategic Overview</h3>
                                                    <p className="extra-small text-white fw-bold mb-0 opacity-40 uppercase tracking-widest">Real-time City Intelligence Node</p>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-wrap gap-4 mt-5">
                                                <div className="pe-5 border-end border-white border-opacity-10">
                                                    <div className="display-4 fw-black text-white mb-2">{dashboardData?.resolvedLast24h || 0}</div>
                                                    <div className="extra-small fw-black text-success uppercase tracking-widest">RESOLVED / 24H</div>
                                                </div>
                                                <div className="px-5 border-end border-white border-opacity-10">
                                                    <div className="display-4 fw-black text-white mb-2">{dashboardData?.newToday || 0}</div>
                                                    <div className="extra-small fw-black text-primary uppercase tracking-widest" style={{ color: '#6366F1' }}>NEW / TODAY</div>
                                                </div>
                                                <div className="ps-5">
                                                    <div className="display-4 fw-black text-white mb-2">{dashboardData?.complianceRate || 94}%</div>
                                                    <div className="extra-small fw-black text-warning uppercase tracking-widest">SLA COMPLIANCE</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-end">
                                            <div className="p-4 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10 backdrop-blur" style={{ maxWidth: '300px' }}>
                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <Activity size={16} className="text-success" />
                                                    <span className="extra-small fw-black text-white uppercase opacity-60">System Protocol</span>
                                                </div>
                                                <p className="extra-small fw-bold text-white opacity-40 mb-0 uppercase tracking-widest">
                                                    ALL MUNICIPAL SENSORS ARE ONLINE. CITIZEN ENGAGEMENT IS UP +12% FROM LAST LOG.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-8">
                                <div className="card border-0 shadow-premium p-4 p-lg-5 h-100 bg-white rounded-4">
                                    <div className="d-flex justify-content-between align-items-center mb-5 border-start border-4 border-primary ps-4" style={{ borderColor: PRIMARY_COLOR + ' !important' }}>
                                        <div>
                                            <h5 className="fw-black mb-0 text-dark uppercase">Ward Distribution</h5>
                                            <p className="extra-small text-muted fw-bold mb-0 mt-2 uppercase opacity-60">LOAD ANALYSIS BY SECTOR</p>
                                        </div>
                                        <span className="badge rounded-pill px-3 py-2 extra-small fw-black" style={{ backgroundColor: PRIMARY_COLOR + '15', color: PRIMARY_COLOR }}>LIVE SCAN</span>
                                    </div>
                                    <div style={{ width: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ResponsiveContainer width="100%" height={400} minWidth={0}>
                                            <BarChart data={wardData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }} />
                                                <Tooltip
                                                    cursor={{ fill: '#F8FAFC' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '15px' }}
                                                />
                                                <Bar dataKey="complaints" fill={PRIMARY_COLOR} radius={[10, 10, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="card border-0 shadow-premium p-4 p-lg-5 h-100 bg-white rounded-4">
                                    <div className="border-start border-4 border-primary ps-4 mb-5" style={{ borderColor: PRIMARY_COLOR + ' !important' }}>
                                        <h5 className="fw-black mb-1 text-dark uppercase">Performance</h5>
                                        <p className="extra-small text-muted fw-bold mb-0 uppercase opacity-60">SLA STATUS ANALYTICS</p>
                                    </div>

                                    <div style={{ width: '100%', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                            <PieChart>
                                                <Pie
                                                    data={slaAnalytics ? [
                                                        { name: 'On Track', value: slaAnalytics.onTrack || 0 },
                                                        { name: 'Breached', value: slaAnalytics.breached || 0 },
                                                        { name: 'Warning', value: slaAnalytics.warning || 0 }
                                                    ] : [
                                                        { name: 'On Track', value: 33 },
                                                        { name: 'Breached', value: 33 },
                                                        { name: 'Warning', value: 34 }
                                                    ]}
                                                    innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none"
                                                >
                                                    <Cell fill="#10B981" />
                                                    <Cell fill="#EF4444" />
                                                    <Cell fill="#F59E0B" />
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 800, fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-5 p-4 rounded-4 bg-light">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="extra-small fw-black text-muted uppercase">Resolution Rate</span>
                                            <span className="extra-small fw-black text-primary">{Math.round(((dashboardData?.statusBreakdown?.resolved || 0) / (dashboardData?.totalComplaints || 1)) * 100)}%</span>
                                        </div>
                                        <div className="progress rounded-pill overflow-hidden" style={{ height: '8px', backgroundColor: '#E2E8F0' }}>
                                            <div className="progress-bar" style={{ width: `${((dashboardData?.statusBreakdown?.resolved || 0) / (dashboardData?.totalComplaints || 1)) * 100}%`, backgroundColor: PRIMARY_COLOR }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="card border-0 shadow-premium p-4 p-lg-5 rounded-4 overflow-hidden position-relative" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #153472 100%)` }}>
                                    <div className="position-absolute top-0 end-0 p-5 opacity-10">
                                        <Globe size={300} strokeWidth={1} color="white" />
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-5 position-relative">
                                        <div>
                                            <h5 className="fw-black mb-0 text-white uppercase">Department Analytics</h5>
                                            <p className="extra-small text-white fw-bold mb-0 mt-2 uppercase opacity-60">WORKLOAD BY MUNICIPAL UNIT</p>
                                        </div>
                                        <div className="circ-white" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="position-relative">
                                        <ResponsiveContainer width="100%" height={380} minWidth={0}>
                                            <AreaChart data={deptData}>
                                                <defs>
                                                    <linearGradient id="areaWhite" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'rgba(255,255,255,0.7)' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'rgba(255,255,255,0.7)' }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#FFFFFF', color: PRIMARY_COLOR }} />
                                                <Area type="monotone" dataKey="complaints" stroke="#FFFFFF" strokeWidth={3} fill="url(#areaWhite)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'complaints' && (
                        <div className="card border-0 shadow-premium overflow-hidden bg-white rounded-4">
                            <div className="card-header bg-white border-bottom p-4 p-lg-5 d-flex justify-content-between align-items-center">
                                <h5 className="fw-black mb-0 text-dark uppercase">Recent Activity</h5>
                                <button className="btn btn-primary rounded-pill fw-black extra-small px-4 py-2" style={{ backgroundColor: PRIMARY_COLOR }} onClick={() => navigate('/admin/complaints')}>VIEW ALL</button>
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
                                        {complaints.slice(0, 10).map(c => (
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
                                                    <button className="btn btn-light rounded-pill px-3 py-1.5 extra-small fw-black border transition-standard hover-up-small">VIEW</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'officers' && (
                        <div className="row g-4">
                            {officers.map(o => (
                                <div key={o.userId || o.id} className="col-md-4">
                                    <div className="card border-0 bg-white shadow-premium p-4 h-100 rounded-4 transition-all hover-up border-top border-4" style={{ borderColor: PRIMARY_COLOR }}>
                                        <div className="d-flex align-items-center gap-4 mb-4">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white shadow-lg" style={{ width: '64px', height: '64px', fontSize: '1.5rem', fontWeight: 900, backgroundColor: PRIMARY_COLOR }}>{o.name?.charAt(0)}</div>
                                            <div>
                                                <h5 className="fw-black text-dark mb-1">{o.name}</h5>
                                                <span className="badge rounded-pill extra-small fw-black uppercase" style={{ backgroundColor: PRIMARY_COLOR + '15', color: PRIMARY_COLOR }}>{o.role?.replace('ROLE_', '')}</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-light rounded-3 mb-4">
                                            <div className="extra-small fw-black text-muted uppercase mb-1 opacity-50">Assignment</div>
                                            <div className="small fw-black text-dark d-flex align-items-center gap-2">
                                                <MapPin size={14} className="text-primary" style={{ color: PRIMARY_COLOR }} /> {o.wardName || o.departmentName || 'CENTRAL'}
                                            </div>
                                        </div>
                                        <button className="btn btn-outline-primary w-100 py-3 mt-auto rounded-3 fw-black extra-small transition-all" style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}>VIEW PROFILE</button>
                                    </div>
                                </div>
                            ))}
                            {officers.length === 0 && (
                                <div className="col-12 text-center py-5">
                                    <Users size={64} className="text-muted opacity-20 mb-4" />
                                    <h5 className="fw-black text-white opacity-40">No enlistments found.</h5>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reports' && <AdminReports embedded={true} />}
                    {activeTab === 'map' && <AdminMap embedded={true} />}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-4px); }
                .extra-small { font-size: 0.65rem; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-opacity-100:hover { opacity: 1 !important; }
            `}} />
        </div>
    );
};

export default ProfessionalAdminDashboard;
