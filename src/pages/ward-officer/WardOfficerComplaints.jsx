import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import {
    ClipboardList, Filter, Search, Download,
    ChevronLeft, CheckCircle, XCircle, Info,
    User, MapPin, Building2, Clock, Shield,
    ExternalLink, MessageSquare, ArrowRight, RefreshCw, Box
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';

export default function WardOfficerComplaints() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [action, setAction] = useState('');
    const [remarks, setRemarks] = useState('');

    // Quick Detail View State
    const [showDetail, setShowDetail] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState('details');

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            let response;
            if (filter === 'RESOLVED') {
                response = await apiService.wardOfficer.getPendingApprovals();
            } else if (filter === 'CLOSED') {
                response = await apiService.wardOfficer.getClosedHistory();
            } else {
                response = await apiService.wardOfficer.getComplaints();
            }
            setComplaints(response.data || (Array.isArray(response) ? response : []));
        } catch (error) {
            showToast('Strategic connection failed. Unable to sync ward ledger.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [filter]);

    const handleAction = async () => {
        if (!remarks.trim()) {
            showToast('Verification remarks are required for audit trail.', 'warning');
            return;
        }

        try {
            if (action === 'approve') {
                await apiService.wardOfficer.approveComplaint(selectedComplaint.complaintId, { remarks });
                showToast('Action verified and records updated.', 'success');
            } else {
                await apiService.wardOfficer.rejectComplaint(selectedComplaint.complaintId, { remarks });
                showToast('Deployment unit rejected. Case returned to operational status.', 'warning');
            }
            setShowModal(false);
            setRemarks('');
            fetchComplaints();
            if (showDetail) setShowDetail(false);
        } catch (error) {
            showToast('Command execution failure. Check personnel permissions.', 'error');
        }
    };

    const openQuickDetail = async (id) => {
        try {
            setShowDetail(true);
            setDetailLoading(true);
            const res = await apiService.complaint.getDetails(id);
            setDetailData(res.data || res);
        } catch (err) {
            showToast('Dossier retrieval failed.', 'error');
            setShowDetail(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = filter === 'ALL' || c.status === filter;
        const matchesSearch = c.complaintId?.toString().includes(searchTerm) ||
            c.title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading && complaints.length === 0) return <LoadingSpinner />;

    return (
        <div className="ward-officer-complaints pb-5">
            <DashboardHeader
                portalName="PMC WARD COMMAND"
                userName="Sector Oversight"
                wardName="Assigned Area"
                subtitle="Sector-Wide Complaint Ledger & Resolution Verification System"
                icon={ClipboardList}
                actions={
                    <button onClick={fetchComplaints} className="btn btn-white bg-white rounded-circle shadow-premium border-0 p-0 d-flex align-items-center justify-content-center transition-all hover-up-tiny" style={{ width: '42px', height: '42px' }}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: PRIMARY_COLOR }} />
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-45px', zIndex: 1 }}>
                <div className="card b-none shadow-premium rounded-5 overflow-hidden bg-white">
                    <div className="card-header bg-white p-4 p-xl-5 border-bottom">
                        <div className="row g-4 align-items-center">
                            <div className="col-xl-4">
                                <div className="input-group border bg-light rounded-pill px-4">
                                    <Search size={16} className="text-muted opacity-40 m-auto" />
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 extra-small fw-black uppercase shadow-none"
                                        placeholder="SEARCH WARD LEDGER..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-xl-8 d-flex gap-2 flex-wrap justify-content-xl-end">
                                {[
                                    { id: 'ALL', label: 'GLOBAL VIEW' },
                                    { id: 'RESOLVED', label: 'PENDING VERIFICATION' },
                                    { id: 'SUBMITTED', label: 'FILED' },
                                    { id: 'ASSIGNED', label: 'DISPATCHED' },
                                    { id: 'IN_PROGRESS', label: 'IN OPERATIONS' },
                                    { id: 'APPROVED', label: 'VERIFIED' },
                                    { id: 'REOPENED', label: 'REACTIVATED' },
                                    { id: 'CLOSED', label: 'ARCHIVED' }
                                ].map(status => (
                                    <button
                                        key={status.id}
                                        className={`btn rounded-pill px-4 py-2 extra-small fw-black transition-all border-0 ${filter === status.id ? 'bg-primary text-white shadow-md' : 'btn-light text-muted opacity-60'}`}
                                        style={filter === status.id ? {
                                            backgroundColor: status.id === 'RESOLVED' ? '#10B981' : PRIMARY_COLOR,
                                            boxShadow: status.id === 'RESOLVED' ? '0 0 15px rgba(16, 185, 129, 0.4)' : ''
                                        } : {}}
                                        onClick={() => setFilter(status.id)}
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-30">
                                <tr>
                                    <th className="ps-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Case Identifier</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Filing Date</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-center">Department</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest text-end pe-5">Current Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredComplaints.map(complaint => (
                                    <tr key={complaint.complaintId} className="cursor-pointer hover-light-bg" onClick={() => openQuickDetail(complaint.complaintId)}>
                                        <td className="ps-5 py-4">
                                            <span className="extra-small fw-black text-primary d-block" style={{ color: PRIMARY_COLOR }}>#{complaint.complaintId}</span>
                                            <span className="extra-small fw-bold text-dark opacity-60 text-truncate d-block" style={{ maxWidth: '250px' }}>{complaint.title}</span>
                                        </td>
                                        <td className="extra-small fw-black text-muted">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="text-center">
                                            <span className="extra-small fw-black px-3 py-1 rounded-pill bg-light border uppercase">
                                                {complaint.departmentName?.replace(/_/g, ' ') || 'GENERAL'}
                                            </span>
                                        </td>
                                        <td className="pe-5 text-end">
                                            <StatusBadge status={complaint.status} size="sm" />
                                        </td>
                                    </tr>
                                ))}
                                {filteredComplaints.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="py-5 text-center text-muted extra-small fw-black uppercase tracking-widest opacity-40">
                                            No operational records matching current parameters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Detail Modal */}
            {showDetail && (
                <div className="modal-backdrop-premium d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', zIndex: 2000 }}>
                    <div className="modal-content-premium bg-white rounded-5 shadow-2xl overflow-hidden w-100 position-relative animate-slideUp" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowDetail(false)} className="btn btn-white shadow-sm rounded-circle p-2 position-absolute border-0 translate-middle-x" style={{ top: '20px', right: '0', zIndex: 10 }}>
                            <XCircle size={20} />
                        </button>

                        {detailLoading ? (
                            <div className="p-5 text-center">
                                <RefreshCw className="animate-spin text-primary mb-3" size={48} />
                                <p className="extra-small fw-black text-muted uppercase tracking-widest">FETCHING DOSSIER INTEL...</p>
                            </div>
                        ) : detailData && (
                            <div className="p-0">
                                <div className="p-5" style={{ background: 'linear-gradient(135deg, #173470 0%, #1e293b 100%)', color: 'white' }}>
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div>
                                            <span className="extra-small fw-black text-white text-opacity-40 uppercase tracking-widest">Case Identifier</span>
                                            <h2 className="fw-black mb-0 display-6">#{detailData.complaintId}</h2>
                                        </div>
                                        <StatusBadge status={detailData.status} />
                                    </div>
                                    <h4 className="fw-black uppercase tracking-tighter mb-0">{detailData.title}</h4>
                                </div>
                                <div className="p-5">
                                    <div className="row g-5">
                                        <div className="col-lg-7">
                                            <div className="d-flex gap-1 bg-light p-1 rounded-pill border mb-4" style={{ width: 'fit-content' }}>
                                                {[
                                                    { id: 'details', label: 'DETAILS', icon: Info },
                                                    { id: 'history', label: 'HISTORY', icon: History }
                                                ].map(tab => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setDetailTab(tab.id)}
                                                        className={`btn rounded-pill px-4 py-2 extra-small fw-black transition-all d-flex align-items-center gap-2 border-0 ${detailTab === tab.id ? 'bg-white text-dark shadow-sm' : 'text-muted opacity-50'}`}
                                                        style={detailTab === tab.id ? { color: PRIMARY_COLOR } : {}}
                                                    >
                                                        <tab.icon size={14} /> {tab.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {detailTab === 'details' ? (
                                                <>
                                                    <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-40">Operational Intelligence Description</h6>
                                                    <p className="fw-bold text-dark mb-5 leading-relaxed">{detailData.description}</p>

                                                    {detailData.status === 'RESOLVED' && (
                                                        <div className="p-4 rounded-4 bg-primary bg-opacity-5 border border-primary border-opacity-10 mb-5">
                                                            <h6 className="extra-small fw-black text-primary uppercase tracking-widest mb-3 d-flex align-items-center gap-2">
                                                                <Shield size={14} /> Functional Audit Required
                                                            </h6>
                                                            <p className="extra-small fw-bold text-dark mb-4 opacity-70">Case has been marked as RESOLVED by the deployment unit. Operational verification is required to authorize final closure.</p>
                                                            <div className="d-flex gap-3">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedComplaint(detailData); setAction('approve'); setShowModal(true); }}
                                                                    className="btn btn-success rounded-pill px-4 py-2 extra-small fw-black d-flex align-items-center gap-2 shadow-sm border-0"
                                                                >
                                                                    <CheckCircle size={14} /> AUTHORIZE
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedComplaint(detailData); setAction('reject'); setShowModal(true); }}
                                                                    className="btn btn-danger rounded-pill px-4 py-2 extra-small fw-black d-flex align-items-center gap-2 shadow-sm border-0"
                                                                >
                                                                    <XCircle size={14} /> REJECT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

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
                                                </>
                                            ) : (
                                                <div className="vstack gap-0">
                                                    {(detailData.history || []).map((log, idx) => (
                                                        <div key={idx} className="d-flex gap-4 position-relative pb-4">
                                                            {idx !== (detailData.history.length - 1) && (
                                                                <div className="position-absolute h-100 border-start border-2 border-primary border-opacity-10" style={{ left: '19px', top: '10px' }}></div>
                                                            )}
                                                            <div className="rounded-circle bg-white shadow-sm border border-primary border-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', zIndex: 1, minWidth: '40px' }}>
                                                                <Info size={16} className="text-primary" />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <span className="extra-small fw-black text-primary uppercase tracking-widest">{log.status}</span>
                                                                    <span className="extra-small text-muted fw-bold opacity-40">{new Date(log.changedAt || log.createdAt).toLocaleString()}</span>
                                                                </div>
                                                                <div className="extra-small text-muted fw-bold uppercase opacity-50 mb-2">BY: {log.changedBy || 'SYSTEM'}</div>
                                                                <p className="extra-small text-dark fw-bold mb-0 opacity-70 italic bg-light p-3 rounded-3 border-start border-2 border-primary border-opacity-20">
                                                                    "{log.remarks || 'Standard diagnostic update'}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(detailData.history || []).length === 0 && (
                                                        <div className="text-center py-5">
                                                            <History size={32} className="text-muted opacity-20 mb-3" />
                                                            <p className="extra-small fw-black text-muted uppercase tracking-widest">No history logs synchronized.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-lg-5">
                                            <div className="vstack gap-4">
                                                <div className="p-4 rounded-4 bg-light border">
                                                    <div className="extra-small fw-black text-muted uppercase opacity-40 mb-3 tracking-widest">Deployment Matrix</div>
                                                    <div className="vstack gap-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle p-2 bg-white shadow-sm text-primary" style={{ color: PRIMARY_COLOR }}><Building2 size={16} /></div>
                                                            <div><small className="extra-small text-muted fw-bold d-block">UNIT</small><span className="small fw-black text-dark uppercase">{detailData.departmentName?.replace(/_/g, ' ')}</span></div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle p-2 bg-white shadow-sm text-success"><User size={16} /></div>
                                                            <div><small className="extra-small text-muted fw-bold d-block">OPERATIVE</small><span className="small fw-black text-dark uppercase">{detailData.assignedOfficerName || 'UNASSIGNED'}</span></div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle p-2 bg-white shadow-sm text-info"><Clock size={16} /></div>
                                                            <div><small className="extra-small text-muted fw-bold d-block">FILED ON</small><span className="small fw-black text-dark">{new Date(detailData.createdAt).toLocaleDateString()}</span></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {detailData.imageUrls?.length > 0 && (
                                                    <div className="rounded-4 overflow-hidden border shadow-sm">
                                                        <img src={detailData.imageUrls[0]} alt="Evidence" className="img-fluid" />
                                                        <div className="p-2 bg-light text-center">
                                                            <span className="extra-small fw-black text-muted uppercase opacity-40">Primary Evidence Archive</span>
                                                        </div>
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

            {/* Action Modal */}
            {showModal && (
                <div className="modal-backdrop-premium d-flex align-items-center justify-content-center p-3 animate-fadeIn" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 3000 }}>
                    <div className="modal-content-premium bg-white rounded-4 shadow-2xl p-4 p-xl-5 w-100 animate-slideUp" style={{ maxWidth: '600px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                            <h5 className="fw-black mb-0 uppercase tracking-tight">System Verification Log</h5>
                            <button onClick={() => setShowModal(false)} className="btn btn-light rounded-circle p-2 border-0"><XCircle size={20} /></button>
                        </div>
                        <div className="mb-4">
                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60">Audit Remarks / Justification</label>
                            <textarea
                                className="form-control border-2 shadow-none extra-small fw-black p-4 rounded-4 bg-light focus-bg-white"
                                rows="5"
                                placeholder="Enter detailed remarks for the official record..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                style={{ resize: 'none' }}
                            ></textarea>
                        </div>
                        <div className="d-flex gap-3">
                            <button onClick={() => setShowModal(false)} className="btn btn-light rounded-pill flex-grow-1 py-3 fw-black extra-small border-2 transition-all">ABORT</button>
                            <button
                                onClick={handleAction}
                                className={`btn rounded-pill flex-grow-1 py-3 fw-black extra-small shadow-lg border-0 transition-all hover-up-tiny ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                            >
                                {action === 'approve' ? 'AUTHORIZE RESOLUTION' : 'REJECT RESOLUTION'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .ward-officer-complaints { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up-tiny:hover { transform: translateY(-4px); }
                .hover-light-bg:hover { background-color: #f8fafc !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .focus-bg-white:focus { background-color: #FFFFFF !important; border-color: ${PRIMARY_COLOR}30 !important; }
            `}} />
        </div>
    );
}
