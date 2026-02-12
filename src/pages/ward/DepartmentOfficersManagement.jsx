import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Mail, Phone, Building, Award, TrendingUp, RefreshCw,
    Search, Filter, Smartphone, MapPin, ShieldCheck, UserCheck, Briefcase, Activity, Target,
    ShieldAlert, Zap, UserPlus, ChevronRight, Info, AlertTriangle, XCircle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';

/**
 * 🎖️ Elite Tactical Personnel Management
 * High-performance UI for Ward Commanders to manage their operative units.
 */
const DepartmentOfficersManagement = () => {
    const navigate = useNavigate();
    const [officers, setOfficers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const BRAND_PRIMARY = '#173470';
    const BRAND_SUCCESS = '#10B981';
    const BRAND_WARNING = '#F59E0B';
    const BRAND_DANGER = '#EF4444';

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchOfficers(),
                fetchDepartments()
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await apiService.citizen.getDepartments();
            setDepartments(res.data || res || []);
        } catch (err) {
            console.error('Failed to load mission-critical department list', err);
        }
    };

    const fetchOfficers = async () => {
        try {
            setRefreshing(true);
            const response = await apiService.wardOfficer.getDepartmentOfficers();
            let data = response.data || response || [];
            if (data && data.content && Array.isArray(data.content)) {
                data = data.content;
            }
            setOfficers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Personnel sync failure:', error);
            setOfficers([]);
        } finally {
            setRefreshing(false);
        }
    };

    const getDepartmentName = (officer) => {
        if (officer.departmentName) return officer.departmentName;
        if (officer.department?.name) return officer.department.name;
        if (officer.department?.departmentName) return officer.department.departmentName;

        // Fallback lookup by ID
        const deptId = officer.departmentId || officer.department?.id || officer.department?.departmentId;
        if (deptId) {
            const dept = departments.find(d => (d.departmentId === deptId || d.id === deptId));
            if (dept) return dept.departmentName || dept.name;
        }

        return 'UNASSIGNED UNIT';
    };

    const [showDeactivated, setShowDeactivated] = useState(false);

    const filteredOfficers = useMemo(() => {
        return officers.filter(o => {
            // Improved active check: true by default if flag is missing
            const isActive = o.active !== false && o.isActive !== false;
            if (!showDeactivated && !isActive) return false;

            const name = (o.name || o.userName || '').toLowerCase();
            const email = (o.email || '').toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = name.includes(query) || email.includes(query) || o.userId?.toString().includes(query);

            const deptId = o.departmentId || o.department?.id || o.department?.departmentId;
            const matchesDept = filterDepartment === 'all' || deptId?.toString() === filterDepartment.toString();

            return matchesSearch && matchesDept;
        });
    }, [officers, searchQuery, filterDepartment, departments, showDeactivated]);

    const stats = useMemo(() => {
        const activeUnits = officers.filter(o => o.active || o.isActive);
        const activeCount = activeUnits.length;
        const total = officers.length;
        const avgLoad = activeCount > 0 ? Math.round(activeUnits.reduce((s, o) => s + (o.assignedComplaints || 0), 0) / activeCount) : 0;

        return [
            { label: 'Total Registry', value: total, icon: Users, color: BRAND_PRIMARY },
            { label: 'Active Unit', value: activeCount, icon: ShieldCheck, color: BRAND_SUCCESS },
            { label: 'Avg Unit Load', value: avgLoad, icon: Activity, color: BRAND_WARNING },
            { label: 'Depts Connected', value: departments.length, icon: Building, color: '#6366F1' }
        ];
    }, [officers, departments]);

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
            <div className="position-relative mb-4">
                <Users size={64} className="text-primary opacity-10" />
                <RefreshCw size={32} className="text-primary animate-spin position-absolute top-50 start-50 translate-middle" />
            </div>
            <h6 className="fw-black text-uppercase tracking-widest text-muted extra-small">Synchronizing Personnel Ledger...</h6>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="WARD COMMAND HUB"
                userName="OUR TEAM"
                wardName="OFFICER REGISTRY"
                subtitle="TACTICAL PERSONNEL MONITOR | UNIT DEPLOYMENT STATUS"
                icon={Users}
                actions={
                    <div className="d-flex gap-2">
                        <button
                            onClick={() => navigate('/ward-officer/register-officer')}
                            className="btn btn-primary rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-lg border-0 d-flex align-items-center gap-2 hover-up"
                            style={{ backgroundColor: BRAND_PRIMARY }}
                        >
                            <UserPlus size={16} /> ENROLL OPERATIVE
                        </button>
                        <button
                            onClick={fetchOfficers}
                            className={`btn btn-white bg-white shadow-sm border rounded-circle p-0 d-flex align-items-center justify-content-center transition-all ${refreshing ? 'animate-spin' : 'hover-up'}`}
                            style={{ width: '45px', height: '45px' }}
                        >
                            <RefreshCw size={20} className="text-primary" />
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-4 px-lg-5" style={{ marginTop: '-40px' }}>
                {/* Metrics Bar */}
                <div className="row g-4 mb-5">
                    {stats.map((stat, i) => (
                        <div key={i} className="col-6 col-md-3">
                            <div className="card h-100 border-0 shadow-premium rounded-4 overflow-hidden bg-white group hover-up transition-all">
                                <div className="card-body p-4 d-flex align-items-center gap-4">
                                    <div className="rounded-4 p-3 d-flex align-items-center justify-content-center shadow-sm border"
                                        style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                                        <stat.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="fw-black text-dark mb-0">{stat.value}</h3>
                                        <p className="extra-small fw-black text-muted text-uppercase tracking-widest mb-0 opacity-60">{stat.label}</p>
                                    </div>
                                </div>
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: stat.color, opacity: 0.3 }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Command Deck */}
                <div className="card border-0 shadow-premium rounded-4 mb-5 bg-white overflow-hidden border-start border-4 border-primary">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-lg-5">
                                <div className="input-group bg-light rounded-pill px-4 border border-2">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><Search size={20} className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                        placeholder="SEARCH BY OPERATIVE NAME OR ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="input-group bg-light rounded-pill px-4 border border-2">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><Filter size={20} className="text-muted" /></span>
                                    <select
                                        className="form-select bg-transparent border-0 py-3 extra-small fw-black text-uppercase tracking-widest shadow-none"
                                        value={filterDepartment}
                                        onChange={(e) => setFilterDepartment(e.target.value)}
                                    >
                                        <option value="all">ALL DEPARTMENTS</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId || d.id} value={d.departmentId || d.id}>
                                                {(d.departmentName || d.name || '').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-3 text-lg-end">
                                <button
                                    onClick={() => setShowDeactivated(!showDeactivated)}
                                    className={`btn rounded-pill px-4 py-3 w-100 extra-small fw-black tracking-widest border-2 transition-all ${showDeactivated ? 'btn-dark' : 'btn-outline-secondary'}`}
                                >
                                    {showDeactivated ? 'HIDE DEACTIVATED' : 'SHOW DEACTIVATED'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personnel Grid */}
                <div className="row g-4">
                    {filteredOfficers.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="p-5 bg-white rounded-4 shadow-sm border border-dashed d-flex flex-column align-items-center">
                                <AlertTriangle size={64} className="text-muted opacity-20 mb-3" />
                                <h5 className="fw-black text-muted text-uppercase tracking-widest">No Operatives Match Query</h5>
                                <p className="extra-small text-muted fw-bold uppercase">Adjustment of tactical filters recommended.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setFilterDepartment('all'); }}
                                    className="btn btn-outline-primary rounded-pill px-4 py-2 fw-black extra-small tracking-widest mt-3 transition-all"
                                >
                                    RESET PARAMETERS
                                </button>
                            </div>
                        </div>
                    ) : (
                        filteredOfficers.map(officer => {
                            // Default to active if no status field is present
                            const isActive = officer.active !== false && officer.isActive !== false;
                            const deptName = getDepartmentName(officer);
                            const initials = (officer.name || officer.userName || 'U').charAt(0).toUpperCase();

                            return (
                                <div key={officer.userId || officer.id} className="col-md-6 col-xl-4">
                                    <div className={`card h-100 border-0 shadow-premium rounded-4 overflow-hidden transition-all hover-up-small bg-white ${!isActive ? 'opacity-75 grayscale' : ''}`}>
                                        <div className="card-header border-0 bg-transparent p-4 pb-0 d-flex justify-content-between align-items-center">
                                            <div className={`badge rounded-pill px-3 py-1.5 extra-small fw-black d-inline-flex align-items-center gap-2 ${isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-muted'}`}>
                                                {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {isActive ? 'ACTIVE_DUTY' : 'DEACTIVATED'}
                                            </div>
                                            <div className="text-end">
                                                <div className="extra-small text-muted fw-black uppercase opacity-40 mb-n1" style={{ fontSize: '0.55rem' }}>RECORD_ID</div>
                                                <div className="fw-black text-dark font-mono small">#{officer.userId || officer.id}</div>
                                            </div>
                                        </div>

                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom border-light">
                                                <div className="rounded-4 d-flex align-items-center justify-content-center text-white fw-black shadow-lg"
                                                    style={{
                                                        width: '64px',
                                                        height: '64px',
                                                        backgroundColor: isActive ? BRAND_PRIMARY : '#94A3B8',
                                                        fontSize: '1.4rem',
                                                        border: '4px solid white',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                    }}>
                                                    {initials}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h5 className="fw-black text-dark mb-1 text-uppercase tracking-tight text-truncate" title={officer.name || officer.userName}>{officer.name || officer.userName || 'UNNAMED'}</h5>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="p-1 rounded bg-light"><Target size={12} className="text-primary" /></div>
                                                        <span className={`extra-small fw-black text-uppercase tracking-wider ${deptName === 'UNASSIGNED UNIT' ? 'text-danger animate-pulse' : 'text-muted'}`}>{deptName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="vstack gap-3 mb-4">
                                                <div className="d-flex align-items-center gap-3 p-2.5 rounded-3 bg-light bg-opacity-50 border border-light transition-all hover-bg-white shadow-sm-hover">
                                                    <div className="p-1.5 rounded bg-white shadow-sm text-primary" style={{ color: BRAND_PRIMARY }}><Mail size={14} /></div>
                                                    <span className="extra-small fw-bold text-dark text-truncate" style={{ maxWidth: '100%' }}>{officer.email || 'N/A'}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-3 p-2.5 rounded-3 bg-light bg-opacity-50 border border-light transition-all hover-bg-white shadow-sm-hover">
                                                    <div className="p-1.5 rounded bg-white shadow-sm text-primary" style={{ color: BRAND_PRIMARY }}><Smartphone size={14} /></div>
                                                    <span className="extra-small fw-bold text-dark tracking-widest">{officer.mobile || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Workload Matrix */}
                                            <div className="p-4 rounded-4 bg-light bg-opacity-75 border-top border-4 border-primary border-opacity-10">
                                                <div className="row g-2 text-center">
                                                    <div className="col-4 border-end">
                                                        <div className="extra-small fw-black text-muted uppercase opacity-40 mb-1" style={{ fontSize: '0.5rem' }}>TOTAL</div>
                                                        <div className="h5 fw-black text-dark mb-0">{officer.assignedComplaints || 0}</div>
                                                    </div>
                                                    <div className="col-4 border-end">
                                                        <div className="extra-small fw-black text-muted uppercase opacity-40 mb-1" style={{ fontSize: '0.5rem' }}>ACTIVE</div>
                                                        <div className="h5 fw-black text-primary mb-0" style={{ color: BRAND_PRIMARY }}>{officer.inProgressCount || 0}</div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="extra-small fw-black text-muted uppercase opacity-40 mb-1" style={{ fontSize: '0.5rem' }}>SOLVED</div>
                                                        <div className="h5 fw-black text-success mb-0" style={{ color: BRAND_SUCCESS }}>{officer.resolvedCount || 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-footer border-0 p-4 pt-0 bg-transparent">
                                            <button
                                                className="btn btn-dark w-100 rounded-pill py-2.5 fw-black extra-small tracking-widest d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all hover-up-small"
                                                onClick={() => navigate(`/ward-officer/officers/${officer.userId || officer.id}`)}
                                                disabled={!isActive}
                                            >
                                                <Target size={14} /> ANALYZE UNIT
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Administrative Footer */}
                <div className="mt-5 p-5 rounded-4 bg-white shadow-premium border-start border-4 border-primary position-relative overflow-hidden group">
                    <div className="position-absolute top-0 end-0 p-5 opacity-5 group-hover-opacity-10 transition-all scale-150 rotate-12">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="d-flex align-items-center gap-4 position-relative z-1">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-4 text-primary d-flex align-items-center justify-content-center shadow-inner">
                            <ShieldCheck size={40} />
                        </div>
                        <div>
                            <h4 className="fw-black text-dark mb-1 uppercase tracking-tight">Personnel Engagement Protocol</h4>
                            <p className="extra-small text-muted fw-bold uppercase tracking-widest mb-0 opacity-60" style={{ maxWidth: '600px' }}>
                                Personnel records are synchronized with central municipal databases. Active monitoring of operative load ensures optimized resolution times and departmental integrity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.68rem; }
                .tracking-widest { letter-spacing: 0.18em; }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .hover-up { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .hover-up:hover { transform: translateY(-10px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important; }
                .hover-up-small:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.08) !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .grayscale { filter: grayscale(1); }
                .shadow-sm-hover:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            `}} />
        </div>
    );
};

export default DepartmentOfficersManagement;

