import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { COMPLAINT_STATUS } from '../../constants';
import {
    CheckCircle, XCircle, Eye, Clock, AlertCircle,
    ShieldCheck, ArrowLeft, RefreshCw, Loader, FileText,
    MessageSquare, CheckCheck, X, Target, AlertTriangle
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { useToast } from '../../hooks/useToast';

const ApprovalQueue = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const BRAND_PRIMARY = '#173470';
    const BRAND_SUCCESS = '#10B981';

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            if (!complaints.length) setLoading(true);

            // Fetch all active complaints for consistent local filtering
            const res = await apiService.wardOfficer.getComplaints({ page: 0, size: 200 });
            const data = res.data?.content || res.data || res;
            const list = Array.isArray(data) ? data : (data?.content || []);

            // Locally filter for audit-ready cases (RESOLVED or PENDING_APPROVAL)
            const auditQueue = list.filter(c => c.status === 'RESOLVED' || c.status === 'PENDING_APPROVAL');
            setComplaints(auditQueue);

        } catch (err) {
            console.error('Audit sync failure:', err);
            showToast('Failed to synchronize approval queue.', 'error');
            setComplaints([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleSync = () => {
        setRefreshing(true);
        fetchPendingApprovals();
    };

    const handleApprove = async (complaintId) => {
        try {
            setProcessingId(complaintId);
            await apiService.wardOfficer.approveComplaint(complaintId, { remarks: 'System Audit: Resolution verified and approved by Ward Executive.' });
            showToast('Case finalized and approved.', 'success');
            fetchPendingApprovals();
        } catch (err) {
            showToast(err.response?.data?.message || 'Approval authorization failure.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (complaintId) => {
        const reason = prompt('AUDIT PROTOCOL: Enter rejection reason for official record:');
        if (!reason || reason.trim() === '') return;

        try {
            setProcessingId(complaintId);
            await apiService.wardOfficer.rejectComplaint(complaintId, { remarks: reason });
            showToast('Case rejected and reassigned to department officer.', 'info');
            fetchPendingApprovals();
        } catch (err) {
            showToast(err.response?.data?.message || 'Rejection protocol failure.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading && !complaints.length) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
            <div className="position-relative mb-4">
                <ShieldCheck size={64} className="text-primary opacity-10" />
                <RefreshCw size={32} className="text-primary animate-spin position-absolute top-50 start-50 translate-middle" />
            </div>
            <p className="fw-black text-muted text-uppercase tracking-widest small">Synchronizing Tactical Audit Queue...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC WARD CONSOLE"
                userName={localStorage.getItem('name') || 'Ward Executive'}
                wardName={localStorage.getItem('wardName') || 'WARD ADMINISTRATION'}
                subtitle="RESOLUTION AUDIT QUEUE | FINAL QUALITY CONTROL PROTOCOLS"
                icon={ShieldCheck}
                actions={
                    <div className="d-flex gap-2">
                        <button onClick={() => navigate('/ward-officer/dashboard')} className="btn btn-white bg-white border shadow-sm rounded-pill px-4 py-2 fw-black extra-small tracking-widest d-flex align-items-center gap-2 transition-all hover-up">
                            <ArrowLeft size={16} /> CONSOLE
                        </button>
                        <button
                            onClick={handleSync}
                            className={`btn btn-primary rounded-pill px-4 py-3 fw-black extra-small tracking-widest d-flex align-items-center gap-2 shadow-lg border-0 transition-all ${refreshing ? 'animate-spin' : 'hover-up'}`}
                            style={{ backgroundColor: BRAND_PRIMARY }}
                        >
                            <RefreshCw size={16} /> RE-SYNC
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-4 px-lg-5" style={{ marginTop: '-30px' }}>
                <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white mb-5">
                    <div className="card-header bg-white p-4 border-0 border-bottom d-flex align-items-center justify-content-between">
                        <h6 className="fw-black text-dark mb-0 uppercase tracking-widest opacity-60">Pending Resolutions ({complaints.length})</h6>
                        <div className="extra-small fw-bold text-muted uppercase tracking-widest opacity-40">System Audit Active</div>
                    </div>

                    <div className="card-body p-0">
                        {complaints.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="p-5 d-flex flex-column align-items-center opacity-20">
                                    <CheckCheck size={80} className="mb-4 text-success" />
                                    <h5 className="fw-black text-uppercase tracking-widest">Audit Registry Vacant</h5>
                                    <p className="extra-small fw-bold mb-0">No resolutions pending verification at this time.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr className="bg-light bg-opacity-50">
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Case Profile</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Assigned Unit</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Evidence</th>
                                            <th className="py-4 border-0 text-center extra-small fw-black text-muted uppercase tracking-widest">Priority</th>
                                            <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase tracking-widest">Audit Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complaints.map(complaint => (
                                            <tr key={complaint.complaintId || complaint.id} className="transition-all hover-bg-light">
                                                <td className="px-5 py-4 border-0">
                                                    <div className="d-flex align-items-center gap-3 mb-1">
                                                        <div className="badge bg-light text-dark fw-black font-mono extra-small border">#{complaint.complaintId || complaint.id}</div>
                                                        <div className="fw-black text-dark text-uppercase tracking-tight h6 mb-0 truncate-text" style={{ maxWidth: '250px' }}>{complaint.title}</div>
                                                    </div>
                                                    <div className="extra-small text-muted fw-bold uppercase tracking-widest opacity-40 ps-1">
                                                        Resolved {new Date(complaint.updatedAt || Date.now()).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-4 border-0">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="p-1.5 rounded bg-light border"><FileText size={12} className="text-primary" /></div>
                                                        <span className="extra-small fw-black text-dark uppercase">{complaint.departmentName || 'GENERAL_UNIT'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 border-0">
                                                    <div className="d-flex align-items-center gap-2 text-success extra-small fw-black uppercase tracking-widest">
                                                        <MessageSquare size={14} className="opacity-40" />
                                                        PROOF ATTACHED
                                                    </div>
                                                </td>
                                                <td className="py-4 border-0 text-center">
                                                    <PriorityBadge priority={complaint.priority} size="xs" />
                                                </td>
                                                <td className="px-5 py-4 border-0 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button
                                                            className="btn btn-outline-light border rounded-circle p-2 hover-up-small text-muted"
                                                            onClick={() => navigate(`/ward-officer/complaints/${complaint.complaintId || complaint.id}`)}
                                                            title="Inspect Evidence"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-white border-danger text-danger rounded-circle p-2 hover-up-small"
                                                            onClick={() => handleReject(complaint.complaintId || complaint.id)}
                                                            disabled={processingId === (complaint.complaintId || complaint.id)}
                                                            title="Reject Plan"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-success rounded-pill px-4 py-2 fw-black extra-small tracking-widest border-0 shadow-sm hover-up-small d-flex align-items-center gap-2"
                                                            onClick={() => handleApprove(complaint.complaintId || complaint.id)}
                                                            disabled={processingId === (complaint.complaintId || complaint.id)}
                                                            style={{ backgroundColor: BRAND_SUCCESS }}
                                                        >
                                                            {processingId === (complaint.complaintId || complaint.id) ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                            APPROVE
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit Guidelines */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-premium bg-dark p-5 rounded-4 h-100 overflow-hidden d-flex flex-row gap-4 align-items-start">
                            <div className="circ-white border shadow-lg bg-opacity-10 flex-shrink-0" style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#F59E0B' }}>
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <h6 className="fw-black text-white uppercase tracking-widest mb-3">Audit Protocol 01</h6>
                                <p className="extra-small text-white opacity-60 fw-bold uppercase leading-relaxed mb-0">
                                    Approve only when 'AFTER' resolution proof is clearly visible in the case file. Incomplete evidence requires immediate rejection.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-premium bg-white p-5 rounded-4 h-100 border-start border-5" style={{ borderStartColor: BRAND_PRIMARY }}>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <Target size={20} className="text-primary" />
                                <h6 className="fw-black text-dark uppercase tracking-widest mb-0">Performance Impact</h6>
                            </div>
                            <p className="extra-small text-muted fw-bold uppercase leading-relaxed mb-0">
                                Finalizing cases updates the Ward Resolution Index (WRI) and triggers citizen satisfaction telemetry. Ensure precision in every audit.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.68rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .hover-up { transition: all 0.3s ease; }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important; }
                .hover-up-small:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important; }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .truncate-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .hover-bg-light:hover { background-color: #F8FAFC !important; }
                .circ-white { border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .rounded-4 { border-radius: 1.5rem !important; }
            `}} />
        </div>
    );
}

export default ApprovalQueue;
