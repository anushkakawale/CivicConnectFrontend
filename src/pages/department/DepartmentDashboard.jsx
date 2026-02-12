import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CheckCircle, Clock, AlertCircle,
    Briefcase, Shield, RefreshCw, BarChart2, Loader,
    ArrowRight, User, Users, ClipboardList, Map as MapIcon, Info,
    Target, Zap, TrendingUp, Search, Activity, FileText, Calendar,
    ChevronRight, ExternalLink, Target as TargetIcon, PlayCircle, CheckCheck,
    Filter, Play, MapPin
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { useToast } from '../../hooks/useToast';
import DepartmentMap from './DepartmentMap';
import { extractImageUrl } from '../../utils/imageUtils';

const DepartmentDashboard = () => {
    const { showToast } = useToast();
    const brandColor = '#173470';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [assignedWork, setAssignedWork] = useState([]);
    const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'map'
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        loadData();
        // Poll for real-time updates every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            if (!data) setLoading(true);

            // Fetch Analytics
            const analyticsPromise = apiService.departmentOfficer.getDashboardSummary();
            // Fetch Assigned Work (Active only by default now)
            const assignedPromise = apiService.departmentOfficer.getAssignedComplaints({ page: 0, size: 50 });

            const [analyticsRes, assignedRes] = await Promise.all([analyticsPromise, assignedPromise]);

            const analyticsData = analyticsRes.data || analyticsRes;

            // Check if statistics are nested or at root
            const stats = analyticsData.statistics || analyticsData;
            const sla = analyticsData.sla || analyticsData;

            setData({
                officerName: analyticsData.officerName || localStorage.getItem('name') || 'Department Officer',
                department: analyticsData.departmentName || 'Operations',
                statistics: {
                    totalAssigned: stats.totalAssigned || stats.assigned || 0,
                    inProgress: stats.inProgress || stats.active || 0,
                    resolved: stats.resolved || stats.completed || 0,
                    pending: stats.pending || 0
                },
                sla: { breached: sla.slaBreached || sla.breached || 0 }
            });

            console.log("📊 Dashboard Data Loaded:", analyticsData);

            const rawWork = assignedRes.data;
            const extractedWork = rawWork?.complaints || rawWork?.content || rawWork?.data || (Array.isArray(rawWork) ? rawWork : (Array.isArray(rawWork?.data) ? rawWork.data : []));
            setAssignedWork(extractedWork || []);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            showToast('Operational sync failure.', 'error');
            // Retain existing data if refresh failed
            if (!data) {
                setData({
                    officerName: localStorage.getItem('name') || 'Department Officer',
                    department: 'Operations',
                    statistics: { totalAssigned: 0, inProgress: 0, resolved: 0, pending: 0 },
                    sla: { breached: 0 }
                });
                setAssignedWork([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const displayList = useMemo(() => {
        return assignedWork.filter(task => {
            const search = searchTerm.toLowerCase();
            const titleMatch = (task.title || '').toLowerCase().includes(search);
            const idMatch = (task.complaintId || task.id || '').toString().includes(search);
            const matchesSearch = !searchTerm || titleMatch || idMatch;

            const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [assignedWork, searchTerm, filterStatus]);

    const kpiCards = useMemo(() => [
        { label: 'Field Deployment', value: data?.statistics?.totalAssigned || 0, icon: ClipboardList, color: '#1E40AF' },
        { label: 'In Operations', value: data?.statistics?.inProgress || 0, icon: PlayCircle, color: '#F59E0B' },
        { label: 'Mission Success', value: data?.statistics?.resolved || 0, icon: CheckCheck, color: '#10B981' },
        { label: 'SLA Breaches', value: data?.sla?.breached || 0, icon: AlertCircle, color: '#EF4444' }
    ], [data]);

    if (loading && !data) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: '#1254AF' }} />
            <p className="fw-black text-dark text-uppercase tracking-widest small">Loading Field Intelligence...</p>
        </div>
    );

    const WorkflowTracker = ({ currentStatus }) => {
        const steps = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        const currentIndex = steps.indexOf(currentStatus);

        return (
            <div className="d-flex align-items-center gap-1 mt-3 mb-2 p-1 bg-light rounded-pill px-3" style={{ height: '32px', width: 'fit-content', border: '1px solid rgba(0,0,0,0.05)' }}>
                {steps.map((step, idx) => (
                    <React.Fragment key={step}>
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${idx <= currentIndex ? 'bg-primary border-primary' : 'bg-white border-muted opacity-40'}`}
                            style={{
                                width: '14px',
                                height: '14px',
                                border: '1,5px solid',
                                fontSize: '7px',
                                color: idx <= currentIndex ? 'white' : '#94A3B8',
                                zIndex: 2
                            }}
                        >
                            {idx <= currentIndex && <Check size={8} strokeWidth={4} />}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-grow-1" style={{ height: '2px', width: '22px', backgroundColor: idx < currentIndex ? '#173470' : '#E2E8F0', zIndex: 1 }}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const Check = ({ size, strokeWidth }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="FIELD OPERATIONS"
                userName={data?.officerName || 'Officer'}
                wardName={data?.department || 'Operations Unit'}
                subtitle="DEPARTMENT COMMAND CENTER | TACTICAL REGISTRY"
                icon={Target}
                showProfileInitials={true}
                actions={
                    <div className="d-flex gap-2">
                        <button
                            onClick={() => navigate('/department/history')}
                            className="btn btn-white bg-white text-primary rounded-circle p-2 shadow-lg border-0 transition-all hover-up d-flex align-items-center justify-content-center"
                            style={{ width: '45px', height: '45px' }}
                            title="View History"
                        >
                            <Clock size={20} />
                        </button>
                        <button
                            onClick={handleRefresh}
                            className={`btn btn-white bg-white text-primary rounded-circle p-2 shadow-lg border-0 transition-all hover-up d-flex align-items-center justify-content-center ${refreshing ? 'animate-spin' : ''}`}
                            style={{ width: '45px', height: '45px' }}
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-4" style={{ marginTop: '-40px' }}>
                {/* Stats Matrix */}
                {/* Stats Matrix - Premium Cards */}
                <div className="row g-4 mb-5">
                    {kpiCards.map((stat, idx) => (
                        <div key={idx} className="col-12 col-sm-6 col-md-3">
                            <div className="card h-100 border-0 shadow-sm hover-up transition-all position-relative overflow-hidden group"
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                }}>
                                <div className="card-body p-4 d-flex flex-column justify-content-between h-100 position-relative z-1">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                backgroundColor: `${stat.color}15`,
                                                width: '56px',
                                                height: '56px'
                                            }}>
                                            <stat.icon size={26} color={stat.color} />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="display-6 fw-black mb-1 tracking-tight" style={{ color: '#1E293B' }}>{stat.value}</h2>
                                        <p className="mb-0 extra-small fw-bold text-uppercase tracking-widest" style={{ color: stat.color, opacity: 0.9 }}>
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '4px', backgroundColor: stat.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Filters */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="bg-white p-1 rounded-pill shadow-sm border d-inline-flex">
                        <button
                            onClick={() => setActiveTab('assigned')}
                            className={`btn rounded-pill px-4 py-2 fw-black extra-small tracking-widest text-uppercase transition-all ${activeTab === 'assigned' ? 'bg-primary text-white shadow-md' : 'text-muted'}`}
                        >
                            Assigned Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`btn rounded-pill px-4 py-2 fw-black extra-small tracking-widest text-uppercase transition-all ${activeTab === 'map' ? 'bg-primary text-white shadow-md' : 'text-muted'}`}
                        >
                            Live Map
                        </button>
                    </div>
                </div>

                {activeTab === 'assigned' ? (
                    <div className="row animate-fadeIn">
                        <div className="col-12 mb-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                                <div className="input-group overflow-hidden border-0 bg-white shadow-lg elevation-1 gov-rounded flex-grow-1" style={{ borderRadius: '30px' }}>
                                    <span className="input-group-text bg-transparent border-0 ps-4"><Search size={22} className="text-primary opacity-50" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 fs-6 fw-bold px-1 shadow-none text-uppercase text-details"
                                        placeholder="SEARCH REGISTRY BY ID OR KEYWORD..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ letterSpacing: '0.05em' }}
                                    />
                                </div>
                                <div className="d-flex align-items-center gap-3 px-4 py-3 bg-white gov-rounded shadow-lg elevation-1" style={{ borderRadius: '30px' }}>
                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary border d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <Filter size={18} />
                                    </div>
                                    <select className="form-select border-0 bg-transparent fw-black extra-small tracking-widest uppercase shadow-none text-details p-0" style={{ minWidth: '150px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                        <option value="ALL">ALL COMMANDS</option>
                                        <option value="ASSIGNED">NEW DEPLOYMENT</option>
                                        <option value="IN_PROGRESS">IN OPERATIONS</option>
                                        <option value="RESOLVED">MISSION SUCCESS</option>
                                        <option value="CLOSED">ARCHIVED</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {displayList.length === 0 ? (
                            <div className="col-12 mt-4">
                                <div className="text-center py-5 bg-white gov-rounded shadow-lg border-2 border-dashed border-light elevation-1">
                                    <div className="rounded-circle bg-light d-inline-flex p-4 mb-4 shadow-inner">
                                        <ClipboardList size={64} className="text-primary opacity-20" />
                                    </div>
                                    <h6 className="fw-black text-dark text-uppercase tracking-[0.3em] extra-small">Registry Status: Operational Clear</h6>
                                    <p className="extra-small text-dark fw-bold uppercase mt-2 opacity-60 px-5">All municipal field assignments have been processed or filtered away.</p>
                                    <button onClick={handleRefresh} className="btn btn-primary mt-4 px-5 py-3 fw-black extra-small tracking-widest">SYNC REGISTRY</button>
                                </div>
                            </div>
                        ) : (
                            <div className="col-12 mt-2">
                                <div className="card border-0 shadow-lg gov-rounded overflow-hidden bg-white elevation-1">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light border-bottom">
                                                <tr>
                                                    <th className="px-5 py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Complaint Node</th>
                                                    <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Status Indicators</th>
                                                    <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Timeline / SLA</th>
                                                    <th className="py-4 border-0 text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Registration</th>
                                                    <th className="px-5 py-4 border-0 text-end text-dark opacity-60 fw-black extra-small uppercase tracking-widest text-details">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayList.map(complaint => (
                                                    <tr key={complaint.complaintId || complaint.id} className="transition-standard hover-bg-light cursor-pointer border-bottom-light" onClick={() => navigate(`/department/complaints/${complaint.complaintId || complaint.id}`)}>
                                                        <td className="px-5 py-4">
                                                            <div className="d-flex align-items-center gap-4">
                                                                <div className="p-2 bg-light gov-rounded text-primary fw-black font-mono extra-small border text-details" style={{ color: brandColor }}>
                                                                    #N-{complaint.complaintId || complaint.id}
                                                                </div>
                                                                <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                                                    <div className="fw-black text-dark small mb-1 text-uppercase tracking-tight text-details">{complaint.title}</div>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <MapPin size={12} className="text-primary opacity-50" />
                                                                        <span className="extra-small fw-bold text-muted uppercase text-details">{complaint.wardName || 'PMC HQ'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-1">
                                                                <StatusBadge status={complaint.status} size="sm" />
                                                                <WorkflowTracker currentStatus={complaint.status} />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-2">
                                                                <PriorityBadge priority={complaint.priority} size="sm" />
                                                                <div className={`d-flex align-items-center gap-2 extra-small fw-black ${complaint.slaStatus === 'BREACHED' ? 'text-danger' : 'text-success'} text-details`}>
                                                                    <div className={`rounded-circle ${complaint.slaStatus === 'BREACHED' ? 'bg-danger' : 'bg-success'} shadow-sm elevation-1 ${complaint.slaStatus === 'BREACHED' ? 'animate-pulse' : ''}`} style={{ width: '8px', height: '8px' }}></div>
                                                                    <span className="uppercase tracking-widest">{complaint.slaStatus || 'SLA ACTIVE'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2 text-muted fw-black extra-small text-details">
                                                                <Calendar size={16} className="text-primary opacity-50" />
                                                                <span className="uppercase tracking-widest">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 text-end">
                                                            <div className="d-flex justify-content-end gap-2">
                                                                <button
                                                                    className="btn btn-light rounded-circle p-2 border transition-standard hover-up-small shadow-sm elevation-1"
                                                                    style={{ width: '42px', height: '42px' }}
                                                                    title="Open Asset"
                                                                >
                                                                    <ChevronRight size={22} className="text-primary" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-5 py-4 bg-light bg-opacity-30 border-top text-center">
                                        <button
                                            onClick={() => navigate('/department/complaints')}
                                            className="btn btn-link text-primary text-decoration-none fw-black extra-small tracking-widest text-uppercase p-0 d-flex align-items-center justify-content-center gap-2 text-details"
                                        >
                                            OPEN FULL DISPATCH REGISTRY <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card border-0 shadow-lg gov-rounded overflow-hidden elevation-2 mt-4 animate-fadeIn" style={{ height: '700px' }}>
                        <DepartmentMap embedded={true} />
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .border-bottom-light { border-bottom: 1px solid rgba(0,0,0,0.05); }
            `}} />
        </div>
    );
};

export default DepartmentDashboard;
