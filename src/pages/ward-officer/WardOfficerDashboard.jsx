import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import {
    ClipboardList, AlertTriangle, CheckCircle, Clock,
    Users, Activity, ArrowRight, UserPlus, Shield, Target, Zap, Building2
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DashboardHeader from '../../components/layout/DashboardHeader';

const EnhancedWardOfficerDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [stats, setStats] = useState({
        active: 0,
        closed: 0,
        pendingApprovals: 0,
        wardId: 0,
        wardName: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingApprovals, setPendingApprovals] = useState([]);

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [analyticsRes, approvalsRes] = await Promise.all([
                apiService.wardOfficer.getDashboardAnalytics().catch(() => ({ data: {} })),
                apiService.wardOfficer.getPendingApprovals().catch(() => ({ data: [] }))
            ]);

            const analytics = analyticsRes.data || analyticsRes;
            const cards = analytics.cards || {};

            setStats({
                active: cards.inProgress || 0,
                closed: cards.closed || 0,
                pendingApprovals: cards.pendingApproval || 0,
                wardId: analytics.wardId || 0,
                wardName: analytics.wardName || 'Assigned Ward'
            });

            const approvals = approvalsRes.data || approvalsRes || [];
            setPendingApprovals(Array.isArray(approvals) ? approvals : (approvals.content || []));
            setError('');
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError('Failed to load dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    const userName = localStorage.getItem('name') || "Ward Officer";

    return (
        <div className="ward-officer-dashboard pb-5">
            <DashboardHeader
                portalName="PMC WARD OPERATIONS"
                userName={userName}
                wardName={stats.wardName}
                subtitle="Local Area Governance & Service Verification Hub"
                icon={Shield}
                actions={
                    <button className="btn btn-white bg-white rounded-pill px-4 extra-small fw-black shadow-premium border-0 d-flex align-items-center gap-2" onClick={() => navigate('/ward-officer/register-officer')}>
                        <UserPlus size={16} /> REGISTER DEPT OFFICER
                    </button>
                }
            />

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-45px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center justify-content-between" role="alert">
                        <span>{error}</span>
                        <button type="button" className="btn-close shadow-none" onClick={() => setError('')}></button>
                    </div>
                )}

                {/* Quick Stats Cards */}
                <div className="row g-4 mb-5">
                    {/* Action Required Card */}
                    <div className="col-lg-4">
                        <div
                            className="card border-0 shadow-premium rounded-5 h-100 overflow-hidden position-relative transition-all hover-up-tiny cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
                            onClick={() => navigate('/ward-officer/approvals')}
                        >
                            <AlertTriangle size={150} className="position-absolute opacity-10 text-white" style={{ right: '-30px', bottom: '-30px' }} />
                            <div className="card-body p-4 p-xl-5 text-white position-relative">
                                <Activity size={24} className="mb-4 opacity-80" />
                                <h1 className="display-4 fw-black mb-1 tabular-nums">{stats.pendingApprovals}</h1>
                                <p className="extra-small fw-black uppercase tracking-widest opacity-80 mb-0">Pending Approvals</p>
                                <div className="mt-4 pt-4 border-top border-white border-opacity-10 d-flex align-items-center gap-2 extra-small fw-black">
                                    ACTION REQUIRED <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Deployment */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-5 h-100 overflow-hidden position-relative transition-all hover-up-tiny" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #173470 100%)' }}>
                            <Target size={150} className="position-absolute opacity-10 text-white" style={{ right: '-30px', bottom: '-30px' }} />
                            <div className="card-body p-4 p-xl-5 text-white position-relative">
                                <Clock size={24} className="mb-4 opacity-80" />
                                <h1 className="display-4 fw-black mb-1 tabular-nums">{stats.active}</h1>
                                <p className="extra-small fw-black uppercase tracking-widest opacity-80 mb-0">Active Issues</p>
                                <div className="mt-4 pt-4 border-top border-white border-opacity-10 d-flex align-items-center gap-2 extra-small fw-black opacity-60">
                                    FIELD WORK IN PROGRESS
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resolved & Closed */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-5 h-100 overflow-hidden position-relative transition-all hover-up-tiny" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                            <CheckCircle size={150} className="position-absolute opacity-10 text-white" style={{ right: '-30px', bottom: '-30px' }} />
                            <div className="card-body p-4 p-xl-5 text-white position-relative">
                                <Shield size={24} className="mb-4 opacity-80" />
                                <h1 className="display-4 fw-black mb-1 tabular-nums">{stats.closed}</h1>
                                <p className="extra-small fw-black uppercase tracking-widest opacity-80 mb-0">Archived Cases</p>
                                <div className="mt-4 pt-4 border-top border-white border-opacity-10 d-flex align-items-center gap-2 extra-small fw-black opacity-60">
                                    SYSTEM VERIFIED
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Recent Pending Verification */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden h-100">
                            <div className="card-header bg-white p-4 p-xl-5 border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-1 opacity-40">Verification Queue</h6>
                                    <h5 className="fw-black mb-0">Pending Approvals</h5>
                                </div>
                                <button className="btn btn-dark rounded-pill px-4 extra-small fw-black shadow-sm" onClick={() => navigate('/ward-officer/approvals')}>VIEW ALL</button>
                            </div>
                            <div className="card-body p-0">
                                {pendingApprovals.length === 0 ? (
                                    <div className="text-center py-5">
                                        <CheckCircle size={48} className="mb-3 opacity-10 text-success" />
                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0">No cases awaiting verification</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <tbody>
                                                {pendingApprovals.slice(0, 5).map(approval => (
                                                    <tr key={approval.id} className="cursor-pointer" onClick={() => navigate('/ward-officer/approvals')}>
                                                        <td className="ps-5 py-4">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="bg-light rounded-pill p-2"><ClipboardList size={16} className="text-primary" /></div>
                                                                <div>
                                                                    <span className="extra-small fw-black text-dark uppercase">{approval.title}</span><br />
                                                                    <span className="extra-small fw-bold text-muted">#{approval.complaintId || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="extra-small fw-black text-muted uppercase">
                                                            Fixed by {approval.assignedOfficerName || 'Officer'}
                                                        </td>
                                                        <td className="pe-5 text-end">
                                                            <button className="btn btn-outline-primary rounded-pill px-4 extra-small fw-black">REVIEW</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Command Center */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden mb-4">
                            <div className="card-header bg-white p-4 border-bottom">
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">Command Center</h6>
                            </div>
                            <div className="list-group list-group-flush">
                                <button className="list-group-item list-group-item-action p-4 border-0 d-flex align-items-center gap-3 hover-light transition-all" onClick={() => navigate('/ward-officer/register-officer')}>
                                    <div className="p-2 rounded-4 bg-primary bg-opacity-10 text-primary"><UserPlus size={20} /></div>
                                    <div>
                                        <h6 className="mb-0 fw-black extra-small uppercase tracking-widest">Register Officer</h6>
                                        <small className="extra-small fw-bold text-muted">Add new deployment units</small>
                                    </div>
                                </button>
                                <button className="list-group-item list-group-item-action p-4 border-0 d-flex align-items-center gap-3 hover-light transition-all" onClick={() => navigate('/ward-officer/complaints')}>
                                    <div className="p-2 rounded-4 bg-success bg-opacity-10 text-success"><ClipboardList size={20} /></div>
                                    <div>
                                        <h6 className="mb-0 fw-black extra-small uppercase tracking-widest">Ward Ledger</h6>
                                        <small className="extra-small fw-bold text-muted">Audit all area issues</small>
                                    </div>
                                </button>
                                <button className="list-group-item list-group-item-action p-4 border-0 d-flex align-items-center gap-3 hover-light transition-all" onClick={() => navigate('/ward-officer/officers')}>
                                    <div className="p-2 rounded-4 bg-info bg-opacity-10 text-info"><Building2 size={20} /></div>
                                    <div>
                                        <h6 className="mb-0 fw-black extra-small uppercase tracking-widest">Deployment Roster</h6>
                                        <small className="extra-small fw-bold text-muted">Manage assigned personnel</small>
                                    </div>
                                </button>
                                <button className="list-group-item list-group-item-action p-4 border-0 d-flex align-items-center gap-3 hover-light transition-all" onClick={() => navigate('/ward-officer/ward-changes')}>
                                    <div className="p-2 rounded-4 bg-warning bg-opacity-10 text-warning"><Users size={20} /></div>
                                    <div>
                                        <h6 className="mb-0 fw-black extra-small uppercase tracking-widest">Transfer Requests</h6>
                                        <small className="extra-small fw-bold text-muted">Approve area changes</small>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Resource Card */}
                        <div className="card border-0 shadow-premium rounded-5 bg-dark p-4 p-xl-5 text-white position-relative overflow-hidden">
                            <Zap size={100} className="position-absolute opacity-10 text-white" style={{ right: '-20px', bottom: '-20px' }} />
                            <h5 className="fw-black uppercase mb-3">Institutional Oversight</h5>
                            <p className="extra-small fw-bold opacity-60 mb-0">Ensure all resolutions are verified with photographic evidence before final approval.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .ward-officer-dashboard { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up-tiny:hover { transform: translateY(-4px); }
                .hover-light:hover { background-color: #f8fafc; }
                .tabular-nums { font-variant-numeric: tabular-nums; }

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

export default EnhancedWardOfficerDashboard;
