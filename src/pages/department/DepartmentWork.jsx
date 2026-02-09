import React, { useState, useEffect, useMemo } from 'react';
import {
    Briefcase, Search, RefreshCw, Loader,
    Clock, AlertTriangle, CheckCircle,
    Calendar, Shield, ChevronRight, X,
    PlayCircle, Activity, FileText, ArrowRight, Play,
    Smartphone, Map as MapIcon, User, Target, TrendingUp, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { extractImageUrl } from '../../utils/imageUtils';
import DashboardHeader from '../../components/layout/DashboardHeader';

const DepartmentWork = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [officerName, setOfficerName] = useState(localStorage.getItem('name') || 'Officer');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const { showToast } = useToast();
    const navigate = useNavigate();

    const brandColor = '#244799';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            if (!complaints.length) setLoading(true);

            // Fetch from verified sources as per security configuration
            const [statsRes, assignedRes] = await Promise.allSettled([
                apiService.departmentOfficer.getDashboardSummary(),
                apiService.departmentOfficer.getAssignedComplaints({ page: 0, size: 2000 })
            ]);

            // 1. Handle Stats & Officer Profile (Consolidated Fallback)
            if (statsRes.status === 'fulfilled') {
                const resData = statsRes.value.data || statsRes.value;
                setStats(resData.statistics || resData);
                if (resData.officerName) {
                    setOfficerName(resData.officerName);
                    localStorage.setItem('name', resData.officerName);
                }
            } else {
                console.warn('Dashboard summary sync failed, deriving local stats.');
            }

            // 2. Handle Work List
            let allWork = [];

            if (assignedRes.status === 'fulfilled') {
                const data = assignedRes.value.data || assignedRes.value;
                const list = data?.content || data?.complaints || data?.data || (Array.isArray(data) ? data : []);
                allWork = Array.isArray(list) ? list : [];
            } else {
                allWork = [];
                console.error('Work delivery stream restricted (403/Forbidden)');
            }

            // Deduplicate by ID
            const uniqueMap = new Map();
            allWork.forEach(item => {
                if (item && typeof item === 'object') {
                    const id = item.complaintId || item.id;
                    if (id && !uniqueMap.has(id)) {
                        uniqueMap.set(id, item);
                    }
                }
            });

            const cleanWork = Array.from(uniqueMap.values());
            setComplaints(cleanWork);

            // DERIVE STATS LOCALLY IF SUMMARY FAILED
            if (statsRes.status !== 'fulfilled') {
                setStats({
                    totalAssigned: cleanWork.length,
                    inProgress: cleanWork.filter(c => c.status === 'IN_PROGRESS').length,
                    pending: cleanWork.filter(c => c.status === 'ASSIGNED').length,
                    resolved: cleanWork.filter(c => c.status === 'RESOLVED').length,
                    breached: cleanWork.filter(c => c.slaStatus === 'BREACHED').length
                });
            }

        } catch (error) {
            console.error('Operational Sync Error:', error);
            showToast('Unable to synchronize workflow registry.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleQuickStart = async (e, id) => {
        e.stopPropagation(); // Don't navigate to detail
        try {
            await apiService.departmentOfficer.startWork(id);
            showToast('Work started successfully.', 'success');
            fetchData();
        } catch (err) {
            showToast('Failed to start work.', 'error');
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const filteredWork = useMemo(() => {
        return complaints.filter(task => {
            const search = (searchTerm || '').toLowerCase();
            const titleMatch = (task.title || '').toLowerCase().includes(search);
            const idMatch = (task.complaintId || task.id || '').toString().includes(search);
            const matchesSearch = !searchTerm || titleMatch || idMatch;

            const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [complaints, searchTerm, filterStatus]);

    const formatDate = (dateString) => {
        if (!dateString) return 'PENDING';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    if (loading && !complaints.length) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: brandColor }} />
            <p className="fw-black text-dark text-uppercase tracking-widest small">Synchronizing System...</p>
        </div>
    );

    const kpiCards = [
        { label: 'Total Assigned', value: stats?.totalAssigned || complaints.length, icon: Target, color: brandColor, bg: '#EFF6FF' },
        { label: 'Active Tasks', value: stats?.inProgress || complaints.filter(c => c.status === 'IN_PROGRESS').length, icon: Activity, color: '#059669', bg: '#ECFDF5' },
        { label: 'New Action', value: stats?.pending || complaints.filter(c => c.status === 'ASSIGNED').length, icon: Clock, color: '#D97706', bg: '#FFFBEB' },
        { label: 'SLA Alert', value: stats?.breached || 0, icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2' }
    ];

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Premium Header */}
            <DashboardHeader
                portalName="FIELD OPERATIONS"
                userName={officerName}
                wardName="Active Registry"
                subtitle="OFFICIAL ASSIGNED TASKS & WORKFLOW"
                icon={Target}
                showProfileInitials={true}
                actions={
                    <button
                        onClick={handleRefresh}
                        className="btn btn-outline-light rounded-circle p-2 shadow-lg border transition-all hover-up d-flex align-items-center justify-content-center"
                        disabled={refreshing}
                        style={{ width: '45px', height: '45px', color: 'white' }}
                        title="SYNC DATA"
                    >
                        <RefreshCw size={20} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                }
            />

            <div className="container" style={{ marginTop: '-40px' }}>
                {/* Stats Matrix */}
                <div className="row g-4 mb-5">
                    {kpiCards.map((stat, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                            <div className="card h-100 border-0 shadow-sm hover-up transition-all position-relative overflow-hidden group"
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                }}>
                                <div className="card-body p-4 text-center">
                                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: stat.bg, color: stat.color, width: '64px', height: '64px' }}>
                                        <stat.icon size={28} />
                                    </div>
                                    <h2 className="display-6 fw-black mb-1 tracking-tight" style={{ color: stat.color }}>{stat.value}</h2>
                                    <p className="text-muted fw-bold text-uppercase extra-small tracking-widest mb-0 opacity-70">{stat.label}</p>
                                </div>
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '4px', backgroundColor: stat.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Intelligent Filter Bar */}
                <div className="card border-0 shadow-lg bg-white p-4 mb-5 overflow-hidden gov-rounded elevation-1">
                    <div className="row g-3">
                        <div className="col-lg-7">
                            <div className="input-group overflow-hidden border-0 bg-light shadow-inner transition-all focus-within-primary" style={{ borderRadius: '30px' }}>
                                <span className="input-group-text bg-transparent border-0 ps-4"><Search size={18} className="text-primary" /></span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent border-0 py-3 fs-6 fw-bold px-0 shadow-none text-uppercase text-details"
                                    placeholder="Search by ID or Issue Title..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="btn border-0 text-muted shadow-none pe-4" onClick={() => setSearchTerm('')}><X size={16} /></button>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="input-group overflow-hidden border-0 bg-light shadow-inner transition-all h-100" style={{ borderRadius: '30px' }}>
                                <span className="input-group-text bg-transparent border-0 ps-4"><Filter size={18} className="text-primary" /></span>
                                <select
                                    className="form-select bg-transparent border-0 py-3 fw-black shadow-none extra-small text-uppercase tracking-widest text-dark"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL">ALL COMMANDS</option>
                                    <option value="ASSIGNED">NEW DEPLOYMENT</option>
                                    <option value="IN_PROGRESS">IN RECTIFICATION</option>
                                    <option value="RESOLVED">VALIDATED RESOLUTION</option>
                                    <option value="CLOSED">FINALIZED ARCHIVE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Command Feed */}
                <div className="row g-4">
                    <div className="col-12 mb-2 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 text-white shadow-sm elevation-1" style={{ backgroundColor: brandColor, borderRadius: '8px' }}><FileText size={20} /></div>
                            <h5 className="fw-black text-dark text-uppercase tracking-wider mb-0 text-details">Department Task Registry</h5>
                        </div>
                        <div className="extra-small fw-black text-muted tracking-widest bg-white px-4 py-2 shadow-sm border text-details gov-rounded">
                            {filteredWork.length} ASSIGNED NODES
                        </div>
                    </div>

                    {filteredWork.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-lg p-5 text-center bg-white border-dashed border-2 gov-rounded elevation-1">
                                <div className="p-4 bg-light d-inline-block mb-3 border rounded-circle shadow-inner">
                                    <Shield size={64} className="text-primary opacity-20" />
                                </div>
                                <h6 className="fw-black text-dark text-uppercase tracking-widest extra-small">Registry Status: Clear</h6>
                                <p className="text-dark extra-small fw-bold opacity-60 uppercase mt-2">No municipal records matching your command were found.</p>
                                <button onClick={handleRefresh} className="btn btn-primary px-5 py-3 mt-3 fw-black extra-small tracking-widest shadow-sm elevation-1" style={{ backgroundColor: brandColor, borderRadius: '30px' }}>SYNC DATABASE</button>
                            </div>
                        </div>
                    ) : (
                        <div className="col-12">
                            <div className="card border-0 shadow-lg overflow-hidden bg-white gov-rounded elevation-2">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light border-bottom">
                                            <tr>
                                                <th className="px-4 py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Tracking ID & Title</th>
                                                <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Workflow State</th>
                                                <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Priority / SLA</th>
                                                <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Received On</th>
                                                <th className="px-4 py-4 border-0 text-end text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredWork.map(task => (
                                                <tr key={task.complaintId || task.id} className="transition-all hover:bg-light cursor-pointer" onClick={() => navigate(`/department/complaints/${task.complaintId || task.id}`)}>
                                                    <td className="px-4 py-4 text-nowrap">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="p-2 bg-light border fw-black extra-small text-primary text-details" style={{ minWidth: '80px', textAlign: 'center', borderRadius: '4px' }}>
                                                                #{task.complaintId || task.id}
                                                            </div>
                                                            <div>
                                                                <div className="fw-black text-dark small text-uppercase tracking-tight text-details">{task.title}</div>
                                                                <div className="extra-small text-muted fw-bold opacity-60 text-details">PMC Workflow Node</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column gap-1">
                                                            <StatusBadge status={task.status} size="sm" />
                                                            <div className="d-flex gap-1" style={{ width: '80px' }}>
                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                    <div key={i} style={{ height: '3px', flex: 1, backgroundColor: i <= (['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].indexOf(task.status) + 1) ? brandColor : '#E2E8F0', borderRadius: '0' }}></div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column gap-2">
                                                            <PriorityBadge priority={task.priority} size="sm" />
                                                            <div className={`d-flex align-items-center gap-1 extra-small fw-black ${task.slaStatus === 'BREACHED' ? 'text-danger' : 'text-success'}`}>
                                                                <div className={`rounded-0 ${task.slaStatus === 'BREACHED' ? 'bg-danger animate-pulse' : 'bg-success'}`} style={{ width: '6px', height: '6px' }}></div>
                                                                {task.slaStatus || 'SLA_OK'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2 text-muted fw-bold extra-small uppercase">
                                                            <Calendar size={12} className="text-primary" /> {formatDate(task.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 text-end">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            {task.status === 'ASSIGNED' ? (
                                                                <button
                                                                    onClick={(e) => handleQuickStart(e, task.complaintId || task.id)}
                                                                    className="btn btn-primary px-4 py-2 fw-black extra-small tracking-widest shadow-sm border-0 d-flex align-items-center gap-2 elevation-1"
                                                                    style={{ backgroundColor: brandColor, borderRadius: '30px' }}
                                                                >
                                                                    <PlayCircle size={14} /> START
                                                                </button>
                                                            ) : (
                                                                <button className="btn btn-white bg-white shadow-sm border px-4 py-2 fw-black extra-small text-primary tracking-widest elevation-1" style={{ borderRadius: '30px' }}>
                                                                    MANAGE
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sub-Actions Interface */}
                <div className="row g-4 mt-5">
                    {[
                        { label: 'Interactive Map', icon: MapIcon, path: '/department/map', color: brandColor, bg: '#EFF6FF' },
                        { label: 'System Analytics', icon: TrendingUp, path: '/department/analytics', color: '#059669', bg: '#ECFDF5' },
                        { label: 'Profile Settings', icon: User, path: '/department/profile', color: '#6366F1', bg: '#EEF2FF' }
                    ].map((link, idx) => (
                        <div key={idx} className="col-md-4">
                            <div
                                onClick={() => navigate(link.path)}
                                className="card border-0 shadow-sm p-4 bg-white transition-all hover-up-small cursor-pointer d-flex flex-row align-items-center gap-3 gov-rounded elevation-1"
                            >
                                <div className="p-3 shadow-inner rounded-circle elevation-1" style={{ backgroundColor: link.bg, color: link.color }}>
                                    <link.icon size={22} />
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="fw-black text-dark mb-0 tracking-wider text-uppercase extra-small text-details">{link.label}</h6>
                                    <p className="text-muted extra-small fw-bold mb-0 opacity-60 text-details uppercase">Mission Objective</p>
                                </div>
                                <ArrowRight size={18} className="text-muted opacity-30" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .tracking-wider { letter-spacing: 0.1em; }
                .tracking-tight { letter-spacing: -0.02em; }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
                .hover-up:hover { transform: translateY(-8px); filter: brightness(1.02); }
                .hover-up-small:hover { transform: translateX(5px); background-color: #fafafa !important; }
                .border-hover-primary:hover { border-left: 4px solid #1254AF !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .focus-within-primary:focus-within { border: 2px solid #1254AF30 !important; background-color: white !important; }
            `}} />
        </div>
    );
};

export default DepartmentWork;
