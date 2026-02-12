/**
 * Admin User Management Page - Strategic Personnel Oversight
 * State-of-the-art interface for city-wide user orchestration.
 */

import React, { useState, useEffect } from 'react';
import {
    Users, Search, UserPlus, UserCheck, UserX, Shield,
    MapPin, Building2, RefreshCw, Filter, MoreHorizontal,
    Mail, ShieldAlert, BadgeCheck, X, FileDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';

import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const { showToast } = useToast();
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getUsers({ page: 0, size: 200 });
            const data = response.data || response;
            const list = data.content || data.data || (Array.isArray(data) ? data : []);
            setUsers(list);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Authorization required for personnel directory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        const actionText = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;

        try {
            if (currentStatus) {
                await apiService.admin.deactivateUserById(userId);
            } else {
                await apiService.admin.activateUserById(userId);
            }
            showToast(`User account ${actionText}d successfully`, 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            showToast('Critical: Failed to update security status.', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleAttributes = (role) => {
        const attributes = {
            ADMIN: { color: '#EF4444', icon: <ShieldAlert size={14} /> },
            WARD_OFFICER: { color: PRIMARY_COLOR, icon: <Building2 size={14} /> },
            DEPARTMENT_OFFICER: { color: '#10B981', icon: <Shield size={14} /> },
            CITIZEN: { color: '#6366F1', icon: <Users size={14} /> }
        };
        return attributes[role] || { color: '#64748B', icon: <Users size={14} /> };
    };


    const handleExportCSV = () => {
        if (!filteredUsers.length) {
            showToast('No records to export.', 'warning');
            return;
        }

        const headers = ["User ID,Full Name,Role,Email,Mobile Number,Active Status,Assigned Ward/Dept"];
        const rows = filteredUsers.map(u => {
            const ward = u.wardByWardId?.areaName || u.wardName || '';
            const dept = u.departmentByDepartmentId?.departmentName || u.departmentName || '';
            const location = ward || dept || 'N/A';
            return [
                u.userId || u.id,
                `"${u.name || ''}"`,
                u.role,
                u.email || '',
                u.mobile || u.phoneNumber || '',
                u.active ? 'Active' : 'Locked',
                `"${location.replace(/_/g, ' ')}"`
            ].join(',');
        });

        const csvContent = headers.concat(rows).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `personnel_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && users.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-3" size={48} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted extra-small uppercase">Synchronizing User Registry...</p>
            </div>
        );
    }

    return (
        <div className="admin-personnel-premium min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Personnel Hub"
                userName="User Registry"
                wardName="Global Oversight"
                subtitle="High-level orchestration of security identities and system access"
                icon={Users}
                actions={
                    <button onClick={fetchUsers} className="btn btn-white bg-white rounded-pill shadow-sm px-4 py-2 border d-flex align-items-center gap-2 extra-small fw-black transition-all hover-shadow-md" style={{ color: PRIMARY_COLOR }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> REFRESH LIST
                    </button>
                }
            />

            <div className="tactical-grid-overlay"></div>

            <div className="container-fluid px-3 px-lg-5 position-relative" style={{ marginTop: '-30px', zIndex: 1 }}>
                <div className="vertical-divider-guide" style={{ left: '33%' }}></div>
                <div className="vertical-divider-guide" style={{ left: '66%' }}></div>

                {/* Filtration Hub */}
                <div className="card border-0 shadow-premium rounded-4 mb-5 bg-white">
                    <div className="card-body p-4 p-lg-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-xl-5">
                                <div className="input-group overflow-hidden border bg-light rounded-pill px-4">
                                    <span className="input-group-text bg-transparent border-0 pe-2"><Search size={20} className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control bg-transparent border-0 py-3 small fw-bold shadow-none"
                                        placeholder="Search by legal name or contact email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-xl-7">
                                <div className="d-flex gap-3 flex-wrap justify-content-xl-end align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="extra-small fw-black text-muted uppercase opacity-40">Filter Role:</span>
                                        <select
                                            className="form-select border-0 bg-light rounded-pill px-4 py-2 small fw-black shadow-sm pointer-pointer w-auto"
                                            value={filterRole}
                                            onChange={(e) => setFilterRole(e.target.value)}
                                        >
                                            <option value="ALL">ALL OPERATIVES</option>
                                            <option value="CITIZEN">CITIZENS</option>
                                            <option value="WARD_OFFICER">WARD OFFICERS</option>
                                            <option value="DEPARTMENT_OFFICER">DEPT OFFICERS</option>
                                            <option value="ADMIN">ADMINISTRATORS</option>
                                        </select>
                                    </div>
                                    <div className="vr d-none d-md-block mx-2" style={{ height: '24px', opacity: 0.1 }}></div>
                                    <button onClick={handleExportCSV} className="btn btn-white bg-white shadow-sm extra-small fw-black px-4 py-2 rounded-pill border d-flex align-items-center gap-2 transition-all hover-up-tiny">
                                        <FileDown size={14} /> EXPORT CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Master Registry - Strategic Table View */}
                <div className="card border-0 shadow-premium rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-5 py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Operative</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Security Role</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Contact Identity</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Mobile</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Sector / Dept</th>
                                    <th className="py-4 border-0 extra-small fw-black text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-5 py-4 border-0 text-end extra-small fw-black text-muted uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="rounded-circle bg-light d-inline-flex p-4 mb-3 mx-auto">
                                                <Users size={48} className="text-muted opacity-20" />
                                            </div>
                                            <h6 className="fw-black text-dark uppercase mb-1">Registry Empty</h6>
                                            <p className="extra-small text-muted fw-bold opacity-60">No operatives found matching the criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const roleAttr = getRoleAttributes(user.role);
                                        const assignment = (user.wardByWardId?.areaName || user.wardName) ?
                                            { label: user.wardByWardId?.areaName || user.wardName, icon: MapPin } :
                                            (user.departmentByDepartmentId?.departmentName || user.departmentName) ?
                                                { label: (user.departmentByDepartmentId?.departmentName || user.departmentName).replace(/_/g, ' '), icon: Building2 } :
                                                { label: 'Civilian Sector', icon: Users };

                                        return (
                                            <tr key={user.userId || user.id} className="hover-light transition-all">
                                                <td className="px-5 py-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-pill fw-black text-white d-flex align-items-center justify-content-center shadow-sm"
                                                            style={{ backgroundColor: roleAttr.color, width: '40px', height: '40px', fontSize: '0.9rem' }}>
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="fw-black text-dark small mb-0 text-truncate tracking-tight d-flex align-items-center gap-2">
                                                                {user.name}
                                                                {user.active && <BadgeCheck size={14} style={{ color: PRIMARY_COLOR }} />}
                                                            </div>
                                                            <div className="extra-small text-muted fw-bold opacity-50">UID: #{user.userId || user.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill" style={{ backgroundColor: `${roleAttr.color}10`, color: roleAttr.color }}>
                                                        {roleAttr.icon}
                                                        <span className="extra-small fw-black text-uppercase tracking-wider" style={{ fontSize: '9px' }}>{user.role?.replace('ROLE_', '').replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted">
                                                        <Mail size={12} className="opacity-40" />
                                                        <span className="text-dark">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted">
                                                        <span className="text-dark fw-black">{user.mobile || user.phoneNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2 extra-small fw-bold text-muted">
                                                        <assignment.icon size={12} className="opacity-40" />
                                                        <span className="text-dark uppercase">{assignment.label}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={`d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill extra-small fw-black uppercase ${user.active ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                                        <div className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: user.active ? '#10B981' : '#EF4444' }}></div>
                                                        {user.active ? 'Active' : 'Locked'}
                                                    </div>
                                                </td>
                                                <td className="px-5 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleActive(user.userId || user.id, user.active)}
                                                            className={`btn rounded-pill px-3 py-1.5 extra-small fw-black transition-all shadow-sm ${user.active ? 'btn-outline-danger' : 'btn-outline-success'} border-2`}
                                                        >
                                                            {user.active ? 'DEACTIVATE' : 'GRANT'}
                                                        </button>
                                                        <button className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border" style={{ width: '32px', height: '32px' }}>
                                                            <MoreHorizontal size={14} className="text-muted" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Hub */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-4 py-5 gap-3 mt-2">
                        <p className="extra-small fw-black text-muted uppercase mb-0 opacity-40">
                            Personnel Records Synchronized: {filteredUsers.length} of {users.length}
                        </p>
                        <div className="d-flex gap-2">
                            <button className="btn btn-white bg-white shadow-sm extra-small fw-black px-4 py-2 rounded-pill border hover-shadow-md transition-all"><ArrowLeft size={14} className="me-2" /> PREVIOUS</button>
                            <button className="btn btn-white bg-white shadow-sm extra-small fw-black px-4 py-2 rounded-pill border hover-shadow-md transition-all">NEXT FIELD <ArrowRight size={14} className="ms-2" /></button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-personnel-premium { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-light:hover { background-color: #F8FAFC !important; }
                .hover-shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .btn-outline-primary { color: ${PRIMARY_COLOR}; border-color: ${PRIMARY_COLOR}; }
                .btn-outline-primary:hover { background-color: ${PRIMARY_COLOR}; color: white; }

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

export default AdminUserManagement;
