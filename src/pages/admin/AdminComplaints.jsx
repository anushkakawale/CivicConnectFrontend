/**
 * Professional Admin Complaints Management Console
 * State-of-the-art UI for granular control over citywide grievances.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search, Filter, MoreHorizontal, Eye,
    CheckCircle, AlertCircle, Building2,
    MapPin, Clock, ChevronDown, RefreshCw,
    ArrowUpDown, ShieldAlert, Navigation,
    Filter as FilterIcon, Calendar, CheckSquare,
    Layers, Zap, ArrowRight, Activity, Timer, X,
    ChevronRight, ChevronLeft, Image as ImageIcon,
    Target, ShieldCheck, Lock
} from 'lucide-react';

import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { getImageUrl, extractImageUrl } from '../../utils/imageUtils';

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
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closeRemarks, setCloseRemarks] = useState('');
    const [selectedItemToClose, setSelectedItemToClose] = useState(null);

    const handleCloseComplaint = async () => {
        if (!closeRemarks.trim()) {
            showToast('Please provide closure remarks.', 'warning');
            return;
        }
        try {
            await apiService.admin.closeComplaint(selectedItemToClose, { remarks: closeRemarks });
            showToast('Complaint closed and archived successfully.', 'success');
            setShowCloseModal(false);
            setCloseRemarks('');
            fetchComplaints();
        } catch (error) {
            showToast('Record archival failed. Verify administrative permissions.', 'error');
        }
    };

    // Master Data
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);

    const fetchAuxData = useCallback(async () => {
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
    }, []);

    const fetchComplaints = useCallback(async (showLoading = true) => {
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
                response = await apiService.admin.getPendingClosures();
            } else if (viewMode === 'ARCHIVED_HISTORY') {
                response = await apiService.admin.getClosedHistory(params);
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
    }, [filters, viewMode, showToast]);

    useEffect(() => {
        fetchAuxData();
    }, [fetchAuxData]);

    useEffect(() => {
        fetchComplaints();

        // Real-time synchronization interval (15 seconds)
        const pollInterval = setInterval(() => {
            fetchComplaints(false); // Silent refresh
        }, 15000);

        return () => clearInterval(pollInterval);
    }, [fetchComplaints]);

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

    const userName = localStorage.getItem('name') || "Administrator";

    return (
        <div className="admin-operations-hub min-vh-100 pb-5">
            <DashboardHeader
                portalName="PMC OPERATIONAL REGISTRY"
                userName={userName}
                wardName="PMC CENTRAL HQ"
                subtitle="Citywide grievances ledger with granular status tracking"
                icon={Target}
                actions={
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-10 border border-white border-opacity-10 rounded-pill p-1 d-flex align-items-center gap-1 shadow-sm px-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {['ALL', 'PENDING_CLOSURE', 'ARCHIVED_HISTORY'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`btn rounded-pill px-4 py-1.5 extra-small fw-black uppercase tracking-widest transition-all border-0 ${viewMode === mode ? 'bg-white text-primary shadow-sm' : 'text-white opacity-40 hover-opacity-100'}`}
                                >
                                    {mode === 'ARCHIVED_HISTORY' ? 'ARCHIVE' : mode.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => fetchComplaints()} className="btn btn-white bg-white rounded-circle shadow-premium border-0 p-0 d-flex align-items-center justify-content-center transition-all hover-up" style={{ width: '42px', height: '42px', color: PRIMARY_COLOR }}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                }
            />

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>

                {/* Stats Ledger */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Complaints', value: stats.total, icon: Layers, color: PRIMARY_COLOR, trend: 'LIVE MATRIX' },
                        { label: 'Ready to Close', value: stats.resolved, icon: CheckCircle, color: '#10B981', trend: 'AUDIT REQD' },
                        { label: 'In Progress', value: stats.active, icon: Activity, color: '#6366F1', trend: 'FIELD OPS' },
                        { label: 'Overdue', value: stats.breached, icon: Timer, color: '#EF4444', trend: 'CRITICAL' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-12 col-sm-6 col-lg-3">
                            <div className="card b-none shadow-premium p-4 h-100 rounded-4 border-0 transition-all hover-up-tiny bg-white overflow-hidden position-relative border-top border-4" style={{ borderTopColor: s.color }}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="rounded-4 d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale"
                                        style={{ width: '46px', height: '46px', backgroundColor: s.color, color: '#FFFFFF' }}>
                                        <s.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <span className="extra-small fw-black px-2 py-0.5 rounded-pill text-muted opacity-40 lowercase tracking-widest">{s.trend}</span>
                                </div>
                                <h1 className="fw-black mb-0 text-dark" style={{ fontSize: '2.4rem', letterSpacing: '-1.5px' }}>{s.value}</h1>
                                <p className="extra-small fw-black text-muted text-uppercase mb-0 opacity-40">{s.label}</p>
                                <div className="position-absolute end-0 bottom-0 opacity-05 mb-n2 me-n2">
                                    <s.icon size={80} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtration Command Bar */}
                <div className="card border-0 shadow-premium rounded-4 bg-white mb-5">
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
                                        <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-bold shadow-sm" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                                            <option value="ALL">ALL STATUS</option>
                                            <option value="SUBMITTED">FILED</option>
                                            <option value="ASSIGNED">DISPATCHED</option>
                                            <option value="IN_PROGRESS">IN OPERATIONS</option>
                                            <option value="RESOLVED">MISSION SUCCESS</option>
                                            <option value="APPROVED">VERIFIED</option>
                                            <option value="REOPENED">REACTIVATED</option>
                                            <option value="REJECTED">RETURNED TO FIELD</option>
                                            <option value="CLOSED">ARCHIVED</option>
                                        </select>
                                    </div>
                                    <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-bold shadow-sm" value={filters.wardId} onChange={e => handleFilterChange('wardId', e.target.value)}>
                                        <option value="ALL">ALL WARDS</option>
                                        {wards.map(w => <option key={w.wardId || w.id} value={w.wardId || w.id}>{w.areaName?.toUpperCase()}</option>)}
                                    </select>
                                    <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-bold shadow-sm" value={filters.departmentId} onChange={e => handleFilterChange('departmentId', e.target.value)}>
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
                                        Case ID
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Proof of Work</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest cursor-pointer" onClick={() => handleSort('title')}>
                                        Complaint Details <ArrowUpDown size={14} className="ms-2 opacity-30" />
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Time Status</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Ward & Dept</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Progress</th>
                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && complaints.length === 0 ? (
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
                                    sortedComplaints.map(c => {
                                        const cId = c.complaintId || c.id;
                                        const isBreached = c.slaStatus === 'BREACHED';

                                        return (
                                            <tr
                                                key={cId}
                                                className="cursor-pointer border-bottom hover-bg-light transition-all"
                                                onClick={() => navigate(`/admin/complaints/${cId}`)}
                                            >
                                                <td className="ps-5 py-4">
                                                    <span className="badge bg-light text-primary border rounded-pill px-3 py-1 extra-small fw-black" style={{ color: PRIMARY_COLOR }}>#{cId}</span>
                                                    <div className={`p-1 mt-1 rounded-circle d-block mx-auto ${c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'bg-danger animate-pulse' : 'bg-muted opacity-20'}`} style={{ width: '8px', height: '8px' }}></div>
                                                </td>
                                                <td className="py-4">
                                                    {(c.images?.length > 0 || c.imageUrls?.length > 0) ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="position-relative">
                                                                <div
                                                                    className="rounded-3 overflow-hidden border bg-light shadow-sm d-flex align-items-center justify-content-center"
                                                                    style={{ width: '48px', height: '48px' }}
                                                                    onClick={(e) => { e.stopPropagation(); c.images?.[0] && setSelectedImage({ ...c.images[0], complaintId: cId }); }}
                                                                >
                                                                    <img
                                                                        src={extractImageUrl(c.images?.[0] || c.imageUrls?.[0], cId)}
                                                                        alt="Proof"
                                                                        className="w-100 h-100 object-fit-cover transition-all hover-scale-110"
                                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=DOC'; }}
                                                                    />
                                                                </div>
                                                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary border border-white extra-small" style={{ fontSize: '0.5rem', padding: '0.2rem 0.4rem' }}>
                                                                    {(c.images?.length || c.imageUrls?.length)}
                                                                </span>
                                                            </div>
                                                            <span className="extra-small fw-black text-success uppercase tracking-widest d-none d-xl-inline" style={{ fontSize: '0.55rem' }}>EVIDENCE</span>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center gap-2 opacity-30">
                                                            <div className="rounded-3 border border-2 border-dashed d-flex align-items-center justify-content-center bg-white" style={{ width: '48px', height: '48px' }}>
                                                                <ImageIcon size={18} />
                                                            </div>
                                                            <span className="extra-small fw-black uppercase tracking-widest d-none d-xl-inline" style={{ fontSize: '0.55rem' }}>NO PROOF</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <div className="fw-black text-dark small mb-1 text-truncate uppercase tracking-tight" style={{ maxWidth: '280px' }}>{c.title || 'CLASSIFIED GORDON'}</div>
                                                    <div className="extra-small text-muted fw-black uppercase opacity-50 d-flex align-items-center gap-2">
                                                        <Calendar size={12} /> {new Date(c.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="d-flex flex-column gap-1">
                                                        <div className="extra-small fw-black text-muted uppercase mb-1 d-flex align-items-center gap-1">
                                                            <Clock size={12} className="opacity-40" />
                                                            {c.status === 'CLOSED' ? (
                                                                <span className="text-success">FULFILLED</span>
                                                            ) : (
                                                                <span className={isBreached ? 'text-danger' : 'text-primary'}>
                                                                    {isBreached ? `OVERDUE ${Math.abs(c.remainingHours || 0)}H` : `${c.remainingHours || 24}H REMAINING`}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="extra-small fw-bold text-muted opacity-40 uppercase" style={{ fontSize: '0.6rem' }}>
                                                            {c.status === 'CLOSED' ? `Latency: ${c.totalElapsedHours || 0}H` : `Target: ${new Date(c.slaDeadline || Date.now() + 86400000).toLocaleTimeString()}`}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="d-flex flex-column gap-1">
                                                        <div className="extra-small fw-black text-primary uppercase d-flex align-items-center gap-1" style={{ color: PRIMARY_COLOR }}>
                                                            <MapPin size={10} /> {c.wardName || 'CENTRAL PMC'}
                                                        </div>
                                                        <div className="extra-small fw-bold text-muted uppercase d-flex align-items-center gap-1 opacity-60">
                                                            <Building2 size={10} /> {c.departmentName?.replace(/_/g, ' ') || 'GENERAL'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="d-none d-xxl-block progress rounded-pill bg-light border shadow-inner" style={{ height: '6px', width: '60px' }}>
                                                            <div
                                                                className="progress-bar rounded-pill transition-all"
                                                                style={{
                                                                    width: c.status === 'CLOSED' ? '100%' : c.status === 'RESOLVED' ? '85%' : c.status === 'IN_PROGRESS' ? '50%' : '20%',
                                                                    backgroundColor: c.status === 'CLOSED' ? '#10B981' : PRIMARY_COLOR
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <StatusBadge status={c.status} size="sm" />
                                                    </div>
                                                </td>
                                                <td className="pe-5 py-4 text-end">
                                                    <div className="d-flex align-items-center justify-content-end gap-2">
                                                        {c.status === 'APPROVED' && (
                                                            <button
                                                                className="btn btn-dark rounded-pill px-3 py-2 extra-small fw-black d-flex align-items-center gap-2 border-0 shadow-sm transition-all hover-up-tiny"
                                                                style={{ backgroundColor: PRIMARY_COLOR }}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedItemToClose(cId); setShowCloseModal(true); }}
                                                            >
                                                                <Lock size={14} /> CLOSE
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-white bg-white rounded-circle shadow-sm border p-2 transition-all hover-up-tiny"
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/complaints/${cId}`); }}
                                                        >
                                                            <ChevronRight size={18} className="text-muted" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Premium Strategic Lightbox */}
                {selectedImage && (
                    <div
                        className="modal-overlay d-flex align-items-center justify-content-center p-4 animate-fadeIn"
                        style={{ backgroundColor: 'rgba(15, 23, 42, 0.98)', zIndex: 9999 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="position-absolute top-0 end-0 p-4">
                            <button className="btn btn-white circ-white shadow-lg border-0 hover-scale-110 transition-all rounded-circle p-2" onClick={() => setSelectedImage(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="position-relative animate-zoomIn" onClick={e => e.stopPropagation()}>
                            <div className="rounded-4 overflow-hidden shadow-2xl border border-white border-opacity-10 bg-dark" style={{ maxWidth: '90vw', maxHeight: '85vh' }}>
                                <img
                                    src={extractImageUrl(selectedImage, selectedImage.complaintId)}
                                    className="img-fluid d-block"
                                    style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxHeight: '80vh' }}
                                    alt="Official Documentation"
                                />
                                <div className="bg-dark p-4 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                            <ShieldCheck size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="extra-small fw-black text-white uppercase tracking-widest">AUTHENTICATED EVIDENCE</div>
                                            <div className="extra-small text-white text-opacity-40 uppercase fw-bold tracking-tight">TIMELOCK: {new Date(selectedImage.createdAt || Date.now()).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline-light rounded-pill px-4 extra-small fw-black uppercase tracking-widest border-2" onClick={() => window.open(extractImageUrl(selectedImage, selectedImage.complaintId), '_blank')}>
                                        FULL RESOLUTION
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showCloseModal && (
                    <div className="modal-overlay d-flex align-items-center justify-content-center p-3 animate-fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000 }}>
                        <div className="bg-white rounded-4 shadow-2xl p-4 p-lg-5 w-100 animate-zoomIn" style={{ maxWidth: '600px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle p-2 bg-dark text-white shadow-sm"><Lock size={20} /></div>
                                    <h5 className="fw-black mb-0 uppercase tracking-tight">Final Closure Archive</h5>
                                </div>
                                <button onClick={() => setShowCloseModal(false)} className="btn btn-light rounded-circle p-2 border-0"><X size={20} /></button>
                            </div>
                            <div className="mb-4">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60">Final Closure Notes</label>
                                <textarea
                                    className="form-control border-2 shadow-none extra-small fw-black p-4 rounded-4 bg-light transition-all focus-bg-white"
                                    rows="5"
                                    placeholder="Explain why this case is being closed..."
                                    value={closeRemarks}
                                    onChange={(e) => setCloseRemarks(e.target.value)}
                                    style={{ resize: 'none' }}
                                ></textarea>
                            </div>
                            <div className="d-flex gap-3">
                                <button onClick={() => setShowCloseModal(false)} className="btn btn-light rounded-pill flex-grow-1 py-3 fw-black extra-small border-2 transition-all">ABORT</button>
                                <button onClick={handleCloseComplaint} className="btn btn-primary rounded-pill flex-grow-1 py-3 fw-black extra-small shadow-lg border-0 transition-all hover-up-tiny" style={{ backgroundColor: PRIMARY_COLOR }}>AUTHORIZE CLOSURE</button>
                            </div>
                        </div>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
                .admin-complaints-view { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-up-tiny:hover { transform: translateY(-3px); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-scale-110:hover { transform: scale(1.02); }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                .animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .object-fit-cover { object-fit: cover; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; }
                .pointer-pointer { cursor: pointer; }
                .focus-bg-white:focus { background-color: #FFFFFF !important; border-color: ${PRIMARY_COLOR}20 !important; }

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
                `
                }} />
            </div>
        </div>
    );
};

export default AdminComplaints;
