import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Menu, X, Home, FileText, BarChart3, Map as MapIcon, Users, Settings, LogOut,
  Bell, Search, User, ChevronDown, PlusCircle, List, MapPin, UserCircle,
  CheckCircle, Clock, TrendingUp, ShieldCheck, Activity
} from 'lucide-react';

const ModernSidebar = ({ role, isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = () => {
    switch (role) {
      case 'ADMIN':
        const adminMenu = [
          { path: '/admin/dashboard', icon: Home, label: 'Dashboard Overview' },
          { path: '/admin/complaints', icon: List, label: 'All Complaints' },
          { path: '/admin/close-complaints', icon: CheckCircle, label: 'Close Complaints' },
          { path: '/admin/departments', icon: Building2, label: 'Departments' },
          { path: '/admin/officers', icon: Users, label: 'Officers Registry' },
          { path: '/admin/analytics', icon: BarChart3, label: 'Analytics & Reports' },
          { path: '/admin/map', icon: MapIcon, label: 'GIS Live Map' },
          { path: '/admin/profile', icon: User, label: 'My Profile' }
        ];
        return adminMenu;
      case 'WARD_OFFICER':
        return [
          { path: '/ward-officer/dashboard', icon: Home, label: 'Command Center' },
          { path: '/ward-officer/complaints', icon: List, label: 'Sector Ledger' },
          { path: '/ward-officer/approvals', icon: CheckCircle, label: 'Approve / Reject' },
          { path: '/ward-officer/register-officer', icon: Users, label: 'Nodal Force' },
          { path: '/ward-officer/analytics', icon: BarChart3, label: 'Sector Intel' },
          { path: '/ward-officer/map', icon: MapIcon, label: 'Sector Map' },
          { path: '/ward-officer/profile', icon: UserCircle, label: 'Officer ID' },
        ];
      case 'DEPARTMENT_OFFICER':
        return [
          { path: '/department/dashboard', icon: Home, label: 'Dashboard' },
          { path: '/department/assigned', icon: CheckCircle, label: 'Assigned Complaints' },
          { path: '/department/in-progress', icon: Clock, label: 'Work In Progress' },
          { path: '/department/history', icon: CheckCircle, label: 'Resolved History' },
          { path: '/department/map', icon: MapIcon, label: 'Area Map' },
          { path: '/department/profile', icon: User, label: 'My Profile' }
        ];
      case 'CITIZEN':
        return [
          { path: '/citizen/dashboard', icon: Home, label: 'My Hub' },
          { path: '/citizen/register-complaint', icon: PlusCircle, label: 'Lodge Grievance' },
          { path: '/citizen/my-complaints', icon: List, label: 'My Ledger' },
          { path: '/citizen/area-complaints', icon: MapPin, label: 'Ward Insight' },
          { path: '/citizen/map', icon: MapIcon, label: 'Citizen Map' },
          { path: '/citizen/notifications', icon: Bell, label: 'Dispatches' },
          { path: '/citizen/profile', icon: User, label: 'Identity Hub' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const userName = localStorage.getItem('userName') || 'Operator';
  const roleLabel = role?.replace('_', ' ').toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 z-40 d-lg-none"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        position-fixed start-0 top-0 h-100 z-50 transition-all duration-300
        ${isOpen ? 'w-sidebar' : 'w-0 overflow-hidden'}
        d-lg-block bg-white shadow-lg border-end
      `} style={{ width: isOpen ? '280px' : '0', transition: 'width 0.3s ease-in-out', backgroundColor: '#FFFFFF' }}>
        <div className="d-flex flex-column h-100">

          {/* Logo Section */}
          <div className="p-4 mb-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-0 text-white shadow-sm" style={{ backgroundColor: '#1254AF' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="fw-black text-dark mb-0 tracking-tight">CivicConnect</h4>
                  <span className="extra-small fw-black opacity-75 tracking-widest text-uppercase" style={{ color: '#1254AF' }}>Gov Portal</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="btn btn-link p-0 d-lg-none text-muted">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* User Profile Hook */}
          <div className="px-4 py-3 mb-4">
            <div className="p-3 rounded-0 d-flex align-items-center gap-3 border" style={{ backgroundColor: '#F8FAFC' }}>
              <div className="p-2 rounded-0 bg-white shadow-sm" style={{ color: '#1254AF' }}>
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="extra-small fw-black text-muted text-uppercase tracking-widest mb-1">Session Active</p>
                <h6 className="fw-black text-dark mb-0 text-truncate">{userName}</h6>
              </div>
            </div>
          </div>

          {/* Navigation Spectrum */}
          <nav className="flex-grow-1 px-3 overflow-y-auto custom-scrollbar">
            <div className="d-flex flex-column gap-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      d-flex align-items-center gap-3 px-3 py-3 rounded-0 transition-all text-decoration-none
                      ${isActive ? 'shadow-md' : 'text-muted hover-bg-light'}
                    `}
                    style={{
                      backgroundColor: isActive ? '#1254AF' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#64748B'
                    }}
                  >
                    <div className={`p-2 rounded-0 ${isActive ? 'bg-white bg-opacity-20' : 'bg-light'}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`fw-black extra-small tracking-widest text-uppercase ${isActive ? 'text-white' : 'text-muted'}`}>
                      {item.label}
                    </span>
                    {isActive && <div className="ms-auto p-1 rounded-0 bg-white shadow-sm animate-pulse"></div>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* System Control Footer */}
          <div className="p-4 border-top">
            <div className="bg-light p-3 rounded-0 mb-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Activity size={14} style={{ color: '#1254AF' }} />
                <span className="extra-small fw-black text-muted uppercase tracking-wider">{roleLabel}</span>
              </div>
              <div className="p-1 rounded-0 bg-success"></div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 rounded-0 py-3 fw-black extra-small tracking-widest d-flex align-items-center justify-content-center gap-2 border-2"
            >
              <LogOut size={18} /> SIGN OUT
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .fw-black { font-weight: 800; }
        .extra-small { font-size: 0.65rem; }
        .tracking-widest { letter-spacing: 0.2em; }
        .tracking-tight { letter-spacing: -0.04em; }
        .transition-all { transition: all 0.25s ease-in-out; }
        .hover-bg-light:hover { background-color: #F8FAFC !important; transform: translateX(5px); }
        .shadow-md { box-shadow: 0 10px 15px -3px rgba(18, 84, 175, 0.2); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse { animation: pulse 2s infinite; }
      `}} />
    </>
  );
};

export default ModernSidebar;
