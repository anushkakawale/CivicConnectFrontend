/**
 * Professional Admin Complaints Management Console
 * State-of-the-art UI for granular control over citywide grievances.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, Filter, MoreHorizontal, Eye,
    CheckCircle, AlertCircle, Building2,
    MapPin, Clock, ChevronDown, RefreshCw,
    ArrowUpDown, ShieldAlert, Navigation,
    Filter as FilterIcon, Calendar, CheckSquare,
    Layers, Zap, ArrowRight, Activity, Timer, X,
    ChevronRight, ChevronLeft, Image as ImageIcon
} from 'lucide-react';

import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminComplaints = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const PRIMARY_COLOR = '#173470';

    // State
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || 'ALL',
        wardId: searchParams.get('ward') || 'ALL',
        departmentId: searchParams.get('department') || 'ALL',
        priority: searchParams.get('priority') || 'ALL',
        searchTerm: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [viewMode, setViewMode] = useState('ALL');
    const [selectedImage, setSelectedImage] = useState(null);

    // Master Data
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchAuxData();
    }, []);

    useEffect(() => {
        fetchComplaints();

        // Real-time synchronization interval (15 seconds)
        const pollInterval = setInterval(() => {
            fetchComplaints(false); // Silent refresh
        }, 15000);

        return () => clearInterval(pollInterval);
    }, [filters, sortConfig, viewMode]);

    const fetchAuxData = async () => {
        try {
            const [wardsRes, deptsRes] = await Promise.all([
                apiService.common.getWards(),
                apiService.common.getDepartments()
            ]);
            setWards(wardsRes.data || wardsRes || []);
            setDepartments(deptsRes.data || deptsRes || []);
        } catch (err) {
            console.error('Master data sync failed:', err);
        }
    };

    const fetchComplaints = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            let response;
            const params = {
                page: 0,
                size: 200,
                status: filters.status !== 'ALL' ? filters.status : undefined,
                wardId: filters.wardId !== 'ALL' ? filters.wardId : undefined,
                departmentId: filters.departmentId !== 'ALL' ? filters.departmentId : undefined,
                priority: filters.priority !== 'ALL' ? filters.priority : undefined
            };

            if (viewMode === 'PENDING_CLOSURE') {
                response = await apiService.admin.getReadyToClose();
            } else if (filters.searchTerm) {
                response = await apiService.admin.searchComplaints({ ...params, query: filters.searchTerm });
            } else {
                response = await apiService.admin.getComplaints(params);
            }

            const data = response.data || response;
            const list = data.content || data.data || (Array.isArray(data) ? data : []);
            setComplaints(list);
        } catch (error) {
            console.error('Data retrieval failed:', error);
            showToast('Unable to synchronize complaint records', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key !== 'searchTerm') {
            const newParams = new URLSearchParams(searchParams);
            if (value === 'ALL') newParams.delete(key === 'wardId' ? 'ward' : key === 'departmentId' ? 'department' : key);
            else newParams.set(key === 'wardId' ? 'ward' : key === 'departmentId' ? 'department' : key, value);
            setSearchParams(newParams);
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedComplaints = useMemo(() => {
        return [...complaints].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'complaintId' || sortConfig.key === 'id') {
                aVal = Number(a.complaintId || a.id);
                bVal = Number(b.complaintId || b.id);
            } else if (sortConfig.key === 'createdAt') {
                aVal = new Date(a.createdAt).getTime();
                bVal = new Date(b.createdAt).getTime();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [complaints, sortConfig]);

    const stats = useMemo(() => ({
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'APPROVED').length,
        active: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        breached: complaints.filter(c => c.slaStatus === 'BREACHED').length
    }), [complaints]);

    return (
        <div className="admin-complaints-view min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Complaints List"
                userName="Manage Issues"
                wardName="Official View"
                subtitle="Review and manage all complaints across the city"
                icon={ShieldAlert}
                actions={
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-1 rounded-pill shadow-sm border d-flex gap-1">
                            {['ALL', 'PENDING_CLOSURE'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`btn rounded-pill px-4 py-1.5 extra-small fw-black transition-all ${viewMode === mode ? 'bg-primary text-white shadow-sm' : 'text-muted opacity-60'}`}
                                    style={viewMode === mode ? { backgroundColor: PRIMARY_COLOR } : {}}
                                >
                                    {mode.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <button onClick={fetchComplaints} className="btn btn-white bg-white rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center transition-all hover-shadow-md" style={{ width: '42px', height: '42px', color: PRIMARY_COLOR }}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-30px' }}>
                {/* Stats Ledger */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Complaints', value: stats.total, icon: Layers, color: PRIMARY_COLOR },
                        { label: 'Ready to Close', value: stats.resolved, icon: CheckCircle, color: '#10B981' },
                        { label: 'In Progress', value: stats.active, icon: Activity, color: '#6366F1' },
                        { label: 'Overdue', value: stats.breached, icon: Timer, color: '#EF4444' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-12 col-sm-6 col-lg-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 p-lg-5 transition-all hover-up bg-white">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="rounded-4 p-3 shadow-sm" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
                                        <s.icon size={26} />
                                    </div>
                                    <div className="extra-small fw-black text-muted uppercase opacity-40">Live Sync</div>
                                </div>
                                <h1 className="fw-black mb-1 display-5 text-dark">{s.value}</h1>
                                <p className="extra-small text-muted fw-black uppercase mb-0">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtration Command Bar */}
                <div className="card border-0 shadow-premium rounded-4 bg-white mb-5 transition-all">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-xl-4">
                                <div className="input-group overflow-hidden border bg-light rounded-pill px-4">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><Search size={20} className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                        placeholder="Search by ID, keyword, or user..."
                                        value={filters.searchTerm}
                                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-xl-8">
                                <div className="d-flex gap-3 flex-wrap justify-content-xl-end">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="extra-small fw-black text-muted uppercase opacity-40">Filters:</span>
                                        <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-bold shadow-sm pointer-pointer" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                                            <option value="ALL">ALL STATUS</option>
                                            <option value="PENDING">PENDING</option>
                                            <option value="IN_PROGRESS">IN PROGRESS</option>
                                            <option value="RESOLVED">RESOLVED</option>
                                            <option value="CLOSED">CLOSED</option>
                                        </select>
                                    </div>
                                    <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-bold shadow-sm pointer-pointer" value={filters.wardId} onChange={e => handleFilterChange('wardId', e.target.value)}>
                                        <option value="ALL">ALL WARDS</option>
                                        {wards.map(w => <option key={w.wardId || w.id} value={w.wardId || w.id}>{w.areaName?.toUpperCase()}</option>)}
                                    </select>
                                    <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-bold shadow-sm pointer-pointer" value={filters.departmentId} onChange={e => handleFilterChange('departmentId', e.target.value)}>
                                        <option value="ALL">ALL UNITS</option>
                                        {departments.map(d => <option key={d.departmentId || d.id} value={d.departmentId || d.id}>{d.departmentName?.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Master Records Ledger */}
                <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest cursor-pointer" onClick={() => handleSort('complaintId')}>
                                        Reference ID
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Preview</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest cursor-pointer" onClick={() => handleSort('title')}>
                                        Specification <ArrowUpDown size={14} className="ms-2 opacity-30" />
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest cursor-pointer" onClick={() => handleSort('priority')}>
                                        Priority <ArrowUpDown size={14} className="ms-2 opacity-30" />
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Assigned To</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <RefreshCw size={48} className="animate-spin text-primary opacity-30 mb-3 mx-auto" style={{ color: PRIMARY_COLOR }} />
                                            <p className="extra-small fw-black text-muted uppercase">Accessing Registry...</p>
                                        </td>
                                    </tr>
                                ) : sortedComplaints.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="rounded-circle bg-light d-inline-flex p-4 mb-4">
                                                <Layers size={48} className="text-muted opacity-20" />
                                            </div>
                                            <h6 className="fw-black text-dark uppercase mb-1">No Records Found</h6>
                                            <p className="extra-small text-muted fw-bold opacity-60">Try adjusting your filtration parameters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedComplaints.map(c => (
                                        <tr key={c.complaintId || c.id} className="cursor-pointer transition-all hover-light" onClick={() => navigate(`/admin/complaints/${c.complaintId || c.id}`)}>
                                            <td className="ps-5">
                                                <span className="badge bg-light text-primary border rounded-pill px-3 py-1 extra-small fw-bold" style={{ color: PRIMARY_COLOR }}>#{c.complaintId || c.id}</span>
                                            </td>
                                            <td>
                                                <div className="rounded-3 border bg-light overflow-hidden d-flex align-items-center justify-content-center bg-white shadow-sm hover-scale-110 transition-all pointer-pointer" style={{ width: '48px', height: '48px' }} onClick={(e) => { e.stopPropagation(); c.images?.[0] && setSelectedImage(c.images[0]); }}>
                                                    {c.images && c.images.length > 0 ? (
                                                        <img src={apiService.getImageUrl(c.images[0].imageUrl || c.images[0].path, c.complaintId || c.id)} className="w-100 h-100 object-fit-cover" alt="preview" />
                                                    ) : (
                                                        <ImageIcon size={16} className="text-muted opacity-30" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-black text-dark small mb-1 text-truncate uppercase tracking-tight" style={{ maxWidth: '280px' }}>{c.title}</div>
                                                <div className="extra-small text-muted fw-bold opacity-50 uppercase d-flex align-items-center gap-2">
                                                    <Calendar size={12} /> {new Date(c.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={`badge rounded-pill px-3 py-1.5 extra-small fw-black ${c.priority === 'CRITICAL' ? 'bg-danger text-white' :
                                                    c.priority === 'HIGH' ? 'bg-warning text-dark' :
                                                        'bg-light text-dark border'
                                                    }`}>
                                                    {c.priority || 'NORMAL'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column gap-1">
                                                    <div className="extra-small fw-black text-dark text-uppercase tracking-tight">{c.wardName || 'CENTRAL'}</div>
                                                    <div className="extra-small text-muted fw-bold uppercase opacity-50">{c.departmentName || 'GENERAL'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column gap-2">
                                                    <StatusBadge status={c.status} size="sm" />
                                                    {c.slaStatus === 'BREACHED' && (
                                                        <span className="extra-small fw-black px-2 py-0.5 rounded-pill bg-danger text-white text-center animate-pulse">BREACH</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 text-end">
                                                <button className="btn btn-white bg-white rounded-circle shadow-sm border p-2 transition-all hover-up-tiny">
                                                    <Eye size={18} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Premium Strategic Lightbox */}
            {selectedImage && (
                <div
                    className="modal-overlay d-flex align-items-center justify-content-center p-4 animate-fadeIn"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.98)', zIndex: 9999, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="position-absolute top-0 end-0 p-4 mt-2 me-2">
                        <button className="btn btn-white circ-white shadow-lg border-0 hover-scale-110 transition-all" onClick={() => setSelectedImage(null)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="position-relative animate-zoomIn" onClick={e => e.stopPropagation()}>
                        <div className="rounded-4 overflow-hidden shadow-2xl border border-white border-opacity-10 bg-dark" style={{ maxWidth: '90vw', maxHeight: '85vh' }}>
                            <img
                                src={extractImageUrl(selectedImage, selectedImage.complaintId || selectedImage.id)}
                                className="img-fluid d-block"
                                style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxHeight: '85vh' }}
                                alt="Official Documentation"
                            />
                            <div className="bg-dark p-4 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="circ-white bg-opacity-10" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <ShieldCheck size={20} className="text-success" />
                                    </div>
                                    <div>
                                        <div className="extra-small fw-black text-white uppercase tracking-widest">AUTHENTICATED EVIDENCE</div>
                                        <div className="extra-small text-white text-opacity-40 uppercase fw-bold tracking-tight">TIMELOCK: {new Date(selectedImage.createdAt || Date.now()).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-light rounded-pill px-4 extra-small fw-black uppercase tracking-widest border-2" onClick={() => window.open(extractImageUrl(selectedImage, selectedImage.complaintId || selectedImage.id), '_blank')}>
                                        FULL RESOLUTION
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-up-tiny:hover { transform: translateY(-3px); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                /* New styles for image modal and hover effects */
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-scale-110:hover { transform: scale(1.1); }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                .animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .object-fit-cover { object-fit: cover; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2000; }
                .badge-rect-blue { background: #1254AF; color: white; padding: 2px 8px; font-weight: 900; letter-spacing: 0.05em; border-radius: 4px; border: 1px solid #0d3d82; text-transform: uppercase; }
                .badge-rect-white { background: white; color: #1254AF; padding: 2px 8px; font-weight: 900; letter-spacing: 0.05em; border-radius: 4px; border: 2px solid #1254AF; text-transform: uppercase; }
            `}} />
        </div>
    );
};
export default AdminComplaints;
