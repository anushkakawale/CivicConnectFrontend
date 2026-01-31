import React, { useState } from 'react';
import ModernSidebar from './ModernSidebar';
import ModernHeader from './ModernHeader';

const ModernLayout = ({ children, role, userName }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ModernSidebar 
        role={role} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <ModernHeader 
          role={role} 
          userName={userName} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
