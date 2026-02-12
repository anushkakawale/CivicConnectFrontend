/**
 * Professional Admin Officer Directory
 * Strategic personnel ledger with ward-based hierarchical grouping.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Search, Shield, Building2, MapPin,
    ChevronDown, ChevronRight, UserPlus, Info,
    RefreshCw, Filter, Phone, Mail, Navigation,
    BadgeCheck, ShieldAlert, Zap, Compass, Edit2, Target, Calendar
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { useMasterData } from '../../contexts/MasterDataContext';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminOfficerDirectory = () => {
    const [officers, setOfficers] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedWards, setExpandedWards] = useState({});
    const navigate = useNavigate();
    const { showToast } = useToast();
    const {
        wards: masterWards,
    } = useMasterData();
    const PRIMARY_COLOR = '#173470';

    // Use wards from context or local state
    const activeWards = (masterWards && masterWards.length > 0) ? masterWards : wards;

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Expand first few wards by default when wards are loaded
        if (activeWards && activeWards.length > 0 && Object.keys(expandedWards).length === 0) {
            const initialExpanded = {};
            activeWards.slice(0, 3).forEach(w => initialExpanded[w.wardId || w.id] = true);
            setExpandedWards(initialExpanded);
        }
    }, [activeWards]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch both officers and wards in parallel
            const [officersResponse, wardsResponse] = await Promise.all([
                apiService.admin.getOfficers(),
                (!masterWards || masterWards.length === 0) ? apiService.common.getWards() : Promise.resolve({ data: [] })
            ]);

            const officersData = officersResponse.data || officersResponse;
            const officersList = Array.isArray(officersData) ? officersData : (officersData?.content || []);
            setOfficers(officersList);

            // Only set wards if we fetched them (context didn't have them)
            if (!masterWards || masterWards.length === 0) {
                const wardsData = wardsResponse.data || wardsResponse;
                const wardsList = Array.isArray(wardsData) ? wardsData : (wardsData?.content || []);
                setWards(wardsList);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Failed to load officer directory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchOfficers = async () => {
        try {
            const response = await apiService.admin.getOfficers();
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data?.content || []);
            setOfficers(list);
        } catch (error) {
            console.error('Error fetching officers:', error);
            showToast('Failed to refresh officers', 'error');
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        const actionText = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${actionText} this security identity?`)) return;

        try {
            if (currentStatus) {
                await apiService.admin.deactivateUserById(userId);
            } else {
                await apiService.admin.activateUserById(userId);
            }
            showToast(`Officer identity ${actionText}d successfully`, 'success');
            fetchOfficers();
        } catch (error) {
            console.error('Error toggling officer status:', error);
            showToast('Critical: Failed to update security status.', 'error');
        }
    };

    const handleEditMobile = async (e, officer) => {
        e.stopPropagation();
        const newMobile = window.prompt("Update Secure Line (Mobile Number):", officer.mobile || officer.phoneNumber || "");
        if (newMobile !== null && newMobile !== (officer.mobile || officer.phoneNumber)) {
            if (!/^\d{10}$/.test(newMobile)) {
                showToast("Invalid format. 10 digits required.", "error");
                return;
            }
            try {
                await apiService.admin.updateUser(officer.userId || officer.id, {
                    mobile: newMobile,
                    phoneNumber: newMobile,
                    phone: newMobile
                });
                showToast("Identity updated on secure ledger.", "success");
                fetchOfficers();
            } catch (err) {
                console.error(err);
                showToast("Update rejected by central command.", "error");
            }
        }
    };

    const toggleWard = (wardId) => {
        setExpandedWards(prev => ({
            ...prev,
            [wardId]: !prev[wardId]
        }));
    };

    // Memoized grouping of officers for better performance
    const groupedOfficers = React.useMemo(() => {
        const safeOfficers = Array.isArray(officers) ? officers : [];
        const mapping = {};

        activeWards.forEach(ward => {
            const wardId = ward.wardId || ward.id;
            const wardNameStr = ward.areaName?.toLowerCase() || ward.wardName?.toLowerCase();

            const filteredByWard = safeOfficers.filter(o => {
                if (o.wardId === wardId) return true;
                if (o.wardByWardId?.wardId === wardId) return true;
                const officerWardStr = o.wardName?.toLowerCase() || o.ward?.toLowerCase() || (o.wardByWardId?.areaName?.toLowerCase());
                if (wardNameStr && officerWardStr && officerWardStr.includes(wardNameStr)) return true;
                return false;
            });

            const wardOfficers = filteredByWard.filter(o => {
                const role = (typeof o.role === 'string' ? o.role : o.role?.name || '').toUpperCase();
                return role === 'WARD_OFFICER' || role === 'ROLE_WARD_OFFICER';
            });

            const deptOfficers = filteredByWard.filter(o => {
                const role = (typeof o.role === 'string' ? o.role : o.role?.name || '').toUpperCase();
                return role === 'DEPARTMENT_OFFICER' || role === 'ROLE_DEPARTMENT_OFFICER';
            });

            mapping[wardId] = { wardOfficers, deptOfficers };
        });

        return mapping;
    }, [officers, activeWards]);

    const getWardData = (wardId) => {
        const data = groupedOfficers[wardId] || { wardOfficers: [], deptOfficers: [] };
        const { wardOfficers, deptOfficers } = data;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            const filterFn = o => o.name?.toLowerCase().includes(lowerSearch) ||
                o.email?.toLowerCase().includes(lowerSearch) ||
                (o.mobile && o.mobile.includes(searchTerm));

            const filteredWard = wardOfficers.filter(filterFn);
            const filteredDept = deptOfficers.filter(filterFn);

            return {
                wardOfficers: filteredWard,
                deptOfficers: filteredDept,
                hasMatches: filteredWard.length > 0 || filteredDept.length > 0
            };
        }

        return { ...data, hasMatches: true };
    };

    if (loading && officers.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted extra-small tracking-widest uppercase">Synchronizing Personnel Ledger...</p>
            </div>
        );
    }

    return (
        <div className="admin-officers-premium min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC', position: 'relative' }}>
            <div className="tactical-grid-overlay"></div>

            <DashboardHeader
                portalName="Official Personnel"
                userName="Officer Directory"
                wardName="Municipal Command"
                subtitle="Strategic grouping of legal operatives by administrative ward and functional unit"
                icon={Users}
                actions={
                    <div className="d-flex gap-2">
                        <button onClick={fetchOfficers} className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm border d-flex align-items-center gap-2 extra-small fw-black tracking-widest transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> REFRESH
                        </button>
                        <button className="btn btn-primary rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-sm border-0 d-flex align-items-center gap-2" style={{ backgroundColor: PRIMARY_COLOR }} onClick={() => navigate('/admin/register-officer')}>
                            <UserPlus size={16} /> ENROLL OFFICER
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>

                {/* Filtration Command Bar */}
                <div className="card border-0 shadow-premium rounded-4 mb-5 bg-white">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-xl-6">
                                <div className="input-group overflow-hidden border bg-light rounded-pill px-4">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><Search size={20} className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                        placeholder="Search by operative name, unit, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-xl-6 text-xl-end">
                                <div className="d-inline-flex align-items-center gap-3 bg-light px-4 py-2 rounded-pill border">
                                    <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">
                                        Active Operatives: {officers.length}
                                    </span>
                                    <div className="vr" style={{ height: '20px', opacity: 0.1 }}></div>
                                    <Shield size={16} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hierarchical Ward Grid */}
                <div className="d-flex flex-column gap-3">
                    {activeWards.length > 0 ? activeWards.map(ward => {
                        const wardId = ward.wardId || ward.id;
                        const { wardOfficers, deptOfficers, hasMatches } = getWardData(wardId);

                        if (!hasMatches && searchTerm) return null;
                        const isExpanded = expandedWards[wardId];

                        return (
                            <div key={wardId} className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white mb-4">
                                <div
                                    className="card-header bg-white py-4 px-4 px-lg-5 border-0 d-flex justify-content-between align-items-center cursor-pointer transition-all hover-light"
                                    onClick={() => toggleWard(wardId)}
                                    style={{ borderLeft: `6px solid ${isExpanded ? PRIMARY_COLOR : '#E2E8F0'}` }}
                                >
                                    <div className="d-flex align-items-center gap-4">
                                        <div className={`rounded-4 d-flex align-items-center justify-content-center border shadow-sm transition-all ${isExpanded ? 'bg-primary text-white' : 'bg-light text-primary'}`} style={{ width: '56px', height: '56px', color: isExpanded ? 'white' : PRIMARY_COLOR, backgroundColor: isExpanded ? PRIMARY_COLOR : '' }}>
                                            <Compass size={28} />
                                        </div>
                                        <div>
                                            <h5 className="fw-black text-dark mb-1 uppercase tracking-tight" style={{ fontSize: '1.25rem' }}>
                                                {ward.areaName?.toUpperCase() || ward.wardName?.toUpperCase() || 'GENERAL SECTOR'}
                                            </h5>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-60">ADMINISTRATIVE WARD #{ward.wardId || ward.id}</span>
                                                <div className="vr opacity-10" style={{ height: '12px' }}></div>
                                                <span className="badge bg-light text-dark extra-small fw-black border px-2">{wardOfficers.length + deptOfficers.length} ACTIVE PERSONNEL</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`rounded-circle p-2 transition-all ${isExpanded ? 'bg-dark text-white shadow-lg' : 'bg-light text-muted'}`} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="card-body bg-light bg-opacity-40 p-4 p-lg-5 border-top">
                                        <div className="row g-5">
                                            {/* Ward Commanders (Authority Level 1) */}
                                            <div className="col-12">
                                                <div className="d-flex align-items-center gap-3 mb-4">
                                                    <Shield size={18} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                                    <h6 className="extra-small fw-black text-dark uppercase tracking-[0.2em] mb-0">WARD COMMAND AUTHORITY</h6>
                                                    <div className="flex-grow-1 border-bottom border-dashed opacity-10"></div>
                                                </div>

                                                {wardOfficers.length > 0 ? (
                                                    <div className="row g-4">
                                                        {wardOfficers.map(officer => (
                                                            <div key={officer.userId || officer.id} className="col-md-6 col-xl-4 text-decoration-none">
                                                                <div className="card border-0 shadow-premium rounded-4 h-100 transition-all hover-up-tiny bg-white border-start border-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                                    <div className="card-body p-4 p-lg-5 position-relative">
                                                                        <div className="position-absolute top-0 end-0 p-4">
                                                                            <div className="d-flex flex-column align-items-end gap-2">
                                                                                <div className={`rounded-circle shadow-sm`} style={{ width: '12px', height: '12px', backgroundColor: officer.active ? '#10B981' : '#EF4444', border: '2px solid white' }}></div>
                                                                                <span className="extra-small fw-black text-muted opacity-30 uppercase tracking-tighter">SECURE</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex align-items-center gap-4 mb-5">
                                                                            <div className="rounded-4 d-flex align-items-center justify-content-center text-white fw-black shadow-lg bg-gradient-to-br"
                                                                                style={{ width: '64px', height: '64px', backgroundColor: PRIMARY_COLOR, fontSize: '1.4rem', background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #1a3a8a 100%)` }}>
                                                                                {officer.name?.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="fw-black text-dark mb-1 uppercase tracking-tight text-truncate" style={{ maxWidth: '180px', fontSize: '1.1rem' }}>{officer.name}</h6>
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    <div className="px-2 py-0.5 rounded-pill bg-primary bg-opacity-10 text-primary extra-small fw-black uppercase tracking-widest">COMMANDER</div>
                                                                                    <span className="extra-small fw-bold text-muted opacity-40">#{officer.userId || officer.id}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="vstack gap-3 mb-5 p-4 bg-light bg-opacity-50 rounded-4 border shadow-inner">
                                                                            <div className="d-flex align-items-center justify-content-between">
                                                                                <div className="d-flex align-items-center gap-3">
                                                                                    <div className="rounded-circle bg-white shadow-sm p-2 text-primary border"><Phone size={14} /></div>
                                                                                    <div>
                                                                                        <div className="extra-small text-muted fw-bold uppercase opacity-40" style={{ fontSize: '0.55rem' }}>Tactical Line</div>
                                                                                        <span className="small fw-black text-dark tracking-widest">{officer.mobile || officer.phoneNumber || 'N/A'}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <button onClick={(e) => handleEditMobile(e, officer)} className="btn btn-white circ-small shadow-sm border p-0 d-flex align-items-center justify-content-center text-primary" style={{ width: '28px', height: '28px' }}>
                                                                                    <Edit2 size={12} />
                                                                                </button>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-3 border-top pt-3">
                                                                                <div className="rounded-circle bg-white shadow-sm p-1.5 text-primary opacity-60 border"><Mail size={12} /></div>
                                                                                <span className="extra-small fw-black text-dark text-truncate lowercase">{officer.email}</span>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="rounded-circle bg-white shadow-sm p-1.5 text-primary opacity-60 border"><Target size={12} /></div>
                                                                                <span className="extra-small fw-black text-dark uppercase">{officer.wardName || 'PMC CENTRAL'}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex gap-2">
                                                                            <button onClick={(e) => { e.stopPropagation(); handleToggleActive(officer.userId || officer.id, officer.active); }} className={`btn ${officer.active ? 'btn-outline-danger' : 'btn-outline-success'} rounded-pill flex-grow-1 extra-small fw-black py-2.5 tracking-widest border-2 transition-all`}>
                                                                                {officer.active ? 'RETRACT AUTHORITY' : 'RESTORE AUTHORITY'}
                                                                            </button>
                                                                            <button className="btn btn-light rounded-pill p-2.5 border shadow-sm transition-all hover-shadow-md"><Info size={16} className="text-muted" /></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-5 rounded-4 border border-dashed text-center bg-white opacity-60 d-flex flex-column align-items-center gap-3">
                                                        <ShieldAlert size={32} className="text-muted mb-2 opacity-20" />
                                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">No Command Officers Registered</p>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/register-officer?wardId=${wardId}&role=WARD_OFFICER`); }}
                                                            className="btn btn-outline-primary rounded-pill px-4 py-2 fw-black extra-small tracking-widest"
                                                            style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                                                        >
                                                            REGISTER NOW
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Department Units (Authority Level 2) */}
                                            <div className="col-12 mt-4">
                                                <div className="d-flex align-items-center gap-3 mb-4">
                                                    <Target size={18} className="text-success" />
                                                    <h6 className="extra-small fw-black text-dark uppercase tracking-[0.2em] mb-0">FUNCTIONAL UNIT SPECIALISTS</h6>
                                                    <div className="flex-grow-1 border-bottom border-dashed opacity-10"></div>
                                                </div>

                                                {deptOfficers.length > 0 ? (
                                                    <div className="row g-4">
                                                        {deptOfficers.map(officer => (
                                                            <div key={officer.userId || officer.id} className="col-md-6 col-xl-4 text-decoration-none">
                                                                <div className="card border-0 shadow-premium rounded-4 h-100 transition-all hover-up-tiny bg-white border-top border-4 border-success">
                                                                    <div className="card-body p-4 p-lg-5">
                                                                        <div className="d-flex align-items-center gap-4 mb-4">
                                                                            <div className="rounded-4 d-flex align-items-center justify-content-center text-white fw-black shadow-md bg-success" style={{ width: '56px', height: '56px', fontSize: '1.2rem' }}>
                                                                                {officer.name?.charAt(0)}
                                                                            </div>
                                                                            <div className="overflow-hidden">
                                                                                <h6 className="fw-black text-dark mb-1 uppercase tracking-tight text-truncate">{officer.name}</h6>
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                    <span className="extra-small fw-black text-success px-2 py-0.5 rounded-pill bg-success bg-opacity-10 uppercase">FIELD SPECIALIST</span>
                                                                                    <span className="extra-small fw-bold text-muted opacity-50">#{officer.userId || officer.id}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex flex-column gap-3 mb-4 p-4 bg-light bg-opacity-75 rounded-4 border shadow-sm">
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="rounded-circle bg-white shadow-sm p-1.5 text-success opacity-60"><Mail size={14} /></div>
                                                                                <span className="extra-small fw-black text-dark text-truncate">{officer.email}</span>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="rounded-circle bg-white shadow-sm p-2 text-success"><Phone size={14} /></div>
                                                                                <div>
                                                                                    <div className="extra-small text-muted fw-bold uppercase opacity-50 mb-0" style={{ fontSize: '0.55rem' }}>Secure Line</div>
                                                                                    <span className="small fw-black text-dark tracking-wider">{officer.mobile || officer.phoneNumber || officer.phone || 'N/A'}</span>
                                                                                </div>
                                                                                <button onClick={(e) => handleEditMobile(e, officer)} className="btn btn-link p-0 text-success opacity-40 hover-opacity-100 border-0 ms-auto">
                                                                                    <Edit2 size={12} />
                                                                                </button>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="rounded-circle bg-white shadow-sm p-1.5 text-success opacity-60"><Building2 size={14} /></div>
                                                                                <span className="extra-small fw-black text-dark uppercase text-truncate">{(officer.departmentName || 'General Maintenance').replace(/_/g, ' ')}</span>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="rounded-circle bg-white shadow-sm p-1.5 text-success opacity-60"><MapPin size={14} /></div>
                                                                                <span className="extra-small fw-black text-dark uppercase">{officer.wardName || 'CENTRAL PMC'}</span>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="rounded-circle bg-white shadow-sm p-1.5 text-success opacity-60"><Calendar size={14} /></div>
                                                                                <span className="extra-small fw-black text-dark text-truncate">Joined: {officer.createdAt ? new Date(officer.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="d-flex gap-2">
                                                                            <button onClick={(e) => { e.stopPropagation(); handleToggleActive(officer.userId || officer.id, officer.active); }} className={`btn ${officer.active ? 'btn-outline-danger' : 'btn-outline-success'} rounded-pill flex-grow-1 extra-small fw-black py-2 tracking-widest transition-all border-2`}>
                                                                                {officer.active ? 'DEACTIVATE' : 'ACTIVATE'}
                                                                            </button>
                                                                            <button className="btn btn-light rounded-pill p-2 border shadow-sm"><Info size={16} className="text-muted" /></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-5 rounded-4 border border-dashed text-center bg-white opacity-60 d-flex flex-column align-items-center gap-3">
                                                        <Zap size={32} className="text-muted mb-2 opacity-20" />
                                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">Zero Specialists Allocated</p>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/register-officer?wardId=${wardId}&role=DEPARTMENT_OFFICER`); }}
                                                            className="btn btn-outline-success rounded-pill px-4 py-2 fw-black extra-small tracking-widest"
                                                        >
                                                            ALLOCATE SPECIALIST
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="text-center py-5">
                            <RefreshCw size={48} className="animate-spin text-primary opacity-20 mb-3 mx-auto" style={{ color: PRIMARY_COLOR }} />
                            <p className="extra-small fw-black text-muted uppercase tracking-widest">Accessing Ward Metadata...</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-officers-premium { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .tactical-grid-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        linear-gradient(rgba(23, 52, 112, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(23, 52, 112, 0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                    z-index: 0;
                }

                .vertical-divider-guide {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to bottom, transparent, rgba(23, 52, 112, 0.03), transparent);
                    pointer-events: none;
                    z-index: -1;
                }
            `}} />
        </div>
    );
};

export default AdminOfficerDirectory;
