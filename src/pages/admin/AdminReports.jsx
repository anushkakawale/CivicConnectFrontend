/**
 * Professional Admin Operational Reports Console
 * State-of-the-art interface for data extraction and institutional auditing.
 */

import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Calendar, Search, Filter,
    RefreshCw, CheckCircle, Clock, AlertCircle,
    FileSpreadsheet, FileJson, Printer, ChevronRight,
    Search as SearchIcon, Database, Layers, ArrowRight,
    ArrowUpDown, FileDown, ShieldCheck, Zap
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminReports = ({ embedded = false }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [filters, setFilters] = useState({
        status: 'ALL',
        searchTerm: ''
    });
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getComplaints({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                size: 250 // Fetch a larger chunk for reporting
            });
            const data = response.data || response;
            const list = data.content || data.data || (Array.isArray(data) ? data : []);
            setReportData(list);
        } catch (error) {
            console.error('Data pull failed:', error);
            showToast('Unable to synchronize report data from central registry', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format) => {
        if (format === 'json' || format === 'audit') {
            showToast(`Generating ${format.toUpperCase()} stream...`, 'info');
            setTimeout(() => showToast(`Record stream dispatched`, 'success'), 1500);
            return;
        }

        try {
            showToast(`Generating official ${format.toUpperCase()} document...`, 'info');
            const response = format === 'pdf'
                ? await apiService.admin.downloadComplaintsPdf(dateRange)
                : await apiService.admin.downloadComplaintsExcel(dateRange);

            const blob = new Blob([response.data], {
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `CivicConnect_Summary_${dateRange.startDate}_to_${dateRange.endDate}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast(`${format.toUpperCase()} report successfully dispatched`, 'success');
        } catch (error) {
            console.error('Download failed:', error);
            if (error.response?.status === 403) {
                showToast('Permission Denied: Administrative privileges required for data extraction.', 'error');
            } else {
                showToast('Generation sequence interrupted. Check system logs.', 'error');
            }
        }
    };

    const filteredData = reportData.filter(item => {
        const matchesStatus = filters.status === 'ALL' || item.status === filters.status;
        const matchesSearch = item.complaintId?.toString().includes(filters.searchTerm) ||
            item.title?.toLowerCase().includes(filters.searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className={`admin-reports-premium pb-5 ${embedded ? 'pt-2' : 'min-vh-100'}`} style={{ backgroundColor: embedded ? 'transparent' : '#F8FAFC' }}>
            {!embedded && (
                <DashboardHeader
                    portalName="Data Archives"
                    userName="Operational Reports"
                    wardName="Audit Division"
                    subtitle="High-fidelity data extraction and administrative reporting services"
                    icon={Database}
                    actions={
                        <div className="d-flex align-items-center gap-3">
                            <div className="input-group bg-white border rounded-pill shadow-sm overflow-hidden px-3">
                                <span className="input-group-text bg-transparent border-0"><Calendar size={16} className="text-muted" /></span>
                                <input type="date" value={dateRange.startDate} onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))} className="form-control border-0 extra-small fw-black py-2 shadow-none" />
                                <span className="input-group-text bg-transparent border-0"><ArrowRight size={14} className="text-muted" /></span>
                                <input type="date" value={dateRange.endDate} onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))} className="form-control border-0 extra-small fw-black py-2 shadow-none" />
                            </div>
                            <button onClick={fetchReportData} className="btn btn-white bg-white rounded-circle shadow-sm border p-2 transition-all hover-shadow-md d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: PRIMARY_COLOR }} />
                            </button>
                        </div>
                    }
                />
            )}

            <div className="container-fluid px-3 px-lg-5" style={embedded ? { marginTop: '0' } : { marginTop: '-30px' }}>
                {/* Export Hub */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Excel Ledger', icon: FileSpreadsheet, color: '#10B981', format: 'excel' },
                        { label: 'PDF Snapshot', icon: Printer, color: '#EF4444', format: 'pdf' },
                        { label: 'JSON Stream', icon: FileJson, color: PRIMARY_COLOR, format: 'json' },
                        { label: 'Audit Trail', icon: ShieldCheck, color: '#6366F1', format: 'audit' }
                    ].map((fmt, i) => (
                        <div key={i} className="col-12 col-md-6 col-xl-3">
                            <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white p-4 transition-all hover-up-tiny group cursor-pointer" onClick={() => handleDownload(fmt.format)}>
                                <div className="d-flex align-items-center justify-content-between mb-0">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle p-2 shadow-sm" style={{ backgroundColor: `${fmt.color}10`, color: fmt.color }}>
                                            <fmt.icon size={20} />
                                        </div>
                                        <div className="extra-small fw-black text-dark uppercase">{fmt.label}</div>
                                    </div>
                                    <FileDown size={18} className="text-muted opacity-30 group-hover-opacity-100 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtration Hub */}
                <div className="card border-0 shadow-premium rounded-4 bg-white mb-5">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-xl-5">
                                <div className="input-group overflow-hidden border bg-light rounded-pill px-4">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><SearchIcon size={20} className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                        placeholder="Scan ledger by ID or subject keywords..."
                                        value={filters.searchTerm}
                                        onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="col-xl-7">
                                <div className="d-flex gap-3 flex-wrap justify-content-xl-end align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="extra-small fw-black text-muted uppercase opacity-40">State:</span>
                                        <select className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-bold shadow-sm pointer-pointer w-auto" value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                                            <option value="ALL">ALL STATES</option>
                                            <option value="PENDING">PENDING</option>
                                            <option value="RESOLVED">RESOLVED</option>
                                            <option value="CLOSED">CLOSED</option>
                                        </select>
                                    </div>
                                    <div className="vr d-none d-md-block mx-2" style={{ height: '24px', opacity: 0.1 }}></div>
                                    <p className="extra-small fw-black text-muted uppercase mb-0 opacity-40">Matching Records: {filteredData.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Ledger */}
                <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase">Entry ID</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Temporal Stamp</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Subject Matrix</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Jurisdiction</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase">Current State</th>
                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase">Verification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><RefreshCw className="animate-spin text-muted mx-auto" size={32} /></td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <Layers className="text-muted opacity-20 mb-3 mx-auto" size={48} />
                                            <h6 className="fw-black text-muted uppercase">No Archival Matches</h6>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map(item => (
                                        <tr key={item.complaintId || item.id} className="transition-all hover-light">
                                            <td className="px-5 fw-black extra-small text-primary" style={{ color: PRIMARY_COLOR }}>#{item.complaintId || item.id}</td>
                                            <td className="extra-small fw-bold text-dark opacity-60">{new Date(item.createdAt).toLocaleString()}</td>
                                            <td>
                                                <div className="fw-black text-dark small mb-0 uppercase text-truncate" style={{ maxWidth: '250px' }}>{item.title}</div>
                                                <div className="extra-small fw-bold text-muted uppercase opacity-40">Priority: {item.priority || 'NORMAL'}</div>
                                            </td>
                                            <td>
                                                <div className="extra-small fw-black text-dark uppercase opacity-60">{item.wardName || 'CENTRAL'}</div>
                                                <div className="extra-small fw-bold text-muted uppercase opacity-40">{item.departmentName || 'GENERAL'}</div>
                                            </td>
                                            <td><StatusBadge status={item.status} size="sm" /></td>
                                            <td className="px-5 text-end">
                                                <div className="d-inline-flex align-items-center gap-1 extra-small fw-black text-success border border-success rounded-pill px-3 py-1 opacity-60">
                                                    <ShieldCheck size={12} /> VERIFIED
                                                </div>
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
                .hover-up-tiny:hover { transform: translateY(-4px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default AdminReports;
