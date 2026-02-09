import React, { useState, useEffect } from 'react';
import {
    Users, Mail, Phone, Building, Award, TrendingUp, RefreshCw,
    Search, Filter, Smartphone, MapPin, ShieldCheck, UserCheck, Briefcase, Activity, Target
} from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
// import { DEPARTMENTS } from '../../constants';
import DashboardHeader from '../../components/layout/DashboardHeader';

/**
 * Enhanced Strategic Officer Directory
 * High-contrast, tactical UI for managing department personnel.
 */
const DepartmentOfficersManagement = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState([]);

    const PRIMARY_COLOR = '#244799';

    useEffect(() => {
        fetchOfficers();
        apiService.common.getDepartments().then(res => setDepartments(res.data || res || []));
    }, []);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const response = await apiService.wardOfficer.getDepartmentOfficers();
            let data = response.data || response || [];
            if (data && data.content && Array.isArray(data.content)) {
                data = data.content;
            }
            setOfficers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching officers:', error);
            setOfficers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOfficers = officers.filter(officer => {
        const matchesDept = filterDepartment === 'all' ||
            officer.department?.departmentId === parseInt(filterDepartment) ||
            officer.departmentId === parseInt(filterDepartment);
        const name = officer.name || officer.userName || "Unknown Officer";
        const email = officer.email || "No Email";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesSearch;
    });

    if (loading && officers.length === 0) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="circ-white shadow-premium mb-4" style={{ width: '80px', height: '80px', color: PRIMARY_COLOR }}>
                <Users className="animate-spin" size={36} />
            </div>
            <p className="fw-black text-muted text-uppercase tracking-widest small">Synchronizing Personnel Records...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="WARD COMMAND HUB"
                userName="PERSONNEL DIRECTORY"
                wardName="OFFICER REGISTRY"
                subtitle="OFFICIAL DEPARTMENTAL STAFF | UNIT PERFORMANCE MONITOR"
                icon={Users}
                actions={
                    <button
                        onClick={fetchOfficers}
                        className="btn btn-white bg-white shadow-premium border-0 rounded-circle d-flex align-items-center justify-content-center p-0"
                        style={{ width: '54px', height: '54px' }}
                    >
                        <RefreshCw size={24} className={`text-primary ${loading ? 'animate-spin' : ''}`} style={{ color: PRIMARY_COLOR }} />
                    </button>
                }
            />

            <div className="container" style={{ maxWidth: '1200px', marginTop: '-30px' }}>
                {/* Statistics Matrix */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'TOTAL PERSONNEL', val: officers.length, icon: Users, color: PRIMARY_COLOR },
                        { label: 'ACTIVE UNIT', val: officers.filter(o => o.isActive).length, icon: ShieldCheck, color: '#10B981' },
                        { label: 'DEPARTMENTS', val: departments.length, icon: Building, color: '#6366F1' },
                        { label: 'AVG LOAD', val: officers.length > 0 ? Math.round(officers.reduce((sum, o) => sum + (o.assignedComplaints || 0), 0) / officers.length) : 0, icon: Activity, color: '#F59E0B' }
                    ].map((stat, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                            <div className="card border-0 shadow-premium rounded-4 p-4 h-100 bg-white border-top border-4 transition-all hover-up" style={{ borderColor: stat.color }}>
                                <div className="d-flex flex-column gap-3">
                                    <div className="p-3 rounded-4 align-self-start shadow-sm border" style={{ backgroundColor: `${stat.color}10`, color: stat.color, width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <stat.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="fw-black mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>{stat.val}</h2>
                                        <p className="fw-black mb-0 extra-small tracking-widest text-muted uppercase">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Command Bar */}
                <div className="row g-4 mb-5">
                    <div className="col-md-8">
                        <div className="card border-0 shadow-premium rounded-4 p-2 bg-white d-flex flex-row align-items-center gap-3 px-4">
                            <Search size={20} className="text-muted opacity-40" />
                            <input
                                type="text"
                                className="form-control border-0 shadow-none fw-black extra-small tracking-widest uppercase p-3"
                                placeholder="SEARCH PERSONNEL BY NAME OR ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-premium rounded-4 p-2 bg-white px-4">
                            <div className="d-flex align-items-center gap-3">
                                <Filter size={20} className="text-muted opacity-40" />
                                <select
                                    className="form-select border-0 shadow-none fw-black extra-small tracking-widest uppercase p-3"
                                    value={filterDepartment}
                                    onChange={(e) => setFilterDepartment(e.target.value)}
                                >
                                    <option value="all">ALL SECTORS</option>
                                    {departments.map(dept => (
                                        <option key={dept.departmentId || dept.id} value={dept.departmentId || dept.id}>
                                            {(dept.departmentName || dept.name || '').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Officers List */}
                <div className="row g-4">
                    {filteredOfficers.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-premium rounded-4 p-5 text-center bg-white border-dashed border-2">
                                <div className="rounded-circle bg-light d-inline-flex p-4 mb-4">
                                    <Users size={64} className="text-muted opacity-20" />
                                </div>
                                <h4 className="fw-black text-dark text-uppercase tracking-widest extra-small">Registry Status: Empty</h4>
                                <p className="text-muted extra-small fw-bold opacity-60 uppercase mt-2">No personnel records found matching current tactical parameters.</p>
                            </div>
                        </div>
                    ) : (
                        filteredOfficers.map(officer => (
                            <div key={officer.userId} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-premium rounded-4 h-100 bg-white transition-all hover-up-small border-start border-4" style={{ borderLeftColor: officer.isActive ? '#10B981' : '#CBD5E1' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-start justify-content-between mb-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="circ-white border shadow-sm fw-black" style={{ width: '48px', height: '48px', color: PRIMARY_COLOR, fontSize: '1.2rem' }}>
                                                    {officer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 className="fw-black text-dark mb-1 uppercase tracking-tight">{officer.name || officer.userName || "UNNAMED"}</h6>
                                                    <span className={`extra-small fw-black tracking-widest uppercase ${officer.isActive || officer.active ? 'text-success' : 'text-muted'}`}>
                                                        {officer.isActive || officer.active ? '● ACTIVE_DUTY' : '○ DEACTIVATED'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <span className="extra-small fw-black text-muted uppercase d-block opacity-40 mb-1">Load</span>
                                                <h4 className="fw-black text-primary mb-0" style={{ color: PRIMARY_COLOR }}>{officer.assignedComplaints || 0}</h4>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-3 mb-4">
                                            <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-30 border border-light">
                                                <div className="p-2 bg-white rounded-3 shadow-sm text-primary"><Briefcase size={14} /></div>
                                                <span className="extra-small fw-black text-dark uppercase tracking-wider">{officer.department?.name || officer.departmentName || 'UNASSIGNED'}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-30 border border-light">
                                                <div className="p-2 bg-white rounded-3 shadow-sm text-muted"><Mail size={14} /></div>
                                                <span className="extra-small fw-black text-dark text-truncate uppercase tracking-wider" style={{ maxWidth: '200px' }}>{officer.email}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-30 border border-light">
                                                <div className="p-2 bg-white rounded-3 shadow-sm text-muted"><Smartphone size={14} /></div>
                                                <span className="extra-small fw-black text-dark uppercase tracking-wider">{officer.mobile || 'SECURE_NODE_MISSING'}</span>
                                            </div>
                                        </div>

                                        {officer.assignedComplaints > 0 && (
                                            <div className="mt-4 pt-4 border-top">
                                                <div className="row g-0 text-center">
                                                    <div className="col-4 border-end">
                                                        <span className="extra-small d-block fw-black text-muted uppercase opacity-40 mb-1">Queue</span>
                                                        <strong className="text-warning fw-black">{officer.pendingCount || 0}</strong>
                                                    </div>
                                                    <div className="col-4 border-end">
                                                        <span className="extra-small d-block fw-black text-muted uppercase opacity-40 mb-1">Active</span>
                                                        <strong className="text-info fw-black">{officer.inProgressCount || 0}</strong>
                                                    </div>
                                                    <div className="col-4">
                                                        <span className="extra-small d-block fw-black text-muted uppercase opacity-40 mb-1">Success</span>
                                                        <strong className="text-success fw-black">{officer.resolvedCount || 0}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Tactical Footer Info */}
                <div className="mt-5 p-5 rounded-4 bg-white shadow-premium border-start border-4 border-primary transition-all hover-up-small">
                    <div className="d-flex gap-4 align-items-center">
                        <div className="p-3 bg-light border shadow-inner rounded-circle text-primary">
                            <Target size={32} />
                        </div>
                        <div>
                            <h6 className="fw-black text-dark mb-1 uppercase tracking-widest">DEPLOYMENT PROTOCOLS</h6>
                            <p className="extra-small text-muted fw-bold mb-0 opacity-60 uppercase tracking-wider">Officer workloads are dynamically balanced based on departmental priority and SLA commitment levels.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05) !important; }
                .hover-up-small:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
                .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.02); }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                .circ-white { border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; }
            `}} />
        </div>
    );
};

export default DepartmentOfficersManagement;
