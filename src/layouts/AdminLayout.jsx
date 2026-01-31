import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import './AdminLayout.css';

const AdminLayout = () => {
    const userName = localStorage.getItem('userName') || 'Admin';

    return (
        <div className="admin-layout">
            {/* Header - Fixed to Top */}
            <TopHeader role="ADMIN" userName={userName} />

            {/* Sidebar - Fixed Left, Below Header */}
            <Sidebar role="ADMIN" />

            {/* Main Content - Pushed by Header and Sidebar */}
            <main className="admin-main-content">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
