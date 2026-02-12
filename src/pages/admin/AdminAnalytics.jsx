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
    Download, FileSpreadsheet, Calendar, Filter, RefreshCw, BarChart2,
    PieChart as PieChartIcon, TrendingUp, Users, MapPin,
    AlertCircle, CheckCircle, Clock, Shield, Search, Zap,
    Layers, ShieldCheck, Target, Activity, Globe
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminAnalytics = ({ embedded = false }) => {
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);
    const [wardPerformance, setWardPerformance] = useState([]);
    const [deptPerformance, setDeptPerformance] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [dashRes, trendsRes, wardRes, deptRes, catRes] = await Promise.all([
                apiService.admin.getDashboard(),
                apiService.admin.getTrends(),
                apiService.admin.getWardPerformance(),
                apiService.admin.getDepartmentPerformance(),
                apiService.admin.getCategories()
            ]);

            setStats(dashRes.data || dashRes);
            setTrends(trendsRes.data || trendsRes || []);
            setWardPerformance(wardRes.data || wardRes || []);
            setDeptPerformance(deptRes.data || deptRes || []);
            setCategories(catRes.data || catRes || []);
        } catch (error) {
            console.error('Projected intelligence sync failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async (format) => {
        try {
            const response = format === 'pdf'
                ? await apiService.admin.downloadComplaintsPdf({})
                : await apiService.admin.downloadComplaintsExcel({});

            const blob = new Blob([response.data || response], {
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Executive_Audit_${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Extraction failed:', err);
        }
    };

    const CHART_COLORS = ['#173470', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted extra-small uppercase tracking-widest">Synthesizing Intelligence Stream...</p>
        </div>
    );

    return (
        <div className="admin-analytics-premium min-vh-100 pb-5">
            <DashboardHeader
                portalName="Global Strategy"
                userName="Director's Dashboard"
                wardName="PMC Headquarters"
                subtitle="High-Performance Municipal Oversight & Citizen Satisfaction Matrix"
                icon={BarChart2}
                actions={
                    <button onClick={fetchAnalytics} className="btn btn-white bg-white rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center gap-2 extra-small fw-black transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> SYNC INTEL
                    </button>
                }
            />

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={embedded ? { marginTop: '0', zIndex: 1 } : { marginTop: '-45px', zIndex: 1 }}>
                <div className="tactical-dividers">
                    <div className="vertical-divider" style={{ left: '25%' }}></div>
                    <div className="vertical-divider" style={{ left: '50%' }}></div>
                    <div className="vertical-divider" style={{ left: '75%' }}></div>
                </div>
                {/* Tactical KPI Deck */}
                <div className="row g-4 mb-5">
                    {[
                        {
                            label: 'Total Operations',
                            val: stats?.totalComplaints || 0,
                            icon: Layers,
                            gradient: 'linear-gradient(135deg, #173470 0%, #3B82F6 100%)',
                            trend: '+12% MoM'
                        },
                        {
                            label: 'Success Rate',
                            val: `${Math.round(stats?.complianceRate || 0)}%`,
                            icon: Target,
                            gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            trend: 'Optimal'
                        },
                        {
                            label: 'Active Pipeline',
                            val: stats?.activeSlas || 0,
                            icon: Activity,
                            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            trend: 'High Flow'
                        },
                        {
                            label: 'Ward Reach',
                            val: stats?.resources?.totalWards || 0,
                            icon: Globe,
                            gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                            trend: 'Global'
                        }
                    ].map((m, idx) => (
                        <div key={idx} className="col-12 col-md-6 col-xl-3">
                            <div className="card border-0 shadow-premium rounded-5 p-4 p-xl-5 transition-all hover-up-tiny text-white position-relative overflow-hidden h-100" style={{ background: m.gradient }}>
                                <m.icon size={80} className="position-absolute opacity-10" style={{ right: '-10px', bottom: '-10px' }} />
                                <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
                                    <div className="bg-white bg-opacity-20 rounded-pill px-3 py-1 extra-small fw-black shadow-sm text-dark" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>{m.trend}</div>
                                    <m.icon size={20} className="opacity-60" />
                                </div>
                                <h1 className="fw-black mb-1 display-5 tabular-nums position-relative">{m.val}</h1>
                                <p className="extra-small fw-black uppercase mb-0 tracking-widest opacity-80 position-relative">{m.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4 mb-5">
                    {/* 1. Daily Trend Pulse - AreaChart */}
                    <div className="col-lg-8">
                        <div className="card b-none shadow-premium rounded-5 overflow-hidden bg-white h-100 p-4 p-lg-5">
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                <div>
                                    <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">Municipal Pulse</h5>
                                    <p className="extra-small text-muted fw-bold uppercase opacity-50 mb-0">Daily dossier volume (Last 30 Days)</p>
                                </div>
                                <div className="rounded-4 bg-primary bg-opacity-10 p-2 text-primary"><TrendingUp size={24} /></div>
                            </div>
                            <div style={{ width: '100%', height: '400px', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                                            tickFormatter={(str) => str.split('-').slice(1).join('/')} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', padding: '15px' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '5px', fontWeight: '900' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorPulse)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 2. Category Pareto - Donut Chart */}
                    <div className="col-lg-4">
                        <div className="card b-none shadow-premium rounded-5 overflow-hidden bg-white h-100 p-4 p-lg-5 text-center">
                            <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">Categorical Split</h5>
                            <p className="extra-small text-muted fw-bold uppercase opacity-50 mb-5">Sectoral resource allocation</p>
                            <div style={{ width: '100%', height: '300px', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categories}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="category"
                                        >
                                            {categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff', fontWeight: '900' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-start">
                                {categories.slice(0, 5).map((cat, idx) => (
                                    <div key={idx} className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                                            <span className="extra-small fw-black text-muted uppercase">{cat.category}</span>
                                        </div>
                                        <span className="extra-small fw-black text-dark">{cat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    {/* 3. Ward Health Matrix - Table/Leaderboard */}
                    <div className="col-lg-6">
                        <div className="card b-none shadow-premium rounded-5 overflow-hidden bg-white h-100">
                            <div className="card-header bg-white p-5 border-0">
                                <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">Ward Efficiency Matrix</h5>
                                <p className="extra-small text-muted fw-bold uppercase opacity-50 mb-0">Performance benchmarking by sector</p>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light bg-opacity-50">
                                        <tr>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase">Ward Deployment</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase text-center">Volume</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase text-center">Efficacy</th>
                                            <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase">Health</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wardPerformance.slice(0, 7).map((w, idx) => {
                                            const health = Math.round(w.efficiency);
                                            const color = health > 90 ? '#10B981' : health > 70 ? '#F59E0B' : '#EF4444';
                                            return (
                                                <tr key={idx}>
                                                    <td className="ps-5">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-light" style={{ width: '30px', height: '30px' }}>
                                                                <MapPin size={14} style={{ color }} />
                                                            </div>
                                                            <span className="extra-small fw-black text-dark uppercase">{w.ward}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center font-monospace extra-small fw-black text-muted">{w.total}</td>
                                                    <td className="text-center">
                                                        <div className="extra-small fw-black px-2 py-1 rounded-pill d-inline-block" style={{ backgroundColor: color + '15', color }}>
                                                            {health}%
                                                        </div>
                                                    </td>
                                                    <td className="pe-5 text-end">
                                                        <div className="progress rounded-pill bg-light" style={{ height: '4px', width: '80px', marginLeft: 'auto' }}>
                                                            <div className="progress-bar rounded-pill" style={{ width: `${health}%`, backgroundColor: color }}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 4. Department SLA Ranking - Radar/Bar Chart */}
                    <div className="col-lg-6">
                        <div className="card b-none shadow-premium rounded-5 overflow-hidden bg-white h-100 p-4 p-lg-5">
                            <h5 className="fw-black text-dark mb-1 uppercase tracking-tight text-center">Department SLA Compliance</h5>
                            <p className="extra-small text-muted fw-bold uppercase opacity-50 mb-5 text-center">Service level agreement adherence leaderboard</p>
                            <div style={{ width: '100%', height: '350px', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deptPerformance} layout="vertical" margin={{ left: 30, right: 30 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#1e293b' }} width={100} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="slaCompliance" radius={[0, 20, 20, 0]} barSize={20}>
                                            {deptPerformance.map((entry, index) => (
                                                <Cell key={index} fill={entry.slaCompliance > 85 ? '#10B981' : '#F59E0B'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Row: Strategy Report Download */}
                <div className="card border-0 shadow-premium rounded-5 bg-primary p-5 text-white overflow-hidden position-relative" style={{ backgroundColor: PRIMARY_COLOR }}>
                    <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                        <div className="col-lg-8">
                            <h2 className="fw-black mb-3 uppercase display-6">Strategic Intelligence Report</h2>
                            <p className="fw-bold opacity-75 mb-0 pe-lg-5">
                                Consolidated audit of city operations including ward-level health matrix, department efficiency rankings,
                                and 30-day volume trends. Authorized for executive review only.
                            </p>
                        </div>
                        <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                            <div className="d-flex gap-3 justify-content-lg-end">
                                <button onClick={() => handleDownloadReport('pdf')} className="btn btn-white bg-white rounded-pill px-5 py-3 extra-small fw-black shadow-lg border-0 d-flex align-items-center gap-3 transition-all hover-scale-105" style={{ color: PRIMARY_COLOR }}>
                                    <Download size={20} /> ARCHIVE PDF
                                </button>
                                <button onClick={() => handleDownloadReport('excel')} className="btn btn-white bg-white rounded-pill px-4 py-3 shadow-lg border-0 transition-all hover-scale-105" style={{ color: PRIMARY_COLOR }}>
                                    <FileSpreadsheet size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <Zap size={250} className="position-absolute opacity-10" style={{ right: '-50px', bottom: '-50px' }} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-analytics-premium { font-family: 'Outfit', sans-serif; position: relative; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up-tiny:hover { transform: translateY(-5px); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-scale-105:hover { transform: scale(1.05); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .tabular-nums { font-variant-numeric: tabular-nums; }
                
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
                
                .tactical-dividers {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    pointer-events: none;
                }
                
                .vertical-divider {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to bottom, transparent, rgba(23, 52, 112, 0.03), transparent);
                }
            `}} />
        </div >
    );
};

export default AdminAnalytics;
