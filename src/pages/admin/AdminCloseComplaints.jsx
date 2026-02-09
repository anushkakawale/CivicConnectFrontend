/**
 * Professional Admin Close Complaints Console
 * Focused view for finalizing and archiving resolved grievances.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, CheckCircle, Activity, Timer, Layers,
    RefreshCw, ArrowUpDown, Calendar, Eye, ShieldAlert
} from 'lucide-react';

import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { calculateSlaStatus } from '../../utils/slaUtils';

const AdminCloseComplaints = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const PRIMARY_COLOR = '#173470';

    // State
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getReadyToClose();
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data.content || data.data || []);
            setComplaints(list);
        } catch (error) {
            console.error('Data retrieval failed:', error);
            showToast('Unable to synchronize complaint records', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickClose = async (id, e) => {
        e.stopPropagation();
        try {
            setProcessing(true);
            await apiService.admin.closeComplaint(id, { closureNotes: 'Final closure finalized by administrator.' });
            showToast(`Complaint #${id} closed successfully`, 'success');
            fetchComplaints();
        } catch (error) {
            showToast('Failed to close complaint', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleBulkClose = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to close ${selectedIds.length} complaints?`)) return;

        try {
            setProcessing(true);
            await Promise.all(selectedIds.map(id =>
                apiService.admin.closeComplaint(id, { closureNotes: 'Bulk closure finalized by administrator.' })
            ));
            showToast(`${selectedIds.length} complaints closed successfully`, 'success');
            setSelectedIds([]);
            fetchComplaints();
        } catch (error) {
            showToast('Bulk closure failed for some complaints', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const toggleSelection = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === sortedComplaints.length && sortedComplaints.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedComplaints.map(c => c.complaintId || c.id));
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedComplaints = useMemo(() => {
        let filtered = [...complaints];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.title?.toLowerCase().includes(lower) ||
                (c.complaintId && c.complaintId.toString().includes(lower))
            );
        }

        return filtered.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'complaintId' || sortConfig.key === 'id') {
                aVal = Number(a.complaintId || a.id);
                bVal = Number(b.complaintId || b.id);
            } else if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
                aVal = new Date(a[sortConfig.key]).getTime();
                bVal = new Date(b[sortConfig.key]).getTime();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [complaints, sortConfig, searchTerm]);

    return (
        <div className="admin-close-complaints-view min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Closure Console"
                userName="Finalize Issues"
                wardName="Audit & Archive"
                subtitle="Review resolved complaints for final closure"
                icon={CheckCircle}
                actions={
                    <button onClick={fetchComplaints} className="btn btn-white bg-white rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center transition-all hover-shadow-md" style={{ width: '42px', height: '42px', color: PRIMARY_COLOR }}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-30px' }}>
                {/* Stats Ledger - Simplified for Closure Context */}
                <div className="row g-4 mb-5">
                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="card border-0 shadow-premium rounded-4 p-4 text-white bg-success transition-all hover-up">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="rounded-4 p-3 shadow-sm bg-white bg-opacity-20 text-white">
                                    <CheckCircle size={26} />
                                </div>
                                <div className="extra-small fw-black text-white uppercase opacity-60">Ready for Closure</div>
                            </div>
                            <h1 className="fw-black mb-1 display-5">{sortedComplaints.length}</h1>
                            <p className="extra-small text-white fw-black uppercase mb-0">Resolved Cases</p>
                        </div>
                    </div>
                </div>

                {/* Filtration Command Bar */}
                <div className="card border-0 shadow-premium rounded-4 bg-white mb-5 transition-all">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-xl-6">
                                <div className="input-group overflow-hidden border bg-light rounded-pill px-4">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><Search size={20} className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                        placeholder="Search resolved cases..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-xl-6 text-end">
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={handleBulkClose}
                                        disabled={processing}
                                        className="btn btn-success rounded-pill px-4 py-2 fw-black extra-small tracking-widest text-uppercase shadow-lg animate-slideDown"
                                    >
                                        {processing ? <RefreshCw size={14} className="animate-spin me-2" /> : <CheckCircle size={14} className="me-2" />}
                                        Close Selected ({selectedIds.length})
                                    </button>
                                )}
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
                                    <th className="px-5 py-4 border-0">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input shadow-none"
                                                type="checkbox"
                                                checked={selectedIds.length === sortedComplaints.length && sortedComplaints.length > 0}
                                                onChange={toggleAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest cursor-pointer" onClick={() => handleSort('complaintId')}>
                                        ID <ArrowUpDown size={14} className="ms-2 opacity-30" />
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest cursor-pointer" onClick={() => handleSort('title')}>
                                        Details <ArrowUpDown size={14} className="ms-2 opacity-30" />
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest cursor-pointer" onClick={() => handleSort('updatedAt')}>
                                        Resolved On <ArrowUpDown size={14} className="ms-2 opacity-30" />
                                    </th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Department</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">SLA Status</th>
                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase">Verification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <RefreshCw size={48} className="animate-spin text-primary opacity-30 mb-3 mx-auto" style={{ color: PRIMARY_COLOR }} />
                                            <p className="extra-small fw-black text-muted uppercase">Accessing Registry...</p>
                                        </td>
                                    </tr>
                                ) : sortedComplaints.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="rounded-circle bg-light d-inline-flex p-4 mb-4">
                                                <Layers size={48} className="text-muted opacity-20" />
                                            </div>
                                            <h6 className="fw-black text-dark uppercase mb-1">No Resolved Records</h6>
                                            <p className="extra-small text-muted fw-bold opacity-60">All resolved complaints have been processed.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedComplaints.map(c => (
                                        <tr
                                            key={c.complaintId || c.id}
                                            className={`cursor-pointer transition-all ${selectedIds.includes(c.complaintId || c.id) ? 'bg-primary bg-opacity-5' : 'hover-light'}`}
                                            onClick={() => navigate(`/admin/complaints/${c.complaintId || c.id}`)}
                                        >
                                            <td className="px-5" onClick={(e) => e.stopPropagation()}>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input shadow-none"
                                                        type="checkbox"
                                                        checked={selectedIds.includes(c.complaintId || c.id)}
                                                        onChange={(e) => toggleSelection(c.complaintId || c.id, e)}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <span className="fw-black text-primary extra-small" style={{ color: PRIMARY_COLOR }}>#{c.complaintId || c.id}</span>
                                            </td>
                                            <td>
                                                <div className="fw-black text-dark small mb-1 text-truncate uppercase tracking-tight" style={{ maxWidth: '300px' }}>{c.title}</div>
                                            </td>
                                            <td>
                                                <div className="extra-small text-muted fw-bold uppercase opacity-50 d-flex align-items-center gap-2">
                                                    <Calendar size={12} /> {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="extra-small text-muted fw-bold uppercase opacity-50">{c.departmentName || 'GENERAL'}</div>
                                            </td>
                                            <td>
                                                {(() => {
                                                    const sla = calculateSlaStatus(c);
                                                    return (
                                                        <div className={`badge-rect-blue px-2 py-1 extra-small ${sla?.breached ? 'bg-danger text-white' : 'bg-success text-white'}`} style={{ fontSize: '9px' }}>
                                                            {sla?.breached ? 'SLA BREACHED' : 'WITHIN SLA'}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-5 text-end">
                                                <button
                                                    disabled={processing}
                                                    onClick={(e) => handleQuickClose(c.complaintId || c.id, e)}
                                                    className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm border transition-all hover-up-tiny fw-bold extra-small text-success d-flex align-items-center gap-2 ms-auto"
                                                >
                                                    {processing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                    QUICK CLOSE
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

            <style dangerouslySetInnerHTML={{
                __html: `
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-up-tiny:hover { transform: translateY(-3px); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default AdminCloseComplaints;
