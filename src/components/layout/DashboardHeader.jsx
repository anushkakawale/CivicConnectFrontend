import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Elite Strategic UI Header
 * Premium design with deep gradients, glassmorphism, and sophisticated spacing.
 */
const DashboardHeader = ({
    portalName = "PMC Citizen Portal",
    wardName = "PMC Central",
    userName = "Citizen",
    subtitle = "Official Municipal Resource Access Cluster",
    icon: Icon = ShieldCheck,
    actions
}) => {
    return (
        <header className="gov-dashboard-header animate-slideUp" style={{
            background: 'linear-gradient(135deg, #173470 0%, #112652 100%)',
            padding: '1.75rem 0 2.25rem',
            position: 'relative',
            borderRadius: '0 0 24px 24px',
            boxShadow: '0 10px 30px rgba(17, 38, 82, 0.15)',
            zIndex: 10
        }}>
            <div className="container-fluid px-4 px-lg-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">

                    <div className="d-flex align-items-center gap-4">
                        <div className="d-flex align-items-center justify-content-center rounded-4 shadow-lg border border-white border-opacity-10"
                            style={{
                                width: '54px',
                                height: '54px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                            }}>
                            <Icon size={26} className="text-white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                        </div>

                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="extra-small fw-black text-white opacity-40 tracking-widest uppercase">
                                    {portalName}
                                </span>
                                {wardName && (
                                    <>
                                        <span className="text-white opacity-20">•</span>
                                        <span className="extra-small fw-bold text-success uppercase tracking-widest" style={{ color: '#10B981' }}>{wardName}</span>
                                    </>
                                )}
                            </div>
                            <h2 className="fw-black text-white mb-0" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
                                {userName}
                            </h2>
                            <p className="extra-small fw-bold text-white opacity-50 mb-0 uppercase tracking-widest mt-1">
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Action Region */}
                    {actions && (
                        <div className="d-flex align-items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
