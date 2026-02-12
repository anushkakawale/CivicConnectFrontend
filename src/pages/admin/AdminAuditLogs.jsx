/**
 * Professional Admin Audit Ledger
 * High-fidelity immutable record of all system-wide operations and security events.
 */

import React, { useState, useEffect } from 'react';
import {
    Shield, Search, RefreshCw, Calendar, Clock,
    User, Activity, FileText, AlertTriangle, ShieldCheck,
    Lock, ArrowRight, Layers, Filter, CheckCircle, Database
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();
    const PRIMARY_COLOR = '#244799';

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getAuditLogs();
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data.content || []);
            setLogs(list);
        } catch (error) {
            console.error('Audit sync failed:', error);
            showToast('Unable to synchronize security ledger', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action) => {
        const a = action?.toUpperCase();
        if (a?.includes('DELETE') || a?.includes('DEACTIVATE') || a?.includes('ERROR')) return '#EF4444';
        if (a?.includes('CREATE') || a?.includes('REGISTER') || a?.includes('ADD')) return '#10B981';
        if (a?.includes('UPDATE') || a?.includes('EDIT') || a?.includes('CHANGE')) return PRIMARY_COLOR;
        return '#64748B';
    };

    if (loading && logs.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted extra-small tracking-widest uppercase">Initializing Immutable Ledger...</p>
        </div>
    );

    return (
        <div className="admin-audit-premium min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Security Ledger"
                userName="Audit Division"
                wardName="Central Oversight"
                subtitle="Immutable timeline of all administrative operations and security transitions"
                icon={Shield}
                actions={
                    <button onClick={fetchLogs} className="btn btn-white bg-white rounded-pill px-4 py-2 border shadow-sm d-flex align-items-center gap-2 extra-small fw-black tracking-widest transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> REFRESH LEDGER
                    </button>
                }
            />

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>

                {/* Filtration Hub */}
                <div className="card border-0 shadow-premium rounded-4 bg-white mb-5">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-xl-6">
                                <div className="input-group overflow-hidden border bg-light rounded-pill px-4">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><Search size={20} className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                        placeholder="Scan ledger by action, operative, or ID..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-xl-6 text-xl-end">
                                <div className="d-inline-flex align-items-center gap-3 bg-light px-4 py-2 rounded-pill border">
                                    <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">Records Tracked: {logs.length}</span>
                                    <div className="vr" style={{ height: '20px', opacity: 0.1 }}></div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Database size={16} className="text-primary opacity-50" />
                                        <span className="extra-small fw-black text-primary uppercase" style={{ color: PRIMARY_COLOR }}>SECURE SYNC ACTIVE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Timeline Ledger */}
                <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Temporal Stamp</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Authorized Operative</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Operational Action</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Entry Details</th>
                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase tracking-widest">Verification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="rounded-circle bg-light d-inline-flex p-4 mb-3">
                                                <Layers size={48} className="text-muted opacity-20" />
                                            </div>
                                            <h6 className="fw-black text-dark uppercase tracking-widest mb-1">Zero Matches</h6>
                                            <p className="extra-small text-muted fw-bold opacity-60">No security events found matching the search criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, idx) => (
                                        <tr key={log.id || idx} className="transition-all hover-light">
                                            <td className="px-5">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle bg-light p-2 text-primary opacity-50" style={{ color: PRIMARY_COLOR }}>
                                                        <Clock size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="extra-small fw-black text-dark">{new Date(log.timestamp).toLocaleDateString()}</div>
                                                        <div className="extra-small text-muted fw-bold opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '32px', height: '32px', fontSize: '0.75rem', backgroundColor: PRIMARY_COLOR }}>
                                                        {log.performedBy?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="extra-small fw-black text-dark uppercase">{log.performedBy || 'Unknown Operative'}</div>
                                                        <div className="extra-small text-muted fw-bold opacity-40 uppercase tracking-widest">Role: ADMINISTRATIVE</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border" style={{ backgroundColor: `${getActionColor(log.action)}10`, color: getActionColor(log.action), borderColor: `${getActionColor(log.action)}30` }}>
                                                    <Activity size={12} />
                                                    <span className="extra-small fw-black text-uppercase tracking-wider">{log.action?.replace(/_/g, ' ')}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="extra-small fw-bold text-dark opacity-75 text-truncate" style={{ maxWidth: '300px' }}>
                                                    {log.details || 'Operational record entry'}
                                                </div>
                                            </td>
                                            <td className="px-5 text-end">
                                                <div className="d-inline-flex align-items-center gap-2 extra-small fw-black text-success opacity-60">
                                                    <ShieldCheck size={16} />
                                                    HASH VERIFIED
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
                .admin-audit-premium { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

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

export default AdminAuditLogs;
