import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Filter, RefreshCw, AlertCircle, Eye,
    Clock, CheckCircle, XCircle, Loader, Calendar,
    Building2, MapPin, ArrowRight, Search, Plus, Activity, AlertCircle as ShieldAlert, User
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ComplaintCard from '../../components/complaints/ComplaintCard';

const MyComplaints = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const PRIMARY_COLOR = '#244799';

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiService.citizen.getMyComplaints({ size: 100 });
            const data = response.data?.content || response.content || response.data || response;
            const list = Array.isArray(data) ? data : (data.content || []);

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
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setError('Failed to load your reports');
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesFilter = filter === 'ALL' ||
            (filter === 'PENDING' && ['SUBMITTED', 'ASSIGNED'].includes(c.status)) ||
            (filter === 'ACTIVE' && c.status === 'IN_PROGRESS') ||
            (filter === 'RESOLVED' && ['RESOLVED', 'CLOSED'].includes(c.status));

        const matchesSearch = (c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.complaintId || c.id)?.toString().includes(searchQuery));

        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => ['SUBMITTED', 'ASSIGNED'].includes(c.status)).length,
        active: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length
    };

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="CivicConnect"
                userName="My Complaints"
                wardName="Overview"
                subtitle="Track and manage your reported civic issues"
                icon={FileText}
                actions={
                    <button
                        onClick={() => navigate('/citizen/register-complaint')}
                        className="btn btn-primary shadow-premium rounded-pill d-flex align-items-center gap-3 px-5 py-3 hover-up transition-all border-0"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        <Plus size={20} strokeWidth={3} />
                        <span className="fw-black extra-small uppercase tracking-widest">File Complaint</span>
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-40px' }}>
                {/* Complaint Statistics */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Submitted', value: stats.total, color: PRIMARY_COLOR, bg: '#EBF2FF', icon: FileText },
                        { label: 'Pending', value: stats.pending, color: '#6366F1', bg: '#F5F3FF', icon: Clock },
                        { label: 'In Progress', value: stats.active, color: '#F59E0B', bg: '#FFF9EB', icon: Activity },
                        { label: 'Resolved', value: stats.resolved, color: '#10B981', bg: '#EDFDF5', icon: CheckCircle }
                    ].map((s, idx) => (
                        <div key={idx} className="col-12 col-md-6 col-lg-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 h-100 bg-white border-top border-4 transition-all hover-up-tiny" style={{ borderTopColor: s.color }}>
                                <div className="d-flex align-items-center gap-4">
                                    <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '54px', height: '54px', backgroundColor: s.bg, color: s.color }}>
                                        <s.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h1 className="fw-black mb-0 text-dark" style={{ letterSpacing: '-2px' }}>{s.value}</h1>
                                        <p className="extra-small fw-black text-muted mb-0 uppercase tracking-widest opacity-60">{s.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Complaints */}
                <div className="card b-none shadow-premium rounded-5 p-4 p-lg-5 mb-5 bg-white overflow-hidden border-top border-5" style={{ borderTopColor: PRIMARY_COLOR }}>
                    <div className="row g-4 align-items-center">
                        <div className="col-xl-7">
                            <div className="d-flex flex-wrap gap-2">
                                {[
                                    { id: 'ALL', label: 'All Complaints' },
                                    { id: 'PENDING', label: 'Pending' },
                                    { id: 'ACTIVE', label: 'In Progress' },
                                    { id: 'RESOLVED', label: 'Resolved' }
                                ].map(btn => (
                                    <button
                                        key={btn.id}
                                        onClick={() => setFilter(btn.id)}
                                        className={`btn rounded-pill px-4 py-2 border-0 fw-black extra-small tracking-widest transition-all ${filter === btn.id ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                        style={filter === btn.id ? { backgroundColor: PRIMARY_COLOR } : {}}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-xl-5">
                            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                                <span className="input-group-text bg-white border-0 ps-4 text-muted">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 py-3 px-3 fw-bold extra-small tracking-wider"
                                    placeholder="Search by ID or Title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Stream */}
                <div className="row g-4 animate-fadeIn">
                    {loading ? (
                        <div className="col-12 text-center py-5">
                            <RefreshCw className="animate-spin text-primary opacity-20 mb-4" size={60} style={{ color: PRIMARY_COLOR }} />
                            <p className="text-muted fw-black extra-small uppercase tracking-widest">Loading complaints...</p>
                        </div>
                    ) : (
                        <>
                            <div className="col-12 mb-4 d-flex align-items-center justify-content-between px-3">
                                <div>
                                    <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">
                                        Total Complaints: {filteredComplaints.length}
                                    </h5>
                                    <p className="extra-small text-muted fw-bold uppercase mb-0 opacity-50">Showing your filed complaints</p>
                                </div>
                                <button
                                    onClick={fetchComplaints}
                                    className="btn btn-white shadow-premium rounded-circle p-3 border-0 transition-all hover-rotate"
                                    title="Refresh"
                                >
                                    <RefreshCw size={20} style={{ color: PRIMARY_COLOR }} />
                                </button>
                            </div>

                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map(c => (
                                    <div key={c.id || c.complaintId} className="col-md-6 col-xl-4">
                                        <div className="transition-all hover-up-tiny h-100">
                                            <ComplaintCard
                                                complaint={c}
                                                onClick={() => navigate(`/citizen/complaints/${c.id || c.complaintId}`)}
                                                brandColor={PRIMARY_COLOR}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <div className="card b-none shadow-premium p-5 text-center bg-white rounded-5 border-dashed border-2">
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4 anim-float shadow-inner" style={{ width: '100px', height: '100px' }}>
                                            <ShieldAlert size={48} className="text-muted opacity-20" />
                                        </div>
                                        <h4 className="fw-black text-dark mb-2 uppercase tracking-widest">No Complaints Found</h4>
                                        <p className="extra-small text-muted fw-black uppercase mb-5 tracking-wider">
                                            No complaints match your search or filter criteria.
                                        </p>
                                        <div className="d-flex justify-content-center gap-3">
                                            <button onClick={() => { setFilter('ALL'); setSearchQuery(''); }} className="btn btn-light px-5 py-3 rounded-pill fw-black extra-small tracking-widest border-2">
                                                CLEAR SEARCH
                                            </button>
                                            <button onClick={() => navigate('/citizen/register-complaint')} className="btn btn-primary px-5 py-3 rounded-pill fw-black extra-small tracking-widest shadow-premium border-0" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                File Complaint
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 950; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .animate-spin { animation: spin 1.2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shadow-premium { box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.06), 0 5px 20px -5px rgba(0, 0, 0, 0.02); }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.04); }
                .transition-all { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1) !important; }
                .hover-up-tiny:hover { transform: translateY(-6px); box-shadow: 0 15px 30px -8px rgba(0,0,0,0.1) !important; }
                .hover-rotate:hover { transform: rotate(90deg); }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .anim-float { animation: float 4s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .b-none { border: none !important; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
            `}} />
        </div>
    );
};

export default MyComplaints;
