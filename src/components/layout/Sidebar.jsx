import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, PlusCircle, List, MapPin, Clock, Users,
    User, LogOut, FileText, CheckCircle, UserPlus, BarChart2,
    Map as MapIcon, Shield, Activity, Smartphone, Info, ShieldAlert,
    ShieldCheck
} from 'lucide-react';

/**
 * Premium Professional Sidebar
 * Clean light aesthetic with active states highlighted in primary blue.
 */
export default function Sidebar({ role }) {
    const location = useLocation();
    const userName = localStorage.getItem("name") || "Officer";
    const PRIMARY_COLOR = '#173470';

    const getMenuItems = () => {
        switch (role) {
            case 'ADMIN':
                return [
                    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
                    { path: '/admin/complaints', icon: List, label: 'Complaints' },
                    { path: '/admin/users', icon: Users, label: 'Citizens' },
                    { path: '/admin/officers', icon: Shield, label: 'Officers' },
                    { path: '/admin/register-ward-officer', icon: UserPlus, label: 'Add Officer' },
                    { path: '/admin/analytics', icon: BarChart2, label: 'Stats' },
                    { path: '/admin/map', icon: MapIcon, label: 'Map' },
                    { path: '/admin/reports', icon: FileText, label: 'Reports' },
                    { path: '/admin/profile', icon: User, label: 'Profile' },
                ];
            case 'WARD_OFFICER':
                return [
                    { path: '/ward-officer/dashboard', icon: LayoutDashboard, label: 'Home' },
                    { path: '/ward-officer/approvals', icon: CheckCircle, label: 'Approvals' },
                    { path: '/ward-officer/complaints', icon: ShieldAlert, label: 'Complaints' },
                    { path: '/ward-officer/ward-changes', icon: MapIcon, label: 'Address Changes' },
                    { path: '/ward-officer/officers', icon: Users, label: 'Our Team' },
                    { path: '/ward-officer/register-officer', icon: UserPlus, label: 'Add Officer' },
                    { path: '/ward-officer/analytics', icon: BarChart2, label: 'Stats' },
                    { path: '/ward-officer/map', icon: MapIcon, label: 'Map' },
                    { path: '/ward-officer/profile', icon: User, label: 'Profile' },
                ];
            case 'DEPARTMENT_OFFICER':
                return [
                    { path: '/department/dashboard', icon: LayoutDashboard, label: 'Home' },
                    { path: '/department/complaints', icon: List, label: 'My Tasks' },
                    { path: '/department/map', icon: MapIcon, label: 'Map' },
                    { path: '/department/analytics', icon: BarChart2, label: 'Stats' },
                    { path: '/department/profile', icon: User, label: 'Profile' },
                ];
            case 'CITIZEN':
                return [
                    { path: '/citizen/dashboard', icon: LayoutDashboard, label: 'Home' },
                    { path: '/citizen/register-complaint', icon: PlusCircle, label: 'File Complaint' },
                    { path: '/citizen/complaints', icon: List, label: 'My Complaints' },
                    { path: '/citizen/area-complaints', icon: Activity, label: 'Ward Activity' },
                    { path: '/citizen/map', icon: MapIcon, label: 'City Map' },
                    { path: '/citizen/sla', icon: Clock, label: 'Tracking' },
                    { path: '/citizen/officers', icon: Users, label: 'Officers' },
                    { path: '/citizen/profile', icon: User, label: 'My Profile' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <aside className="border-end bg-white" style={{
            position: 'fixed',
            top: '70px',
            left: 0, bottom: 0,
            width: '260px',
            zIndex: 1040,
            display: 'flex', flexDirection: 'column',
            boxShadow: '4px 0 10px rgba(0,0,0,0.02)'
        }}>
            {/* Nav Stream */}
            <div className="flex-grow-1 py-4 px-2 overflow-auto custom-sidebar-scroll">
                <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    style={{
                                        transition: 'all 0.2s ease',
                                        fontWeight: isActive ? 800 : 500,
                                        backgroundColor: isActive ? `${PRIMARY_COLOR}10` : 'transparent',
                                        color: isActive ? PRIMARY_COLOR : '#64748b',
                                        padding: '0.75rem 1.25rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        border: isActive ? `1px solid ${PRIMARY_COLOR}20` : '1px solid transparent'
                                    }}
                                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={18} className="me-3" />
                                    <span style={{ fontSize: '0.85rem' }} className="fw-bold text-uppercase">{item.label}</span>
                                    {isActive && <div className="ms-auto" style={{ width: '5px', height: '15px', backgroundColor: PRIMARY_COLOR, borderRadius: '10px' }}></div>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Footer */}
            <div className="p-4 border-top mt-auto">
                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center py-2.5 fw-black extra-small rounded-3 transition-all border-2"
                >
                    <LogOut size={16} className="me-2" />
                    LOGOUT
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .sidebar-nav-item:hover { background-color: #f8fafc !important; color: ${PRIMARY_COLOR} !important; }
                .sidebar-nav-item.active:hover { background-color: ${PRIMARY_COLOR}15 !important; }
                .custom-sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .custom-sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .extra-small { font-size: 0.65rem; }
            `}} />
        </aside>
    );
}
