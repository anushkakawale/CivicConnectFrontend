import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import {
    Home, FileText, Bell, User, LogOut, Briefcase, BarChart3, Map
} from 'lucide-react';

const DepartmentSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/department/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/department/complaints', icon: FileText, label: 'My Complaints' },
        { path: '/department/map', icon: Map, label: 'Map View' },
        { path: '/department/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/department/notifications', icon: Bell, label: 'Notifications' },
        { path: '/department/profile', icon: User, label: 'Profile' }
    ];

    return (
        <div className="d-flex flex-column vh-100 bg-white border-end shadow-sm" style={{ width: '260px' }}>
            {/* Brand */}
            <div className="p-4 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <Briefcase size={28} className="text-primary" />
                    <div>
                        <h6 className="mb-0 fw-bold text-primary">CivicConnect</h6>
                        <small className="text-muted">Department Officer</small>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 p-3">
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

export default DepartmentSidebar;
