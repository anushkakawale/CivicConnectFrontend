import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle,
  Shield,
  Building2,
  Briefcase,
  Users
} from 'lucide-react';

const ModernHeader = ({ role, userName, onProfileClick, showProfile }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New complaint assigned',
      message: 'Water supply issue in Ward 3',
      time: '5 minutes ago',
      type: 'info',
      read: false
    },
    {
      id: 2,
      title: 'SLA breach warning',
      message: 'Complaint #1234 approaching deadline',
      time: '1 hour ago',
      type: 'warning',
      read: false
    },
    {
      id: 3,
      title: 'Complaint resolved',
      message: 'Road repair completed in Ward 2',
      time: '2 hours ago',
      type: 'success',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleIcon = () => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'WARD_OFFICER': return Building2;
      case 'DEPARTMENT_OFFICER': return Briefcase;
      case 'CITIZEN': return Users;
      default: return User;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'ADMIN': return 'from-purple-600 to-purple-700';
      case 'WARD_OFFICER': return 'from-green-600 to-green-700';
      case 'DEPARTMENT_OFFICER': return 'from-blue-600 to-blue-700';
      case 'CITIZEN': return 'from-amber-600 to-amber-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const RoleIcon = getRoleIcon();

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 ml-6">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                            }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                  notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-blue-600'
                              }`}>
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-slate-600 truncate">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className={`w-6 h-6 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center`}>
                  <User className="w-3 h-3 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500 capitalize">{role?.replace('_', ' ')}</p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center`}>
                        <RoleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{userName}</p>
                        <p className="text-sm text-slate-500 capitalize">{role?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        onProfileClick();
                        setShowUserMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 ${showProfile ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Indicator */}
      {showProfile && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Viewing Profile</span>
            </div>
            <button
              onClick={onProfileClick}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ModernHeader;
