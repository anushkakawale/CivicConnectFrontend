import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useToast } from '../../components/ui/ToastProvider';

export default function RegisterDepartmentOfficer() {
    const navigate = useNavigate();
    const toast = useToast();
    const [wards, setWards] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        wardId: '',
        departmentId: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wardsRes, deptsRes] = await Promise.all([
                apiService.wardOfficer.getWards(),
                apiService.wardOfficer.getDepartments()
            ]);
            setWards(wardsRes.data || []);
            setDepartments(deptsRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiService.wardOfficer.registerDepartmentOfficer({
                ...formData,
                wardId: parseInt(formData.wardId),
                departmentId: parseInt(formData.departmentId)
            });
            toast.success('Department Officer registered successfully');
            setFormData({ name: '', email: '', mobile: '', password: '', wardId: '', departmentId: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

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
                                    <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{
                                        width: '70px',
                                        height: '70px',
                                        background: 'linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)'
                                    }}>
                                        <i className="bi bi-person-plus text-white" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <h2 className="fw-bold">Register Department Officer</h2>
                                    <p className="text-muted">Add a new officer to your ward</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Full Name *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Mobile *</label>
                                            <input
                                                type="tel"
                                                className="form-control form-control-lg"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Password *</label>
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Ward *</label>
                                            <select
                                                className="form-select form-select-lg"
                                                value={formData.wardId}
                                                onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Ward</option>
                                                {wards.map(ward => (
                                                    <option key={ward.wardId} value={ward.wardId}>
                                                        {ward.areaName} (Ward {ward.wardNumber})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Department *</label>
                                            <select
                                                className="form-select form-select-lg"
                                                value={formData.departmentId}
                                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept.departmentId} value={dept.departmentId}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-lg w-100 text-white"
                                                disabled={loading}
                                                style={{ background: 'linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)' }}
                                            >
                                                {loading ? 'Registering...' : 'Register Officer'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
