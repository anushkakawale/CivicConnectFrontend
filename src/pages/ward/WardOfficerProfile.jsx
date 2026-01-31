import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Edit2, Lock, Smartphone, Save, X } from 'lucide-react';
import profileService from '../../services/profileService';
import PasswordChangeModal from '../../components/profile/PasswordChangeModal';
import MobileOTPModal from '../../components/profile/MobileOTPModal';

const WardOfficerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showMobileModal, setShowMobileModal] = useState(false);

    const [editedProfile, setEditedProfile] = useState({
        name: '',
        email: '',
        mobile: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getOfficerProfile();
            setProfile(data);
            setEditedProfile({
                name: data.name || '',
                email: data.email || '',
                mobile: data.mobile || ''
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile. Please try again.');
            // Fallback for development if backend fails 500
            if (process.env.NODE_ENV === 'development') {
                setProfile({
                    name: 'Ward Officer (Dev)',
                    email: 'ward.officer@example.com',
                    mobile: '9876543210',
                    ward: { name: 'Ward 1' },
                    stats: { totalApprovals: 0, pendingReviews: 0, officersManaged: 0 }
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            await profileService.updateOfficerProfile(editedProfile);
            await fetchProfile();
            setEditing(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile({
            name: profile.name || '',
            email: profile.email || '',
            mobile: profile.mobile || ''
        });
        setEditing(false);
        setError('');
    };

    const handleMobileUpdate = (newMobile) => {
        fetchProfile(); // Refresh profile after mobile update
    };

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold mb-1">
                        <Shield size={28} className="me-2 text-primary" />
                        Ward Officer Profile
                    </h2>
                    <p className="text-muted mb-0">Manage your profile information and settings</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            <div className="row g-4">
                {/* Profile Card */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Personal Information</h5>
                            {!editing ? (
                                <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
                                    <Edit2 size={16} className="me-1" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} className="me-1" />
                                                Save
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        <X size={16} className="me-1" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                {/* Name */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        <User size={16} className="me-2" />
                                        Full Name
                                    </label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editedProfile.name}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                        />
                                    ) : (
                                        <p className="form-control-plaintext">{profile?.name || 'Not set'}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        <Mail size={16} className="me-2" />
                                        Email Address
                                    </label>
                                    <p className="form-control-plaintext">{profile?.email || 'Not set'}</p>
                                    <small className="text-muted">Email cannot be changed</small>
                                </div>

                                {/* Mobile */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        <Phone size={16} className="me-2" />
                                        Mobile Number
                                    </label>
                                    <div className="d-flex align-items-center gap-2">
                                        <p className="form-control-plaintext mb-0">{profile?.mobile || 'Not set'}</p>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setShowMobileModal(true)}
                                        >
                                            <Smartphone size={14} className="me-1" />
                                            Change
                                        </button>
                                    </div>
                                </div>

                                {/* Ward */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        <MapPin size={16} className="me-2" />
                                        Ward
                                    </label>
                                    <p className="form-control-plaintext">
                                        {profile?.ward?.name || profile?.wardNumber || 'Not assigned'}
                                    </p>
                                </div>

                                {/* Role */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        <Shield size={16} className="me-2" />
                                        Role
                                    </label>
                                    <p className="form-control-plaintext">
                                        <span className="badge bg-primary">Ward Officer</span>
                                    </p>
                                </div>

                                {/* User ID */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">User ID</label>
                                    <p className="form-control-plaintext text-muted">#{profile?.userId || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security & Actions */}
                <div className="col-lg-4">
                    {/* Security Card */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom">
                            <h6 className="mb-0 fw-bold">
                                <Lock size={18} className="me-2" />
                                Security
                            </h6>
                        </div>
                        <div className="card-body">
                            <button
                                className="btn btn-outline-primary w-100 mb-3"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                <Lock size={16} className="me-2" />
                                Change Password
                            </button>
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => setShowMobileModal(true)}
                            >
                                <Smartphone size={16} className="me-2" />
                                Update Mobile Number
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom">
                            <h6 className="mb-0 fw-bold">Quick Stats</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Total Approvals</span>
                                <span className="fw-bold">{profile?.stats?.totalApprovals || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Pending Reviews</span>
                                <span className="fw-bold text-warning">{profile?.stats?.pendingReviews || 0}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Officers Managed</span>
                                <span className="fw-bold text-info">{profile?.stats?.officersManaged || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PasswordChangeModal
                show={showPasswordModal}
                onHide={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    alert('Password changed successfully!');
                }}
            />

            <MobileOTPModal
                show={showMobileModal}
                onHide={() => setShowMobileModal(false)}
                currentMobile={profile?.mobile}
                onSuccess={handleMobileUpdate}
            />
        </div>
    );
};

export default WardOfficerProfile;
