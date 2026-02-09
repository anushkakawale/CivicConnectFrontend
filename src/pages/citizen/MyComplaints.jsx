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
                portalName="PMC Citizen Portal"
                title="My reports"
                subtitle="Track the status of all your submitted municipal issues."
                icon={FileText}
                actions={
                    <button
                        onClick={() => navigate('/citizen/register-complaint')}
                        className="btn btn-primary shadow-premium rounded-4 d-flex align-items-center gap-2 px-4 py-2"
                        style={{ backgroundColor: PRIMARY_COLOR, border: 'none' }}
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        <span className="fw-bold small">Report issue</span>
                    </button>
                }
            />

            <div className="container-fluid px-5">
                {/* Visual Stats Bar */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total reported', value: stats.total, color: PRIMARY_COLOR, bg: '#EBF2FF', icon: FileText },
                        { label: 'Pending', value: stats.pending, color: '#6366F1', bg: '#F5F3FF', icon: Clock },
                        { label: 'In progress', value: stats.active, color: '#F59E0B', bg: '#FFFCF5', icon: Activity },
                        { label: 'Resolved', value: stats.resolved, color: '#10B981', bg: '#ECFDF5', icon: CheckCircle }
                    ].map((s, idx) => (
                        <div key={idx} className="col-md-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 h-100 bg-white border-bottom border-4" style={{ borderColor: s.color }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '44px', height: '44px', backgroundColor: s.bg, color: s.color }}>
                                        <s.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-1px' }}>{s.value}</h3>
                                        <p className="extra-small fw-bold text-muted mb-0 uppercase-tracking">{s.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and Actions */}
                <div className="card border-0 shadow-premium rounded-4 p-4 mb-5 bg-white">
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-6">
                            <div className="d-flex flex-wrap gap-2">
                                {[
                                    { id: 'ALL', label: 'All reports' },
                                    { id: 'PENDING', label: 'Pending' },
                                    { id: 'ACTIVE', label: 'In progress' },
                                    { id: 'RESOLVED', label: 'Resolved' }
                                ].map(btn => (
                                    <button
                                        key={btn.id}
                                        onClick={() => setFilter(btn.id)}
                                        className={`btn rounded-pill px-4 py-2 fw-bold small transition-all ${filter === btn.id ? 'btn-primary' : 'btn-light border text-muted'}`}
                                        style={filter === btn.id ? { backgroundColor: PRIMARY_COLOR, border: 'none' } : {}}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0 ps-4 rounded-start-pill text-muted">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0 py-3 rounded-end-pill px-3 fw-medium"
                                    placeholder="Search by ID or title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="row g-4 animate-fadeIn">
                    {loading ? (
                        <div className="col-12 text-center py-5" style={{ backgroundColor: '#F8FAFC' }}>
                            <RefreshCw className="animate-spin text-primary opacity-20 mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
                            <p className="text-muted fw-bold small">Updating reports...</p>
                        </div>
                    ) : (
                        <>
                            <div className="col-12 mb-4 d-flex align-items-center justify-content-between">
                                <h5 className="fw-bold text-dark mb-0 border-start border-4 border-primary ps-3">
                                    Showing {filteredComplaints.length} reports
                                </h5>
                                <button
                                    onClick={fetchComplaints}
                                    className="btn btn-light rounded-circle shadow-sm p-2 border"
                                    title="Refresh details"
                                >
                                    <RefreshCw size={18} className="text-muted" />
                                </button>
                            </div>

                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map(c => (
                                    <div key={c.id || c.complaintId} className="col-md-6 col-lg-4">
                                        <div className="animate-fadeIn">
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
                                    <div className="card border-0 shadow-premium p-5 text-center bg-white rounded-4 border-2 border-dashed">
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                                            <ShieldAlert size={32} className="text-muted opacity-30" />
                                        </div>
                                        <h4 className="fw-bold text-dark mb-2">No reports found</h4>
                                        <p className="text-muted small fw-medium mt-2">
                                            We couldn't find any reports matching your current filter.
                                        </p>
                                        <div className="mt-5">
                                            <button onClick={() => { setFilter('ALL'); setSearchQuery(''); }} className="btn btn-primary px-5 py-3 rounded-pill fw-bold small shadow-premium border-0" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                Clear all filters
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
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .transition-all { transition: all 0.3s ease; }
                .uppercase-tracking { text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; }
                .extra-small { font-size: 11px; }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
};

export default MyComplaints;
