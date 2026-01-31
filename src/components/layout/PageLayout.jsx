import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function PageLayout({ children, role, userName }) {
    return (
        <div className="gov-layout">
            <Sidebar role={role} />
            <div className="gov-main">
                <TopHeader role={role} userName={userName} />
                <div className="gov-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
