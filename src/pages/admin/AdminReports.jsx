/**
 * Professional Admin Operational Reports Console
 * State-of-the-art interface for data extraction, institutional auditing, and tactical oversight.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    FileText, Download, Calendar, Search, Filter,
    RefreshCw, CheckCircle, Clock, AlertCircle,
    FileSpreadsheet, FileJson, Printer, ChevronRight,
    Search as SearchIcon, Database, Layers, ArrowRight,
    ArrowUpDown, FileDown, ShieldCheck, Zap, Target,
    Activity, Shield, Globe, MapPin, Building2,
    Trash2, ExternalLink, Filter as FilterIcon, TrendingUp, MessageSquare, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminReports = ({ embedded = false }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('LEDGER');
    const [reportData, setReportData] = useState([]);
    const [trends, setTrends] = useState([]);
    const [wardPerformance, setWardPerformance] = useState([]);
    const [deptPerformance, setDeptPerformance] = useState([]);
    const [categories, setCategories] = useState([]);

    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [filters, setFilters] = useState({ status: 'ALL', searchTerm: '', ward: 'ALL' });
    const PRIMARY_COLOR = '#173470';

    const wards = useMemo(() => {
        const uniqueWards = [...new Set(reportData.map(item => item.wardName).filter(Boolean))];
        return uniqueWards.sort();
    }, [reportData]);

    useEffect(() => {
        fetchAllIntelligence();
    }, [dateRange]);

    const fetchAllIntelligence = async () => {
        try {
            setLoading(true);
            const [complaintsRes, trendsRes, wardRes, deptRes, catRes] = await Promise.all([
                apiService.admin.getComplaints({ ...dateRange, size: 500 }),
                apiService.admin.getTrends(),
                apiService.admin.getWardPerformance(),
                apiService.admin.getDepartmentPerformance(),
                apiService.admin.getCategories()
            ]);

            const cData = complaintsRes.data || complaintsRes;
            setReportData(cData.content || cData.data || (Array.isArray(cData) ? cData : []));
            setTrends(trendsRes.data || trendsRes || []);
            setWardPerformance(wardRes.data || wardRes || []);
            setDeptPerformance(deptRes.data || deptRes || []);
            setCategories(catRes.data || catRes || []);
        } catch (error) {
            console.error('Projected intelligence sync failure:', error);
            showToast('Strategic data synchronization failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format, reportType = 'complaints') => {
        try {
            showToast(`Generating ${format.toUpperCase()} record...`, 'info');
            const response = format === 'pdf'
                ? await apiService.admin.downloadComplaintsPdf(dateRange)
                : await apiService.admin.downloadComplaintsExcel(dateRange);

            const blob = new Blob([response.data || response], {
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PMC_Audit_${reportType}_${dateRange.startDate}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (val) {
            showToast('Extraction failed', 'error');
        }
    };

    const filteredData = reportData.filter(item => {
        const matchesStatus = filters.status === 'ALL' || item.status === filters.status;
        const matchesWard = filters.ward === 'ALL' || item.wardName === filters.ward;
        const cId = item.complaintId || item.id;
        const matchesSearch = cId?.toString().includes(filters.searchTerm) ||
            item.title?.toLowerCase().includes(filters.searchTerm.toLowerCase());
        return matchesStatus && matchesSearch && matchesWard;
    });

    const metrics = useMemo(() => {
        const total = filteredData.length;
        const resolved = filteredData.filter(i => i.status === 'RESOLVED').length;
        const closed = filteredData.filter(i => i.status === 'CLOSED').length;
        const inProgress = filteredData.filter(i => i.status === 'IN_PROGRESS').length;
        const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;
        return { total, resolved, closed, inProgress, resolutionRate };
    }, [filteredData]);

    const [selectedId, setSelectedId] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const openQuickView = async (id) => {
        try {
            setSelectedId(id);
            setShowDetail(true);
            setDetailLoading(true);
            const res = await apiService.complaint.getDetails(id);
            setDetailData(res.data || res);
        } catch (err) {
            showToast('Failed to fetch dossier details', 'error');
            setShowDetail(false);
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className={`admin-reports-premium pb-5 ${embedded ? 'pt-2' : 'min-vh-100'}`}>
            {!embedded && (
                <DashboardHeader
                    portalName="PMC OFFICIAL REPORTS"
                    userName="Report Archive"
                    wardName="Administrative Headquarters"
                    subtitle="Official Complaint Register & Area Efficiency Metrics"
                    icon={Database}
                    actions={
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white bg-opacity-10 border border-white border-opacity-10 rounded-pill p-1 d-flex align-items-center gap-1 shadow-sm px-3 mx-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <Calendar size={14} className="text-white opacity-40" />
                                <input type="date" value={dateRange.startDate} onChange={e => setDateRange(p => ({ ...p, startDate: e.target.value }))} className="bg-transparent border-0 text-white extra-small fw-black py-1 shadow-none outline-none" style={{ colorScheme: 'dark' }} />
                                <ArrowRight size={12} className="text-white opacity-20" />
                                <input type="date" value={dateRange.endDate} onChange={e => setDateRange(p => ({ ...p, endDate: e.target.value }))} className="bg-transparent border-0 text-white extra-small fw-black py-1 shadow-none outline-none" style={{ colorScheme: 'dark' }} />
                            </div>
                            <button onClick={fetchAllIntelligence} className="btn btn-white bg-white rounded-circle shadow-premium border-0 p-0 d-flex align-items-center justify-content-center transition-all hover-up-tiny" style={{ width: '42px', height: '42px' }}>
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: PRIMARY_COLOR }} />
                            </button>
                        </div>
                    }
                />
            )}

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={embedded ? { marginTop: '0', zIndex: 1 } : { marginTop: '-45px', zIndex: 1 }}>
                <div className="tactical-vertical-divider" style={{ left: '25%' }}></div>
                <div className="tactical-vertical-divider" style={{ left: '75%' }}></div>

                <div className="row g-4 mb-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-premium rounded-5 bg-white h-100 p-4 p-xl-5 overflow-hidden position-relative">
                            <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-4 opacity-40">Complaint Trends Over Time</h6>
                            <div style={{ width: '100%', height: '200px', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trends}>
                                        <defs>
                                            <linearGradient id="pulse-gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                                                <stop offset="50%" stopColor="#60A5FA" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#93C5FD" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="count" stroke="#173470" strokeWidth={3} fill="url(#pulse-gradient)" />
                                        <Tooltip contentStyle={{ border: 'none', borderRadius: '12px', background: '#1e293b', color: '#fff' }} itemStyle={{ fontSize: 10, fontWeight: 900 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card b-none shadow-premium rounded-5 bg-primary p-5 text-white h-100 position-relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #2563EB 100%)` }}>
                            <Zap size={150} className="position-absolute opacity-10 text-white" style={{ right: '-30px', bottom: '-30px' }} />
                            <Target size={24} className="mb-3" />
                            <h2 className="fw-black display-5 mb-1 tabular-nums">{metrics.resolutionRate}%</h2>
                            <p className="extra-small fw-black uppercase tracking-widest opacity-60">Completion Rate</p>
                            <div className="mt-4 pt-4 border-top border-white border-opacity-10 d-flex gap-4">
                                <div><h5 className="mb-0 fw-black">{metrics.total}</h5><span className="extra-small opacity-50 uppercase">Tickets</span></div>
                                <div><h5 className="mb-0 fw-black">{metrics.closed}</h5><span className="extra-small opacity-50 uppercase">Closed</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card b-none shadow-premium rounded-5 bg-white overflow-hidden mb-5">
                    <div className="card-header bg-white p-0 border-bottom">
                        <div className="d-flex overflow-auto admin-reports-tabs">
                            {[
                                { id: 'LEDGER', label: 'Case Ledger', icon: Layers, color: '#173470' },
                                { id: 'WARD', label: 'Area Performance', icon: MapPin, color: '#10B981' },
                                { id: 'DEPT', label: 'Department Stats', icon: Activity, color: '#F59E0B' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`btn border-0 rounded-0 px-5 py-4 extra-small fw-black uppercase tracking-widest transition-all d-flex align-items-center gap-2 ${activeTab === tab.id ? 'active-tab' : 'text-muted opacity-60 hover-light'}`}
                                    style={activeTab === tab.id ? {
                                        backgroundColor: 'white',
                                        color: tab.color,
                                        borderBottom: `4px solid ${tab.color}`
                                    } : {}}
                                >
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {activeTab === 'LEDGER' && (
                            <>
                                <div className="p-4 p-xl-5 border-bottom">
                                    <div className="row g-4 align-items-center">
                                        <div className="col-xl-4">
                                            <div className="input-group border bg-light rounded-pill px-4">
                                                <SearchIcon size={16} className="text-muted opacity-40 m-auto" />
                                                <input type="text" className="form-control bg-transparent border-0 py-3 extra-small fw-black uppercase shadow-none" placeholder="SEARCH CASES..."
                                                    value={filters.searchTerm} onChange={e => setFilters(p => ({ ...p, searchTerm: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="col-xl-8 d-flex gap-2 flex-wrap justify-content-xl-end">
                                            <select className="form-select border rounded-pill bg-light extra-small fw-black px-4 py-2 shadow-none w-auto" value={filters.ward} onChange={e => setFilters(p => ({ ...p, ward: e.target.value }))}>
                                                <option value="ALL">ALL AREAS</option>
                                                {wards.map(w => <option key={`ward-filter-${w}`} value={w}>{w.toUpperCase()}</option>)}
                                            </select>
                                            <select className="form-select border rounded-pill bg-light extra-small fw-black px-4 py-2 shadow-none w-auto" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                                                <option value="ALL">ALL STATUSES</option>
                                                <option value="SUBMITTED">RECEIVED</option>
                                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                                <option value="RESOLVED">FIXED</option>
                                                <option value="CLOSED">CLOSED</option>
                                            </select>
                                            <button onClick={() => handleDownload('pdf')} className="btn btn-dark rounded-pill px-4 extra-small fw-black d-flex align-items-center gap-2 shadow-sm border-0"><Download size={14} /> DOWNLOAD PDF</button>
                                            <button onClick={() => handleDownload('excel')} className="btn btn-success rounded-pill px-4 extra-small fw-black d-flex align-items-center gap-2 shadow-sm border-0"><FileSpreadsheet size={14} /> EXCEL SPREADSHEET</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light bg-opacity-30">
                                            <tr>
                                                <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Dossier Account</th>
                                                <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Date Filed</th>
                                                <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Department</th>
                                                <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Area Sector</th>
                                                <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase tracking-widest">Current Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map(item => (
                                                <tr key={`ledger-${item.complaintId || item.id}`} className="cursor-pointer transition-all border-bottom hover-bg-light" onClick={() => openQuickView(item.complaintId || item.id)}>
                                                    <td className="px-5 py-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                                                                <FileText size={18} className="text-primary opacity-40" />
                                                            </div>
                                                            <div>
                                                                <span className="extra-small fw-black text-primary d-block mb-1" style={{ color: PRIMARY_COLOR }}>#{item.complaintId || item.id}</span>
                                                                <span className="extra-small fw-bold text-dark opacity-80 text-truncate d-block" style={{ maxWidth: '280px' }}>{item.title || 'CLASSIFIED COMMAND'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="extra-small fw-black text-muted uppercase mb-1 d-flex align-items-center gap-1">
                                                            <Calendar size={12} className="opacity-30" />
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="extra-small fw-bold text-muted opacity-30 uppercase" style={{ fontSize: '0.6rem' }}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Building2 size={14} className="text-muted opacity-40" />
                                                            <span className="extra-small fw-black text-muted uppercase tracking-tighter">{(item.departmentName || 'GENERAL').replace(/_/g, ' ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <MapPin size={14} className="text-primary opacity-50" />
                                                            <div className="extra-small fw-black text-primary uppercase" style={{ color: PRIMARY_COLOR }}>
                                                                <span className="px-2 py-1 rounded bg-light border border-opacity-10 d-inline-block shadow-sm">
                                                                    {item.wardName || 'CENTRAL SECTOR'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-end">
                                                        <div className="d-flex align-items-center justify-content-end gap-3">
                                                            <StatusBadge status={item.status} size="sm" />
                                                            <ChevronRight size={14} className="text-muted opacity-30" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredData.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-5 text-center text-muted extra-small fw-black uppercase tracking-widest">No matching records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'WARD' && (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light bg-opacity-30">
                                        <tr>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Area Assignment</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Total Volume</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Resolved Cases</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Delayed Cases</th>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-end">Area Health Matrix</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wardPerformance.map((w, idx) => {
                                            const health = Math.round(w.efficiency);
                                            const color = health > 90 ? '#10B981' : health > 75 ? '#F59E0B' : '#EF4444';
                                            return (
                                                <tr key={`ward-perf-${w.ward || idx}`}>
                                                    <td className="px-5"><div className="d-flex align-items-center gap-3"><MapPin size={14} style={{ color: PRIMARY_COLOR }} /><span className="extra-small fw-black text-dark uppercase">{w.ward}</span></div></td>
                                                    <td className="text-center extra-small fw-black text-muted">{w.total}</td>
                                                    <td className="text-center extra-small fw-black text-success">{w.resolved}</td>
                                                    <td className="text-center extra-small fw-black text-danger">{w.breached}</td>
                                                    <td className="px-5 text-end">
                                                        <div className="d-flex align-items-center justify-content-end gap-3">
                                                            <span className="extra-small fw-black" style={{ color }}>{health}%</span>
                                                            <div className="progress rounded-pill bg-light" style={{ height: '4px', width: '80px' }}>
                                                                <div className="progress-bar rounded-pill" style={{ width: `${health}%`, backgroundColor: color }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'DEPT' && (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light bg-opacity-30">
                                        <tr>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Department Unit</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Completed Work</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Active Workload</th>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-end">SLA Compliance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deptPerformance.map((d, idx) => {
                                            const compliance = Math.round(d.slaCompliance);
                                            const color = compliance > 85 ? '#10B981' : compliance > 65 ? '#F59E0B' : '#EF4444';
                                            return (
                                                <tr key={`dept-perf-${d.department || idx}`}>
                                                    <td className="px-5"><div className="d-flex align-items-center gap-3"><Building2 size={14} style={{ color: PRIMARY_COLOR }} /><span className="extra-small fw-black text-dark uppercase">{d.department}</span></div></td>
                                                    <td className="text-center extra-small fw-black text-success">{d.resolved}</td>
                                                    <td className="text-center extra-small fw-black text-muted">{d.total - d.resolved}</td>
                                                    <td className="px-5 text-end">
                                                        <div className="d-flex align-items-center justify-content-end gap-3">
                                                            <span className="extra-small fw-black" style={{ color }}>{compliance}%</span>
                                                            <div className="progress rounded-pill bg-light" style={{ height: '4px', width: '100px' }}>
                                                                <div className="progress-bar rounded-pill" style={{ width: `${compliance}%`, backgroundColor: color }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 rounded-5 shadow-premium text-white d-flex align-items-center justify-content-between overflow-hidden position-relative" style={{ background: `linear-gradient(45deg, ${PRIMARY_COLOR} 0%, #1e293b 100%)` }}>
                    <div className="position-relative" style={{ zIndex: 1 }}>
                        <h4 className="fw-black uppercase mb-2">Internal Compliance Warning</h4>
                        <p className="extra-small fw-bold opacity-60 mb-0">All data extractions are strictly monitored. Any unauthorized reporting is subject to governance audit.</p>
                    </div>
                    <ShieldCheck size={120} className="position-absolute opacity-10 text-white" style={{ right: '-20px', bottom: '-20px' }} />
                    <button className="btn btn-white bg-white rounded-pill px-5 py-3 extra-small fw-black shadow-lg border-0 transition-all hover-scale-105" style={{ color: PRIMARY_COLOR }}>SYSTEM AUDIT LOGS</button>
                </div>
            </div>

            {/* QuickView Modal */}
            {showDetail && (
                <div className="modal-backdrop d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000 }}>
                    <div className="modal-content-premium bg-white rounded-5 shadow-2xl overflow-hidden w-100 position-relative" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowDetail(false)} className="btn btn-white shadow-sm rounded-circle p-2 position-absolute border-0 translate-middle-x" style={{ top: '20px', right: '0', zIndex: 10 }}>
                            <ExternalLink size={20} />
                        </button>

                        {detailLoading ? (
                            <div className="p-5 text-center">
                                <RefreshCw className="animate-spin text-primary mb-3" size={48} />
                                <p className="extra-small fw-black text-muted uppercase tracking-widest">FETCHING DOSSIER INTEL...</p>
                            </div>
                        ) : detailData && (
                            <div className="p-0">
                                <div className="p-5 brand-gradient text-white">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div>
                                            <span className="extra-small fw-black text-white text-opacity-40 uppercase tracking-widest">Case Identifier</span>
                                            <h2 className="fw-black mb-0 display-6">#{detailData.complaintId || detailData.id}</h2>
                                        </div>
                                        <StatusBadge status={detailData.status} />
                                    </div>
                                    <h4 className="fw-black uppercase tracking-tighter mb-0">{detailData.title}</h4>
                                </div>
                                <div className="p-5">
                                    <div className="row g-5">
                                        <div className="col-lg-7">
                                            <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-40">Operational Description</h6>
                                            <p className="fw-bold text-dark mb-5 leading-relaxed">{detailData.description}</p>

                                            {detailData.feedback && (
                                                <div className="p-4 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-20 mb-5">
                                                    <h6 className="extra-small fw-black text-warning uppercase tracking-widest mb-3 d-flex align-items-center gap-2">
                                                        <MessageSquare size={14} /> Citizen Feedback
                                                    </h6>
                                                    <div className="mb-3 text-warning">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <span key={i} style={{ fontSize: '20px' }}>{i < detailData.rating ? '★' : '☆'}</span>
                                                        ))}
                                                    </div>
                                                    <p className="extra-small fw-black text-dark mb-0 italic">"{detailData.feedback}"</p>
                                                </div>
                                            )}

                                            <button onClick={() => navigate(`/admin/complaints/${detailData.complaintId || detailData.id}`)} className="btn btn-primary rounded-pill px-5 py-3 extra-small fw-black shadow-lg border-0 d-flex align-items-center gap-3 transition-all hover-up-tiny" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                FULL AUDIT LOG <ArrowRight size={16} />
                                            </button>
                                        </div>
                                        <div className="col-lg-5">
                                            <div className="vstack gap-4">
                                                <div className="p-4 rounded-4 bg-light border">
                                                    <div className="extra-small fw-black text-muted uppercase opacity-40 mb-3 tracking-widest">Deployment Matrix</div>
                                                    <div className="vstack gap-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle p-2 bg-white shadow-sm text-primary"><Building2 size={16} /></div>
                                                            <div><small className="extra-small text-muted fw-bold d-block">DEPARTMENT</small><span className="small fw-black text-dark uppercase">{detailData.departmentName?.replace(/_/g, ' ')}</span></div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle p-2 bg-white shadow-sm text-success"><MapPin size={16} /></div>
                                                            <div><small className="extra-small text-muted fw-bold d-block">AREA</small><span className="small fw-black text-dark uppercase">{detailData.wardName}</span></div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle p-2 bg-white shadow-sm text-info"><User size={16} /></div>
                                                            <div><small className="extra-small text-muted fw-bold d-block">OPERATIVE</small><span className="small fw-black text-dark uppercase">{detailData.assignedOfficerName || 'UNASSIGNED'}</span></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {detailData.imageUrls?.length > 0 && (
                                                    <div className="rounded-4 overflow-hidden border">
                                                        <img src={detailData.imageUrls[0]} alt="Evidence" className="img-fluid" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-reports-premium { font-family: 'Outfit', sans-serif; position: relative; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-light:hover { background: #f1f5f9; }
                .hover-light-bg:hover { background-color: #f8fafc !important; }
                .hover-scale-105:hover { transform: scale(1.05); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .tabular-nums { font-variant-numeric: tabular-nums; }
                .admin-reports-tabs button { position: relative; }
                .admin-reports-tabs button.active-tab { color: #173470 !important; opacity: 1 !important; }
                .brand-gradient { background: linear-gradient(135deg, #173470 0%, #1e293b 100%); }
                .modal-backdrop { animation: fadeIn 0.3s ease-out; }
                .modal-content-premium { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
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
                
                .tactical-vertical-divider {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to bottom, transparent, rgba(23, 52, 112, 0.04), transparent);
                    pointer-events: none;
                }
            `}} />
        </div>
    );
};

export default AdminReports;
