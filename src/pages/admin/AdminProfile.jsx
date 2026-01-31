/**
 * Admin Profile Page
 * Profile management for admin users
 */

import React, { useState, useEffect } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import PasswordChangeModal from '../../components/profile/PasswordChangeModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import '../department/DepartmentProfile.css'; // Reuse department profile styles

const AdminProfile = () => {
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
            // Admin profile from localStorage (no backend endpoint for admin profile yet)
            const userName = localStorage.getItem('userName') || localStorage.getItem('name') || 'Admin';
            const userEmail = localStorage.getItem('email') || 'admin@civicconnect.gov';
            const userId = localStorage.getItem('userId') || '1';

            setProfile({
                name: userName,
                email: userEmail,
                userId: userId,
                role: 'ADMIN'
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
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
                        <Shield size={64} />
                    </div>
                    <h2>{profile.name}</h2>
                    <div className="profile-role">
                        <Shield size={18} />
                        Administrator
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
                            <Shield size={18} />
                            Role
                        </div>
                        <div className="detail-value">Administrator</div>
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
                    show={showPasswordModal}
                    onHide={() => setShowPasswordModal(false)}
                    onSuccess={() => {
                        setShowPasswordModal(false);
                        showToast('Password changed successfully', 'success');
                    }}
                />
            )}
        </div>
    );
};

export default AdminProfile;
