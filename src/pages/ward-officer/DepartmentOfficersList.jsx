import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DepartmentOfficersList() {
    const navigate = useNavigate();
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        try {
            const response = await apiService.wardOfficer.getDepartmentOfficers();
            setOfficers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch officers:', error);
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

            <div className="container py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="fw-bold">Department Officers</h2>
                        <p className="text-muted">Manage officers in your ward</p>
                    </div>
                </div>

                <div className="row g-4">
                    {officers.map((officer, idx) => (
                        <div key={idx} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                <div className="card-body p-4">
                                    <div className="text-center mb-3">
                                        <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{
                                            width: '60px',
                                            height: '60px',
                                            background: 'linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)'
                                        }}>
                                            <i className="bi bi-person-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <h5 className="fw-bold mb-1">{officer.name}</h5>
                                        <span className="badge bg-primary">{officer.departmentName}</span>
                                    </div>
                                    <div className="border-top pt-3">
                                        <p className="mb-2 small"><i className="bi bi-envelope me-2 text-primary"></i>{officer.email}</p>
                                        <p className="mb-0 small"><i className="bi bi-telephone me-2 text-success"></i>{officer.mobile}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
