import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, CheckCircle, AlertTriangle, Clock,
    LayoutDashboard, Activity, TrendingUp, Users,
    ArrowRight, RefreshCw, Zap, Shield
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        breached: 0
    });
    const [wardData, setWardData] = useState([]);
    const [workloadData, setWorkloadData] = useState([]);
    const [readyToClose, setReadyToClose] = useState([]);
    const PRIMARY_COLOR = '#244799';

    const userName = (() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.name || 'Admin';
        } catch (e) {
            return 'Admin';
        }
    })();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, readyRes, workloadRes] = await Promise.all([
                apiService.admin.getDashboard().catch(() => ({})),
                apiService.admin.getComplaints({ page: 0, size: 5, status: 'RESOLVED' }).catch(() => ({ content: [] })),
                apiService.admin.getOfficerWorkload().catch(() => ([]))
            ]);

            const d = dashboardRes;
            if (d.statistics) {
                setStats({
                    total: d.statistics.totalComplaints || 0,
                    pending: d.statistics.pending || 0,
                    resolved: d.statistics.resolved || 0,
                    breached: d.sla ? d.sla.breached : 0
                });
            }

            if (d.wardStats) {
                setWardData(d.wardStats.map(w => ({ wardName: w.wardName, count: w.total })).slice(0, 8));
            }

            const workloadList = workloadRes.data || workloadRes || [];
            const mappedWorkload = Array.isArray(workloadList) ? workloadList.map(w => ({
                name: w.officerName || w.name || 'Officer',
                value: w.activeComplaints || w.count || 0
            })) : [];

            setWorkloadData(mappedWorkload);

            const resolvedComplaints = readyRes.content || readyRes.data || (Array.isArray(readyRes) ? readyRes : []);
            setReadyToClose(resolvedComplaints);

        } catch (error) {
            console.error('Dashboard synchronization failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const CHART_COLORS = ['#244799', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted extra-small tracking-widest uppercase">Synchronizing Command Console...</p>
        </div>
    );

    return (
        <div className="admin-dashboard-container min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Executive Dashboard"
                userName={userName || 'Official'}
                wardName="City-Wide Authority"
                subtitle="High-level operational overview and performance analytics"
                icon={LayoutDashboard}
                actions={
                    <button onClick={loadDashboardData} className="btn btn-white bg-white rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-sm border d-flex align-items-center gap-2 transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> REFRESH DATA
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-30px' }}>
                {/* Scorecards */}
                <div className="row g-4 mb-5">
                    {[
                        { title: 'Total Registered', value: stats.total, icon: FileText, color: PRIMARY_COLOR, trend: 'Lifetime volume' },
                        { title: 'Requires Action', value: stats.pending, icon: Activity, color: '#f59e0b', trend: 'In-queue tasks' },
                        { title: 'Field Resolved', value: stats.resolved, icon: CheckCircle, color: '#10b981', trend: 'Pending archival' },
                        { title: 'Critical Slips', value: stats.breached, icon: Shield, color: '#ef4444', trend: 'SLA breaches' }
                    ].map((stat, idx) => (
                        <div key={idx} className="col-12 col-md-6 col-xl-3">
                            <div className="card h-100 border-0 shadow-premium rounded-4 overflow-hidden group hover-up transition-all bg-white">
                                <div className="card-body p-4 p-xl-5">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="p-3 rounded-4 shadow-sm" style={{ backgroundColor: `${stat.color}10` }}>
                                            <stat.icon size={26} style={{ color: stat.color }} />
                                        </div>
                                        <div className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">System-wide</div>
                                    </div>
                                    <h1 className="fw-black mb-1 display-5" style={{ color: stat.color }}>{stat.value}</h1>
                                    <p className="text-dark fw-black small mb-1 uppercase tracking-tight">{stat.title}</p>
                                    <p className="extra-small text-muted fw-bold mb-0 opacity-60 uppercase">{stat.trend}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analytical Quadrants */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-premium rounded-4 h-100 bg-white p-4 p-lg-5">
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                <div>
                                    <h5 className="mb-1 fw-black text-dark uppercase tracking-tight">Geospatial Distribution</h5>
                                    <p className="text-muted extra-small fw-bold uppercase tracking-widest opacity-60">Complaints mapped by administrative ward</p>
                                </div>
                                <div className="p-2 bg-light rounded-pill px-3 extra-small fw-black text-primary border">ACTIVE UNITS</div>
                            </div>
                            <div style={{ height: '350px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={wardData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="wardName" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                        <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[6, 6, 6, 6]} barSize={35} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-4 h-100 bg-white p-4 p-lg-5">
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                <h5 className="mb-0 fw-black text-dark uppercase tracking-tight">Officer Workload</h5>
                                <Users size={18} className="text-primary opacity-40" />
                            </div>
                            <div style={{ height: '300px', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {workloadData.length > 0 ? (
                                        <PieChart>
                                            <Pie
                                                data={workloadData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={95}
                                                paddingAngle={5}
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {workloadData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 10px rgba(0,0,0,0.1)' }} />
                                        </PieChart>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center h-100 text-muted extra-small fw-bold">
                                            NO ACTIVE ASSIGNMENTS
                                        </div>
                                    )}
                                </ResponsiveContainer>
                                {workloadData.length > 0 && (
                                    <div className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none">
                                        <div className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">Active</div>
                                        <div className="fw-black h3 mb-0" style={{ color: PRIMARY_COLOR }}>
                                            {workloadData.reduce((acc, curr) => acc + curr.value, 0)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-top">
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {workloadData.slice(0, 4).map((d, i) => (
                                        <div key={i} className="extra-small fw-bold px-3 py-1 bg-light rounded-pill border text-muted d-flex align-items-center gap-2">
                                            <div className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                            {d.name}: {d.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Queue Section */}
                <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden">
                    <div className="card-header bg-white border-bottom py-4 px-4 px-lg-5 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1 fw-black text-dark uppercase tracking-tight">Operational Audit Queue</h5>
                            <p className="text-muted extra-small fw-bold mb-0 uppercase tracking-widest opacity-60">Cases resolved by field units awaiting final administrative closure</p>
                        </div>
                        <button className="btn btn-primary rounded-pill px-4 py-2 extra-small fw-black tracking-widest shadow-sm border-0" style={{ backgroundColor: PRIMARY_COLOR }} onClick={() => navigate('/admin/complaints?status=RESOLVED')}>
                            FULL LEDGER <ArrowRight size={14} className="ms-2" />
                        </button>
                    </div>
                    <div className="card-body p-0">
                        {readyToClose.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light bg-opacity-50">
                                        <tr>
                                            <th className="px-5 py-3 text-muted extra-small fw-black border-0 uppercase tracking-widest">Identification</th>
                                            <th className="py-3 text-muted extra-small fw-black border-0 uppercase tracking-widest">Deployment Ward</th>
                                            <th className="py-3 text-muted extra-small fw-black border-0 uppercase tracking-widest">Resp. Unit</th>
                                            <th className="px-5 py-3 text-muted extra-small fw-black border-0 uppercase tracking-widest text-end">Verification</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {readyToClose.map((item) => (
                                            <tr key={item.complaintId || item.id} className="cursor-pointer" onClick={() => navigate(`/admin/complaints/${item.complaintId || item.id}`)}>
                                                <td className="px-5 border-0">
                                                    <div className="fw-black text-dark small mb-0">{item.title}</div>
                                                    <div className="extra-small text-primary fw-bold" style={{ color: PRIMARY_COLOR }}>#{item.complaintId || item.id}</div>
                                                </td>
                                                <td className="border-0">
                                                    <span className="badge rounded-pill bg-white border px-3 py-2 text-dark extra-small fw-black">
                                                        {item.wardName || (item.ward && item.ward.wardName) || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="border-0">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: PRIMARY_COLOR }}></div>
                                                        <span className="extra-small fw-black text-muted uppercase tracking-tight">{item.departmentName || (item.department && item.department.name) || 'General'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 border-0 text-end">
                                                    <button className="btn btn-outline-primary rounded-pill px-4 py-1.5 extra-small fw-black tracking-widest transition-all" style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }} onClick={(e) => { e.stopPropagation(); navigate(`/admin/complaints/${item.complaintId || item.id}`); }}>
                                                        INSPECT
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="rounded-circle bg-light d-inline-flex p-4 mb-3">
                                    <CheckCircle size={48} className="text-success opacity-10" />
                                </div>
                                <h6 className="fw-black text-muted uppercase tracking-widest mb-1">Queue Operational</h6>
                                <p className="extra-small text-muted fw-bold">All resolved cases have been successfully audited.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-dashboard-container { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .tracking-tight { letter-spacing: -0.01em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default AdminDashboard;
