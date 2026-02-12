import React, { useState, useEffect } from 'react';
import {
    User, Mail, MapPin, Building2,
    Edit3, Save, X, Phone, Loader, ArrowLeft, Smartphone,
    ChevronRight, AtSign, Globe, Briefcase, CheckCircle, AlertCircle, Lock, Key, Eye, EyeOff, Check, ShieldCheck, Shield, FileText, Calendar, Info, Zap, RefreshCw, Compass, Camera
} from 'lucide-react';
import apiService from '../api/apiService';
import { USER_ROLES } from '../constants';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

/**
 * Enhanced Strategic Profile Management
 * High-contrast, streamlined UI without redundant headers.
 */
const ProfilePage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editAddressFields, setEditAddressFields] = useState({
        addressLine1: "",
        addressLine2: "",
        city: "",
        pincode: ""
    });
    const [editAddress, setEditAddress] = useState("");
    const [editMobile, setEditMobile] = useState("");

    // Password Update State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showWardModal, setShowWardModal] = useState(false);
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState("");
    const [wardChangeRemarks, setWardChangeRemarks] = useState("");
    const [requestingWard, setRequestingWard] = useState(false);

    // Mobile OTP state
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [newMobile, setNewMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [completionScore, setCompletionScore] = useState(0);

    const PRIMARY_COLOR = '#173470'; // PMC Professional Blue

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // This effect runs when `user` state changes, after fetchData completes.
        // We can move score calculation here or keep it in fetchData.
        // For now, let's assume fetchData sets the score.
        // The user's instruction implies a `loadCompletionScore` function, but it's not provided.
        // I'll assume `fetchData` already handles score calculation or we'll add a separate call.
        // For now, I'll just add the ward loading logic.
        if (user?.role === USER_ROLES.CITIZEN || user?.role === 'ROLE_CITIZEN') {
            loadWards();
        }
    }, [user]);

    const loadWards = async () => {
        try {
            const res = await apiService.masterData.getWards();
            setWards(res.data || res || []);
        } catch (err) {
            console.error("Failed to load wards", err);
        }
    };

    const handleWardChangeRequest = async () => {
        if (!selectedWard || !wardChangeRemarks) {
            showToast("Please select a ward and provide remarks", "error");
            return;
        }

        setRequestingWard(true);
        try {
            await apiService.profile.requestWardChange({
                requestedWardId: selectedWard,
                reason: wardChangeRemarks
            });
            showToast("Ward change request submitted successfully", "success");
            setShowWardModal(false);
            setWardChangeRemarks("");
            setSelectedWard("");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to submit request", "error");
        } finally {
            setRequestingWard(false);
        }
    };

    const calculateScore = (userData) => {
        if (!userData) return 0;
        let score = 0;
        const role = (userData.role || '').replace('ROLE_', '');

        if (role === 'CITIZEN') {
            if (userData.name) score += 20;
            if (userData.email) score += 20;
            if (userData.mobile) score += 20;
            if (userData.wardId || userData.wardName || userData.ward) score += 25;

            // Address (15-20%)
            const hasAddr = userData.addressLine1 || userData.address || userData.fullAddress;
            const hasCity = userData.city;
            const hasZip = userData.pincode;

            if (hasAddr && hasCity && hasZip) score += 15; // Maxes out at 100
            else if (hasAddr && hasCity) score += 15;
            else if (hasAddr) score += 8;
        } else {
            // Officers / Admin
            if (userData.name) score += 34;
            if (userData.email) score += 33;
            if (userData.mobile) score += 33;
        }

        return Math.min(100, score);
    };

    const getMissingItems = (userData) => {
        if (!userData) return [];
        const missing = [];
        const role = (userData.role || '').replace('ROLE_', '');

        if (!userData.name) missing.push("Official Name");
        if (!userData.mobile) missing.push("Mobile Verification");
        if (!userData.email) missing.push("Email Verification");

        if (role === 'CITIZEN') {
            if (!(userData.wardId || userData.wardName || userData.ward)) missing.push("Ward Selection");
            if (!userData.addressLine1 && !userData.address && !userData.fullAddress) missing.push("Address Details");
            if (!userData.city) missing.push("City Details");
        }

        return missing;
    };

    const fetchData = async () => {
        const localRole = localStorage.getItem('role');
        try {
            setLoading(true);
            let response;
            if (localRole === 'DEPARTMENT_OFFICER') {
                try {
                    response = await apiService.departmentOfficer.getProfile();
                } catch (e) {
                    response = await apiService.profile.getProfile();
                }
            } else if (localRole === 'WARD_OFFICER') {
                try {
                    response = await apiService.wardOfficer.getProfile();
                } catch (e) {
                    response = await apiService.profile.getProfile();
                }
            } else {
                response = await apiService.profile.getProfile();
            }

            const rawData = response.data || response;
            const data = {
                ...rawData,
                role: rawData.role?.replace('ROLE_', '')
            };

            let finalUser = data;

            if (data.role === USER_ROLES.CITIZEN) {
                try {
                    const citRes = await apiService.profile.getCitizenProfile();
                    const citData = citRes.data || citRes;

                    // Priority merging
                    finalUser = {
                        ...data,
                        ...citData,
                        name: data.name || citData.name,
                        mobile: citData.mobile || data.mobile,
                        address: data.fullAddress || citData.fullAddress || citData.address || citData.residentialAddress || data.address,
                        addressLine1: citData.addressLine1 || "",
                        addressLine2: citData.addressLine2 || "",
                        city: citData.city || "",
                        pincode: citData.pincode || "",
                        role: 'CITIZEN' // Ensure role is set
                    };

                    setUser(finalUser);
                    setEditName(finalUser.name || "");
                    setEditAddress(finalUser.address || "");
                    setEditAddressFields({
                        addressLine1: finalUser.addressLine1 || "",
                        addressLine2: finalUser.addressLine2 || "",
                        city: finalUser.city || "Pune",
                        pincode: finalUser.pincode || ""
                    });
                    setEditMobile(finalUser.mobile || "");
                } catch (e) {
                    setUser(data);
                    setEditName(data.name || "");
                    setEditMobile(data.mobile || "");
                    finalUser = data;
                }
            } else {
                setUser(data);
                setEditName(data.name || "");
                setEditMobile(data.mobile || "");
                finalUser = data;
            }

            // Calculate Score Locally based on new logic
            const calculatedScore = calculateScore(finalUser);
            setCompletionScore(calculatedScore);

        } catch (err) {
            console.error('Failed to load profile:', err);
            showToast('Unable to load profile data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper to fetch ward name if missing
    useEffect(() => {
        const resolveWardName = async () => {
            if (user?.wardId && !user?.wardName && !user?.ward?.areaName) {
                try {
                    const res = await apiService.masterData.getWards();
                    const wards = res.data || res;
                    const matched = wards.find(w => w.wardId === user.wardId);
                    if (matched) {
                        setUser(prev => ({ ...prev, wardName: matched.areaName }));
                    }
                } catch (e) {
                    console.error("Failed to resolve ward name", e);
                }
            }
        };
        if (user) resolveWardName();
    }, [user?.wardId]);

    const handleSaveProfile = async () => {
        if (!editName.trim()) return showToast("Name cannot be empty.", "error");
        try {
            setSaving(true);
            const updatePromises = [apiService.profile.updateName(editName)];

            if (user?.role === USER_ROLES.CITIZEN || user?.role === 'ROLE_CITIZEN') {
                updatePromises.push(apiService.profile.citizenUpdateAddress({
                    addressLine1: editAddress,
                    addressLine2: editAddressFields.addressLine2,
                    city: editAddressFields.city,
                    pincode: editAddressFields.pincode
                }));
            }

            if (editMobile !== user?.mobile) {
                // We now handle mobile separately via OTP flow
                // This section will focus on Name and Address only
            }

            await Promise.all(updatePromises);

            // Immediate local state update for snappy UI
            setUser(prev => ({
                ...prev,
                name: editName,
                mobile: editMobile,
                addressLine1: editAddressFields.addressLine1,
                addressLine2: editAddressFields.addressLine2,
                city: editAddressFields.city,
                pincode: editAddressFields.pincode
            }));

            showToast("Your profile was updated successfully.", "success");
            setIsEditing(false);

            // Update localStorage name for dashboard consistency
            localStorage.setItem('name', editName);
            window.dispatchEvent(new Event('storage'));

            // Refresh data from server to ensure synchronization
            await fetchData();
        } catch (err) {
            console.error("Save profile error:", err);

            // Handle the specific backend "Duplicate entry" constraint issue for notification_stats
            const errorMessage = err.response?.data?.message || "";
            if (errorMessage.includes("Duplicate entry") && errorMessage.includes("notification_stats")) {
                showToast("System synchronization error. Your profile was saved, but notification settings could not be updated. Please try again later.", "warning");
                // Local state update anyway since the name/address usually saves even if the subsequent listener fails
                setIsEditing(false);
                fetchData();
            } else {
                showToast(errorMessage || "Could not save changes.", "error");
            }
        } finally {
            setSaving(false);
        }
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[@$!%*?&]/.test(pwd)) strength++;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: 'Very Weak', color: '#EF4444' },
            { strength: 2, label: 'Weak', color: '#F59E0B' },
            { strength: 3, label: 'Medium', color: '#3B82F6' },
            { strength: 4, label: 'Strong', color: '#6366F1' },
            { strength: 5, label: 'Very Strong', color: '#22C55E' }
        ];
        return levels[strength];
    };

    const handleUpdatePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            return showToast("Please fill in all password fields.", "error");
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return showToast("Passwords do not match.", "error");
        }
        try {
            setPasswordLoading(true);
            await apiService.profile.updatePassword(passwordData.currentPassword, passwordData.newPassword);
            showToast("Password changed successfully.", "success");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to change password.", "error");
        } finally {
            setPasswordLoading(false);
        }
    };

    const calculateEnrollment = (date) => {
        if (!date) return "Member";
        const start = new Date(date);
        const now = new Date();
        const diff = now - start;
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));

        if (years > 0) return `Member since ${years} year(s)`;
        if (months > 0) return `Member since ${months} month(s)`;
        return `Member since ${days} day(s)`;
    };

    const handleRequestMobileOtp = async () => {
        if (!newMobile.match(/^\d{10}$/)) return showToast("Enter a valid 10-digit number.", "error");
        try {
            setOtpLoading(true);
            await apiService.profile.requestMobileOtp(newMobile);
            setOtpSent(true);
            setShowOtpModal(true);
            showToast("Verification OTP sent to your device.", "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to initiate update.", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyMobileOtp = async () => {
        if (!otp.match(/^\d{6}$/)) return showToast("Enter 6-digit OTP.", "error");
        try {
            setOtpLoading(true);
            await apiService.profile.verifyMobileOtp(otp, newMobile);
            showToast("Mobile number updated successfully.", "success");
            setShowOtpModal(false);
            setOtp("");
            fetchData();
        } catch (err) {
            if (err.response?.status === 403) {
                showToast("Access Denied: You do not have permission to update mobile data through this channel.", "error");
            } else {
                showToast(err.response?.data?.message || "Invalid OTP.", "error");
            }
        } finally {
            setOtpLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-3" size={40} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-bold text-muted small uppercase tracking-widest">Accessing Profile...</p>
        </div>
    );

    const pwdStrength = getPasswordStrength(passwordData.newPassword);

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="container py-4">
                <div className="row g-4">
                    {/* Sidebar Profile Card */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden mb-4">
                            <div className="p-5 text-center position-relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
                                <Shield size={120} className="position-absolute text-white opacity-5" style={{ right: '-20px', bottom: '-20px' }} />
                                <div className="d-inline-flex p-2 rounded-4 bg-white bg-opacity-5 mb-3 mx-auto position-relative group" style={{ width: '100px', height: '100px' }}>
                                    <div className="w-100 h-100 rounded-4 bg-white d-flex align-items-center justify-content-center text-dark display-6 fw-black overflow-hidden position-relative">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <h5 className="fw-black text-white mb-2 uppercase tracking-tight">{user?.name}</h5>
                                <div className="badge bg-white bg-opacity-10 text-white rounded-pill px-3 py-2 extra-small fw-black tracking-widest border border-white border-opacity-10">
                                    {(user?.role === 'CITIZEN' || user?.role === 'ROLE_CITIZEN') ? 'CITIZEN ACCOUNT' :
                                        (user?.role === 'WARD_OFFICER' || user?.role === 'ROLE_WARD_OFFICER') ? 'WARD OFFICER' :
                                            (user?.role === 'DEPARTMENT_OFFICER' || user?.role === 'ROLE_DEPARTMENT_OFFICER') ? 'FIELD DEPT OFFICER' :
                                                'OFFICIAL STAFF'}
                                </div>
                            </div>

                            <div className="card-body p-4">
                                <div className="d-grid mb-4">
                                    {!isEditing ? (
                                        <button onClick={() => setIsEditing(true)} className="btn btn-outline-primary rounded-pill py-2 fw-bold small">
                                            <Edit3 size={14} className="me-2" /> Edit Details
                                        </button>
                                    ) : (
                                        <div className="d-grid gap-2">
                                            <button onClick={handleSaveProfile} className="btn btn-primary rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 small" disabled={saving}>
                                                {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Save Updates
                                            </button>
                                            <button onClick={() => {
                                                setIsEditing(false);
                                                setEditName(user.name);
                                                setEditAddress(user.address || "");
                                                setEditMobile(user.mobile || "");
                                            }} className="btn btn-light rounded-pill py-2 fw-bold small">
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="vstack gap-3 border-top pt-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 bg-light rounded-3 text-primary" style={{ color: PRIMARY_COLOR }}><ShieldCheck size={18} /></div>
                                        <div>
                                            <div className="extra-small text-muted fw-bold caps">Trust Level</div>
                                            <div className="small fw-bold">VERIFIED {completionScore >= 80 ? 'STRATEGIC' : 'STANDARD'}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 bg-light rounded-3 text-primary" style={{ color: PRIMARY_COLOR }}><Calendar size={18} /></div>
                                        <div>
                                            <div className="extra-small text-muted fw-bold caps">Membership</div>
                                            <div className="small fw-bold text-truncate">{calculateEnrollment(user?.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 bg-light rounded-3 text-primary" style={{ color: PRIMARY_COLOR }}>
                                            {(user?.role === 'DEPARTMENT_OFFICER' || user?.role === 'ROLE_DEPARTMENT_OFFICER') ? <Building2 size={18} /> : <MapPin size={18} />}
                                        </div>
                                        <div>
                                            <div className="extra-small text-muted fw-bold caps">
                                                {(user?.role === 'DEPARTMENT_OFFICER' || user?.role === 'ROLE_DEPARTMENT_OFFICER') ? 'Assigned Unit' : 'My Ward'}
                                            </div>
                                            <div className="small fw-bold text-truncate">
                                                {(user?.role === 'DEPARTMENT_OFFICER' || user?.role === 'ROLE_DEPARTMENT_OFFICER')
                                                    ? (user?.departmentName || user?.department?.name || 'Unit Alpha')
                                                    : (user?.wardName || user?.ward?.areaName || 'Not Assigned')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Completion Card */}
                        <div className="card border-0 shadow-premium rounded-4 bg-white p-4 mb-4 border-start border-5 transition-all hover-up-tiny" style={{ borderLeftColor: completionScore === 100 ? '#10B981' : '#F59E0B' }}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h6 className="fw-black text-dark mb-1 uppercase tracking-tighter">Profile Integrity</h6>
                                    <p className="extra-small text-muted fw-bold mb-0 opacity-50 uppercase">Operational Readiness Score</p>
                                </div>
                                <div className="h4 fw-black mb-0" style={{ color: completionScore === 100 ? '#10B981' : '#F59E0B' }}>{completionScore}%</div>
                            </div>
                            <div className="progress rounded-pill bg-light mb-3" style={{ height: '8px' }}>
                                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{
                                    width: `${completionScore}%`,
                                    backgroundColor: completionScore === 100 ? '#10B981' : '#F59E0B',
                                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}></div>
                            </div>

                            {completionScore < 100 ? (
                                <div className="mt-3 p-3 rounded-3 bg-light bg-opacity-50 border border-light">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <AlertCircle size={14} className="text-warning" />
                                        <span className="extra-small fw-black text-dark uppercase tracking-widest">Pending Requirements</span>
                                    </div>
                                    <div className="vstack gap-2">
                                        {getMissingItems(user).map((item, i) => (
                                            <div key={i} className="d-flex align-items-center gap-2 extra-small fw-bold text-muted">
                                                <div className="rounded-circle bg-warning bg-opacity-20" style={{ width: 6, height: 6 }}></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center gap-2 text-success extra-small fw-black uppercase tracking-widest">
                                    <CheckCircle size={14} /> Strategic Account Active
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-lg-8 animate-fadeIn">
                        {/* Profile Info Card */}
                        <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 mb-4">
                            <h5 className="fw-bold text-dark mb-4 pb-3 border-bottom d-flex align-items-center gap-2">
                                <User size={20} className="text-primary" style={{ color: PRIMARY_COLOR }} /> Profile Details
                            </h5>

                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="small fw-bold text-muted mb-2 d-block caps">Full Name</label>
                                    <div className={`p-3 rounded-3 border ${isEditing ? 'border-primary' : 'bg-light border-0'}`}>
                                        {isEditing ? (
                                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="form-control border-0 bg-transparent fw-bold p-0 shadow-none text-dark" autoFocus />
                                        ) : (
                                            <div className="fw-bold text-dark">{user?.name || 'User'}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="small fw-bold text-muted mb-2 d-block caps">Email Address</label>
                                    <div className="p-3 rounded-3 bg-light border-0">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <Mail size={12} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                            <span className="extra-small fw-bold text-primary caps" style={{ color: PRIMARY_COLOR }}>Primary Email</span>
                                        </div>
                                        <div className="fw-bold text-dark">{user?.email || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="small fw-bold text-muted mb-0 caps">Phone Number</label>
                                        {!isEditing && (
                                            <button onClick={() => setShowOtpModal(true)} className="btn btn-link p-0 text-decoration-none extra-small fw-bold" style={{ color: PRIMARY_COLOR }}>Update Mobile</button>
                                        )}
                                    </div>
                                    <div className="p-3 rounded-3 bg-light border-0">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <Smartphone size={12} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                            <span className="extra-small fw-bold text-primary caps" style={{ color: PRIMARY_COLOR }}>Secure Identifer</span>
                                        </div>
                                        <div className="fw-bold text-dark">{user?.mobile || 'Not provided'}</div>
                                    </div>
                                </div>

                                {(user?.role === USER_ROLES.CITIZEN || user?.role === 'ROLE_CITIZEN') && (
                                    <>
                                        <div className="col-md-12">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="small fw-bold text-muted mb-0 caps">Administrative Ward</label>
                                                {!isEditing && (
                                                    <button onClick={() => setShowWardModal(true)} className="btn btn-link p-0 text-decoration-none extra-small fw-bold" style={{ color: PRIMARY_COLOR }}>Request Change</button>
                                                )}
                                            </div>
                                            <div className="p-3 rounded-3 bg-light border-0">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <Compass size={12} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                                    <span className="extra-small fw-bold text-primary caps" style={{ color: PRIMARY_COLOR }}>Ward</span>
                                                </div>
                                                <div className="fw-bold text-dark">{user?.wardName || user?.ward?.areaName || 'Not Assigned'}</div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="small fw-bold text-muted mb-2 d-block caps">Residential Address</label>
                                            <div className={`p-3 rounded-3 border ${isEditing ? 'border-primary' : 'bg-light border-0'}`}>
                                                {isEditing ? (
                                                    <div className="d-flex flex-column gap-3">
                                                        <div className="d-flex gap-2">
                                                            <MapPin size={18} className="text-primary mt-1" />
                                                            <textarea
                                                                value={editAddress}
                                                                onChange={e => setEditAddress(e.target.value)}
                                                                className="form-control border-0 bg-transparent fw-bold p-0 shadow-none text-dark"
                                                                rows="2"
                                                                placeholder="Enter your street and area details..."
                                                            />
                                                        </div>
                                                        <div className="row g-2">
                                                            <div className="col-6">
                                                                <input
                                                                    type="text"
                                                                    className="form-control bg-light border-0 extra-small fw-bold"
                                                                    placeholder="City"
                                                                    value={editAddressFields.city}
                                                                    onChange={e => setEditAddressFields({ ...editAddressFields, city: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="col-6">
                                                                <input
                                                                    type="text"
                                                                    className="form-control bg-light border-0 extra-small fw-bold"
                                                                    placeholder="Pincode"
                                                                    value={editAddressFields.pincode}
                                                                    onChange={e => setEditAddressFields({ ...editAddressFields, pincode: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex gap-2">
                                                        <MapPin size={18} className="text-primary" />
                                                        <div>
                                                            <div className="fw-bold text-dark">{user?.address || user?.fullAddress || 'Address not added'}</div>
                                                            {(user?.city || user?.pincode) && (
                                                                <div className="extra-small text-muted fw-bold mt-1">
                                                                    {user?.city}{user?.city && user?.pincode ? ', ' : ''}{user?.pincode}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Password Card */}
                        <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
                            <h5 className="fw-bold text-dark mb-4 pb-3 border-bottom d-flex align-items-center gap-2">
                                <Lock size={20} className="text-danger" /> Update Password
                            </h5>

                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="small fw-bold text-muted mb-1 d-block caps">Current Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            className="form-control rounded-3 border-light bg-light py-3 fw-bold shadow-none"
                                            value={passwordData.currentPassword}
                                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            placeholder="Verify your current password"
                                        />
                                        <button className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-muted" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>{showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small fw-bold text-muted mb-1 d-block caps">New Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            className="form-control rounded-3 border-light bg-light py-3 fw-bold shadow-none"
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="Enter new password"
                                        />
                                        <button className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-muted" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>{showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                    {passwordData.newPassword && (
                                        <div className="mt-2">
                                            <div className="progress rounded-pill overflow-hidden" style={{ height: '4px' }}>
                                                <div className="progress-bar" style={{ width: `${(getPasswordStrength(passwordData.newPassword).strength / 5) * 100}%`, backgroundColor: getPasswordStrength(passwordData.newPassword).color }}></div>
                                            </div>
                                            <div className="extra-small fw-bold mt-1" style={{ color: getPasswordStrength(passwordData.newPassword).color }}>Strength: {getPasswordStrength(passwordData.newPassword).label}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="small fw-bold text-muted mb-1 d-block caps">Confirm Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            className="form-control rounded-3 border-light bg-light py-3 fw-bold shadow-none"
                                            value={passwordData.confirmPassword}
                                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="Repeat new password"
                                        />
                                        <button className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-muted" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>{showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                </div>
                                <div className="col-12 mt-4">
                                    <button
                                        className="btn btn-primary rounded-pill py-3 fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleUpdatePassword}
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? <Loader size={18} className="animate-spin" /> : <Zap size={18} />} Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ward Change Modal */}
            {showWardModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1100 }}>
                    <div className="position-absolute w-100 h-100 bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }} onClick={() => setShowWardModal(false)}></div>
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative animate-zoomIn" style={{ maxWidth: '450px', width: '90%' }}>
                        <div className="p-4 bg-primary text-white d-flex align-items-center justify-content-between" style={{ backgroundColor: PRIMARY_COLOR }}>
                            <div className="d-flex align-items-center gap-3">
                                <Compass size={20} />
                                <h6 className="fw-black mb-0 uppercase tracking-widest small">Identity Relocation Request</h6>
                            </div>
                            <button onClick={() => setShowWardModal(false)} className="btn btn-link text-white p-0 shadow-none"><Zap size={18} /></button>
                        </div>
                        <div className="card-body p-5">
                            <div className="mb-4">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2">Target Administrative Ward</label>
                                <select
                                    className="form-select rounded-3 py-3 border-light bg-light fw-bold shadow-none"
                                    value={selectedWard}
                                    onChange={e => setSelectedWard(e.target.value)}
                                >
                                    <option value="">Select Target Jurisdiction</option>
                                    {wards.map(ward => (
                                        <option key={ward.id || ward.wardId} value={ward.id || ward.wardId}>
                                            Ward {ward.id || ward.wardId} - {ward.areaName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2">Relocation Justification (Remarks)</label>
                                <textarea
                                    className="form-control rounded-3 py-3 border-light bg-light fw-bold shadow-none"
                                    rows="3"
                                    placeholder="State reason for jurisdiction change..."
                                    value={wardChangeRemarks}
                                    onChange={e => setWardChangeRemarks(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="d-flex gap-3">
                                <button onClick={() => setShowWardModal(false)} className="btn btn-light rounded-pill py-3 flex-grow-1 fw-black extra-small uppercase">Abort</button>
                                <button
                                    onClick={handleWardChangeRequest}
                                    className="btn btn-primary rounded-pill py-3 flex-grow-1 fw-black extra-small uppercase shadow-premium"
                                    disabled={requestingWard}
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    {requestingWard ? <Loader size={18} className="animate-spin mx-auto" /> : "SUBMIT REQUEST"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1100 }}>
                    <div className="position-absolute w-100 h-100 bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }} onClick={() => setShowOtpModal(false)}></div>
                    <div className="card b-none shadow-lg rounded-4 overflow-hidden position-relative animate-zoomIn" style={{ maxWidth: '400px', width: '90%' }}>
                        <div className="p-4 bg-dark text-white d-flex align-items-center gap-3">
                            <Smartphone className="text-primary" size={24} style={{ color: PRIMARY_COLOR }} />
                            <h6 className="fw-black mb-0 uppercase tracking-widest small">Secure Update Protocol</h6>
                        </div>
                        <div className="card-body p-5">
                            {(!otpSent) ? (
                                <div className="mb-4">
                                    <label className="extra-small fw-bold text-muted uppercase mb-2">Enter New Mobile Number</label>
                                    <div className="input-group border bg-light rounded-3 overflow-hidden mb-4">
                                        <span className="input-group-text bg-transparent border-0"><Smartphone size={18} className="text-muted" /></span>
                                        <input
                                            type="tel"
                                            className="form-control border-0 bg-transparent py-3 fw-bold shadow-none"
                                            placeholder="10 Digit Number"
                                            value={newMobile}
                                            onChange={e => setNewMobile(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={handleRequestMobileOtp} className="btn btn-primary w-100 rounded-pill py-3 fw-black extra-small tracking-widest" disabled={otpLoading} style={{ backgroundColor: PRIMARY_COLOR }}>
                                        {otpLoading ? <Loader size={18} className="animate-spin" /> : "REQUEST SECURITY KEY"}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="p-3 bg-light rounded-3 mb-4 text-center border">
                                        <div className="extra-small text-muted fw-bold uppercase mb-1">Target Identity</div>
                                        <div className="fw-black text-dark">{newMobile}</div>
                                    </div>
                                    <label className="extra-small fw-bold text-muted uppercase mb-2">Verification Code</label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        className="form-control rounded-3 py-3 fw-black border-primary bg-white shadow-none text-center h4"
                                        placeholder="000000"
                                        value={otp}
                                        style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                                        onChange={e => setOtp(e.target.value)}
                                    />
                                    <div className="d-flex gap-2 mt-4">
                                        <button onClick={() => { setShowOtpModal(false); setOtpSent(false); }} className="btn btn-light rounded-pill py-3 flex-grow-1 fw-black extra-small uppercase">Cancel</button>
                                        <button onClick={handleVerifyMobileOtp} className="btn btn-primary rounded-pill py-3 flex-grow-1 fw-black extra-small uppercase" disabled={otpLoading} style={{ backgroundColor: PRIMARY_COLOR }}>
                                            {otpLoading ? <Loader size={18} className="animate-spin mx-auto" /> : "AUTHENTICATE"}
                                        </button>
                                    </div>
                                    <button onClick={() => setOtpSent(false)} className="btn btn-link w-100 text-center mt-3 extra-small fw-black text-muted text-decoration-none">CHANGE NUMBER</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .caps { text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.65rem; }
                .extra-small { font-size: 0.65rem; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
};

export default ProfilePage;
