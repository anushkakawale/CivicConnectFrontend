import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Smartphone, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import profileService from '../../services/profileService';

const MobileOTPModal = ({ show, onHide, currentMobile, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Enter mobile, 2: Enter OTP
    const [newMobile, setNewMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [mockOtp, setMockOtp] = useState(''); // For development
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const validateMobile = (mobile) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    };

    const handleSendOTP = async () => {
        setError('');

        if (!validateMobile(newMobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        if (newMobile === currentMobile) {
            setError('New mobile number is same as current');
            return;
        }

        try {
            setLoading(true);
            const response = await profileService.requestMobileOTP(newMobile);

            // Store mock OTP for development (backend returns it)
            if (response.mockOtp) {
                setMockOtp(response.mockOtp);
                console.log('🔐 Mock OTP:', response.mockOtp);
            }

            setStep(2);
            setCooldown(60); // 60 seconds cooldown
        } catch (err) {
            console.error('OTP request error:', err);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            await profileService.verifyMobileOTP(otp);

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                if (onSuccess) onSuccess(newMobile);
            }, 2000);
        } catch (err) {
            console.error('OTP verification error:', err);
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = () => {
        setOtp('');
        setError('');
        handleSendOTP();
    };

    const handleClose = () => {
        setStep(1);
        setNewMobile('');
        setOtp('');
        setMockOtp('');
        setError('');
        setSuccess(false);
        setCooldown(0);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title className="d-flex align-items-center">
                    <Smartphone size={24} className="me-2 text-primary" />
                    Change Mobile Number
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
                        Mobile number updated successfully!
                    </Alert>
                )}

                {/* Development Mode - Show Mock OTP */}
                {mockOtp && step === 2 && (
                    <Alert variant="info" className="mb-3">
                        <strong>🔐 Development Mode</strong>
                        <br />
                        Mock OTP: <code className="fs-5 fw-bold">{mockOtp}</code>
                        <br />
                        <small className="text-muted">This will be removed in production</small>
                    </Alert>
                )}

                {step === 1 ? (
                    // Step 1: Enter New Mobile Number
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Mobile Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentMobile || 'Not set'}
                                disabled
                                className="bg-light"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>New Mobile Number *</Form.Label>
                            <Form.Control
                                type="tel"
                                value={newMobile}
                                onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="Enter 10-digit mobile number"
                                disabled={loading || success}
                                maxLength={10}
                                required
                            />
                            <Form.Text className="text-muted">
                                Enter a valid 10-digit Indian mobile number
                            </Form.Text>
                        </Form.Group>
                    </Form>
                ) : (
                    // Step 2: Enter OTP
                    <Form>
                        <div className="alert alert-info mb-3">
                            <small>
                                OTP has been sent to <strong>{newMobile}</strong>
                            </small>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Enter OTP *</Form.Label>
                            <Form.Control
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                disabled={loading || success}
                                maxLength={6}
                                className="text-center fs-4 letter-spacing-wide"
                                required
                            />
                            <Form.Text className="text-muted">
                                OTP is valid for 5 minutes
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center">
                            <Button
                                variant="link"
                                onClick={() => setStep(1)}
                                disabled={loading || success}
                                className="p-0"
                            >
                                ← Change Number
                            </Button>
                            <Button
                                variant="link"
                                onClick={handleResendOTP}
                                disabled={loading || success || cooldown > 0}
                                className="p-0"
                            >
                                {cooldown > 0 ? (
                                    <>
                                        <Clock size={16} className="me-1" />
                                        Resend in {cooldown}s
                                    </>
                                ) : (
                                    'Resend OTP'
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer className="border-top">
                <Button variant="secondary" onClick={handleClose} disabled={loading || success}>
                    Cancel
                </Button>
                {step === 1 ? (
                    <Button
                        variant="primary"
                        onClick={handleSendOTP}
                        disabled={loading || success || !newMobile || newMobile.length !== 10}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} className="me-2" />
                                Send OTP
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        variant="success"
                        onClick={handleVerifyOTP}
                        disabled={loading || success || !otp || otp.length !== 6}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Verifying...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle size={18} className="me-2" />
                                Verified!
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} className="me-2" />
                                Verify OTP
                            </>
                        )}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default MobileOTPModal;
