import { useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';
import { ShieldCheck, User, LogOut, Search, Bell, Settings } from 'lucide-react';

/**
 * Premium Professional Header
 * Clean, light aesthetic with subtle shadows.
 */
function TopHeader({ role, userName }) {
    const navigate = useNavigate();
    const PRIMARY_COLOR = '#173470';

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

    return (
        <header className="gov-topbar shadow-sm" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 1050,
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            background: 'linear-gradient(135deg, #173470 0%, #0d2552 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>

            {/* Branding Section */}
            <div className="d-flex align-items-center cursor-pointer" onClick={() => navigate('/')}>
                <div
                    className="circ-primary me-3 shadow-lg d-flex align-items-center justify-content-center"
                    style={{
                        width: '42px',
                        height: '42px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <ShieldCheck size={24} className="text-white" />
                </div>
                <div className="d-flex flex-column">
                    <span className="fw-black text-white h5 mb-0" style={{ letterSpacing: '-0.5px' }}>PMC CIVIC CONNECT</span>
                    <span className="extra-small text-white fw-bold uppercase opacity-60" style={{ marginTop: '-4px' }}>Pune Municipal Corporation</span>
                </div>
            </div>

            {/* Functional Controls */}
            <div className="d-flex align-items-center gap-4">

                <div className="vr d-none d-md-block mx-1" style={{ height: '24px', opacity: 0.2, backgroundColor: 'white' }}></div>

                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-circle hover-bg-light-soft transition-all cursor-pointer position-relative">
                        <NotificationBell darkIcon={false} />
                    </div>

                    <div className="dropdown">
                        <div
                            className="d-flex align-items-center gap-3 p-1 ps-2 border border-white border-opacity-20 rounded-pill cursor-pointer transition-all hover-shadow-md bg-white bg-opacity-10"
                            style={{ height: '48px', backdropFilter: 'blur(5px)' }}
                            data-bs-toggle="dropdown"
                        >
                            <div className="d-none d-md-block text-end me-1">
                                <div className="fw-black text-white extra-small mb-0 uppercase">{userName}</div>
                                <div className="extra-small text-white fw-bold opacity-75">{getRoleLabel()}</div>
                            </div>
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold shadow-sm cursor-pointer transition-all hover-up-tiny bg-white"
                                style={{ width: '38px', height: '38px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const path = role === 'ADMIN' ? '/admin/profile' :
                                        role === 'WARD_OFFICER' ? '/ward-officer/profile' :
                                            role === 'DEPARTMENT_OFFICER' ? '/department/profile' : '/citizen/profile';
                                    navigate(path);
                                }}
                            >
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <ul className="dropdown-menu dropdown-menu-end border-0 shadow-premium rounded-4 p-2 animate-zoomIn" style={{ minWidth: '220px', marginTop: '10px' }}>
                            <li className="px-3 py-2 mb-2 border-bottom">
                                <div className="extra-small fw-black text-muted uppercase mb-1">Authenticated as</div>
                                <div className="small fw-bold text-dark">{userName}</div>
                            </li>
                            <li>
                                <button className="dropdown-item py-2 px-3 d-flex align-items-center gap-3 rounded-3 transition-all hover-bg-primary-soft text-dark" onClick={() => {
                                    const path = role === 'ADMIN' ? '/admin/profile' :
                                        role === 'WARD_OFFICER' ? '/ward-officer/profile' :
                                            role === 'DEPARTMENT_OFFICER' ? '/department/profile' : '/citizen/profile';
                                    navigate(path);
                                }}>
                                    <div className="rounded-circle p-2 bg-primary bg-opacity-10 text-primary">
                                        <User size={16} />
                                    </div>
                                    <span className="small fw-black text-uppercase">View Profile</span>
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item py-2 px-3 d-flex align-items-center gap-3 rounded-3 transition-all hover-bg-primary-soft text-dark">
                                    <div className="rounded-circle p-2 bg-light text-muted">
                                        <Settings size={16} />
                                    </div>
                                    <span className="small fw-black text-uppercase">Settings</span>
                                </button>
                            </li>
                            <li><hr className="dropdown-divider opacity-10 my-2" /></li>
                            <li>
                                <button className="dropdown-item py-2 px-3 text-danger d-flex align-items-center gap-3 rounded-3 transition-all hover-bg-danger-soft" onClick={handleLogout}>
                                    <div className="rounded-circle p-2 bg-danger bg-opacity-10">
                                        <LogOut size={16} />
                                    </div>
                                    <span className="small fw-black text-uppercase">Logout</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .gov-topbar .dropdown-item:hover { background: #f1f5f9 !important; }
                .hover-bg-light-soft:hover { background-color: rgba(255,255,255,0.1); }
                .hover-shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); }
                .extra-small { font-size: 0.65rem; }
                .shadow-premium { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                .fw-black { font-weight: 900; }
            `}} />
        </header >
    );
}

export default TopHeader;
