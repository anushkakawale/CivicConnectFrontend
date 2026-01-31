import React, { useState, useEffect } from 'react';
import { Smartphone, Send, CheckCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import apiService from '../../api/apiService';
import './ChangeMobile.css';

const ChangeMobile = ({ currentMobile, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Enter mobile, 2: Enter OTP
    const [newMobile, setNewMobile] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const validateMobile = (mobile) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateMobile(newMobile)) {
            setError('Please enter a valid 10-digit mobile number starting with 6-9');
            return;
        }

        if (newMobile === currentMobile) {
            setError('New mobile number must be different from current number');
            return;
        }

        try {
            setLoading(true);
            await apiService.auth.sendMobileOTP(newMobile);
            setStep(2);
            setTimer(120); // 2 minutes
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOTP = [...otp];
        newOTP[index] = value;
        setOtp(newOTP);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOTPKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleOTPPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOTP = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setOtp(newOTP);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, 5);
        const lastInput = document.getElementById(`otp-${lastIndex}`);
        if (lastInput) lastInput.focus();
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            await apiService.auth.verifyMobileOTP(newMobile, otpValue);
            setSuccess(true);

            setTimeout(() => {
                if (onSuccess) onSuccess();
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        try {
            setLoading(true);
            await apiService.auth.sendMobileOTP(newMobile);
            setTimer(120);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="change-mobile-container">
            <div className="change-mobile-header">
                <div className="header-icon">
                    <Smartphone className="w-6 h-6" />
                </div>
                <div>
                    <h2>Change Mobile Number</h2>
                    <p>Update your mobile number with OTP verification</p>
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
                    <span>Mobile number updated successfully!</span>
                </div>
            )}

            <div className="change-mobile-content">
                {/* Current Mobile Display */}
                <div className="current-mobile-display">
                    <span className="label">Current Mobile Number</span>
                    <span className="value">{currentMobile}</span>
                </div>

                {/* Step 1: Enter New Mobile */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="mobile-form">
                        <div className="form-group">
                            <label htmlFor="newMobile">
                                New Mobile Number <span className="required">*</span>
                            </label>
                            <div className="mobile-input-wrapper">
                                <span className="country-code">+91</span>
                                <input
                                    type="tel"
                                    id="newMobile"
                                    value={newMobile}
                                    onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength={10}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <p className="input-hint">
                                Enter a valid Indian mobile number starting with 6, 7, 8, or 9
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || newMobile.length !== 10}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send OTP
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="otp-form">
                        <div className="otp-sent-message">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p>
                                OTP sent to <strong>+91 {newMobile}</strong>
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Enter 6-Digit OTP</label>
                            <div className="otp-inputs" onPaste={handleOTPPaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                        disabled={loading}
                                        className="otp-input"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="otp-timer">
                            {timer > 0 ? (
                                <div className="timer-active">
                                    <Clock className="w-4 h-4" />
                                    <span>Resend OTP in {formatTime(timer)}</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="resend-button"
                                    disabled={loading || !canResend}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp(['', '', '', '', '', '']);
                                    setError('');
                                }}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Change Number
                            </button>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading || otp.join('').length !== 6}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Verify OTP
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Info Section */}
            <div className="info-section">
                <h4>Important Information</h4>
                <ul>
                    <li>OTP is valid for 2 minutes</li>
                    <li>You can request a new OTP after the timer expires</li>
                    <li>Your mobile number will be updated immediately after verification</li>
                    <li>You'll receive a confirmation SMS on your new number</li>
                </ul>
            </div>
        </div>
    );
};

export default ChangeMobile;
