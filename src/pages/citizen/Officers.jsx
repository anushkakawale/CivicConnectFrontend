import React, { useState, useEffect } from 'react';
import {
    User, Building2, MapPin, Phone, RefreshCw, Loader,
    Activity, Shield, ShieldCheck, Zap, Info, Search,
    ChevronRight, ExternalLink, Smartphone, Mail, Briefcase
} from 'lucide-react';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { useToast } from '../../hooks/useToast';

const Officers = () => {
    const { showToast } = useToast();
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        try {
            if (!officers.length) setLoading(true);
            const response = await apiService.citizen.getOfficers();
            setOfficers(response.data || response || []);
        } catch (error) {
            console.error('Failed to fetch officials:', error);
            showToast('Operational Feed Error: Official directory synchronization failed.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOfficers();
    };

    if (loading && !officers.length) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
                <Activity className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted text-uppercase tracking-[0.2em] extra-small">Synchronizing Official Directory...</p>
            </div>
        );
    }

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="CITIZEN COMMAND"
                userName="OFFICIAL DIRECTORY"
                wardName="VERIFIED PERSONNEL"
                subtitle="Authorized municipal officers and departmental jurisdictions for individual sectors"
                icon={ShieldCheck}
                actions={
                    <button onClick={handleRefresh} className="btn btn-white shadow-premium border-0 rounded-circle d-flex align-items-center justify-content-center p-0" style={{ width: '56px', height: '56px' }}>
                        <RefreshCw size={24} className={refreshing ? 'animate-spin' : ''} style={{ color: PRIMARY_COLOR }} />
                    </button>
                }
            />

            <div className="container-fluid px-5" style={{ marginTop: '-40px' }}>
                {officers.length === 0 ? (
                    <div className="card border-0 shadow-premium rounded-5 p-5 text-center bg-white border-dashed border-3 transition-standard hover-up-tiny mx-auto" style={{ maxWidth: '800px' }}>
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4 anim-float shadow-inner" style={{ width: '90px', height: '90px' }}>
                            <Shield size={40} className="text-muted opacity-30" />
                        </div>
                        <h4 className="fw-black text-dark uppercase tracking-widest mb-2">Personnel Clear</h4>
                        <p className="text-muted extra-small fw-black uppercase tracking-widest opacity-60 mt-3">
                            No authorized officials are currently assigned to your directory node.
                        </p>
                    </div>
                ) : (
                    <div className="row g-4 animate-fadeIn">
                        {officers.map((officer, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-premium h-100 bg-white rounded-5 transition-standard hover-up-tiny overflow-hidden border-top border-4" style={{ borderColor: PRIMARY_COLOR }}>
                                    <div className="p-5 border-bottom bg-light bg-opacity-30 position-relative">
                                        <div className="strategic-grid opacity-5 position-absolute w-100 h-100 top-0 start-0"></div>
                                        <div className="d-flex align-items-center gap-4 position-relative">
                                            <div className="rounded-4 d-flex align-items-center justify-content-center shadow-lg border-2 border-white"
                                                style={{
                                                    width: '72px',
                                                    height: '72px',
                                                    backgroundColor: '#FFFFFF',
                                                    color: PRIMARY_COLOR,
                                                    minWidth: '72px'
                                                }}>
                                                <User size={32} strokeWidth={2.5} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h5 className="fw-black mb-1 text-dark uppercase tracking-tight text-truncate">{officer.name}</h5>
                                                <div className="badge rounded-pill fw-black extra-small uppercase tracking-widest px-3 py-2"
                                                    style={{ backgroundColor: `${PRIMARY_COLOR}15`, color: PRIMARY_COLOR }}>
                                                    {(officer.role || 'Municipal Unit').replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-body p-5">
                                        <div className="d-flex flex-column gap-4">
                                            {officer.department && (
                                                <div className="d-flex align-items-start gap-4">
                                                    <div className="p-3 rounded-4 bg-light text-primary shadow-sm border border-white" style={{ color: PRIMARY_COLOR }}>
                                                        <Building2 size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="extra-small fw-black text-muted mb-1 uppercase tracking-widest opacity-60">Strategic Node</p>
                                                        <p className="fw-black text-dark mb-0 uppercase tracking-tight">{(officer.departmentName || officer.department).replace(/_/g, ' ')}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex align-items-start gap-4">
                                                <div className="p-3 rounded-4 bg-light text-primary shadow-sm border border-white" style={{ color: PRIMARY_COLOR }}>
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <p className="extra-small fw-black text-muted mb-1 uppercase tracking-widest opacity-60">Jurisdiction Area</p>
                                                    <p className="fw-black text-dark mb-0 uppercase tracking-tight">
                                                        Ward {officer.wardNumber || officer.wardId || 'PMC CENTER'}
                                                    </p>
                                                </div>
                                            </div>

                                            {officer.mobile && (
                                                <div className="d-flex align-items-start gap-4 p-4 rounded-4 bg-primary bg-opacity-5 border border-primary border-opacity-10 transition-standard hover-scale">
                                                    <div className="p-3 rounded-circle bg-white text-primary shadow-sm" style={{ color: PRIMARY_COLOR }}>
                                                        <Smartphone size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="extra-small fw-black text-muted mb-1 uppercase tracking-widest opacity-60">Intercom Frequency</p>
                                                        <a href={`tel:${officer.mobile}`} className="fw-black text-dark text-decoration-none d-flex align-items-center gap-2">
                                                            {officer.mobile} <ExternalLink size={12} className="opacity-40" />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-footer bg-light bg-opacity-30 border-0 p-5 pt-0">
                                        <button className="btn btn-white w-100 rounded-pill py-3 fw-black extra-small tracking-widest border shadow-sm transition-standard hover-up-tiny d-flex align-items-center justify-content-center gap-3">
                                            VERIFY CREDENTIALS <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-5 p-5 rounded-5 bg-white shadow-premium border-start border-5 border-primary transition-standard hover-up-tiny d-flex align-items-center gap-5">
                    <div className="p-4 bg-light border shadow-inner rounded-circle text-primary anim-float">
                        <Info size={32} />
                    </div>
                    <div>
                        <h6 className="fw-black text-dark mb-1 uppercase tracking-widest">PERSONNEL SPECIFICATIONS</h6>
                        <p className="extra-small text-muted fw-bold mb-0 opacity-60 uppercase tracking-widest lh-lg">All officials listed are verified by the PMC Municipal Command. Personnel information is updated via decentralized HR nodes every 24 hours.</p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 950; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .ls-tight { letter-spacing: -0.05em; }
                .animate-spin { animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .transition-standard { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up-tiny:hover { transform: translateY(-8px); box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15) !important; }
                .hover-scale:hover { transform: scale(1.02); }
                .shadow-premium { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08), 0 5px 20px -5px rgba(0,0,0,0.03); }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
                .anim-float { animation: float 3s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .strategic-grid { background-image: radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px); background-size: 20px 20px; }
            `}} />
        </div>
    );
};

export default Officers;
