import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';

const WardOfficerLayout = () => {
    const [userName, setUserName] = useState('Ward Officer');

    useEffect(() => {
        // Get user name from localStorage
        try {
            const userStr = localStorage.getItem('user');
            const nameStr = localStorage.getItem('name');

            if (nameStr) {
                setUserName(nameStr);
            } else if (userStr) {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.email || 'Ward Officer');
            }
        } catch (err) {
            console.error('Error getting user name:', err);
            setUserName('Ward Officer');
        }
    }, []);

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Top Bar - Fixed */}
            <TopHeader role="WARD_OFFICER" userName={userName} />

            {/* Sidebar - Fixed below navbar */}
            <Sidebar role="WARD_OFFICER" />

            {/* Main Content Area */}
            <div
                className="gov-main d-flex flex-column"
                style={{
                    marginTop: '70px',
                    marginLeft: '250px',
                    width: 'calc(100% - 250px)',
                    transition: 'all 0.3s ease'
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

export default WardOfficerLayout;
