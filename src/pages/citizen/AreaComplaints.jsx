import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Eye, Filter, RefreshCw, AlertCircle, CheckCircle,
    Clock, Calendar, Building2, TrendingUp, Search, Layers,
    ArrowRight, Info, Activity, Zap, Shield, Compass
} from 'lucide-react';
import apiService from '../../api/apiService';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardHeader from '../../components/layout/DashboardHeader';

import ComplaintCard from '../../components/complaints/ComplaintCard';

const AreaComplaints = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDepartment, setFilterDepartment] = useState('ALL');
    const [departments, setDepartments] = useState([]);
    const [wardInfo, setWardInfo] = useState(null);

    const PRIMARY_COLOR = '#1254AF';

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const deptRes = await apiService.masterData.getDepartments();
            setDepartments(deptRes.data || []);

            const profileRes = await apiService.profile.getProfile();
            const profile = profileRes.data || profileRes;
            const wardId = profile.wardId || profile.ward?.id || profile.ward?.wardId;

            if (wardId) {
                setWardInfo({
                    wardName: profile.ward?.areaName || profile.wardName || 'Neighborhood',
                    wardId: wardId
                });
            }

            const response = await apiService.citizen.getWardComplaints();
            const data = response.data?.content || response.content || response.data || response;
            const list = Array.isArray(data) ? data : (data.content || []);

            // Tactical Anonymization and De-duplication
            const uniqueMap = new Map();
            list.forEach(item => {
                const id = item.complaintId || item.id;
                if (id && !uniqueMap.has(id)) {
                    // Anonymize citizen data for public visibility
                    const anonymized = {
                        ...item,
                        citizenName: "IDENTIFIED CITIZEN",
                        citizenEmail: "SENSITIVE@PROTECTED",
                        citizenMobile: "CONTACT_MASKED"
                    };
                    uniqueMap.set(id, anonymized);
                }
            });

            const finalComplaints = Array.from(uniqueMap.values());
            setComplaints(finalComplaints);
        } catch (err) {
            console.error('Failed to load area reports:', err);
            setError('Unable to load reports for this area.');
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
        const matchesDept = filterDepartment === 'ALL' ||
            (c.departmentId?.toString() === filterDepartment) ||
            (c.department?.departmentId?.toString() === filterDepartment);
        return matchesStatus && matchesDept;
    });

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => ['SUBMITTED', 'PENDING', 'ASSIGNED'].includes(c.status)).length,
        active: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-bold text-muted small">Loading local area reports...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Citizen Dashboard"
                title="Local Issues"
                subtitle={`Showing reports from ${wardInfo?.wardName || 'your area'}.`}
                icon={Compass}
                actions={
                    <div className="d-flex align-items-center gap-3">
                        <button
                            onClick={loadData}
                            className="btn btn-light rounded-pill px-4 py-2 fw-black d-flex align-items-center gap-2 shadow-sm border-0 transition-all hover-up"
                            style={{ color: PRIMARY_COLOR }}
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> REFRESH FEED
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-5">
                {/* Visual Stats */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total reported', val: stats.total, icon: Layers, color: PRIMARY_COLOR, bg: '#EBF2FF' },
                        { label: 'Pending', val: stats.pending, icon: Clock, color: '#6366F1', bg: '#F5F3FF' },
                        { label: 'In progress', val: stats.active, icon: Activity, color: '#F59E0B', bg: '#FFFCF5' },
                        { label: 'Resolved', val: stats.resolved, icon: CheckCircle, color: '#10B981', bg: '#ECFDF5' }
                    ].map((s, idx) => (
                        <div key={idx} className="col-md-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 h-100 bg-white border-bottom border-4" style={{ borderColor: s.color }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '44px', height: '44px', backgroundColor: s.bg, color: s.color }}>
                                        <s.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-1px' }}>{s.val}</h3>
                                        <p className="extra-small fw-bold text-muted mb-0 uppercase-tracking">{s.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters Hub */}
                <div className="card border-0 shadow-premium rounded-4 p-4 bg-white mb-5">
                    <div className="row g-4 align-items-end">
                        <div className="col-lg-6">
                            <label className="form-label extra-small fw-bold text-muted mb-3 uppercase-tracking d-flex align-items-center gap-2">
                                <Filter size={12} style={{ color: PRIMARY_COLOR }} /> Resolution status
                            </label>
                            <div className="d-flex gap-2 flex-wrap">
                                {[
                                    { id: 'ALL', label: 'All reports' },
                                    { id: 'SUBMITTED', label: 'Reported' },
                                    { id: 'IN_PROGRESS', label: 'In progress' },
                                    { id: 'RESOLVED', label: 'Resolved' }
                                ].map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setFilterStatus(s.id)}
                                        className={`btn rounded-pill px-4 py-2 fw-bold small transition-all ${filterStatus === s.id ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`}
                                        style={filterStatus === s.id ? { backgroundColor: PRIMARY_COLOR, border: 'none' } : {}}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <label className="form-label extra-small fw-bold text-muted mb-3 uppercase-tracking d-flex align-items-center gap-2">
                                <Building2 size={12} style={{ color: PRIMARY_COLOR }} /> Municipal departments
                            </label>
                            <select
                                className="form-select rounded-pill border py-3 px-4 fw-bold shadow-none small bg-light border-0"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <option value="ALL">All departments</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>
                                        {(dept.name || dept.departmentName).replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-2">
                            <div className="p-3 rounded-pill bg-light d-flex align-items-center justify-content-center gap-2 border" style={{ height: '54px' }}>
                                <Search size={16} className="text-muted" />
                                <span className="small fw-bold text-dark">{filteredComplaints.length} found</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="row g-4 animate-fadeIn">
                    {filteredComplaints.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-premium rounded-4 p-5 text-center bg-white border-dashed border-2">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                                    <Shield size={32} className="text-muted opacity-30" />
                                </div>
                                <h4 className="fw-bold text-dark mb-2">No area reports found</h4>
                                <p className="text-muted small fw-medium mt-2">
                                    No reports were found in your area matching these filters.
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredComplaints.map((c) => (
                            <div key={c.id || c.complaintId} className="col-md-6 col-lg-4">
                                <ComplaintCard
                                    complaint={c}
                                    onClick={() => navigate(`/citizen/complaints/${c.id || c.complaintId}`)}
                                    brandColor={PRIMARY_COLOR}
                                />
                            </div>
                        ))
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
            `}} />
        </div>
    );
};

export default AreaComplaints;
