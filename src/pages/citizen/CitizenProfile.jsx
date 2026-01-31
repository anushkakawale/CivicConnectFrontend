import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Home, Lock,
    Edit2, Save, X, Eye, EyeOff, Shield, Calendar,
    CheckCircle, AlertCircle
} from 'lucide-react';
import { OTPNotificationContainer } from '../../components/common/OTPNotification';
import useOTPNotification from '../../hooks/useOTPNotification';
import profileService from '../../services/profileService';
import './CitizenProfile.css';

const CitizenProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState({
        name: false,
        address: false,
        mobile: false,
        password: false
    });

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        newMobile: '',
        otp: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    // Password visibility
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const {
        notifications,
        showSuccess,
        showError,
        showOTPSent,
        showOTPVerified,
        showOTPInvalid,
        removeNotification
    } = useOTPNotification();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getCitizenProfile();
            setProfile(data);
            setFormData(prev => ({
                ...prev,
                name: data.name || '',
                address: data.address || ''
            }));
        } catch (error) {
            showError('Failed to load profile');
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (field) => {
        setEditMode(prev => ({ ...prev, [field]: true }));
    };

    const handleCancel = (field) => {
        setEditMode(prev => ({ ...prev, [field]: false }));
        // Reset form data
        if (field === 'name') {
            setFormData(prev => ({ ...prev, name: profile.name }));
        } else if (field === 'address') {
            setFormData(prev => ({ ...prev, address: profile.address }));
        } else if (field === 'mobile') {
            setFormData(prev => ({ ...prev, newMobile: '', otp: '' }));
            setOtpSent(false);
        } else if (field === 'password') {
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        }
    };

    const handleUpdateName = async () => {
        try {
            await profileService.updateName(formData.name);
            setProfile(prev => ({ ...prev, name: formData.name }));
            setEditMode(prev => ({ ...prev, name: false }));
            showSuccess('Name updated successfully');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update name');
        }
    };

    const handleUpdateAddress = async () => {
        try {
            await profileService.updateAddress(formData.address);
            setProfile(prev => ({ ...prev, address: formData.address }));
            setEditMode(prev => ({ ...prev, address: false }));
            showSuccess('Address updated successfully');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update address');
        }
    };

    const handleRequestOTP = async () => {
        if (!formData.newMobile || formData.newMobile.length !== 10) {
            showError('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            setOtpLoading(true);
            const response = await profileService.requestMobileOTP(formData.newMobile);
            setOtpSent(true);

            // In development, the backend might return the OTP
            const otp = response.otp || null;
            showOTPSent(otp, formData.newMobile);
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!formData.otp || formData.otp.length !== 6) {
            showError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setOtpLoading(true);
            await profileService.verifyMobileOTP(formData.otp);
            setProfile(prev => ({ ...prev, mobile: formData.newMobile }));
            setEditMode(prev => ({ ...prev, mobile: false }));
            setFormData(prev => ({ ...prev, newMobile: '', otp: '' }));
            setOtpSent(false);
            showOTPVerified();
        } catch (error) {
            if (error.response?.status === 400) {
                showOTPInvalid();
            } else {
                showError(error.response?.data?.message || 'Failed to verify OTP');
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }

        try {
            await profileService.changePassword(formData.currentPassword, formData.newPassword);
            setEditMode(prev => ({ ...prev, password: false }));
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            showSuccess('Password changed successfully');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to change password');
        }
    };

    if (loading) {
        return (
            <div className="citizen-profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="citizen-profile-error">
                <AlertCircle size={48} />
                <p>Failed to load profile</p>
                <button onClick={fetchProfile} className="btn-retry">Retry</button>
            </div>
        );
    }

    return (
        <div className="citizen-profile-container">
            <OTPNotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />

            <div className="profile-header">
                <div className="profile-header-content">
                    <div className="profile-avatar">
                        <User size={48} />
                    </div>
                    <div className="profile-header-info">
                        <h1>{profile.name}</h1>
                        <p className="profile-role">
                            <Shield size={16} />
                            Citizen
                        </p>
                    </div>
                </div>
                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Complaints</span>
                        <span className="stat-value">{profile.totalComplaints || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Member Since</span>
                        <span className="stat-value">
                            <Calendar size={14} />
                            {new Date(profile.joinedDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                {/* Name Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-title">
                            <User size={20} />
                            <h2>Full Name</h2>
                        </div>
                        {!editMode.name && (
                            <button onClick={() => handleEdit('name')} className="btn-edit">
                                <Edit2 size={16} />
                                Edit
                            </button>
                        )}
                    </div>
                    <div className="section-content">
                        {editMode.name ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="form-input"
                                    placeholder="Enter your name"
                                />
                                <div className="form-actions">
                                    <button onClick={handleUpdateName} className="btn-save">
                                        <Save size={16} />
                                        Save
                                    </button>
                                    <button onClick={() => handleCancel('name')} className="btn-cancel">
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="section-value">{profile.name}</p>
                        )}
                    </div>
                </div>

                {/* Email Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-title">
                            <Mail size={20} />
                            <h2>Email Address</h2>
                        </div>
                        <span className="badge-verified">
                            <CheckCircle size={14} />
                            Verified
                        </span>
                    </div>
                    <div className="section-content">
                        <p className="section-value">{profile.email}</p>
                        <p className="section-note">Email cannot be changed</p>
                    </div>
                </div>

                {/* Mobile Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-title">
                            <Phone size={20} />
                            <h2>Mobile Number</h2>
                        </div>
                        {!editMode.mobile && (
                            <button onClick={() => handleEdit('mobile')} className="btn-edit">
                                <Edit2 size={16} />
                                Change
                            </button>
                        )}
                    </div>
                    <div className="section-content">
                        {editMode.mobile ? (
                            <div className="edit-form">
                                <div className="otp-flow">
                                    <div className="form-group">
                                        <label>New Mobile Number</label>
                                        <input
                                            type="tel"
                                            value={formData.newMobile}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newMobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                            className="form-input"
                                            placeholder="Enter 10-digit mobile number"
                                            maxLength={10}
                                            disabled={otpSent}
                                        />
                                    </div>

                                    {!otpSent ? (
                                        <button
                                            onClick={handleRequestOTP}
                                            className="btn-primary"
                                            disabled={otpLoading || formData.newMobile.length !== 10}
                                        >
                                            {otpLoading ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    ) : (
                                        <>
                                            <div className="form-group">
                                                <label>Enter OTP</label>
                                                <input
                                                    type="text"
                                                    value={formData.otp}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                                    className="form-input otp-input"
                                                    placeholder="Enter 6-digit OTP"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button
                                                    onClick={handleVerifyOTP}
                                                    className="btn-save"
                                                    disabled={otpLoading || formData.otp.length !== 6}
                                                >
                                                    <CheckCircle size={16} />
                                                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                                                </button>
                                                <button onClick={() => handleCancel('mobile')} className="btn-cancel">
                                                    <X size={16} />
                                                    Cancel
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleRequestOTP}
                                                className="btn-link"
                                                disabled={otpLoading}
                                            >
                                                Resend OTP
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="section-value">{profile.mobile}</p>
                        )}
                    </div>
                </div>

                {/* Address Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-title">
                            <Home size={20} />
                            <h2>Address</h2>
                        </div>
                        {!editMode.address && (
                            <button onClick={() => handleEdit('address')} className="btn-edit">
                                <Edit2 size={16} />
                                Edit
                            </button>
                        )}
                    </div>
                    <div className="section-content">
                        {editMode.address ? (
                            <div className="edit-form">
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="form-textarea"
                                    placeholder="Enter your address"
                                    rows={3}
                                />
                                <div className="form-actions">
                                    <button onClick={handleUpdateAddress} className="btn-save">
                                        <Save size={16} />
                                        Save
                                    </button>
                                    <button onClick={() => handleCancel('address')} className="btn-cancel">
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="section-value">{profile.address}</p>
                        )}
                    </div>
                </div>

                {/* Ward Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-title">
                            <MapPin size={20} />
                            <h2>Ward</h2>
                        </div>
                    </div>
                    <div className="section-content">
                        <p className="section-value">{profile.ward}</p>
                        <p className="section-note">To change ward, please submit a ward change request</p>
                    </div>
                </div>

                {/* Password Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-title">
                            <Lock size={20} />
                            <h2>Password</h2>
                        </div>
                        {!editMode.password && (
                            <button onClick={() => handleEdit('password')} className="btn-edit">
                                <Edit2 size={16} />
                                Change
                            </button>
                        )}
                    </div>
                    <div className="section-content">
                        {editMode.password ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="form-input"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                            className="password-toggle"
                                        >
                                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>New Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="form-input"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                            className="password-toggle"
                                        >
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="form-input"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            className="password-toggle"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button onClick={handleChangePassword} className="btn-save">
                                        <Save size={16} />
                                        Change Password
                                    </button>
                                    <button onClick={() => handleCancel('password')} className="btn-cancel">
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="section-value">••••••••</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitizenProfile;
