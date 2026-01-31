import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../../api/apiService';
import './ChangePassword.css';

const ChangePassword = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
        return Math.min(strength, 100);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, newPassword });
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const getStrengthColor = () => {
        if (passwordStrength < 40) return '#ef4444';
        if (passwordStrength < 70) return '#f59e0b';
        return '#10b981';
    };

    const getStrengthText = () => {
        if (passwordStrength < 40) return 'Weak';
        if (passwordStrength < 70) return 'Medium';
        return 'Strong';
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            setError('Please enter your current password');
            return false;
        }
        if (!formData.newPassword) {
            setError('Please enter a new password');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (formData.newPassword === formData.currentPassword) {
            setError('New password must be different from current password');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (passwordStrength < 40) {
            setError('Please choose a stronger password');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validateForm()) return;

        try {
            setLoading(true);
            await apiService.profile.changePassword(
                formData.currentPassword,
                formData.newPassword
            );

            setSuccess(true);
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordStrength(0);

            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <div className="change-password-header">
                <div className="header-icon">
                    <Lock className="w-6 h-6" />
                </div>
                <div>
                    <h2>Change Password</h2>
                    <p>Update your password to keep your account secure</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <CheckCircle className="w-5 h-5" />
                    <span>Password changed successfully!</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="change-password-form">
                {/* Current Password */}
                <div className="form-group">
                    <label htmlFor="currentPassword">
                        Current Password <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            placeholder="Enter your current password"
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            tabIndex={-1}
                        >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="form-group">
                    <label htmlFor="newPassword">
                        New Password <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your new password"
                            disabled={loading}
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            tabIndex={-1}
                        >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                        <div className="password-strength">
                            <div className="strength-bar-container">
                                <div
                                    className="strength-bar"
                                    style={{
                                        width: `${passwordStrength}%`,
                                        backgroundColor: getStrengthColor()
                                    }}
                                />
                            </div>
                            <span className="strength-text" style={{ color: getStrengthColor() }}>
                                {getStrengthText()}
                            </span>
                        </div>
                    )}

                    <div className="password-requirements">
                        <p className="requirements-title">Password must contain:</p>
                        <ul>
                            <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                                At least 8 characters
                            </li>
                            <li className={/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                                Uppercase and lowercase letters
                            </li>
                            <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                                At least one number
                            </li>
                            <li className={/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                                At least one special character
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                    <label htmlFor="confirmPassword">
                        Confirm New Password <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Re-enter your new password"
                            disabled={loading}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            tabIndex={-1}
                        >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <p className="error-hint">Passwords do not match</p>
                    )}
                    {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                        <p className="success-hint">Passwords match</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Changing Password...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Change Password
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Security Tips */}
            <div className="security-tips">
                <h4>Security Tips</h4>
                <ul>
                    <li>Use a unique password you don't use elsewhere</li>
                    <li>Avoid common words and personal information</li>
                    <li>Consider using a password manager</li>
                    <li>Change your password regularly</li>
                </ul>
            </div>
        </div>
    );
};

export default ChangePassword;
