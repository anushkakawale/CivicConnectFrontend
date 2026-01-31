/**
 * Department Profile Page
 * Profile management for department officers with password change
 */

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Shield } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { DEPARTMENTS } from '../../constants';
import PasswordChangeModal from '../../components/profile/PasswordChangeModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import './DepartmentProfile.css';

const DepartmentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await apiService.common.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getDepartmentInfo = (departmentId) => {
        const dept = DEPARTMENTS.find(d => d.department_id === parseInt(departmentId));
        return dept || { name: 'General', icon: '📋', color: 'secondary' };
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!profile) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-danger">Failed to load profile</div>
            </div>
        );
    }

    const dept = getDepartmentInfo(profile.departmentId);

    return (
        <div className="department-profile-page">
            <div className="page-header">
                <h1>
                    <User size={32} />
                    My Profile
                </h1>
                <p>Manage your profile information and settings</p>
            </div>

            <div className="profile-grid">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="profile-avatar">
                        <User size={64} />
                    </div>
                    <h2>{profile.name}</h2>
                    <div className="profile-role">
                        <Shield size={18} />
                        Department Officer
                    </div>
                    <div className="profile-department">
                        <Building2 size={18} />
                        {dept.icon} {dept.name}
                    </div>
                </div>

                {/* Details Card */}
                <div className="details-card">
                    <h3>Contact Information</h3>

                    <div className="detail-item">
                        <div className="detail-label">
                            <Mail size={18} />
                            Email Address
                        </div>
                        <div className="detail-value">{profile.email}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">
                            <Phone size={18} />
                            Mobile Number
                        </div>
                        <div className="detail-value">{profile.mobileNumber || 'Not provided'}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">
                            <Building2 size={18} />
                            Department
                        </div>
                        <div className="detail-value">{dept.name}</div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-label">
                            <Shield size={18} />
                            Role
                        </div>
                        <div className="detail-value">Department Officer</div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="actions-card">
                    <h3>Account Settings</h3>

                    <button
                        className="action-button"
                        onClick={() => setShowPasswordModal(true)}
                    >
                        <Shield size={20} />
                        <div>
                            <div className="action-title">Change Password</div>
                            <div className="action-description">Update your account password</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <PasswordChangeModal
                    onClose={() => setShowPasswordModal(false)}
                    onSuccess={() => {
                        setShowPasswordModal(false);
                        showToast('Password changed successfully', 'success');
                    }}
                />
            )}
        </div>
    );
};

export default DepartmentProfile;
