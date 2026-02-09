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
    BadgeCheck, ShieldAlert, Zap, Compass, Edit2
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { useMasterData } from '../../contexts/MasterDataContext';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminOfficerDirectory = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedWards, setExpandedWards] = useState({});
    const navigate = useNavigate();
    const { showToast } = useToast();
    const {
        wards: masterWards,
    } = useMasterData();
    const PRIMARY_COLOR = '#244799';

    useEffect(() => {
        fetchOfficers();
        // Expand first few wards by default
        const initialExpanded = {};
        if (masterWards && masterWards.length > 0) {
            masterWards.slice(0, 3).forEach(w => initialExpanded[w.wardId] = true);
            setExpandedWards(initialExpanded);
        }
    }, [masterWards]);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getOfficers();
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data?.content || []);
            setOfficers(list);
        } catch (error) {
            console.error('Error fetching officers:', error);
            showToast('Authorization required for officer directory', 'error');
        } finally {
            setLoading(false);
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
                await apiService.admin.updateUser(officer.userId || officer.id, { mobile: newMobile });
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

    const getWardData = (wardId) => {
        const safeOfficers = Array.isArray(officers) ? officers : [];
        const wardMeta = masterWards.find(w => w.wardId === wardId);

        const filterByWard = (o) => {
            if (o.wardId === wardId) return true;
            if (o.wardByWardId?.wardId === wardId) return true;
            const wardNameStr = wardMeta?.areaName?.toLowerCase() || wardMeta?.wardName?.toLowerCase();
            const officerWardStr = o.wardName?.toLowerCase() || o.ward?.toLowerCase() || (o.wardByWardId?.areaName?.toLowerCase());
            if (wardNameStr && officerWardStr && officerWardStr.includes(wardNameStr)) return true;
            return false;
        };

        const wardOfficers = safeOfficers.filter(o => {
            const isMatch = filterByWard(o);
            const role = (typeof o.role === 'string' ? o.role : o.role?.name || '').toUpperCase();
            return isMatch && (role === 'WARD_OFFICER' || role === 'ROLE_WARD_OFFICER');
        });

        const deptOfficers = safeOfficers.filter(o => {
            const isMatch = filterByWard(o);
            const role = (typeof o.role === 'string' ? o.role : o.role?.name || '').toUpperCase();
            return isMatch && (role === 'DEPARTMENT_OFFICER' || role === 'ROLE_DEPARTMENT_OFFICER');
        });

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            const filterFn = o => o.name?.toLowerCase().includes(lowerSearch) ||
                o.email?.toLowerCase().includes(lowerSearch) ||
                (o.mobile && o.mobile.includes(searchTerm));

            return {
                wardOfficers: wardOfficers.filter(filterFn),
                deptOfficers: deptOfficers.filter(filterFn),
                hasMatches: wardOfficers.some(filterFn) || deptOfficers.some(filterFn)
            };
        }

        return { wardOfficers, deptOfficers, hasMatches: true };
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
        <div className="admin-officers-premium min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
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
                        <button className="btn btn-primary rounded-pill px-4 py-2 fw-black extra-small tracking-widest shadow-sm border-0 d-flex align-items-center gap-2" style={{ backgroundColor: PRIMARY_COLOR }} onClick={() => navigate('/admin/register-ward-officer')}>
                            <UserPlus size={16} /> ENROLL OFFICER
                        </button>
                    </div>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-30px' }}>
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
                    {masterWards.length > 0 ? masterWards.map(ward => {
                        const wardId = ward.wardId || ward.id;
                        const { wardOfficers, deptOfficers, hasMatches } = getWardData(wardId);

                        if (!hasMatches && searchTerm) return null;
                        const isExpanded = expandedWards[wardId];

                        return (
                            <div key={wardId} className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white mb-2">
                                <div
                                    className="card-header bg-white py-4 px-4 px-lg-5 border-0 d-flex justify-content-between align-items-center cursor-pointer transition-all hover-light"
                                    onClick={() => toggleWard(wardId)}
                                >
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center bg-light text-primary border shadow-sm" style={{ width: '52px', height: '52px', color: PRIMARY_COLOR }}>
                                            <Compass size={24} />
                                        </div>
                                        <div>
                                            <h5 className="fw-black text-dark mb-0 uppercase tracking-tight">
                                                WARD {ward.number || wardId}: {ward.areaName?.toUpperCase() || 'GENERAL UNIT'}
                                            </h5>
                                            <span className="extra-small fw-black text-muted uppercase tracking-widest opacity-40">
                                                {wardOfficers.length + deptOfficers.length} DEPLOYED PERSONNEL
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`rounded-circle p-2 transition-all ${isExpanded ? 'bg-primary text-white shadow-sm' : 'bg-light text-muted'}`} style={{ backgroundColor: isExpanded ? PRIMARY_COLOR : '', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="card-body bg-light bg-opacity-30 p-4 p-lg-5 border-top">
                                        <div className="row g-5">
                                            {/* Ward Authority Section */}
                                            <div className="col-12">
                                                <h6 className="extra-small fw-black text-primary uppercase tracking-[0.2em] mb-4 d-flex align-items-center gap-3">
                                                    <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: PRIMARY_COLOR }}></div>
                                                    WARD COMMAND OFFICERS
                                                </h6>
                                                {wardOfficers.length > 0 ? (
                                                    <div className="row g-4">
                                                        {wardOfficers.map(officer => (
                                                            <div key={officer.userId || officer.id} className="col-md-6 col-lg-4">
                                                                <div className="card border-0 shadow-premium rounded-4 h-100 transition-all hover-up bg-white border-top border-4" style={{ borderColor: PRIMARY_COLOR }}>
                                                                    <div className="card-body p-4 p-lg-5">
                                                                        <div className="d-flex align-items-center gap-4 mb-4">
                                                                            <div className="rounded-4 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '56px', height: '56px', backgroundColor: PRIMARY_COLOR }}>
                                                                                {officer.name?.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <div className="fw-black text-dark small mb-0 uppercase tracking-tight">{officer.name}</div>
                                                                                <div className="extra-small fw-black text-muted uppercase opacity-40">ID: #{officer.userId || officer.id}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-flex flex-column gap-2 p-3 bg-light rounded-4 border-dashed border mb-4">
                                                                            <div className="extra-small fw-black text-dark d-flex align-items-center gap-3">
                                                                                <Mail size={14} className="text-primary opacity-50" />
                                                                                <span className="text-truncate">{officer.email}</span>
                                                                            </div>
                                                                            <div className="extra-small fw-black text-dark d-flex align-items-center gap-3">
                                                                                <Phone size={14} className="text-primary opacity-50" />
                                                                                <span>{officer.mobile || officer.phoneNumber || officer.phone || officer.mobileNumber || 'SECURE LINE'}</span>
                                                                                <button onClick={(e) => handleEditMobile(e, officer)} className="btn btn-link p-0 ms-2 text-primary opacity-50 hover-opacity-100 border-0">
                                                                                    <Edit2 size={12} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                                                                            <div className={`extra-small fw-black uppercase ${officer.active ? 'text-success' : 'text-danger'} d-flex align-items-center gap-2`}>
                                                                                <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: officer.active ? '#10B981' : '#EF4444' }}></div>
                                                                                {officer.active ? 'Active' : 'Locked'}
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleToggleActive(officer.userId || officer.id, officer.active); }}
                                                                                className={`btn btn-sm rounded-pill px-3 py-1 extra-small fw-black transition-all ${officer.active ? 'btn-outline-danger' : 'btn-outline-success'} border-2`}
                                                                            >
                                                                                {officer.active ? 'LOCK' : 'GRANT'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-5 rounded-4 border border-dashed text-center bg-white opacity-60">
                                                        <ShieldAlert size={32} className="text-muted mb-2 opacity-20" />
                                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">Zero Ward Commanders Assigned</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Department Agents Section */}
                                            <div className="col-12 mt-5">
                                                <h6 className="extra-small fw-black text-success uppercase tracking-[0.2em] mb-4 d-flex align-items-center gap-3">
                                                    <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                                    FUNCTIONAL UNIT AGENTS
                                                </h6>
                                                {deptOfficers.length > 0 ? (
                                                    <div className="row g-4">
                                                        {deptOfficers.map(officer => (
                                                            <div key={officer.userId || officer.id} className="col-md-6 col-lg-4">
                                                                <div className="card border-0 shadow-premium rounded-4 h-100 transition-all hover-up bg-white border-top border-4 border-success">
                                                                    <div className="card-body p-4 p-lg-5">
                                                                        <div className="d-flex align-items-center gap-4 mb-4">
                                                                            <div className="rounded-4 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm bg-success" style={{ width: '56px', height: '56px' }}>
                                                                                {officer.name?.charAt(0)}
                                                                            </div>
                                                                            <div className="overflow-hidden">
                                                                                <div className="fw-black text-dark small mb-0 uppercase tracking-tight text-truncate">{officer.name}</div>
                                                                                <div className="extra-small fw-black text-muted uppercase opacity-40">Unit: {(officer.departmentName || 'GENERAL').replace(/_/g, ' ')}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-flex flex-column gap-2 p-3 bg-light rounded-4 border-dashed border mb-4">
                                                                            <div className="extra-small fw-black text-dark d-flex align-items-center gap-3">
                                                                                <Mail size={14} className="text-success opacity-50" />
                                                                                <span className="text-truncate">{officer.email}</span>
                                                                            </div>
                                                                            <div className="extra-small fw-black text-dark d-flex align-items-center gap-3">
                                                                                <Phone size={14} className="text-success opacity-50" />
                                                                                <span>{officer.mobile || 'SECURE LINE'}</span>
                                                                                <button onClick={(e) => handleEditMobile(e, officer)} className="btn btn-link p-0 ms-2 text-primary opacity-50 hover-opacity-100 border-0">
                                                                                    <Edit2 size={12} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                                                                            <div className={`extra-small fw-black uppercase ${officer.active ? 'text-success' : 'text-danger'} d-flex align-items-center gap-2`}>
                                                                                <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: officer.active ? '#10B981' : '#EF4444' }}></div>
                                                                                {officer.active ? 'Active' : 'Locked'}
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleToggleActive(officer.userId || officer.id, officer.active); }}
                                                                                className={`btn btn-sm rounded-pill px-3 py-1 extra-small fw-black transition-all ${officer.active ? 'btn-outline-danger' : 'btn-outline-success'} border-2`}
                                                                            >
                                                                                {officer.active ? 'LOCK' : 'GRANT'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-5 rounded-4 border border-dashed text-center bg-white opacity-60">
                                                        <Zap size={32} className="text-muted mb-2 opacity-20" />
                                                        <p className="extra-small fw-black text-muted uppercase tracking-widest mb-0 opacity-40">Zero Unit Agents Assigned</p>
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
            `}} />
        </div>
    );
};

export default AdminOfficerDirectory;
