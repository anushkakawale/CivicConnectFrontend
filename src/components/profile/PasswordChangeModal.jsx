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
        <Modal show={show} onHide={handleClose} centered className="security-vault-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="w-100 text-center mt-3">
                    <div className="p-3 rounded-0 bg-primary bg-opacity-10 d-inline-flex mb-3" style={{ color: '#1254AF' }}>
                        <Lock size={32} />
                    </div>
                    <h4 className="fw-black text-dark text-uppercase tracking-widest mb-1">Change Password</h4>
                    <p className="extra-small text-muted fw-bold uppercase tracking-widest opacity-60">Secure your official account</p>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-5 pb-5">
                {error && (
                    <Alert variant="danger" className="border-0 rounded-0 extra-small fw-bold text-uppercase tracking-wider py-3 mb-4">
                        <XCircle size={16} className="me-2" />
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="border-0 rounded-0 extra-small fw-bold text-uppercase tracking-wider py-3 mb-4">
                        <CheckCircle size={16} className="me-2" />
                        Password Changed Successfully!
                    </Alert>
                )}

                <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    {/* Current Password */}
                    <Form.Group>
                        <Form.Label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2 px-1">Current Password</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                                className="form-control rounded-0 p-3 border-0 bg-light fw-bold shadow-none extra-small tracking-wider"
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="btn border-0 text-muted position-absolute end-0 top-50 translate-middle-y me-2 shadow-none"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                style={{ zIndex: 10 }}
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </Form.Group>

                    {/* New Password */}
                    <Form.Group>
                        <Form.Label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2 px-1">New Password</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="Enter new strong password"
                                className="form-control rounded-0 p-3 border-0 bg-light fw-bold shadow-none extra-small tracking-wider"
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="btn border-0 text-muted position-absolute end-0 top-50 translate-middle-y me-2 shadow-none"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                style={{ zIndex: 10 }}
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {formData.newPassword && (
                            <div className="mt-3 px-1">
                                <div className="d-flex justify-content-between mb-2">
                                    <small className="extra-small fw-black text-muted uppercase tracking-wider">Strength</small>
                                    <small className={`extra-small fw-black uppercase tracking-wider text-${getStrengthColor()}`}>
                                        {getStrengthLabel()}
                                    </small>
                                </div>
                                <ProgressBar
                                    now={passwordStrength}
                                    variant={getStrengthColor()}
                                    style={{ height: '4px' }}
                                    className="rounded-0 bg-light"
                                />
                            </div>
                        )}
                    </Form.Group>

                    {/* Confirm New Password */}
                    <Form.Group>
                        <Form.Label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2 px-1">Confirm New Password</Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Repeat new password"
                                className="form-control rounded-0 p-3 border-0 bg-light fw-bold shadow-none extra-small tracking-wider"
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="btn border-0 text-muted position-absolute end-0 top-50 translate-middle-y me-2 shadow-none"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                style={{ zIndex: 10 }}
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 px-5 pb-5 pt-0 d-flex gap-3">
                <Button variant="light" className="rounded-0 flex-grow-1 py-3 fw-black extra-small tracking-widest text-uppercase border" onClick={handleClose} disabled={loading || success}>
                    CANCEL
                </Button>
                <Button
                    variant="primary"
                    className="rounded-0 flex-grow-1 py-3 fw-black extra-small tracking-widest text-uppercase shadow-lg border-0"
                    style={{ backgroundColor: '#1254AF' }}
                    onClick={handleSubmit}
                    disabled={loading || success || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                    {loading ? 'CHANGING...' : 'UPDATE PASSWORD'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PasswordChangeModal;
