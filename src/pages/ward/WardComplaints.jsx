import React, { useState, useEffect } from 'react';
import {
    FileText, Eye, Filter, ArrowLeft, RefreshCw,
    Loader, Search, Calendar, Building2, User,
    Shield, Briefcase, ChevronRight, X, AlertCircle,
    Clock, MapPin, Camera, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import wardOfficerService from '../../services/wardOfficerService';
// import { DEPARTMENTS } from '../../constants';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import { extractImageUrl } from '../../utils/imageUtils';

const WardComplaints = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDept, setFilterDept] = useState('ALL');
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchComplaints();
        apiService.common.getDepartments().then(res => setDepartments(res.data || res || []));
    }, []);

    useEffect(() => {
        applyFilters();
    }, [complaints, searchTerm, filterStatus, filterDept]);

    const fetchComplaints = async () => {
        try {
            if (!complaints.length) setLoading(true);
            const response = await wardOfficerService.getWardComplaints();
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data?.content || []);

            // Deduplicate by ID
            const uniqueMap = new Map();
            list.forEach(item => {
                if (item && typeof item === 'object') {
                    const id = item.complaintId || item.id;
                    if (id && !uniqueMap.has(id)) {
                        uniqueMap.set(id, item);
                    }
                }
            });
            setComplaints(Array.from(uniqueMap.values()));
        } catch (err) {
            console.error('Failed to load complaints:', err);
            setComplaints([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchComplaints();
    };

    const applyFilters = () => {
        let filtered = [...complaints];

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.complaintId || c.id)?.toString().includes(searchTerm) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(c => c.status === filterStatus);
        }

        if (filterDept !== 'ALL') {
            filtered = filtered.filter(c => {
                const deptId = c.departmentId || c.department?.id;
                return deptId?.toString() === filterDept;
            });
        }

        setFilteredComplaints(filtered);
    };

    if (loading && !complaints.length) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: '#244799' }} />
            <p className="fw-black text-muted text-uppercase tracking-widest small">Synchronizing Ward Registry...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Premium Header */}
            <DashboardHeader
                portalName="PMC WARD CONSOLE"
                userName={localStorage.getItem('name') || 'Ward Executive'}
                wardName={localStorage.getItem('wardName') || 'WARD ADMINISTRATION'}
                subtitle="Jurisdiction Case Inventory | Comprehensive Complaint Management"
                icon={FileText}
            />

            <div className="container mt-4">
                {/* Search & Filter Hub */}
                <div className="card border-0 shadow-sm rounded-0 bg-white p-4 mb-4">
                    <div className="row g-3">
                        <div className="col-lg-6">
                            <div className="input-group overflow-hidden rounded-0 border bg-light shadow-none transition-all focus-within-primary">
                                <span className="input-group-text bg-transparent border-0 ps-3"><Search size={18} className="text-primary" /></span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent border-0 py-2 fw-bold px-0 shadow-none"
                                    placeholder="Search by ID, Title or Description..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="btn border-0 text-muted shadow-none" onClick={() => setSearchTerm('')}><X size={16} /></button>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <select className="form-select border-0 bg-light rounded-0 px-4 py-2 fw-bold text-muted shadow-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="APPROVED">Approved</option>
                            </select>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <select className="form-select border-0 bg-light rounded-0 px-4 py-2 fw-bold text-muted shadow-none" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                                <option value="ALL">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.departmentId || d.id} value={d.departmentId || d.id}>
                                        {(d.departmentName || d.name || '').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Complaints Grid - More similar to detail page info density */}
                {filteredComplaints.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-0 shadow-sm">
                        <div className="p-4 rounded-0 bg-light d-inline-block mb-3">
                            <FileText size={48} className="text-muted opacity-20" />
                        </div>
                        <h6 className="fw-black text-muted text-uppercase tracking-widest extra-small">No matches found</h6>
                        <p className="text-muted small">Try refining your search parameters.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredComplaints.map(complaint => (
                            <div key={complaint.complaintId || complaint.id} className="col-md-6 col-xl-4">
                                <div
                                    className="card border-0 shadow-sm rounded-0 h-100 overflow-hidden hover-card cursor-pointer d-flex flex-column transition-all"
                                    onClick={() => navigate(`/ward-officer/complaints/${complaint.complaintId || complaint.id}`)}
                                >
                                    {/* Simplified Header Image logic similar to detail page */}
                                    {complaint.images?.[0] || complaint.imageUrl ? (
                                        <div className="ratio ratio-21x9 overflow-hidden bg-light">
                                            <img
                                                src={extractImageUrl(complaint.images?.[0] || complaint.imageUrl)}
                                                className="w-100 h-100 object-fit-cover opacity-90 transition-all hover-zoom"
                                                alt="Case Thumbnail"
                                            />
                                            <div className="position-absolute top-0 end-0 p-2">
                                                <StatusBadge status={complaint.status} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-light d-flex justify-content-between align-items-center">
                                            <div className="p-3 bg-white rounded-0 shadow-sm">
                                                <Camera size={24} className="text-muted opacity-30" />
                                            </div>
                                            <StatusBadge status={complaint.status} />
                                        </div>
                                    )}

                                    <div className="p-4 flex-grow-1">
                                        <div className="mb-2">
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-0 extra-small fw-black tracking-widest">#{complaint.complaintId || complaint.id}</span>
                                        </div>
                                        <h6 className="fw-black text-dark mb-2 text-truncate-2" title={complaint.title}>{complaint.title}</h6>
                                        <p className="extra-small text-muted text-truncate-2 mb-3 fw-bold opacity-75">{complaint.description || 'No description provided.'}</p>

                                        <div className="row g-2 mt-auto">
                                            <div className="col-6">
                                                <div className="d-flex align-items-center gap-2 text-muted extra-small fw-bold">
                                                    <Calendar size={14} className="text-primary opacity-50" />
                                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="col-6 text-end">
                                                <div className="d-flex align-items-center justify-content-end gap-2 text-muted extra-small fw-bold">
                                                    <Briefcase size={14} className="text-primary opacity-50" />
                                                    <span className="text-truncate" style={{ maxWidth: '80px' }}>{complaint.departmentName || complaint.department?.name || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-3 bg-light border-top d-flex justify-content-between align-items-center mt-auto gap-3">
                                        <div className="d-flex flex-column gap-1">
                                            <PriorityBadge priority={complaint.priority} size="xs" />
                                            {(() => {
                                                const deadline = complaint.slaDeadline ? new Date(complaint.slaDeadline) : null;
                                                const now = new Date();
                                                const timeLeft = deadline ? deadline - now : 0;
                                                const hoursLeft = deadline ? (timeLeft / 36e5) : 0;
                                                const isBreached = complaint.slaStatus === 'BREACHED';

                                                if (['RESOLVED', 'CLOSED'].includes(complaint.status)) {
                                                    return <span className="text-success extra-small fw-black uppercase tracking-tight">FULFILLED</span>;
                                                }

                                                if (isBreached) {
                                                    return <span className="text-danger extra-small fw-black uppercase tracking-tight animate-pulse">OVERDUE {Math.abs(hoursLeft).toFixed(1)}H</span>;
                                                } else if (deadline && hoursLeft > 0) {
                                                    return <span className={`extra-small fw-black uppercase tracking-tight ${hoursLeft < 4 ? 'text-warning' : 'text-primary'}`}>{hoursLeft.toFixed(1)}H LEFT</span>;
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        <button className="btn btn-sm btn-white border shadow-sm rounded-pill px-3 py-1 text-primary extra-small fw-black tracking-widest text-uppercase d-flex align-items-center gap-1 hover-up">
                                            DETAILS <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .tracking-wider { letter-spacing: 0.1em; }
                .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.8em; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hover-card:hover { border-color: #1254AF50 !important; transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15) !important; }
                .hover-card:hover .hover-zoom { transform: scale(1.1); }
                .focus-within-primary:focus-within { border-color: #1254AF !important; box-shadow: 0 0 0 4px rgba(18, 84, 175, 0.1) !important; background-color: #fff !important; }
                .btn-white:hover { background-color: #f8f9fa !important; transform: scale(1.05); }
                .hover-up:hover { transform: translateY(-2px); }
                .rounded-0 { border-radius: 2rem !important; }
            `}} />
        </div>
    );
};

export default WardComplaints;
