import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function WardOfficerProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiService.wardOfficer.getProfile();
            setProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom, #f8f9fc 0%, #e9ecef 100%)' }}>
            <nav className="navbar navbar-dark shadow-sm" style={{ background: 'linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)' }}>
                <div className="container-fluid px-4">
                    <span className="navbar-brand fw-bold">
                        <i className="bi bi-building me-2"></i>Ward Officer Portal
                    </span>
                    <button onClick={() => navigate('/ward-officer')} className="btn btn-light btn-sm">
                        <i className="bi bi-house me-2"></i>Dashboard
                    </button>
                </div>
            </nav>

            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{
                                        width: '100px',
                                        height: '100px',
                                        background: 'linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)'
                                    }}>
                                        <i className="bi bi-person-circle text-white" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h2 className="fw-bold">{profile?.name || 'Ward Officer'}</h2>
                                    <span className="badge bg-primary px-3 py-2">Ward Officer</span>
                                </div>

                                <div className="row g-3 mt-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded">
                                            <p className="text-muted small mb-1">Email</p>
                                            <h6 className="mb-0">{profile?.email || localStorage.getItem('email')}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded">
                                            <p className="text-muted small mb-1">Mobile</p>
                                            <h6 className="mb-0">{profile?.mobile || 'Not provided'}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded">
                                            <p className="text-muted small mb-1">Ward</p>
                                            <h6 className="mb-0">{profile?.wardName || 'Ward ' + profile?.wardNumber}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded">
                                            <p className="text-muted small mb-1">Status</p>
                                            <h6 className="mb-0 text-success">
                                                <i className="bi bi-check-circle-fill me-2"></i>Active
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
