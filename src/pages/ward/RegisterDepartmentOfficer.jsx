import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wardOfficerService from '../../services/wardOfficerService';
import { DEPARTMENTS } from '../../constants';
import { UserPlus, AlertCircle } from 'lucide-react';

const RegisterDepartmentOfficer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        departmentId: '',
        wardId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                password: formData.password,
                departmentId: parseInt(formData.departmentId),
                wardId: parseInt(formData.wardId)
            };

            await wardOfficerService.registerDepartmentOfficer(payload);
            setSuccess('✅ Department Officer registered successfully!');

            // Reset form
            setFormData({
                name: '',
                email: '',
                mobile: '',
                password: '',
                confirmPassword: '',
                departmentId: '',
                wardId: ''
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/ward-officer/officers');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register officer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold mb-1">
                        <UserPlus size={28} className="me-2 text-primary" />
                        Register Department Officer
                    </h2>
                    <p className="text-muted mb-0">Create a new department officer account</p>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Alert Messages */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <AlertCircle size={18} className="me-2" />
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            {success}
                            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                        </div>
                    )}

                    {/* Registration Form */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">Officer Details</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    {/* Name */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="officer@civicconnect.gov"
                                        />
                                    </div>

                                    {/* Mobile */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Mobile Number *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>

                                    {/* Department */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Department *</label>
                                        <select
                                            className="form-select"
                                            name="departmentId"
                                            value={formData.departmentId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {DEPARTMENTS.map((dept) => (
                                                <option key={dept.department_id} value={dept.department_id}>
                                                    {dept.icon} {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Ward */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Ward Number *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="wardId"
                                            value={formData.wardId}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            placeholder="Enter ward number"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Password *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                            placeholder="Minimum 6 characters"
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Confirm Password *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                            placeholder="Re-enter password"
                                        />
                                    </div>
                                </div>

                                {/* Info Alert */}
                                <div className="alert alert-info mt-4 mb-4">
                                    <small>
                                        <strong>Note:</strong> The officer will be able to login using the provided email and password.
                                        They will be assigned to handle complaints in the specified ward and department.
                                    </small>
                                </div>

                                {/* Buttons */}
                                <div className="d-flex gap-2 justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/ward-officer/officers')}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Registering...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={18} className="me-2" />
                                                Register Officer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterDepartmentOfficer;
