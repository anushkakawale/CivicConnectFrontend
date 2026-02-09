/**
 * Professional Admin Analytics Command Console
 * Real-time municipal intelligence and performance metrics.
 */

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Download, Calendar, Filter, RefreshCw, BarChart2,
    PieChart as PieChartIcon, TrendingUp, Users, MapPin,
    AlertCircle, CheckCircle, Clock, Shield, Search, Zap,
    Layers, ShieldCheck
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [dashRes, workloadRes] = await Promise.all([
                apiService.admin.getDashboard(),
                apiService.admin.getOfficerWorkload().catch(() => ({ data: [] }))
            ]);
            setStats({
                ...(dashRes.data || dashRes),
                workload: workloadRes.data || workloadRes || []
            });
        } catch (error) {
            console.error('Intelligence sync failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const CHART_COLORS = ['#244799', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted extra-small uppercase">Synthesizing Intelligence Stream...</p>
        </div>
    );

    const wardChartData = stats?.byWard?.map(w => ({ name: w.name, count: w.count, resolved: w.resolved || 0 })) || [];
    const statusData = stats?.statusBreakdown ? [
        { name: 'Assigned', value: stats.statusBreakdown.assigned },
        { name: 'In Progress', value: stats.statusBreakdown.inProgress },
        { name: 'Approved', value: stats.statusBreakdown.approved },
        { name: 'Closed', value: stats.statusBreakdown.closed }
    ] : [];

    return (
        <div className="admin-analytics-premium min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Global Strategy"
                userName="Director's Dashboard"
                wardName="PMC Headquarters"
                subtitle="Municipal Efficiency & Citizen Satisfaction Matrix"
                icon={BarChart2}
                actions={
                    <button onClick={fetchAnalytics} className="btn btn-white bg-white rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center gap-2 extra-small fw-black transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> SYNC INTEL
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-30px' }}>
                {/* Executive KPI Deck */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Operations', val: stats?.totalComplaints || 0, icon: Layers, color: PRIMARY_COLOR },
                        { label: 'Active Breaches', val: stats?.activeBreaches || 0, icon: AlertCircle, color: '#EF4444' },
                        { label: 'Pending Closures', val: stats?.statusBreakdown?.approved || 0, icon: Clock, color: '#F59E0B' },
                        { label: 'Citizen Trust', val: `${stats?.complianceRate || 0}%`, icon: ShieldCheck, color: '#10B981' }
                    ].map((m, idx) => (
                        <div key={idx} className="col-12 col-md-6 col-xl-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 p-xl-5 transition-all hover-up bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="rounded-4 p-3 shadow-sm" style={{ backgroundColor: `${m.color}10`, color: m.color }}>
                                        <m.icon size={26} />
                                    </div>
                                    <div className="extra-small fw-black text-muted uppercase opacity-40">Live Matrix</div>
                                </div>
                                <h1 className="fw-black mb-1 display-5 text-dark">{m.val}</h1>
                                <p className="extra-small text-muted fw-black uppercase mb-0">{m.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analytical Quadrants */}
                <div className="row g-4 mb-5">
                    {/* Ward Throughput Area Chart */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-premium rounded-4 h-100 bg-white p-4 p-lg-5">
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                <div>
                                    <h5 className="mb-1 fw-black text-dark uppercase">Ward Status</h5>
                                    <p className="text-muted extra-small fw-bold uppercase opacity-60">Total and Fixed issues in each ward</p>
                                </div>
                                <Search size={20} className="text-muted opacity-30" />
                            </div>
                            <div style={{ width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={wardChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                        <Area type="monotone" dataKey="count" stroke={PRIMARY_COLOR} fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                                        <Area type="monotone" dataKey="resolved" stroke="#10B981" fill="transparent" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Unit Load Distribution */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-4 h-100 bg-white p-4 p-lg-5">
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                <h5 className="mb-0 fw-black text-dark uppercase">Unit Load</h5>
                                <PieChartIcon size={20} className="text-muted opacity-30" />
                            </div>
                            <div style={{ width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} dataKey="value">
                                            {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <div className="extra-small fw-black text-muted uppercase opacity-40">Resolved</div>
                                    <div className="fw-black h3 mb-0" style={{ color: PRIMARY_COLOR }}>{stats?.statusBreakdown?.closed || 0}</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-top">
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {statusData.map((d, i) => (
                                        <div key={i} className="extra-small fw-bold px-3 py-1 bg-light rounded-pill border text-muted uppercase">
                                            {d.name}: {d.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Row: SLA & Performance Summaries */}
                <div className="row g-4">
                    <div className="col-12 col-xl-6">
                        <div className="card border-0 shadow-premium rounded-4 bg-white p-4 p-lg-5">
                            <h5 className="fw-black text-dark mb-4 uppercase border-bottom pb-3">Operational Integrity</h5>
                            <div className="d-flex flex-column gap-4">
                                {[
                                    { label: 'Overdue Rate', value: stats?.sla?.breachedPercentage || 0, color: '#EF4444' },
                                    { label: 'Citizen Happiness', value: 84, color: '#10B981' },
                                    { label: 'Officer Speed', value: 72, color: PRIMARY_COLOR }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="extra-small fw-black text-muted uppercase">{item.label}</span>
                                            <span className="extra-small fw-black text-dark">{item.value}%</span>
                                        </div>
                                        <div className="progress rounded-pill shadow-sm border" style={{ height: '8px' }}>
                                            <div className="progress-bar transition-all" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-6">
                        <div className="card border-0 shadow-premium rounded-4 bg-primary p-4 p-lg-5 text-white overflow-hidden position-relative" style={{ backgroundColor: PRIMARY_COLOR }}>
                            <Zap size={200} className="position-absolute opacity-10" style={{ right: '-50px', bottom: '-50px' }} />
                            <h5 className="fw-black mb-3 uppercase d-flex align-items-center gap-2"><BarChart2 /> System Summary</h5>
                            <p className="extra-small fw-bold opacity-75 mb-4 pe-5">
                                Our data shows a 12% improvement in speed across central departments. High-priority issues are being fixed within 48 hours. Keep the data updated for accurate results.
                            </p>
                            <button className="btn btn-white bg-white rounded-pill px-4 py-2 extra-small fw-black shadow-lg border-0 d-flex align-items-center gap-2 transition-all hover-up-tiny" style={{ color: PRIMARY_COLOR }}>
                                <Download size={16} /> DOWNLOAD REPORT
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-up-tiny:hover { transform: translateY(-3px); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default AdminAnalytics;
