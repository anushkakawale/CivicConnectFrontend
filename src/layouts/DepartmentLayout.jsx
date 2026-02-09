import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';

const DepartmentLayout = () => {
    const [userName, setUserName] = useState('Department Officer');

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            const nameStr = localStorage.getItem('name');

            if (nameStr) {
                setUserName(nameStr);
            } else if (userStr) {
                const user = JSON.parse(userStr);
                setUserName(user.name || user.email || 'Officer');
            }
        } catch (err) {
            console.error('Error getting user name:', err);
        }
    }, []);

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <TopHeader role="DEPARTMENT_OFFICER" userName={userName} />

            <Sidebar role="DEPARTMENT_OFFICER" />

            <div
                className="gov-main d-flex flex-column"
                style={{
                    marginTop: '70px',
                    marginLeft: '260px',
                    width: 'calc(100% - 260px)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    minHeight: 'calc(100vh - 70px)'
                }}
            >
                <div className="flex-grow-1 p-0">
                    <Outlet context={{ userName }} />
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .gov-main {
                        margin-left: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default DepartmentLayout;
