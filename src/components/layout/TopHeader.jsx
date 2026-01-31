import { useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

export default function TopHeader({ role, userName }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const getRoleLabel = () => {
        switch (role) {
            case 'ADMIN': return 'Administrator';
            case 'WARD_OFFICER': return 'Ward Officer';
            case 'DEPARTMENT_OFFICER': return 'Dept Officer';
            case 'CITIZEN': return 'Citizen';
            default: return 'User';
        }
    };

    // Role-based accent line
    const getRoleColor = () => {
        switch (role) {
            case 'ADMIN': return '#0B3C5D'; // Navy
            case 'WARD_OFFICER': return '#F59E0B'; // Amber
            case 'DEPARTMENT_OFFICER': return '#7C3AED'; // Purple
            case 'CITIZEN': return '#1CA7A6'; // Teal
            default: return '#64748B';
        }
    };

    return (
        <div className="gov-topbar bg-white border-bottom" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1030,
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            borderTop: `4px solid ${getRoleColor()}` // Subtle top accent
        }}>
            {/* Branding */}
            <div className="d-flex align-items-center">
                <div
                    className="rounded-3 d-flex align-items-center justify-content-center me-2 shadow-sm"
                    style={{ width: 40, height: 40, backgroundColor: getRoleColor(), color: 'white' }}
                >
                    <i className="bi bi-building" style={{ fontSize: '1.25rem' }}></i>
                </div>
                <div>
                    <h1 className="h5 fw-bold mb-0" style={{ letterSpacing: '-0.5px', color: '#0B3C5D' }}>CivicConnect</h1>
                </div>
            </div>

            {/* Right Section */}
            <div className="d-flex align-items-center gap-4">
                {/* Notification Bell */}
                <NotificationBell darkIcon={true} />

                <div className="d-flex align-items-center gap-3">
                    {/* User Profile Info */}
                    <div
                        className="d-none d-md-block text-end cursor-pointer"
                        onClick={() => {
                            const basePath = role === 'ADMIN' ? '/admin' :
                                role === 'WARD_OFFICER' ? '/ward-officer' :
                                    role === 'DEPARTMENT_OFFICER' ? '/department' : '/citizen';
                            navigate(`${basePath}/profile`);
                        }}
                    >
                        <div className="fw-semibold text-dark small">{userName}</div>
                        <div style={{ fontSize: '0.7rem', color: getRoleColor(), fontWeight: 600, textTransform: 'uppercase' }}>
                            {getRoleLabel()}
                        </div>
                    </div>

                    {/* Avatar Circle */}
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center border"
                        style={{
                            width: 40, height: 40, cursor: 'pointer',
                            backgroundColor: `${getRoleColor()}20`, // 20% opacity
                            color: getRoleColor()
                        }}
                        onClick={() => {
                            const basePath = role === 'ADMIN' ? '/admin' :
                                role === 'WARD_OFFICER' ? '/ward-officer' :
                                    role === 'DEPARTMENT_OFFICER' ? '/department' : '/citizen';
                            navigate(`${basePath}/profile`);
                        }}
                    >
                        <span className="fw-bold">{userName?.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
