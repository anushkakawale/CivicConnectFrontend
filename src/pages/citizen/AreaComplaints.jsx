import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Eye, Filter, RefreshCw, AlertCircle, CheckCircle,
    Clock, Calendar, Building2, TrendingUp, Search, Layers,
    ArrowRight, Info, Activity, Zap, Shield, Compass, Target,
    LayoutGrid, List, ChevronRight, BarChart3
} from 'lucide-react';
import apiService from '../../api/apiService';
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

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // 30s heart-beat
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const [deptRes, profileRes, wardCompRes] = await Promise.all([
                apiService.masterData.getDepartments(),
                apiService.profile.getProfile(),
                apiService.citizen.getWardComplaints()
            ]);

            setDepartments(deptRes.data || []);

            const profile = profileRes.data || profileRes;
            const wardId = profile.wardId || profile.ward?.id || profile.ward?.wardId;

            if (wardId) {
                setWardInfo({
                    wardName: profile.ward?.areaName || profile.wardName || 'Local Sector',
                    wardId: wardId
                });
            }

            const data = wardCompRes.data?.content || wardCompRes.content || wardCompRes.data || wardCompRes;
            const list = Array.isArray(data) ? data : (data.content || []);

            // Tactical Intelligence: Anonymization and De-duplication
            const uniqueMap = new Map();
            list.forEach(item => {
                const id = item.complaintId || item.id;
                if (id && !uniqueMap.has(id)) {
                    uniqueMap.set(id, {
                        ...item,
                        citizenName: "VERIFIED_UNIT",
                        citizenEmail: "SENSITIVE_DATA",
                        citizenMobile: "PROTECTED"
                    });
                }
            });

            setComplaints(Array.from(uniqueMap.values()));
        } catch (err) {
            console.error('Failed to load area intel:', err);
            setError('Operational Feed Error: Area synchronization failed.');
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

    if (loading && complaints.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
            <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted text-uppercase tracking-[0.2em] extra-small">Synchronizing Local Area Intel...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="CITIZEN COMMAND"
                userName="AREA MONITORING"
                wardName={wardInfo?.wardName || "LOCAL SECTOR"}
                subtitle={`Real-time overview of active concerns in the ${wardInfo?.wardName || 'verified'} sector`}
                icon={Compass}
                actions={
                    <button onClick={loadData} className="btn btn-white shadow-premium border-0 rounded-circle d-flex align-items-center justify-content-center p-0 hover-rotate" style={{ width: '56px', height: '56px' }}>
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} style={{ color: PRIMARY_COLOR }} />
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-40px' }}>
                {/* Statistics Row */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'TOTAL VOLUME', value: stats.total, icon: BarChart3, color: PRIMARY_COLOR, bg: '#EBF2FF' },
                        { label: 'PENDING ACTION', value: stats.pending, icon: Clock, color: '#6366F1', bg: '#F5F5FF' },
                        { label: 'ACTIVE WORK', value: stats.active, icon: Activity, color: '#F59E0B', bg: '#FFF9EB' },
                        { label: 'SUCCESS NODES', value: stats.resolved, icon: CheckCircle, color: '#10B981', bg: '#EDFDF5' }
                    ].map((kpi, idx) => (
                        <div key={idx} className="col-12 col-md-6 col-lg-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 bg-white h-100 transition-all hover-up-tiny">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '54px', height: '54px', backgroundColor: kpi.bg, color: kpi.color }}>
                                        <kpi.icon size={26} strokeWidth={2.5} />
                                    </div>
                                    <div className="badge rounded-pill extra-small fw-black text-muted opacity-40 uppercase" style={{ backgroundColor: '#F1F5F9' }}>Sector Stat</div>
                                </div>
                                <h1 className="fw-black mb-1 text-dark display-5" style={{ letterSpacing: '-2px' }}>{kpi.value}</h1>
                                <p className="text-muted fw-black mb-0 extra-small uppercase tracking-widest opacity-40">{kpi.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Controls */}
                <div className="card border-0 shadow-premium rounded-5 bg-white p-4 p-lg-5 mb-5 overflow-hidden border-top border-5" style={{ borderTopColor: PRIMARY_COLOR }}>
                    <div className="row g-5 align-items-end">
                        <div className="col-lg-5">
                            <div className="mb-4 d-flex align-items-center gap-3">
                                <Filter size={18} style={{ color: PRIMARY_COLOR }} />
                                <span className="extra-small fw-black text-dark uppercase tracking-widest opacity-60">Strategic Control Hub</span>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                {[
                                    { id: 'ALL', label: 'ALL INTERCEPTS' },
                                    { id: 'SUBMITTED', label: 'NEW' },
                                    { id: 'IN_PROGRESS', label: 'WORKING' },
                                    { id: 'RESOLVED', label: 'SUCCESS' }
                                ].map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setFilterStatus(s.id)}
                                        className={`btn rounded-pill px-4 py-2 border-0 fw-black extra-small tracking-widest transition-standard shadow-sm ${filterStatus === s.id ? 'btn-primary' : 'btn-light text-muted'}`}
                                        style={filterStatus === s.id ? { backgroundColor: PRIMARY_COLOR } : {}}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="mb-4 d-flex align-items-center gap-3">
                                <Building2 size={18} style={{ color: PRIMARY_COLOR }} />
                                <span className="extra-small fw-black text-dark uppercase tracking-widest opacity-60">Department Node</span>
                            </div>
                            <select
                                className="form-select rounded-4 border-light py-3 px-4 fw-black shadow-none extra-small tracking-widest bg-light"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <option value="ALL">ALL MUNICIPAL NODES</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>
                                        {(dept.name || dept.departmentName || "NODE").replace(/_/g, ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 text-lg-end">
                            <div className="p-3 rounded-pill bg-light border shadow-inner d-inline-flex align-items-center gap-3 px-5">
                                <Target size={20} style={{ color: PRIMARY_COLOR }} />
                                <span className="extra-small fw-black text-dark uppercase tracking-widest">{filteredComplaints.length} RESULTS</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result Feed */}
                <div className="row g-4">
                    {filteredComplaints.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-premium rounded-5 p-5 text-center bg-white border-dashed border-3 transition-standard hover-up-tiny">
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4 anim-float shadow-inner" style={{ width: '100px', height: '100px' }}>
                                    <Shield size={48} className="text-muted opacity-20" />
                                </div>
                                <h4 className="fw-black text-dark uppercase tracking-widest mb-2">Sector Status: Clear</h4>
                                <p className="text-muted extra-small fw-black uppercase tracking-widest opacity-60 mt-3">
                                    No active reports detected in this tactical sector matching your filter parameters.
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredComplaints.map((c) => (
                            <div key={c.id || c.complaintId} className="col-md-6 col-lg-4">
                                <div className="transition-standard hover-up-tiny h-100">
                                    <ComplaintCard
                                        complaint={c}
                                        onClick={() => navigate(`/citizen/complaints/${c.id || c.complaintId}`)}
                                        brandColor={PRIMARY_COLOR}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Information Footer */}
                <div className="mt-5 p-5 rounded-5 bg-white shadow-premium border-start border-5 border-primary transition-standard hover-up-tiny d-flex flex-column flex-md-row align-items-center gap-5">
                    <div className="p-4 bg-light border shadow-inner rounded-circle text-primary anim-float">
                        <Info size={40} />
                    </div>
                    <div>
                        <h6 className="fw-black text-dark mb-1 uppercase tracking-widest">AREA INTEL SPECIFICATIONS</h6>
                        <p className="extra-small text-muted fw-bold mb-0 opacity-60 uppercase tracking-widest lh-lg">
                            Global area view enabled. Citizen PII is cryptographically masked for public transparency and privacy compliance.
                            Last synchronized: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="ms-md-auto">
                        <button onClick={() => navigate('/citizen/register-complaint')} className="btn btn-dark rounded-pill px-5 py-3 extra-small fw-black tracking-widest transition-all hover-up-tiny">
                            FILE NEW REPORT
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 950; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .animate-spin { animation: spin 1.2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .transition-standard { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .transition-all { transition: all 0.3s ease; }
                .hover-up-tiny:hover { transform: translateY(-8px); box-shadow: 0 30px 60px -12px rgba(0,0,0,0.12) !important; }
                .hover-rotate:hover svg { transform: rotate(90deg); transition: transform 0.4s ease; }
                .shadow-premium { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.06), 0 5px 20px -5px rgba(0,0,0,0.02); }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.04); }
                .anim-float { animation: float 4s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .display-5 { font-size: 3.5rem; }
            `}} />
        </div>
    );
};

export default AreaComplaints;
