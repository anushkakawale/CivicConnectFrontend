import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';

const CitizenLayout = () => {
    const [userName, setUserName] = useState('Citizen');

    useEffect(() => {
        // Get user name from localStorage
        try {
            const userStr = localStorage.getItem('user');
            const nameStr = localStorage.getItem('name');

            if (nameStr) {
                setUserName(nameStr);
            } else if (userStr) {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.email || 'Citizen');
            }
        } catch (err) {
            console.error('Error getting user name:', err);
            setUserName('Citizen');
        }
    }, []);

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Top Bar - Fixed */}
            <TopHeader role="CITIZEN" userName={userName} />

            {/* Sidebar - Fixed below navbar */}
            <Sidebar role="CITIZEN" />

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
            <style>{`
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

export default CitizenLayout;

