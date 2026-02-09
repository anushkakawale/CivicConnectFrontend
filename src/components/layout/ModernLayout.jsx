import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ModernSidebar from './ModernSidebar';
import ModernHeader from './ModernHeader';
import UserProfile from '../profile/UserProfile';

const ModernLayout = ({ role, userName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfile = () => setShowProfile(!showProfile);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <ModernSidebar
        role={role}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Header */}
        <ModernHeader
          role={role}
          userName={userName}
          onProfileClick={toggleProfile}
          showProfile={showProfile}
          onMenuClick={toggleSidebar}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {showProfile ? (
            <UserProfile
              user={{
                name: userName,
                email: localStorage.getItem('email') || '',
                role: role,
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString()
              }}
              role={role}
              onUpdate={(updatedData) => {
                console.log('Profile updated:', updatedData);
                setShowProfile(false);
              }}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
