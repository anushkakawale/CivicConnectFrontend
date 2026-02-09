import React, { useState, useEffect } from 'react';
import {
    MapPin, CheckCircle, XCircle, Clock, History, FileText,
    ArrowLeft, RefreshCw, Loader, User, Mail, Smartphone,
    Check, X, MessageSquare, ChevronRight, TrendingUp, Building,
    Shield, Briefcase, Info, Search, Filter, ShieldAlert, Activity
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { WARDS } from '../../constants';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';

/**
 * Enhanced Strategic Ward Relocation Hub
 * High-contrast, tactical UI for managing citizen jurisdiction changes.
 */
const WardChangeManagement = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, HISTORY
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState({ show: false, request: null, action: null });
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const PRIMARY_COLOR = '#1254AF';

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            if (!refreshing) setLoading(true);
            let response;
            if (activeTab === 'PENDING') {
                response = await apiService.wardOfficer.getPendingWardChanges();
            } else {
                response = await apiService.wardOfficer.getWardChangeHistory();
            }

            const list = Array.isArray(response) ? response : (response?.data || []);
            setRequests(list);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleAction = (request, action) => {
        setActionModal({ show: true, request, action });
        setRemarks('');
    };

    const handleConfirmAction = async () => {
        if (!remarks.trim()) return showToast('Please provide remarks', 'error');

        try {
            setProcessing(true);
            const { request, action } = actionModal;

            if (action === 'approve') {
                await apiService.wardOfficer.approveWardChange(request.requestId, remarks);
                showToast('Ward change approved. The citizen has been reassigned.', 'success');
            } else {
                await apiService.wardOfficer.rejectWardChange(request.requestId, remarks);
                showToast('Ward change request rejected.', 'info');
            }

            setActionModal({ show: false, request: null, action: null });
            loadData();
        } catch (error) {
            showToast('Failed to process request.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const getWardName = (wardNumber) => {
        if (!wardNumber) return 'WARD_UNKNOWN';
        const ward = (WARDS || []).find(w => w.number === wardNumber);
        return ward ? `Ward ${ward.number} - ${ward.area_name}` : `Ward ${wardNumber}`;
    };

    if (loading && !requests.length && !refreshing) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="circ-white shadow-premium mb-4" style={{ width: '80px', height: '80px', color: PRIMARY_COLOR }}>
                <MapPin className="animate-spin" size={36} />
            </div>
            <p className="fw-black text-muted text-uppercase tracking-widest small">Synchronizing Relocation Records...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="WARD COMMAND HUB"
                userName="RELOCATION MANAGEMENT"
                wardName="JURISDICTION HUB"
                subtitle="OFFICIAL WARD RELOCATION PROTOCOL | CITIZEN RECORD REASSIGNMENT"
                icon={MapPin}
                actions={
                    <button
                        onClick={handleRefresh}
                        className="btn btn-white bg-white shadow-premium border-0 rounded-circle d-flex align-items-center justify-content-center p-0"
                        style={{ width: '54px', height: '54px' }}
                    >
                        <RefreshCw size={24} className={`text-primary ${refreshing ? 'animate-spin' : ''}`} style={{ color: PRIMARY_COLOR }} />
                    </button>
                }
            />

            <div className="container" style={{ maxWidth: '1200px', marginTop: '-30px' }}>
                {/* Visual Stats Row */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'PENDING ACTIONS', val: requests.filter(r => r.status === 'PENDING').length || (activeTab === 'PENDING' ? requests.length : 0), icon: Clock, color: '#F59E0B' },
                        { label: 'JURISDICTION OPS', val: requests.length, icon: Shield, color: PRIMARY_COLOR },
                        { label: 'SYSTEM HEALTH', val: 'OPTIMAL', icon: Activity, color: '#10B981' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-4">
                            <div className="card border-0 shadow-premium rounded-4 p-4 h-100 bg-white border-top border-4 transition-all hover-up" style={{ borderColor: s.color }}>
                                <div className="d-flex align-items-center gap-4">
                                    <div className="p-3 rounded-4 shadow-sm border" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
                                        <s.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="fw-black mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>{s.val}</h3>
                                        <p className="fw-black mb-0 extra-small tracking-widest text-muted uppercase">{s.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs Hub */}
                <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden mb-5">
                    <div className="card-header bg-white border-bottom p-0 border-0">
                        <div className="d-flex">
                            {[
                                { id: 'PENDING', label: 'AUTHORIZATION QUEUE', icon: ShieldAlert },
                                { id: 'HISTORY', label: 'EXECUTION LOGS', icon: History }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-grow-1 p-4 border-0 fw-black extra-small tracking-[0.2em] text-uppercase transition-all d-flex align-items-center justify-content-center gap-3 ${activeTab === tab.id ? 'bg-light text-primary' : 'text-muted bg-transparent opacity-40'}`}
                                    style={activeTab === tab.id ? { color: PRIMARY_COLOR, borderBottom: `5px solid ${PRIMARY_COLOR}` } : {}}
                                >
                                    <tab.icon size={18} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card-body p-5">
                        {requests.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="p-4 rounded-circle bg-light d-inline-block mb-4 border-dashed border-2">
                                    <Building size={64} className="text-muted opacity-20" />
                                </div>
                                <h5 className="fw-black text-dark text-uppercase tracking-widest extra-small">Registry Status: Clear</h5>
                                <p className="text-muted extra-small fw-bold uppercase tracking-widest mt-2">No relocation records matching current operational frequency.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {requests.map((req) => (
                                    <div key={req.requestId} className="col-lg-6">
                                        <div className="card border-0 shadow-premium rounded-4 p-5 h-100 transition-all hover-up-small bg-white border-start border-4" style={{ borderLeftColor: req.status === 'APPROVED' ? '#10B981' : req.status === 'REJECTED' ? '#EF4444' : PRIMARY_COLOR }}>
                                            <div className="d-flex justify-content-between align-items-start mb-4 pb-4 border-bottom border-light">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="circ-white border shadow-sm fw-black" style={{ width: '48px', height: '48px', color: PRIMARY_COLOR, fontSize: '1.2rem' }}>
                                                        {req.citizenName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-black text-dark mb-1 uppercase tracking-tight">{req.citizenName}</h6>
                                                        <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-60">ID: #{req.requestId}</span>
                                                    </div>
                                                </div>
                                                {activeTab === 'HISTORY' && (
                                                    <span className={`px-3 py-1 rounded-pill extra-small fw-black tracking-widest uppercase ${req.status === 'APPROVED' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                                        {req.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between p-4 rounded-4 bg-light bg-opacity-30 mb-4 position-relative border">
                                                <div className="text-center flex-grow-1">
                                                    <span className="extra-small d-block fw-black text-muted uppercase tracking-widest mb-1 opacity-40">Origin</span>
                                                    <p className="fw-black text-dark mb-0 uppercase">{getWardName(req.oldWardNumber).split(' - ')[0]}</p>
                                                </div>
                                                <div className="p-2 bg-white rounded-circle shadow-sm border position-absolute top-50 start-50 translate-middle" style={{ zIndex: 2 }}>
                                                    <ChevronRight size={18} className="text-primary" />
                                                </div>
                                                <div className="text-center flex-grow-1 border-start">
                                                    <span className="extra-small d-block fw-black text-primary uppercase tracking-widest mb-1 opacity-40">Target</span>
                                                    <p className="fw-black text-primary mb-0 uppercase">{getWardName(req.newWardNumber).split(' - ')[0]}</p>
                                                </div>
                                            </div>

                                            {req.remarks && (
                                                <div className="p-4 rounded-4 mb-4 bg-light border-start border-4 border-primary">
                                                    <div className="d-flex align-items-center gap-2 extra-small fw-black text-primary uppercase tracking-widest mb-2">
                                                        <MessageSquare size={14} /> Official Justification
                                                    </div>
                                                    <p className="extra-small text-dark fw-bold mb-0 opacity-80 italic lh-base uppercase tracking-wider">"{req.remarks}"</p>
                                                </div>
                                            )}

                                            {activeTab === 'PENDING' && (
                                                <div className="d-flex gap-3 mt-4 pt-4 border-top">
                                                    <button onClick={() => handleAction(req, 'reject')} className="btn btn-light flex-grow-1 rounded-pill py-3 fw-black extra-small tracking-widest text-danger transition-all hover-up-small border-0 shadow-sm uppercase">
                                                        <X size={16} className="me-2" /> Deny Access
                                                    </button>
                                                    <button onClick={() => handleAction(req, 'approve')} className="btn btn-primary flex-grow-1 rounded-pill py-3 fw-black extra-small tracking-widest shadow-premium border-0 transition-all hover-up-small uppercase" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                        <Check size={16} className="me-2" /> Authorize
                                                    </button>
                                                </div>
                                            )}

                                            {activeTab === 'HISTORY' && (
                                                <div className="mt-4 pt-4 border-top d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-2 extra-small fw-black text-muted uppercase tracking-widest">
                                                        <Clock size={14} className="opacity-40" /> {new Date(req.updatedAt || req.requestedAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">Status: Audited</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tactical Footer */}
                <div className="mt-5 p-5 rounded-4 bg-white shadow-premium border-start border-4 border-primary transition-all hover-up-small">
                    <div className="d-flex gap-4 align-items-center">
                        <div className="p-3 bg-light border shadow-inner rounded-circle text-primary">
                            <Briefcase size={32} />
                        </div>
                        <div>
                            <h6 className="fw-black text-dark mb-1 uppercase tracking-widest">RELOCATION PROTOCOL SPECIFICATIONS</h6>
                            <p className="extra-small text-muted fw-bold mb-0 opacity-60 uppercase tracking-wider">All jurisdictional changes require manual commander authorization. Execution stamps are logged on the central municipal registry.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {actionModal.show && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 py-5" style={{ zIndex: 2000 }} onClick={() => setActionModal({ show: false, request: null, action: null })}>
                    <div className="card border-0 shadow-premium rounded-4 overflow-hidden animate-zoomIn w-90" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <div className={`p-4 text-white border-0 d-flex align-items-center justify-content-between ${actionModal.action === 'approve' ? 'bg-success' : 'bg-danger'}`}>
                            <h6 className="fw-black mb-0 uppercase tracking-widest">Confirm Directive</h6>
                            <button onClick={() => setActionModal({ show: false, request: null, action: null })} className="btn btn-link text-white p-0 shadow-none"><X size={24} /></button>
                        </div>
                        <div className="card-body p-5">
                            <div className="p-4 rounded-4 bg-light mb-5 border">
                                <span className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-40">Target Entity</span>
                                <h6 className="fw-black text-dark mb-1 uppercase">{actionModal.request?.citizenName}</h6>
                                <p className="extra-small text-muted mb-0">{actionModal.request?.citizenEmail}</p>
                            </div>

                            <div className="mb-5">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 d-block opacity-50">Operational Justification</label>
                                <textarea
                                    className="form-control rounded-4 bg-light border-0 p-4 shadow-none focus-bg-white extra-small fw-black uppercase"
                                    rows="4"
                                    placeholder="Enter closing remarks..."
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <button
                                onClick={handleConfirmAction}
                                disabled={processing || !remarks.trim()}
                                className={`btn w-100 rounded-pill py-3 fw-black text-white text-uppercase tracking-widest shadow-premium border-0 ${actionModal.action === 'approve' ? 'bg-success' : 'bg-danger'} ${processing || !remarks.trim() ? 'opacity-50' : ''}`}
                            >
                                {processing ? <RefreshCw className="animate-spin" size={18} /> : `EXECUTE ${actionModal.action === 'approve' ? 'APPROVAL' : 'REJECTION'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05) !important; }
                .hover-up-small:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                .circ-white { border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
                .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .focus-bg-white:focus { background-color: #fff !important; box-shadow: 0 0 0 4px rgba(18, 84, 175, 0.1) !important; }
            `}} />
        </div>
    );
};

export default WardChangeManagement;
