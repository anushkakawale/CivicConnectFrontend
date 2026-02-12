import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Phone, Mail, Building2, Search, Filter,
    ArrowRight, MapPin, Loader, RefreshCw, Activity,
    Shield, Briefcase, Zap, Star, ChevronRight, UserCheck,
    MessageSquare, Calendar
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { DEPARTMENTS } from '../../constants';
import DashboardHeader from '../../components/layout/DashboardHeader';

const WardOfficerDirectory = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [officers, setOfficers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('ALL');

    const brandColor = '#1254AF';

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        try {
            if (!officers.length) setLoading(true);
            const response = await apiService.wardOfficer.getDepartmentOfficers();
            const data = Array.isArray(response) ? response : (response.data || []);
            // If data contains department officers, map them to a cleaner structure if needed
            // But usually the API returns a list of UserDTOs or similar
            setOfficers(data);
        } catch (error) {
            console.error('Error fetching department officers:', error);
            showToast('Failed to load department officers', 'error');
            // Mock data for fallback
            setOfficers([
                { departmentOfficerId: 1, name: 'Priya Sharma', email: 'priya.sharma@civic.gov.in', mobile: '9876543211', departmentId: 1, department: { name: 'Water Supply' }, workload: 12 },
                { departmentOfficerId: 2, name: 'Amit Patel', email: 'amit.patel@civic.gov.in', mobile: '9876543212', departmentId: 2, department: { name: 'Roads' }, workload: 8 },
                { departmentOfficerId: 3, name: 'Sanjay Deshmukh', email: 'sanjay.d@civic.gov.in', mobile: '9123456789', departmentId: 3, department: { name: 'Waste Management' }, workload: 15 }
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOfficers();
    };

    const getDepartmentMeta = (deptId) => {
        const dept = DEPARTMENTS.find(d => d.department_id === parseInt(deptId));
        return dept || { name: 'Administration', icon: '🏢', color: '#64748B' };
    };

    const filteredOfficers = useMemo(() => {
        return officers.filter(officer => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = officer.name?.toLowerCase().includes(search) ||
                officer.email?.toLowerCase().includes(search) ||
                officer.mobile?.includes(search);
            const matchesDepartment = filterDepartment === 'ALL' ||
                officer.departmentId === parseInt(filterDepartment);
            return matchesSearch && matchesDepartment;
        });
    }, [officers, searchTerm, filterDepartment]);

    if (loading && !officers.length) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F0F2F5' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: brandColor }} />
            <p className="fw-black text-muted text-uppercase tracking-widest small">Indexing Officer Registry...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F0F2F5' }}>
            <DashboardHeader
                portalName="OFFICER DIRECTORY"
                userName="WARD PERSONNEL"
                wardName="OPERATIONAL ROSTER"
                subtitle="Jurisdiction Command: Departmental Liaison & Task Force"
                icon={Users}
                actions={
                    <button
                        onClick={handleRefresh}
                        className={`btn btn-white bg-white rounded-0 px-4 py-2 fw-black extra-small tracking-widest shadow-sm border-0 d-flex align-items-center gap-2 ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={14} /> SYNC DIRECTORY
                    </button>
                }
            />

            <div className="container py-4">
                {/* Statistics Cards */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Officers', value: officers.length, icon: UserCheck, color: brandColor, bg: brandColor },
                        { label: 'Active Status', value: officers.length, icon: Zap, color: '#10B981', bg: '#10B981' },
                        { label: 'Departments', value: new Set(officers.map(o => o.departmentId)).size, icon: Building2, color: '#3B82F6', bg: '#3B82F6' },
                        { label: 'Avg Workload', value: '4.2', icon: Activity, color: '#F59E0B', bg: '#F59E0B' }
                    ].map((stat, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                            <div className="card border-0 shadow-lg rounded-0 p-4 h-100" style={{ backgroundColor: stat.bg }}>
                                <div className="d-flex flex-column gap-3">
                                    <div className="p-3 rounded-0 align-self-start bg-white bg-opacity-90 text-primary shadow-sm" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <stat.icon size={24} style={{ color: stat.bg }} />
                                    </div>
                                    <div>
                                        <h2 className="fw-black mb-0 text-white" style={{ letterSpacing: '-0.5px' }}>{stat.value}</h2>
                                        <p className="text-white fw-black mb-0 extra-small text-uppercase tracking-widest opacity-80">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="card border-0 shadow-lg rounded-0 bg-white p-4 mb-5">
                    <div className="row g-3 align-items-center">
                        <div className="col-lg-7">
                            <div className="position-relative">
                                <Search className="position-absolute top-50 start-0 translate-middle-y ms-4 text-primary opacity-50" size={18} />
                                <input
                                    type="text"
                                    className="form-control ps-5 py-3 rounded-0 border-0 bg-light fw-bold shadow-none"
                                    placeholder="SEARCH BY NAME, EMAIL OR MOBILE..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ letterSpacing: '0.05em' }}
                                />
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="d-flex align-items-center gap-2">
                                <div className="p-3 rounded-0 bg-light border">
                                    <Filter size={18} className="text-muted" />
                                </div>
                                <select
                                    className="form-select border-0 bg-light rounded-0 px-4 py-3 fw-black extra-small tracking-widest shadow-none"
                                    value={filterDepartment}
                                    onChange={(e) => setFilterDepartment(e.target.value)}
                                >
                                    <option value="ALL">ALL DEPARTMENTS</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept.department_id} value={dept.department_id}>{dept.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Officers Grid */}
                <div className="row g-4">
                    {filteredOfficers.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="p-5 rounded-0 bg-white shadow-sm border border-dashed border-2">
                                <Users size={64} className="text-muted opacity-20 mb-3" />
                                <h6 className="fw-black text-muted text-uppercase tracking-widest extra-small">No Officers Found</h6>
                                <p className="text-muted small fw-bold">Try adjusting your search or department filters.</p>
                            </div>
                        </div>
                    ) : (
                        filteredOfficers.map((officer) => {
                            const dept = getDepartmentMeta(officer.departmentId);
                            return (
                                <div key={officer.departmentOfficerId} className="col-md-6 col-lg-4">
                                    <div className="card border-0 shadow-sm rounded-0 h-100 overflow-hidden hover-card transition-all bg-white border-top border-5" style={{ borderTopColor: brandColor }}>
                                        <div className="p-5">
                                            <div className="d-flex justify-content-between align-items-start mb-4">
                                                <div>
                                                    <h5 className="fw-black text-dark mb-1 text-uppercase tracking-tight">{officer.name}</h5>
                                                    <span className={`badge ${officer.status === 'DEACTIVATED' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light text-muted'} border rounded-0 px-3 py-1 extra-small fw-black tracking-widest uppercase`}>
                                                        {officer.status || 'Active'}
                                                    </span>
                                                </div>
                                                <div className="text-end">
                                                    <div className="extra-small fw-black text-muted uppercase tracking-widest mb-1 opacity-50">Workload</div>
                                                    <div className="fw-black text-primary fs-4" style={{ color: brandColor }}>{officer.workload || 0}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-column gap-3 mb-5">
                                                <div className="p-3 rounded-0 bg-light bg-opacity-50 border border-light d-flex align-items-center gap-3">
                                                    <div className="p-2 rounded-0 bg-white shadow-sm">
                                                        <Building2 size={16} className="text-primary" />
                                                    </div>
                                                    <span className="extra-small fw-black text-dark uppercase tracking-widest">{dept.name}</span>
                                                </div>
                                                <div className="p-3 rounded-0 bg-light bg-opacity-50 border border-light d-flex align-items-center gap-3">
                                                    <div className="p-2 rounded-0 bg-white shadow-sm">
                                                        <Mail size={16} className="text-primary" />
                                                    </div>
                                                    <span className="extra-small fw-bold text-muted text-truncate">{officer.email}</span>
                                                </div>
                                                <div className="p-3 rounded-0 bg-light bg-opacity-50 border border-light d-flex align-items-center gap-3">
                                                    <div className="p-2 rounded-0 bg-white shadow-sm">
                                                        <Phone size={16} className="text-primary" />
                                                    </div>
                                                    <span className="extra-small fw-bold text-muted">{officer.mobile}</span>
                                                </div>
                                            </div>

                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <a href={`mailto:${officer.email}`} className="btn btn-white bg-white border shadow-sm rounded-0 w-100 py-3 extra-small fw-black tracking-widest uppercase hover-up transition-all">
                                                        <Mail size={14} className="me-2" /> EMAIL
                                                    </a>
                                                </div>
                                                <div className="col-6">
                                                    <a href={`tel:${officer.mobile}`} className="btn btn-primary rounded-0 w-100 py-3 extra-small fw-black tracking-widest uppercase shadow-md border-0 hover-up transition-all" style={{ backgroundColor: brandColor }}>
                                                        <Phone size={14} className="me-2" /> CALL
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .tracking-tight { letter-spacing: -0.02em; }
                .animate-spin { animation: spin 1s linear infinite; }
                .hover-card:hover { transform: translateY(-10px); box-shadow: 0 25px 40px -10px rgba(0,0,0,0.15) !important; border-top-color: #F59E0B !important; }
                .hover-up:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .rounded-0 { border-radius: 2.5rem !important; }
            `}} />
        </div>
    );
};

export default WardOfficerDirectory;
