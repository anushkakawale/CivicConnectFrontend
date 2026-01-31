import { useState, useEffect } from 'react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/ToastProvider';

export default function Officers() {
    const toast = useToast();
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        try {
            const response = await apiService.citizen.getOfficers();
            setOfficers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch officers:', error);
            toast.error('Failed to load officers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading officers..." fullScreen />;

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom, #f8f9fc 0%, #e9ecef 100%)' }}>
            {/* Header */}
            <div className="position-relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                paddingTop: '4rem',
                paddingBottom: '6rem'
            }}>
                <div className="position-absolute w-100 h-100" style={{
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.1
                }}></div>
                <div className="container position-relative">
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle p-3" style={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <i className="bi bi-person-badge-fill text-white" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <div>
                            <h1 className="display-5 fw-bold text-white mb-0">Ward Officers</h1>
                            <p className="text-white opacity-75 mb-0">Your local government representatives</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-3rem' }}>
                {officers.length === 0 ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-5 text-center">
                            <i className="bi bi-person-x display-1 text-muted opacity-25 mb-4"></i>
                            <h4 className="fw-bold mb-2">No Officers Found</h4>
                            <p className="text-muted mb-0">No officers assigned to your ward yet</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4 mb-5">
                        {officers.map((officer, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-sm h-100" style={{
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '';
                                    }}>
                                    <div className="card-body p-4">
                                        <div className="text-center mb-4">
                                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}>
                                                <i className="bi bi-person-fill text-white" style={{ fontSize: '2.5rem' }}></i>
                                            </div>
                                            <h5 className="fw-bold mb-1">{officer.name}</h5>
                                            <span className="badge" style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            }}>
                                                {officer.role?.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="border-top pt-3">
                                            {officer.department && (
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="bi bi-building text-primary me-2"></i>
                                                    <span className="text-muted small">{officer.department}</span>
                                                </div>
                                            )}
                                            {officer.mobile && (
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="bi bi-telephone text-success me-2"></i>
                                                    <a href={`tel:${officer.mobile}`} className="text-decoration-none">
                                                        {officer.mobile}
                                                    </a>
                                                </div>
                                            )}
                                            {officer.wardNumber && (
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-geo-alt text-danger me-2"></i>
                                                    <span className="text-muted small">Ward {officer.wardNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
