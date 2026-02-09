import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { COMPLAINT_STATUS } from '../../constants';
import {
    CheckCircle, XCircle, Eye, Clock, AlertCircle,
    ShieldCheck, ArrowLeft, RefreshCw, Loader, FileText,
    MessageSquare, CheckCheck, X
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

    const PRIMARY_COLOR = '#1254AF';

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            if (!complaints.length) setLoading(true);
            const data = await apiService.wardOfficer.getPendingApprovals();
            const list = Array.isArray(data) ? data : (data?.content || []);
            setComplaints(list);
        } catch (err) {
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
            await apiService.wardOfficer.approveComplaint(complaintId, { remarks: 'Approved after verification of resolution proof.' });
            showToast('Case finalized and approved.', 'success');
            fetchPendingApprovals();
        } catch (err) {
            showToast(err.response?.data?.message || 'Approval authorization failure.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (complaintId) => {
        const reason = prompt('Enter rejection reason for audit log:');
        if (!reason || reason.trim() === '') return;

        try {
            setProcessingId(complaintId);
            await apiService.wardOfficer.rejectComplaint(complaintId, { remarks: reason });
            showToast('Case rejected and flagged for reassessment.', 'info');
            fetchPendingApprovals();
        } catch (err) {
            showToast(err.response?.data?.message || 'Rejection protocol failure.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading && !complaints.length) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F0F2F5' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted text-uppercase tracking-widest small">Synchronizing Approvals...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8F9FA' }}>
            <DashboardHeader
                portalName="PMC WARD CONSOLE"
                userName={localStorage.getItem('name') || 'Ward Executive'}
                wardName={localStorage.getItem('wardName') || 'WARD ADMINISTRATION'}
                subtitle="Approval Queue | Final Quality Control & Resolution Audit"
                icon={ShieldCheck}
                actions={
                    <div className="d-flex gap-2">
                        <button onClick={() => navigate('/ward-officer/dashboard')} className="btn btn-white bg-white text-muted rounded-0 px-4 py-2 fw-black extra-small tracking-widest d-flex align-items-center gap-2 shadow-sm border-0">
                            <ArrowLeft size={16} /> CONSOLE
                        </button>
                        <button
                            onClick={handleSync}
                            className="btn btn-primary rounded-0 px-4 py-3 fw-black extra-small tracking-widest d-flex align-items-center gap-2 shadow-md border-0 transition-all hover-up"
                            disabled={refreshing}
                            style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'SYNCING...' : 'SYNC DATA'}
                        </button>
                    </div>
                }
            />

            <div className="container mt-4">
                <div className="card border-0 shadow-lg rounded-0 bg-white overflow-hidden mb-5">
                    <div className="card-header bg-white border-0 p-5 pb-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="fw-black text-dark text-uppercase tracking-wider mb-1">Authorization Matrix</h4>
                                <p className="extra-small text-muted fw-bold uppercase tracking-widest opacity-50">Pending your final executive review</p>
                            </div>
                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-0 px-4 py-2 fw-black extra-small tracking-widest">
                                {complaints.length} CASES PENDING
                            </span>
                        </div>
                    </div>

                    <div className="card-body p-5">
                        {complaints.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="p-4 rounded-0 bg-light d-inline-block mb-4">
                                    <CheckCheck size={64} className="text-success opacity-20" />
                                </div>
                                <h5 className="fw-black text-muted text-uppercase tracking-widest">Registry Clean</h5>
                                <p className="text-muted small">All resolved complaints have been audited and finalized.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr className="bg-light bg-opacity-50">
                                            <th className="border-0 rounded-start extra-small fw-black text-muted text-uppercase tracking-widest ps-4 py-3">Case ID</th>
                                            <th className="border-0 extra-small fw-black text-muted text-uppercase tracking-widest py-3">Subject</th>
                                            <th className="border-0 extra-small fw-black text-muted text-uppercase tracking-widest py-3">Resolution Proof</th>
                                            <th className="border-0 extra-small fw-black text-muted text-uppercase tracking-widest py-3">Department</th>
                                            <th className="border-0 extra-small fw-black text-muted text-uppercase tracking-widest py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-0">
                                        {complaints.map((c) => {
                                            const cId = c.complaintId || c.id;
                                            const isProcessing = processingId === cId;
                                            return (
                                                <tr key={cId} className="transition-all hover-bg-light border-0">
                                                    <td className="ps-4 border-0">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-0 px-2 py-1 extra-small fw-black">#{cId}</span>
                                                    </td>
                                                    <td className="border-0">
                                                        <h6 className="fw-black text-dark mb-0 extra-small text-uppercase">{c.title}</h6>
                                                        <p className="extra-small text-muted mb-0 fw-bold opacity-50">Resolved: {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'N/A'}</p>
                                                    </td>
                                                    <td className="border-0">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="p-2 bg-success bg-opacity-10 text-success rounded-0">
                                                                <FileText size={16} />
                                                            </div>
                                                            <span className="extra-small fw-bold text-success text-uppercase">Proof Available</span>
                                                        </div>
                                                    </td>
                                                    <td className="border-0">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="p-1 rounded-0 bg-light">📋</div>
                                                            <span className="extra-small fw-black text-muted text-uppercase">{(c.departmentName || 'General').replace(/_/g, ' ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="border-0 text-center pe-4">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                onClick={() => navigate(`/ward-officer/complaints/${cId}`)}
                                                                className="btn btn-light rounded-0 p-2 shadow-sm border-0 transition-all hover-up-small"
                                                                title="Review Details"
                                                            >
                                                                <Eye size={18} className="text-primary" />
                                                            </button>
                                                            <button
                                                                className="btn btn-success rounded-0 p-2 shadow-sm border-0 transition-all hover-up-small"
                                                                onClick={() => handleApprove(cId)}
                                                                disabled={isProcessing}
                                                                title="Execute Approval"
                                                                style={{ backgroundColor: '#10B981' }}
                                                            >
                                                                {isProcessing ? <Loader size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                                            </button>
                                                            <button
                                                                className="btn btn-danger rounded-0 p-2 shadow-sm border-0 transition-all hover-up-small"
                                                                onClick={() => handleReject(cId)}
                                                                disabled={isProcessing}
                                                                title="Reject Resolution"
                                                                style={{ backgroundColor: '#EF4444' }}
                                                            >
                                                                <X size={18} />
                                                            </button>
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

                {/* Tactical Note */}
                <div className="card border-0 shadow-sm rounded-0 bg-white p-5 border-start border-5 transition-all hover-bg-light" style={{ borderColor: '#6366F1' }}>
                    <div className="d-flex align-items-start gap-4">
                        <div className="p-3 rounded-0 bg-indigo-50 text-indigo-600" style={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}>
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <h5 className="fw-black text-dark text-uppercase tracking-wider mb-2">Audit Synchronization Protocols</h5>
                            <p className="extra-small text-muted fw-bold mb-0 opacity-75 lh-lg">
                                All approvals are cryptographically logged. Ensure multi-visual verification of resolution proof before case finalization.
                                Rejected cases are automatically rerouted to the assigned officer with audit flags.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .tracking-wider { letter-spacing: 0.12em; }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-spin { animation: spin 0.8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hover-up:hover { transform: translateY(-5px); }
                .hover-up-small:hover { transform: scale(1.1); transform: translateY(-2px); }
                .hover-bg-light:hover { background-color: #F8FAFC !important; }
                .rounded-0 { border-radius: 2.2rem !important; }
            `}} />
        </div>
    );
};

export default ApprovalQueue;
