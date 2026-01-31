import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';

const DepartmentLayout = () => {
    const userName = localStorage.getItem("email") || "Department Officer";

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Header Fixed Top */}
            <TopHeader role="DEPARTMENT_OFFICER" userName={userName} />

            {/* Sidebar Fixed Left */}
            <Sidebar role="DEPARTMENT_OFFICER" />

            {/* Main Content Pushed */}
            <div style={{
                marginTop: '70px',
                marginLeft: '250px',
                padding: 0,
                transition: 'margin-left 0.3s ease'
            }}>
                <Outlet />
            </div>
        </div>
    );
};

export default DepartmentLayout;
