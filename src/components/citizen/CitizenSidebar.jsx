import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import apiService from '../../api/apiService';
import {
    Home, Plus, FileText, Clock, Star,
    User, LogOut, Bell, Building2, Shield, MapPin, Search
} from 'lucide-react';

const CitizenSidebar = () => {
    const navigate = useNavigate();
    const [areaCount, setAreaCount] = useState(0);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const profileRes = await apiService.profile.getProfile();
            const profile = profileRes.data || profileRes;
            const wardId = profile.wardId || profile.ward?.id || profile.ward?.wardId;

            if (wardId) {
                const response = await apiService.citizen.getAreaComplaints({ wardId, size: 1 });
                setAreaCount(response.totalElements || response.data?.totalElements || 0);
            }
        } catch (err) {
            console.warn('Could not fetch sidebar counts');
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/citizen/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/citizen/register-complaint', icon: Plus, label: 'New Complaint', highlight: true },
        { path: '/citizen/complaints', icon: FileText, label: 'My Complaints' },
        { path: '/citizen/area-complaints', icon: MapPin, label: 'My Area Complaints', badge: areaCount },
        { path: '/citizen/notifications', icon: Bell, label: 'Notifications' },
        { path: '/citizen/sla', icon: Clock, label: 'SLA Status' },
        { path: '/citizen/feedback/pending', icon: Star, label: 'Feedback' },
        { path: '/citizen/profile', icon: User, label: 'Profile' }
    ];

    return (
        <div className="d-flex flex-column vh-100 bg-white border-end shadow-sm" style={{ width: '260px' }}>
            {/* Brand */}
            <div className="p-4 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <Building2 size={28} className="text-primary" />
                    <div>
                        <h6 className="mb-0 fw-bold text-primary">CivicConnect</h6>
                        <small className="text-muted">Pune Municipal Corp</small>
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
                                    `nav-link d-flex align-items-center justify-content-between rounded-3 px-3 py-2-5 transition-all mb-1 ${isActive
                                        ? 'bg-primary text-white shadow-sm active-nav'
                                        : 'text-secondary hover-bg-light'
                                    } ${item.highlight ? 'fw-bold' : ''}`
                                }
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="small">{item.label}</span>
                                </div>
                                {item.badge > 0 && (
                                    <span className={`badge rounded-pill extra-small ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer - Logout */}
            <div className="p-3 border-top mt-auto">
                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 fw-bold small"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .py-2-5 { padding-top: 0.65rem; padding-bottom: 0.65rem; }
                .extra-small { font-size: 10px; padding: 0.35em 0.65em; }
                .active-nav { background-color: #173470 !important; }
                .hover-bg-light:hover { background-color: #f8fafc; color: #173470 !important; }
                .transition-all { transition: all 0.2s ease; }
            `}} />
        </div>
    );
};

export default CitizenSidebar;
