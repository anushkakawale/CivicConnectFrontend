import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';

const DepartmentOfficerLayout = () => {
    const [userName, setUserName] = useState('Department Officer');

    useEffect(() => {
        // Get user name from localStorage
        try {
            const userStr = localStorage.getItem('user');
            const nameStr = localStorage.getItem('name');

            if (nameStr) {
                setUserName(nameStr);
            } else if (userStr) {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.email || 'Department Officer');
            }
        } catch (err) {
            console.error('Error getting user name:', err);
            setUserName('Department Officer');
        }
    }, []);

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Top Bar - Fixed */}
            <TopHeader role="DEPARTMENT_OFFICER" userName={userName} />

            {/* Sidebar - Fixed below navbar */}
            <Sidebar role="DEPARTMENT_OFFICER" />

            {/* Main Content Area */}
            <div
                className="gov-main d-flex flex-column"
                style={{
                    marginTop: '65px', // SYNCED
                    marginLeft: '280px', // SYNCED
                    width: 'calc(100% - 280px)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    minHeight: 'calc(100vh - 65px)'
                }}
            >
                {/* Page Content */}
                <div className="flex-grow-1 bg-light">
                    <Outlet />
                </div>
            </div>

            {/* Responsive Styles */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .gov-main {
                        margin-left: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default DepartmentOfficerLayout;
