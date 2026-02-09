/**
 * Ward Change Requests Page (Citizen)
 * Display ward change request history with status tracking
 * Revamped with Teal Design System v2.0
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Plus, Loader, History as HistoryIcon, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { WARDS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import './WardChangeRequests.css';

const WardChangeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [selectedWard, setSelectedWard] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();
    const primaryColor = '#1254AF';

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await apiService.getMyWardChangeRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching ward change requests:', error);
            showToast('Failed to load request history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNewRequest = async () => {
        if (!selectedWard) {
            showToast('Please select a ward', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await apiService.createWardChangeRequest(parseInt(selectedWard));
            showToast('Request submitted successfully', 'success');
            setShowNewRequestModal(false);
            setSelectedWard('');
            fetchRequests();
        } catch (error) {
            console.error('Error creating request:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to submit request';
            showToast(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock size={20} className="text-warning" />;
            case 'APPROVED':
                return <CheckCircle size={20} className="text-success" />;
            case 'REJECTED':
                return <XCircle size={20} className="text-danger" />;
            default:
                return <AlertCircle size={20} className="text-muted" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getWardName = (wardNumber) => {
        const ward = WARDS.find(w => w.number === wardNumber);
        return ward ? `Ward ${ward.number} - ${ward.area_name}` : `Ward ${wardNumber}`;
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: primaryColor }} />
            <p className="fw-bold text-muted">Checking request status...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC Citizen Portal"
                userName="Change location"
                wardName="Ward transfer"
                subtitle="Request a change in your assigned residential ward for reporting issues."
                icon={MapPin}
                actions={
                    <button
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-lg border-0"
                        style={{ width: '56px', height: '56px', backgroundColor: primaryColor }}
                        onClick={() => setShowNewRequestModal(true)}
                    >
                        <Plus size={24} />
                    </button>
                }
            />

            <div className="container" style={{ maxWidth: '1000px', marginTop: '-20px' }}>
                {requests.length === 0 ? (
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border-dashed border-2">
                        <MapPin size={80} className="text-muted opacity-25 mb-4 mx-auto" />
                        <h4 className="fw-bold text-dark mb-2">No change requests found</h4>
                        <p className="text-muted small mb-4">You are currently assigned to your registered ward area.</p>
                        <button
                            className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-sm"
                            style={{ backgroundColor: primaryColor, border: '0' }}
                            onClick={() => setShowNewRequestModal(true)}
                        >
                            Request ward change
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-4 px-2">
                            <HistoryIcon size={18} className="text-primary" style={{ color: primaryColor }} />
                            <h6 className="fw-bold text-dark mb-0">Previous requests</h6>
                        </div>

                        <div className="d-flex flex-column gap-4">
                            {requests.map((request) => (
                                <div key={request.requestId} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`p-2 rounded-pill bg-light d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                                                    {getStatusIcon(request.status)}
                                                </div>
                                                <span className="fw-bold small text-muted">
                                                    {request.status}
                                                </span>
                                            </div>
                                            <span className="small text-muted opacity-50 fw-bold">
                                                Submitted: {formatDate(request.requestedAt)}
                                            </span>
                                        </div>

                                        <div className="row align-items-center g-3 mb-4">
                                            <div className="col-md-5">
                                                <div className="p-3 rounded-4 bg-light border-start border-4 border-secondary">
                                                    <small className="small fw-bold text-muted d-block mb-1 uppercase opacity-50">Current ward</small>
                                                    <span className="fw-bold text-dark">
                                                        {getWardName(request.oldWardNumber)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-2 text-center">
                                                <ArrowRight size={24} className="text-muted" />
                                            </div>
                                            <div className="col-md-5">
                                                <div className="p-3 rounded-4 bg-light border-start border-4 border-primary" style={{ borderLeftColor: primaryColor }}>
                                                    <small className="small fw-bold text-muted d-block mb-1 uppercase opacity-50">New ward</small>
                                                    <span className="fw-bold text-dark">
                                                        {getWardName(request.newWardNumber)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {request.status !== 'PENDING' && (
                                            <div className="p-3 rounded-4 bg-light border-0">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ShieldCheck size={16} className="text-primary" style={{ color: primaryColor }} />
                                                        <span className="small fw-bold uppercase opacity-50">
                                                            {request.status === 'APPROVED' ? 'Approved by:' : 'Rejected by:'}
                                                        </span>
                                                        <span className="fw-bold text-primary" style={{ color: primaryColor }}>{request.decidedBy || 'Administrator'}</span>
                                                    </div>
                                                    {request.decidedAt && (
                                                        <span className="small fw-bold opacity-30">
                                                            {formatDate(request.decidedAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                {request.remarks && (
                                                    <div className="mt-2 pt-2 border-top">
                                                        <p className="mb-0 small text-muted italic">"{request.remarks}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showNewRequestModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}>
                    <div className="card border-0 rounded-4 shadow-xl overflow-hidden animate-slideUp" style={{ width: '100%', maxWidth: '500px' }}>
                        <div className="card-header border-0 bg-white p-4 px-5 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-dark">Request ward change</h5>
                            <button className="btn-close shadow-none" onClick={() => setShowNewRequestModal(false)}></button>
                        </div>

                        <div className="card-body p-5 pt-2">
                            <p className="text-muted small mb-4">
                                Select the new ward area you want to be assigned to. This request will be reviewed by an administrator.
                            </p>

                            <div className="mb-4">
                                <label className="small fw-bold text-muted mb-2 uppercase opacity-50">New ward</label>
                                <select
                                    value={selectedWard}
                                    onChange={(e) => setSelectedWard(e.target.value)}
                                    className="form-select border-2 shadow-none py-3 px-4 rounded-4 bg-light fw-bold"
                                >
                                    <option value="">Select a ward...</option>
                                    {WARDS.map((ward) => (
                                        <option key={ward.wardId} value={ward.wardId}>
                                            Ward {ward.number} - {ward.area_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-light rounded-pill px-4 fw-bold small flex-grow-1"
                                    onClick={() => setShowNewRequestModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary rounded-pill px-4 py-3 fw-bold small flex-grow-1 shadow-sm"
                                    style={{ backgroundColor: primaryColor, border: '0' }}
                                    onClick={handleNewRequest}
                                    disabled={submitting || !selectedWard}
                                >
                                    {submitting ? <RefreshCw className="animate-spin me-2" size={18} /> : 'Submit request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-slideUp { animation: slideUp 0.3s ease-out; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}} />
        </div>
    );
};

export default WardChangeRequests;
