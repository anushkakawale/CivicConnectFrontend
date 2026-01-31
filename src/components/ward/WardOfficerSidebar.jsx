import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import {
    Home, FileText, CheckCircle, Users, UserPlus, BarChart3, Map, Bell, User, LogOut, Shield
} from 'lucide-react';

const WardOfficerSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/ward-officer/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/ward-officer/approvals', icon: CheckCircle, label: 'Approvals' },
        { path: '/ward-officer/complaints', icon: FileText, label: 'All Complaints' },
        { path: '/ward-officer/officers', icon: Users, label: 'Officers' },
        { path: '/ward-officer/register-officer', icon: UserPlus, label: 'Register Officer' },
        { path: '/ward-officer/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/ward-officer/map', icon: Map, label: 'Map View' },
        { path: '/ward-officer/notifications', icon: Bell, label: 'Notifications' },
        { path: '/ward-officer/profile', icon: User, label: 'Profile' }
    ];

    return (
        <div className="d-flex flex-column vh-100 bg-white border-end shadow-sm" style={{ width: '260px' }}>
            {/* Brand */}
            <div className="p-4 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <Shield size={28} className="text-primary" />
                    <div>
                        <h6 className="mb-0 fw-bold text-primary">CivicConnect</h6>
                        <small className="text-muted">Ward Officer</small>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 p-3 overflow-auto">
                <ul className="nav flex-column gap-1">
                    {menuItems.map((item) => (
                        <li key={item.path} className="nav-item">
                            <NavLink
                                to={item.path}
                                end
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-dark hover-bg-light'
                                    }`
                                }
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer - Logout */}
            <div className="p-3 border-top">
                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default WardOfficerSidebar;
