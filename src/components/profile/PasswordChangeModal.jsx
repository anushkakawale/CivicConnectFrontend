import React, { useState } from 'react';
import { Modal, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import profileService from '../../services/profileService';

const PasswordChangeModal = ({ show, onHide, onSuccess }) => {
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

    // Password strength calculation
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 10;
        if (/[a-z]/.test(password)) strength += 15;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
        return Math.min(strength, 100);
    };

    const passwordStrength = calculatePasswordStrength(formData.newPassword);

    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'danger';
        if (passwordStrength < 70) return 'warning';
        return 'success';
    };

    const getStrengthLabel = () => {
        if (passwordStrength < 40) return 'Weak';
        if (passwordStrength < 70) return 'Medium';
        return 'Strong';
    };

    const validatePassword = () => {
        if (!formData.currentPassword) {
            setError('Current password is required');
            return false;
        }
        if (!formData.newPassword) {
            setError('New password is required');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (!/[A-Z]/.test(formData.newPassword)) {
            setError('Password must contain at least one uppercase letter');
            return false;
        }
        if (!/[a-z]/.test(formData.newPassword)) {
            setError('Password must contain at least one lowercase letter');
            return false;
        }
        if (!/[0-9]/.test(formData.newPassword)) {
            setError('Password must contain at least one number');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword()) return;

        try {
            setLoading(true);
            await profileService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setSuccess(true);
            setTimeout(() => {
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setSuccess(false);
                onHide();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            console.error('Password change error:', err);
            setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setError('');
        setSuccess(false);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title className="d-flex align-items-center">
                    <Lock size={24} className="me-2 text-primary" />
                    Change Password
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="d-flex align-items-center">
                        <XCircle size={20} className="me-2" />
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="d-flex align-items-center">
                        <CheckCircle size={20} className="me-2" />
                        Password changed successfully!
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Current Password */}
                    <Form.Group className="mb-3">
                        <Form.Label>Current Password *</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                style={{ zIndex: 10 }}
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </Form.Group>

                    {/* New Password */}
                    <Form.Group className="mb-3">
                        <Form.Label>New Password *</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="Enter new password"
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                style={{ zIndex: 10 }}
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formData.newPassword && (
                            <div className="mt-2">
                                <div className="d-flex justify-content-between mb-1">
                                    <small className="text-muted">Password Strength:</small>
                                    <small className={`text-${getStrengthColor()} fw-bold`}>
                                        {getStrengthLabel()}
                                    </small>
                                </div>
                                <ProgressBar
                                    now={passwordStrength}
                                    variant={getStrengthColor()}
                                    style={{ height: '5px' }}
                                />
                            </div>
                        )}
                        <Form.Text className="text-muted">
                            Must be at least 8 characters with uppercase, lowercase, and number
                        </Form.Text>
                    </Form.Group>

                    {/* Confirm Password */}
                    <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password *</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                style={{ zIndex: 10 }}
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <Form.Text className="text-danger">
                                Passwords do not match
                            </Form.Text>
                        )}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-top">
                <Button variant="secondary" onClick={handleClose} disabled={loading || success}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || success || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Changing...
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle size={18} className="me-2" />
                            Changed!
                        </>
                    ) : (
                        'Change Password'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PasswordChangeModal;
