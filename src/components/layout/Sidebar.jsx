import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    List,
    MapPin,
    Clock,
    Users,
    User,
    LogOut,
    FileText,
    CheckCircle,
    UserPlus,
    BarChart2,
    Map as MapIcon,
    Shield
} from 'lucide-react';

export default function Sidebar({ role }) {
    const location = useLocation();

    // Mapping roles to color themes
    const getRoleTheme = () => {
        switch (role) {
            case 'CITIZEN':
                return {
                    activeBg: 'rgba(28, 167, 166, 0.1)', // Teal
                    activeText: '#1CA7A6',
                    activeBorder: '#1CA7A6'
                };
            case 'WARD_OFFICER':
                return {
                    activeBg: 'rgba(245, 158, 11, 0.1)', // Amber
                    activeText: '#F59E0B',
                    activeBorder: '#F59E0B'
                };
            case 'DEPARTMENT_OFFICER':
                return {
                    activeBg: 'rgba(124, 58, 237, 0.1)', // Purple
                    activeText: '#7C3AED',
                    activeBorder: '#7C3AED'
                };
            case 'ADMIN':
            default:
                return {
                    activeBg: 'rgba(11, 60, 93, 0.1)', // Deep Navy
                    activeText: '#0B3C5D',
                    activeBorder: '#0B3C5D'
                };
        }
    };

    const theme = getRoleTheme();

    // Map roles to menu items
    const getMenuItems = () => {
        switch (role) {
            case 'ADMIN':
                return [
                    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/admin/complaints', icon: List, label: 'All Complaints' },
                    { path: '/admin/users', icon: Users, label: 'User Management' },
                    { path: '/admin/officers', icon: Shield, label: 'Officers Directory' },
                    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
                    { path: '/admin/reports', icon: FileText, label: 'Reports' },
                    { path: '/admin/profile', icon: User, label: 'Profile' },
                ];
            case 'WARD_OFFICER':
                return [
                    { path: '/ward-officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/ward-officer/approvals', icon: CheckCircle, label: 'Pending Approvals' },
                    { path: '/ward-officer/complaints', icon: List, label: 'Ward Complaints' },
                    { path: '/ward-officer/ward-changes', icon: MapIcon, label: 'Ward Changes' },
                    { path: '/ward-officer/officers', icon: Users, label: 'Department Officers' },
                    { path: '/ward-officer/register-officer', icon: UserPlus, label: 'Register Officer' },
                    { path: '/ward-officer/analytics', icon: BarChart2, label: 'Analytics' },
                    { path: '/ward-officer/map', icon: MapIcon, label: 'Map View' },
                    { path: '/ward-officer/profile', icon: User, label: 'Profile' },
                ];
            case 'DEPARTMENT_OFFICER':
                return [
                    { path: '/department/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/department/complaints', icon: List, label: 'My Complaints' },
                    { path: '/department/analytics', icon: BarChart2, label: 'Analytics' },
                    { path: '/department/map', icon: MapIcon, label: 'Map View' },
                    { path: '/department/profile', icon: User, label: 'Profile' },
                ];
            case 'CITIZEN':
                return [
                    { path: '/citizen/dashboard', icon: LayoutDashboard, label: 'Overview' },
                    { path: '/citizen/register-complaint', icon: PlusCircle, label: 'Register Complaint' },
                    { path: '/citizen/complaints', icon: List, label: 'My Complaints' },
                    { path: '/citizen/area-complaints', icon: MapPin, label: 'Community' },
                    { path: '/citizen/map', icon: MapIcon, label: 'City Map' },
                    { path: '/citizen/sla', icon: Clock, label: 'SLA Status' },
                    { path: '/citizen/officers', icon: Users, label: 'Officer Directory' },
                    { path: '/citizen/profile', icon: User, label: 'My Profile' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <aside className="bg-white border-end" style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            bottom: 0,
            width: '250px',
            zIndex: 1020,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 24px rgba(0,0,0,0.01)'
        }}>
            {/* Scrollable Nav Area */}
            <div className="flex-grow-1 py-4 px-3 overflow-auto custom-scrollbar">
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    style={({ isActive }) => ({
                                        transition: 'all 0.2s ease',
                                        fontWeight: isActive ? 600 : 500,
                                        backgroundColor: isActive ? theme.activeBg : 'transparent',
                                        color: isActive ? theme.activeText : '#64748B', // Slate 500
                                        borderLeft: isActive ? `4px solid ${theme.activeBorder}` : '4px solid transparent',
                                        paddingLeft: isActive ? '0.75rem' : '1rem' // Compensate border
                                    })}
                                    className="d-flex align-items-center py-3 rounded-end-3 text-decoration-none"
                                >
                                    <Icon size={20} className="me-3" strokeWidth={2} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-top bg-light bg-opacity-30">
                <button
                    onClick={handleLogout}
                    className="btn btn-white w-100 d-flex align-items-center justify-content-center py-2 text-danger hover-bg-danger-soft transition-all"
                    style={{ fontWeight: 500, border: '1px solid #fee2e2' }}
                >
                    <LogOut size={18} className="me-2" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
