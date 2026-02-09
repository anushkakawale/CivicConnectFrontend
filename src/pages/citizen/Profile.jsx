import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/ToastProvider';

export default function CitizenProfile() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState(null);
    const [wards, setWards] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        wardNumber: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
        fetchWards();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiService.citizen.getProfile();
            setProfile(response.data);
            setFormData({
                name: response.data.name || '',
                email: response.data.email || '',
                mobile: response.data.mobile || '',
                wardNumber: response.data.wardNumber || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchWards = async () => {
        try {
            const response = await apiService.masterData.getWards();
            setWards(response.data || []);
        } catch (error) {
            console.error('Failed to fetch wards:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await apiService.profile.update({
                mobile: formData.mobile,
                wardNumber: formData.wardNumber
            });
            toast.success('Profile updated successfully');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.warning('Passwords do not match');
            return;
        }
        try {
            await apiService.profile.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    if (loading) return <LoadingSpinner message="Loading your profile..." fullScreen />;

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>


            <div className="row g-4">
                {/* Personal Information */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-0 mb-4">
                        <div className="card-header bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Personal Information</h5>
                            {!editing && (
                                <button onClick={() => setEditing(true)} className="btn btn-primary">
                                    <i className="bi bi-pencil me-2"></i>Edit Profile
                                </button>
                            )}
                        </div>
                        <div className="card-body p-4">
                            {editing ? (
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Full Name</label>
                                            <input type="text" className="form-control" value={formData.name} disabled />
                                            <small className="text-muted">Name cannot be changed</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Email</label>
                                            <input type="email" className="form-control" value={formData.email} disabled />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Mobile</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Ward</label>
                                            <select
                                                className="form-select"
                                                value={formData.wardNumber}
                                                onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                                            >
                                                <option value="">Select Ward</option>
                                                {wards.map(ward => (
                                                    <option key={ward.wardId} value={ward.wardNumber}>
                                                        {ward.areaName} (Ward {ward.wardNumber})
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted">Ward change requires approval</small>
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-primary me-2">Save Changes</button>
                                            <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-0">
                                            <p className="text-muted small mb-1">Email</p>
                                            <h6 className="mb-0">{profile?.email}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-0">
                                            <p className="text-muted small mb-1">Mobile</p>
                                            <h6 className="mb-0">{profile?.mobile || 'Not provided'}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-0">
                                            <p className="text-muted small mb-1">Ward</p>
                                            <h6 className="mb-0">{profile?.areaName || 'Not assigned'}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-0 shadow-sm border-start border-primary border-4">
                                            <p className="text-muted small mb-1 fw-bold uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>Access Privileges</p>
                                            <h6 className="mb-0 fw-black text-dark">
                                                GOVERNMENT_LEVEL_1
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-0">
                                            <p className="text-muted small mb-1">Status</p>
                                            <h6 className="mb-0 text-success fw-bold">
                                                <i className="bi bi-patch-check-fill me-2"></i>ACTIVE_OPERATIVE
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="card border-0 shadow-sm rounded-0">
                        <div className="card-header bg-transparent border-0 p-4">
                            <h5 className="fw-bold mb-0">Security Settings</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleChangePassword}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-dark">Update Password</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-0 mb-4">
                        <div className="card-body p-4 text-center">
                            <h6 className="text-muted mb-3">Community Impact Score</h6>
                            <h1 className="display-4 fw-bold text-primary mb-0">740</h1>
                            <div className="mt-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small">Citizen Level</span>
                                    <span className="small text-muted">Level 4</span>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-0">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3">Activity Summary</h6>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <span className="text-muted">Total Reports</span>
                                <span className="fw-bold">12</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <span className="text-muted">Resolved</span>
                                <span className="fw-bold text-success">9</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Reliability</span>
                                <span className="fw-bold text-primary">98%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
