import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Menu, 
  X, 
  Home, 
  FileText, 
  BarChart3, 
  Map, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  User,
  ChevronDown,
  PlusCircle,
  List,
  MapPin,
  UserCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { GovButton, GovBadge } from '../ui/GovComponents';

const ModernSidebar = ({ role, isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { path: '/admin/dashboard', icon: Home, label: 'Dashboard', color: 'blue' },
          { path: '/admin/complaints', icon: FileText, label: 'Complaints', color: 'green' },
          { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'purple' },
          { path: '/admin/map', icon: Map, label: 'Map View', color: 'amber' },
          { path: '/admin/reports', icon: FileText, label: 'Reports', color: 'red' },
        ];
      case 'WARD_OFFICER':
        return [
          { path: '/ward-officer/dashboard', icon: Home, label: 'Dashboard', color: 'blue' },
          { path: '/ward-officer/complaints', icon: List, label: 'Ward Complaints', color: 'green' },
          { path: '/ward-officer/approvals', icon: CheckCircle, label: 'Pending Approvals', color: 'amber' },
          { path: '/ward-officer/officers', icon: Users, label: 'Department Officers', color: 'purple' },
          { path: '/ward-officer/analytics', icon: BarChart3, label: 'Ward Analytics', color: 'red' },
          { path: '/ward-officer/map', icon: Map, label: 'Ward Map', color: 'blue' },
          { path: '/ward-officer/profile', icon: UserCircle, label: 'Profile', color: 'gray' },
        ];
      case 'DEPARTMENT_OFFICER':
        return [
          { path: '/department/dashboard', icon: Home, label: 'Dashboard', color: 'blue' },
          { path: '/department/assigned', icon: CheckCircle, label: 'Assigned to Me', color: 'green' },
          { path: '/department/in-progress', icon: Clock, label: 'In Progress', color: 'amber' },
          { path: '/department/resolved', icon: CheckCircle, label: 'Resolved', color: 'purple' },
        ];
      case 'CITIZEN':
        return [
          { path: '/citizen/dashboard', icon: Home, label: 'Dashboard', color: 'blue' },
          { path: '/citizen/complaints/new', icon: PlusCircle, label: 'Register Complaint', color: 'green' },
          { path: '/citizen/complaints', icon: List, label: 'My Complaints', color: 'purple' },
          { path: '/citizen/ward-complaints', icon: MapPin, label: 'Ward Complaints', color: 'amber' },
          { path: '/citizen/officers', icon: Users, label: 'Officers', color: 'red' },
          { path: '/citizen/profile', icon: UserCircle, label: 'Profile', color: 'gray' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const userName = localStorage.getItem('email') || 'User';
  const userRole = role?.replace('_', ' ').toLowerCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getRoleColor = (role) => {
    const colors = {
      'ADMIN': 'purple',
      'WARD_OFFICER': 'green',
      'DEPARTMENT_OFFICER': 'blue',
      'CITIZEN': 'amber'
    };
    return colors[role] || 'blue';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-0 -translate-x-full'}
        lg:w-64 lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">CivicConnect</h1>
                  <p className="text-xs text-slate-400">Smart Governance</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <GovBadge variant="secondary" size="sm" className="mt-1">
                  {userRole}
                </GovBadge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? `bg-${item.color}-600 shadow-lg transform scale-105` 
                      : 'hover:bg-slate-700 hover:translate-x-1'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : `text-${item.color}-400`}`} />
                  </div>
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-red-600/20 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernSidebar;
