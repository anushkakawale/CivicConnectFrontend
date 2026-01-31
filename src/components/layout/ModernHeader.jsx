import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Settings, 
  LogOut,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { GovButton, GovBadge } from '../ui/GovComponents';

const ModernHeader = ({ role, userName, onMenuToggle }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: 'Complaint Updated', message: 'Your complaint #123 has been resolved', time: '2 hours ago', read: false },
    { id: 2, title: 'New Assignment', message: 'You have been assigned a new complaint', time: '5 hours ago', read: false },
    { id: 3, title: 'System Update', message: 'System maintenance scheduled for tonight', time: '1 day ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Menu Toggle & Search */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 rounded-xl px-4 py-2 w-96">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search complaints, officers, or resources..."
                className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            !notification.read ? 'bg-blue-600' : 'bg-slate-300'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">{notification.title}</p>
                            <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
                            <p className="text-slate-400 text-xs mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <GovBadge variant="secondary" size="sm" className="mt-0.5">
                    {role?.replace('_', ' ').toLowerCase()}
                  </GovBadge>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <p className="font-medium text-slate-900">{userName}</p>
                    <p className="text-sm text-slate-600">{role?.replace('_', ' ')}</p>
                  </div>
                  <div className="py-2">
                    <button className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-slate-50 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;
