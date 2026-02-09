/**
 * Professional Admin Profile Console
 * State-of-the-art interface for managing official identity and security credentials.
 */

import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Shield, Calendar,
    Edit3, Save, X, Lock, Loader, AtSign, ArrowLeft, Key, ShieldCheck,
    Briefcase, Globe, Activity, CheckCircle, AlertCircle, Eye, EyeOff, Smartphone, Info, FileText, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import apiService from '../../api/apiService';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [securityPulse, setSecurityPulse] = useState('SYNCING');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        mobile: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Inline Mobile Logic
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        const verifySession = () => {
            const role = localStorage.getItem('role');
            const token = localStorage.getItem('token');
            if (!token) setSecurityPulse('UNAUTHENTICATED');
            else if (role !== 'ADMIN') setSecurityPulse('ROLE_MISMATCH');
            else setSecurityPulse('ACTIVE');
        };

        verifySession();
        fetchProfile();
        fetchSecurityFeed();
        const interval = setInterval(fetchSecurityFeed, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiService.profile.getProfile();
            const data = response.data || response;
            setProfile(data);
            setFormData({
                name: data.name || '',
                mobile: data.mobile || ''
            });
            setSecurityPulse('ACTIVE');
        } catch (error) {
            if (error.response?.status === 403) {
                setSecurityPulse('RESTRICTED');
                // Use fallback from localStorage if 403
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                setProfile({
                    name: localStorage.getItem('name') || storedUser.name || 'Administrator',
                    email: localStorage.getItem('email') || storedUser.email || '',
                    role: 'ADMIN',
                    isFallback: true
                });
            } else {
                showToast('Failed to synchronize profile data', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSecurityFeed = async () => {
        try {
            const res = await apiService.notifications.getAll();
            setNotifications((res.data || res || []).slice(0, 5));
        } catch (e) {
            console.warn('Security feed poll failed');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (formData.name !== profile.name) {
                await apiService.profile.updateName(formData.name);
                setProfile(prev => ({ ...prev, name: formData.name }));
                localStorage.setItem('name', formData.name);
                showToast('Name successfully updated', 'success');
            }

            if (formData.mobile !== profile.mobile) {
                await handleRequestMobileOtp(formData.mobile);
            } else {
                setEditMode(false);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRequestMobileOtp = async (mobileNum) => {
        if (!mobileNum.match(/^\d{10}$/)) return showToast("Enter a valid 10-digit number.", "error");
        try {
            setOtpLoading(true);
            await apiService.profile.requestMobileOtp(mobileNum);
            setOtpSent(true);
            showToast("Verification code dispatched. Check security feed.", "success");
            fetchSecurityFeed();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to initiate mobile update.", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyMobileOtp = async () => {
        if (!otp.match(/^\d{6}$/)) return showToast("Enter 6-digit verification code.", "error");
        try {
            setOtpLoading(true);
            await apiService.profile.verifyMobileOtp(otp, formData.mobile);
            showToast("Mobile identity hardened successfully.", "success");
            setOtpSent(false);
            setEditMode(false);
            setOtp("");
            fetchProfile();
        } catch (err) {
            if (err.response?.status === 403) {
                showToast("System restriction: Administrators cannot update mobile numbers via this protocol.", "error");
            } else {
                showToast(err.response?.data?.message || "Invalid security key.", "error");
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            return showToast('Fields are incomplete', 'error');
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return showToast('Passwords mismatch', 'error');
        }
        try {
            setPasswordLoading(true);
            await apiService.profile.updatePassword(passwordData.currentPassword, passwordData.newPassword);
            showToast('Strategic credentials rotated', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Verification failure', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted extra-small">Accessing Official Credentials...</p>
        </div>
    );

    return (
        <div className="admin-profile-premium min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="container-fluid px-3 px-lg-5 pt-5" style={{ maxWidth: '1600px' }}>
                <div className="row g-5">
                    {/* Security Info Panel */}
                    <div className="col-lg-4">
                        <div className="d-flex flex-column gap-5">
                            <div className="card glass-card p-4 rounded-4 border-0">
                                <div className="p-4 text-center">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 border border-4 border-white shadow-lg bg-primary text-white" style={{ width: '80px', height: '80px', backgroundColor: PRIMARY_COLOR }}>
                                        <span className="h2 fw-black mb-0">{profile?.name?.charAt(0) || 'A'}</span>
                                    </div>
                                    <h5 className="fw-black text-dark mb-1 uppercase">{profile?.name || 'Administrator'}</h5>
                                    <p className="extra-small fw-black text-muted opacity-40 mb-0">SUPERVISORY AUTHORITY LEVEL 1</p>
                                </div>
                                <div className="card-body px-2">
                                    <div className="d-grid gap-2 mb-4">
                                        {!editMode ? (
                                            <button onClick={() => setEditMode(true)} className="btn btn-primary rounded-pill py-3 fw-black extra-small tracking-widest" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                <Edit3 size={16} className="me-2" /> MODIFY IDENTITY
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={handleSave} className="btn btn-success rounded-pill py-3 fw-black extra-small tracking-widest" disabled={saving}>
                                                    <Save size={16} className="me-2" /> {saving ? 'SYNCING...' : 'COMMIT CHANGES'}
                                                </button>
                                                <button onClick={() => { setEditMode(false); setOtpSent(false); }} className="btn btn-light rounded-pill py-3 fw-black extra-small tracking-widest text-muted">CANCEL</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Security Notifications Feed */}
                            <div className="card border-0 shadow-premium rounded-4 bg-white p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                                    <h6 className="extra-small fw-black text-dark uppercase tracking-widest mb-0 d-flex align-items-center gap-2">
                                        <Shield size={14} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                        Tactical Security Feed
                                    </h6>
                                    <span className="badge bg-success bg-opacity-10 text-success extra-small">LIVE</span>
                                </div>
                                <div className="d-flex flex-column gap-3">
                                    {notifications.length === 0 ? (
                                        <p className="extra-small text-muted text-center py-3">No recent security events.</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className="p-3 bg-light rounded-3 border-start border-4 border-primary">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="extra-small fw-black text-primary uppercase" style={{ color: PRIMARY_COLOR }}>{n.type || 'SYSTEM'}</span>
                                                    <span className="extra-small text-muted">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="extra-small fw-bold text-dark mb-0 opacity-80">{n.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Orchestration */}
                    <div className="col-lg-8">
                        <div className="d-flex flex-column gap-5">
                            {/* Parameters Card */}
                            <div className="card border-0 shadow-premium rounded-4 bg-white p-4 p-xl-5">
                                <div className="identity-section mb-4">
                                    <div className="row g-4">
                                        {/* NAME (Editable in Edit Mode) */}
                                        <div className="col-12">
                                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Full Name</label>
                                            <input
                                                type="text"
                                                disabled={!editMode}
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className={`form-control p-4 rounded-4 border-2 transition-all h3 fw-black p-0 shadow-none text-dark mb-0 uppercase tracking-tight
                                                    ${editMode ? 'bg-white border-primary border-opacity-30' : 'bg-light bg-opacity-50 border-transparent text-muted'}
                                                `}
                                                style={editMode ? { borderColor: PRIMARY_COLOR, color: '#1E293B' } : {}}
                                            />
                                        </div>

                                        {/* EMAIL (Read-Only) */}
                                        <div className="col-md-6">
                                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Connectivity Port (Email)</label>
                                            <div className="p-4 rounded-4 bg-light bg-opacity-50 border-2 border-transparent">
                                                <h6 className="fw-black text-dark mb-0 uppercase opacity-60 d-flex align-items-center gap-2">
                                                    <Mail size={14} /> {profile?.email}
                                                </h6>
                                            </div>
                                        </div>

                                        {/* ROLE (Read-Only) */}
                                        <div className="col-md-6">
                                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Authorized Role</label>
                                            <div className="p-4 rounded-4 bg-light bg-opacity-50 border-2 border-transparent">
                                                <h6 className="fw-black text-dark mb-0 uppercase opacity-60 d-flex align-items-center gap-2">
                                                    <Shield size={14} /> {profile?.role || 'ADMINISTRATOR'}
                                                </h6>
                                            </div>
                                        </div>

                                        {/* MOBILE (Editable in Edit Mode) */}
                                        <div className="col-md-6">
                                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Mobile Communications</label>
                                            <div className={`p-4 rounded-4 border-2 transition-all d-flex align-items-center gap-2
                                                ${editMode ? 'bg-white border-primary border-opacity-30' : 'bg-light bg-opacity-50 border-transparent text-muted'}
                                            `} style={editMode ? { borderColor: PRIMARY_COLOR } : {}}>
                                                <Smartphone size={16} className={editMode ? 'text-primary' : 'text-muted'} style={editMode ? { color: PRIMARY_COLOR } : {}} />
                                                <input
                                                    type="tel"
                                                    disabled={!editMode}
                                                    value={formData.mobile}
                                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                                    className="form-control border-0 bg-transparent fw-black p-0 shadow-none text-dark mb-0 h6"
                                                    placeholder="MOBILE"
                                                />
                                            </div>
                                        </div>

                                        {/* DESIGNATION (Read-Only) - Show if Admin has one or generic title */}
                                        <div className="col-md-6">
                                            <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Designation</label>
                                            <div className="p-4 rounded-4 bg-light bg-opacity-50 border-2 border-transparent">
                                                <h6 className="fw-black text-dark mb-0 uppercase opacity-60 d-flex align-items-center gap-2">
                                                    <Briefcase size={14} /> {profile?.designation || 'Level 1 Supervisory Authority'}
                                                </h6>
                                            </div>
                                        </div>

                                        {/* Inline OTP Verification Step */}
                                        {otpSent && (
                                            <div className="col-12 animate-slideUp">
                                                <div className="p-4 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-20 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle p-2 bg-white text-primary shadow-sm" style={{ color: PRIMARY_COLOR }}><ShieldCheck size={24} /></div>
                                                        <div>
                                                            <div className="extra-small fw-black text-primary uppercase" style={{ color: PRIMARY_COLOR }}>Verification Required</div>
                                                            <p className="extra-small fw-bold text-muted mb-0 uppercase">Enter the 6-digit key sent to {formData.mobile}</p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="text"
                                                            maxLength="6"
                                                            placeholder="000000"
                                                            className="form-control text-center fw-black shadow-none rounded-3 border-2"
                                                            style={{ width: '120px', borderColor: PRIMARY_COLOR }}
                                                            value={otp}
                                                            onChange={e => setOtp(e.target.value)}
                                                        />
                                                        <button onClick={handleVerifyMobileOtp} className="btn btn-primary px-4 fw-black extra-small tracking-widest rounded-3" disabled={otpLoading} style={{ backgroundColor: PRIMARY_COLOR }}>
                                                            {otpLoading ? <Loader size={16} className="animate-spin" /> : 'VERIFY'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Credential Rotation Card */}
                            <div className="card border-0 shadow-premium rounded-4 bg-white p-4 p-xl-5">
                                <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-4">
                                    <div className="rounded-circle p-2 bg-light text-dark"><Key size={20} /></div>
                                    <h6 className="fw-black text-dark mb-0 uppercase tracking-widest">Security Core</h6>
                                </div>
                                <div className="row g-4">
                                    <div className="col-12 col-md-4">
                                        <label className="extra-small fw-black text-muted uppercase mb-2">Current Key</label>
                                        <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="form-control rounded-3 py-3 fw-bold bg-light border-0 shadow-none extra-small" placeholder="VERIFY CURRENT" />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="extra-small fw-black text-muted uppercase mb-2">New Key</label>
                                        <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-control rounded-3 py-3 fw-bold bg-light border-0 shadow-none extra-small" placeholder="CREATE NEW" />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="extra-small fw-black text-muted uppercase mb-2">Confirm Key</label>
                                        <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-control rounded-3 py-3 fw-bold bg-light border-0 shadow-none extra-small" placeholder="RE-ENTER" />
                                    </div>
                                    <div className="col-12 mt-4 text-end">
                                        <button className="btn btn-dark rounded-pill px-5 py-3 fw-black extra-small tracking-widest text-white border-0" onClick={handleChangePassword} disabled={passwordLoading}>
                                            {passwordLoading ? <Loader size={16} className="animate-spin" /> : 'ROTATE CREDENTIALS'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .uppercase { text-transform: uppercase; }
            `}} />
        </div>
    );
};

export default AdminProfile;
