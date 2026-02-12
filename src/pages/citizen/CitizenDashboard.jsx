import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import {
    Plus, FileText, Clock, CheckCircle, Shield,
    Activity, RefreshCw, MapPin, User, Building2,
    TrendingUp, Bell, ArrowRight, ShieldAlert,
    LayoutDashboard, Map as MapIcon, Info, Compass, Smartphone, ShieldCheck, Zap, ChevronRight
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../hooks/useToast';
import ComplaintCard from '../../components/complaints/ComplaintCard';

/**
 * Premium Strategic Citizen Dashboard
 * Unified resident experience with high-contrast tactical hub.
 */
const CitizenDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [dashboardData, setDashboardData] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [wardComplaints, setWardComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [userName, setUserName] = useState(localStorage.getItem('name') || 'Citizen');
    const PRIMARY_COLOR = '#173470';

    const formatDate = (dateString) => {
        if (!dateString) return 'n/a';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [profileRes, dashRes] = await Promise.allSettled([
                apiService.profile.getProfile(),
                apiService.citizen.getDashboard()
            ]);

            if (profileRes.status === 'fulfilled') {
                const profile = profileRes.value.data || profileRes.value;
                setUserProfile(profile);
                if (profile.name) {
                    setUserName(profile.name);
                    localStorage.setItem('name', profile.name);
                }

                // Fetch area activity if profile is available and not in dashboard data
                const wardId = profile.wardId || profile.ward?.id || profile.ward?.wardId;
                if (wardId && (!dashRes.value?.data?.wardComplaints)) {
                    apiService.citizen.getWardComplaints()
                        .then(res => {
                            const data = res.data?.content || res.content || res.data || res;
                            setWardComplaints(Array.isArray(data) ? data : []);
                        })
                        .catch(() => { });
                }
            }

            if (dashRes.status === 'fulfilled') {
                const data = dashRes.value.data || dashRes.value;
                setDashboardData(data);

                // Use dashboard data for recent and ward activity if provided
                if (data.recentComplaints) {
                    setRecentComplaints(data.recentComplaints);
                }
                if (data.wardComplaints) {
                    setWardComplaints(data.wardComplaints);
                }
            } else {
                // Fallback for totals
                const res = await apiService.citizen.getMyComplaints({ size: 100 });
                const list = res.content || res.data || [];
                setDashboardData({
                    totalComplaints: list.length,
                    pendingComplaints: list.filter(c => ['SUBMITTED', 'ASSIGNED'].includes(c.status)).length,
                    inProgressComplaints: list.filter(c => c.status === 'IN_PROGRESS').length,
                    resolvedComplaints: list.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length
                });
                setRecentComplaints(list.slice(0, 4));
            }

        } catch (err) {
            console.error('Data fetch failure:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !dashboardData) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted extra-small uppercase">Syncing Mission Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="citizen-dashboard min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="CITIZEN COMMAND"
                userName={userName}
                wardName={userProfile?.ward?.areaName || userProfile?.wardName || 'PMC CENTRAL HUB'}
                subtitle="OFFICIAL RESIDENT PORTAL | MUNICIPAL ACTION CENTER"
                icon={ShieldIcon}
                showProfileInitials={true}
                actions={
                    <button
                        onClick={() => navigate('/citizen/register-complaint')}
                        className="btn btn-primary shadow-premium rounded-circle d-flex align-items-center justify-content-center hover-up transition-all"
                        style={{ width: '60px', height: '60px', backgroundColor: PRIMARY_COLOR, border: 'none' }}
                        title="File New Report"
                    >
                        <Plus size={32} strokeWidth={3} />
                    </button>
                }
            />

            <div className="container-fluid px-4 animate-fadeIn" style={{ marginTop: '-40px' }}>
                {/* Tactical KPI Matrix */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'REPORTED', val: dashboardData?.totalComplaints || 0, icon: FileText, color: PRIMARY_COLOR, bg: '#EBF2FF' },
                        { label: 'PENDING', val: (dashboardData?.pendingComplaints || 0) + (dashboardData?.submittedComplaints || 0), icon: Clock, color: '#6366F1', bg: '#F5F3FF' },
                        { label: 'ACTIVE', val: (dashboardData?.inProgressComplaints || 0) + (dashboardData?.assignedComplaints || 0) + (dashboardData?.resolvedComplaints || 0), icon: Activity, color: '#F59E0B', bg: '#FFFCF5' },
                        { label: 'EXECUTED', val: (dashboardData?.closedComplaints || 0) + (dashboardData?.approvedComplaints || 0), icon: CheckCircle, color: '#10B981', bg: '#ECFDF5' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-6 col-sm-6 col-lg-3">
                            <div className="card b-none shadow-premium p-4 h-100 bg-white rounded-4 transition-all hover-up border-top border-5" style={{ borderTopColor: s.color }}>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '54px', height: '54px', backgroundColor: s.bg, color: s.color }}>
                                        <s.icon size={26} strokeWidth={2.5} />
                                    </div>
                                    <Zap size={18} className="text-muted opacity-10" />
                                </div>
                                <h1 className="fw-black mb-1 text-dark display-5" style={{ letterSpacing: '-2px' }}>{s.val}</h1>
                                <p className="extra-small fw-black text-muted mb-0 opacity-40 uppercase tracking-widest">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    {/* Primary Feed Quadrant */}
                    <div className="col-xl-8">
                        {/* Section 1: My Reports */}
                        <div className="d-flex align-items-center justify-content-between mb-5 bg-white p-4 rounded-4 shadow-sm border-start border-5" style={{ borderColor: PRIMARY_COLOR }}>
                            <div>
                                <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">Recent Activity</h5>
                                <p className="extra-small text-muted fw-bold uppercase mb-0 opacity-50">Status of your personal reports</p>
                            </div>
                            <button onClick={() => navigate('/citizen/complaints')} className="btn btn-dark rounded-pill px-4 py-2 extra-small fw-black transition-all hover-up-tiny">VIEW ALL REPORTS</button>
                        </div>

                        {(!Array.isArray(recentComplaints) || recentComplaints.length === 0) ? (
                            <div className="card b-none shadow-premium p-5 text-center bg-white rounded-4 mb-5 border-dashed border-2">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '100px', height: '100px' }}>
                                    <ShieldAlert size={48} className="text-muted opacity-20" />
                                </div>
                                <h4 className="fw-black text-dark mb-2 uppercase">No Active Reports</h4>
                                <p className="extra-small text-muted fw-bold uppercase mb-4 px-lg-5">
                                    You have not submitted any reports yet. <br />
                                    Reporting helps improve your neighborhood.
                                </p>
                                <button onClick={() => navigate('/citizen/register-complaint')} className="btn btn-primary px-5 py-3 rounded-pill fw-black extra-small shadow-premium border-0" style={{ backgroundColor: PRIMARY_COLOR }}>
                                    REPORT NEW ISSUE
                                </button>
                            </div>
                        ) : (
                            <div className="row g-4 mb-5">
                                {Array.isArray(recentComplaints) && recentComplaints.map((c) => (
                                    <div key={c.id || c.complaintId} className="col-md-6">
                                        <div className="card b-none shadow-premium rounded-4 overflow-hidden h-100 transition-all hover-up border-start border-5" style={{ borderLeftColor: PRIMARY_COLOR }}>
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between mb-3">
                                                    <span className="extra-small fw-black text-muted opacity-40">#{c.complaintId || c.id}</span>
                                                    <StatusBadge status={c.status} size="sm" />
                                                </div>
                                                <h6 className="fw-black text-dark mb-3 text-uppercase">{c.title}</h6>
                                                <div className="d-flex align-items-center gap-3 mb-4">
                                                    <div className="p-2 rounded bg-light"><Building2 size={14} className="text-muted" /></div>
                                                    <span className="extra-small fw-bold text-muted uppercase">{(c.departmentName || 'GENERAL').replace(/_/g, ' ')}</span>
                                                </div>
                                                <div className="border-top pt-3 mt-auto d-flex justify-content-between align-items-center">
                                                    <span className="extra-small text-muted fw-bold">{formatDate(c.createdAt)}</span>
                                                    <button onClick={() => navigate(`/citizen/complaints/${c.id || c.complaintId}`)} className="btn btn-outline-primary btn-sm border-2 rounded-circle hover-up" style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}>
                                                        <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Section 2: Entire Ward Complaints Archive */}
                        <div className="d-flex align-items-center justify-content-between mb-5 bg-dark p-4 rounded-4 shadow-lg">
                            <div>
                                <h5 className="fw-black text-white mb-1 uppercase tracking-tight">Area Activity</h5>
                                <p className="extra-small text-white uppercase mb-0 opacity-50">Local reports in your neighborhood</p>
                            </div>
                            <span className="badge bg-primary px-3 py-2 rounded-pill extra-small fw-black" style={{ backgroundColor: PRIMARY_COLOR }}>LIVE FEED</span>
                        </div>

                        <div className="card b-none shadow-premium bg-white overflow-hidden rounded-4 mb-5">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Issue Details</th>
                                            <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Department</th>
                                            <th className="py-4 border-0 text-center extra-small fw-black text-muted uppercase tracking-widest">Current Status</th>
                                            <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase">View</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wardComplaints.length > 0 ? wardComplaints.map((item) => (
                                            <tr key={item.id || item.complaintId} className="cursor-pointer transition-all hover-light" onClick={() => navigate(`/citizen/complaints/${item.id || item.complaintId}`)}>
                                                <td className="px-5 py-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="p-2 rounded bg-light border"><FileText size={16} className="text-muted" /></div>
                                                        <div>
                                                            <div className="fw-black text-dark small uppercase">{item.title}</div>
                                                            <div className="extra-small text-muted fw-bold opacity-40 uppercase mt-1">Ref: #{item.complaintId || item.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="extra-small fw-black text-muted uppercase">{(item.departmentName || 'General').replace(/_/g, ' ')}</span>
                                                </td>
                                                <td className="text-center">
                                                    <StatusBadge status={item.status} size="sm" />
                                                </td>
                                                <td className="px-5 text-end">
                                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm border hover-up transition-all" style={{ width: '38px', height: '38px', backgroundColor: '#F8FAFC', color: PRIMARY_COLOR }}>
                                                        <ArrowRight size={16} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5">
                                                    <div className="p-4 rounded-circle bg-light d-inline-block mb-3">
                                                        <MapIcon size={32} className="text-muted opacity-20" />
                                                    </div>
                                                    <p className="extra-small fw-black text-muted uppercase opacity-40">Scanning for sector activity...</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Control Panel */}
                    <div className="col-xl-4">
                        <div className="sticky-top" style={{ top: '110px' }}>
                            <div className="card b-none shadow-premium bg-white p-4 mb-4 rounded-4 border-top border-5" style={{ borderTopColor: '#10B981' }}>
                                <h6 className="fw-black text-dark mb-4 uppercase tracking-[0.2em] opacity-40 border-bottom pb-4">Mission Links</h6>
                                <div className="d-grid gap-3">
                                    {[
                                        { label: 'Strategic Officers', icon: User, path: '/citizen/officers', color: PRIMARY_COLOR, bg: '#EBF2FF' },
                                        { label: 'Sector Tactical Map', icon: MapIcon, path: '/citizen/map', color: '#6366F1', bg: '#F5F5FF' },
                                        { label: 'SLA Tracking Ledger', icon: Clock, path: '/citizen/sla', color: '#F59E0B', bg: '#FFF9EB' },
                                        { label: 'Management Profile', icon: ShieldCheck, path: '/citizen/profile', color: '#1E293B', bg: '#F8FAFC' }
                                    ].map((link, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => navigate(link.path)}
                                            className="btn btn-light bg-white p-4 d-flex align-items-center gap-4 border shadow-sm transition-all rounded-4 hover-up-small text-start border-start border-5"
                                            style={{ borderLeftColor: link.color }}
                                        >
                                            <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', backgroundColor: link.bg, color: link.color }}>
                                                <link.icon size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <span className="fw-black text-dark extra-small uppercase tracking-widest d-block mb-1">{link.label}</span>
                                                <span className="extra-small fw-bold text-muted uppercase opacity-40">View Protocol</span>
                                            </div>
                                            <ChevronRight size={18} className="opacity-20" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Operational Integrity */}
                            <div className="card b-none shadow-premium p-4 rounded-4 position-relative overflow-hidden bg-dark">
                                <div className="position-absolute bottom-0 end-0 p-3 opacity-10">
                                    <ShieldCheck size={160} strokeWidth={1} className="text-white" />
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-success rounded-circle animate-pulse" style={{ width: '12px', height: '12px', boxShadow: '0 0 20px #10B981' }}></div>
                                    <h6 className="fw-black text-white extra-small uppercase tracking-widest mb-0 opacity-80">INTEGRITY LOCK</h6>
                                </div>
                                <p className="extra-small text-white opacity-60 uppercase tracking-wider mb-0 lh-relaxed fw-black">
                                    Operational data is encrypted under municipal protocol. 24/7 Citizen-Command synchronization active.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1) !important; }
                .hover-up-small:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .b-none { border: none !important; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                .hover-light:hover { background-color: #F8FAFC !important; }
            `}} />
        </div>
    );
};

const ShieldIcon = (props) => (
    <div {...props} className="d-flex align-items-center justify-content-center">
        <ShieldCheck {...props} />
    </div>
);

export default CitizenDashboard;
