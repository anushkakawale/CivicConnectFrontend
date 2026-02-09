import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Shield, Calendar,
    Edit2, Save, X, Lock, Loader, AtSign, ArrowLeft, Key, ShieldCheck, CheckCircle, Eye, EyeOff, Info, Building2, Map, Zap, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import apiService from '../../api/apiService';

const CitizenProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const PRIMARY_COLOR = '#244799';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiService.profile.getProfile();
            const rawData = response.data || response;
            const data = {
                ...rawData,
                role: rawData.role?.replace('ROLE_', '')
            };

            setProfile(data);
            setFormData({
                name: data.name || '',
                mobile: data.mobile || '',
                address: data.addressLine1 || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const promises = [];
            if (formData.name !== profile.name) {
                promises.push(apiService.profile.updateName(formData.name));
            }
            if (formData.mobile !== profile.mobile) {
                promises.push(apiService.profile.updateMobile(formData.mobile));
            }
            if (formData.address !== profile.addressLine1) {
                promises.push(apiService.profile.citizenUpdateAddress({ address: formData.address }));
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }

            localStorage.setItem('name', formData.name);
            setEditMode(false);
            showToast('Operational profile successfully updated', 'success');
            fetchProfile();
        } catch (error) {
            console.error('Update failed:', error);
            showToast('Failed to update profile. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showToast('Please fill all password fields', 'warning');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        try {
            setSaving(true);
            await apiService.profile.updatePassword(passwordData.currentPassword, passwordData.newPassword);
            showToast('Password changed successfully!', 'success');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Current password might be wrong', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
            <Loader className="animate-spin text-primary mb-3" size={40} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted extra-small uppercase tracking-widest">Accessing Citizen Ledger...</p>
        </div>
    );

    return (
        <div className="citizen-profile min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Header Hero */}
            <div className="py-5 text-center position-relative mb-5" style={{ background: 'linear-gradient(135deg, #244799 0%, #17367B 100%)' }}>
                <div className="d-flex align-items-center justify-content-center mb-4 mx-auto transition-standard hover-scale"
                    style={{
                        width: '120px', height: '120px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '24px',
                        border: '4px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}>
                    <User size={64} style={{ color: PRIMARY_COLOR }} strokeWidth={2.5} />
                </div>
                <h2 className="fw-black mb-1 text-white uppercase tracking-tight">{profile?.name || 'Citizen'}</h2>
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mt-2 bg-white bg-opacity-15 rounded-pill border border-white border-opacity-10">
                    <ShieldCheck size={14} className="text-white" />
                    <span className="extra-small fw-black text-white uppercase tracking-widest opacity-80">VERIFIED CITIZEN ACCOUNT</span>
                </div>
            </div>

            <div className="container px-4 px-md-5" style={{ marginTop: '-40px' }}>
                <div className="row g-4 g-lg-5">
                    {/* Perspective Card */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-4 bg-white overflow-hidden mb-4 h-100">
                            <div className="p-5 text-center position-relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
                                <Shield size={120} className="position-absolute text-white opacity-5" style={{ right: '-20px', bottom: '-20px' }} />
                                <div className="d-inline-flex p-2 rounded-4 bg-white bg-opacity-5 mb-3 mx-auto" style={{ width: '100px', height: '100px' }}>
                                    <div className="w-100 h-100 rounded-4 bg-white d-flex align-items-center justify-content-center text-dark display-6 fw-black">
                                        {profile?.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <h5 className="fw-black text-white mb-2 uppercase tracking-tight">{profile?.name}</h5>
                                <div className="badge bg-white bg-opacity-10 text-white rounded-pill px-3 py-2 extra-small fw-black tracking-widest border border-white border-opacity-10">
                                    {(profile?.role === 'CITIZEN' || profile?.role === 'ROLE_CITIZEN') ? 'CITIZEN' :
                                        (profile?.role === 'WARD_OFFICER' || profile?.role === 'ROLE_WARD_OFFICER') ? 'WARD OFFICER' :
                                            (profile?.role === 'DEPARTMENT_OFFICER' || profile?.role === 'ROLE_DEPARTMENT_OFFICER') ? 'DEPT OFFICER' :
                                                'PMC OFFICIAL'}
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="d-flex flex-column gap-3">
                                    <div className="p-4 bg-light bg-opacity-50 rounded-4 border border-dashed">
                                        <p className="extra-small fw-black text-muted mb-2 uppercase tracking-widest opacity-40">Assigned Ward</p>
                                        <div className="d-flex align-items-center gap-3">
                                            <Building2 size={18} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                            <h6 className="fw-black mb-0 text-dark">Ward {profile?.wardNumber || profile?.wardId || '0'}</h6>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-light bg-opacity-50 rounded-4 border border-dashed">
                                        <p className="extra-small fw-black text-muted mb-2 uppercase tracking-widest opacity-40">Primary Area</p>
                                        <div className="d-flex align-items-center gap-3">
                                            <MapPin size={18} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                            <h6 className="fw-black mb-0 text-dark uppercase tracking-tight">{profile?.areaName || 'CENTRAL ZONE'}</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 pt-3">
                                    <button onClick={() => setShowPasswordModal(true)} className="btn btn-dark w-100 py-3 rounded-pill fw-black extra-small tracking-widest transition-all hover-up-tiny d-flex align-items-center justify-content-center gap-2">
                                        <Lock size={14} /> UPDATE SECURITY CREDENTIALS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-premium bg-white p-4 p-md-5 rounded-4 h-100">
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                <div>
                                    <h5 className="fw-black text-dark mb-1 uppercase tracking-tight">Personal Identity</h5>
                                    <p className="extra-small text-muted fw-bold uppercase tracking-widest opacity-60">Manage your municipal account profile</p>
                                </div>
                                <div className="d-flex gap-3">
                                    {!editMode ? (
                                        <button onClick={() => setEditMode(true)} className="btn bg-light text-dark px-4 py-2 extra-small fw-black tracking-widest border shadow-sm transition-all hover-up-tiny rounded-pill">
                                            <Edit2 size={14} className="me-2" /> EDIT PROFILE
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button onClick={() => setEditMode(false)} className="btn btn-light px-4 py-2 extra-small fw-black tracking-widest rounded-pill border">CANCEL</button>
                                            <button onClick={handleSave} disabled={saving} className="btn btn-primary px-4 py-2 extra-small fw-black tracking-widest shadow-lg border-0 d-flex align-items-center gap-2 rounded-pill" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                {saving ? 'SYNCING...' : <><Save size={14} /> COMMIT CHANGES</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

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

                                {/* WARD (Read-Only) */}
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Ward Office Details</label>
                                    <div className="p-4 rounded-4 bg-primary bg-opacity-5 border-2 border-transparent">
                                        <h6 className="fw-black text-primary mb-0 uppercase d-flex align-items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                                            <Building2 size={14} /> Ward No. {profile?.wardNumber} ({profile?.areaName || 'Main Zone'})
                                        </h6>
                                    </div>
                                </div>

                                {/* ROLE (Read-Only) */}
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Account Status</label>
                                    <div className="p-4 rounded-4 bg-light bg-opacity-50 border-2 border-transparent">
                                        <h6 className="fw-black text-dark mb-0 uppercase opacity-60 d-flex align-items-center gap-2">
                                            <ShieldCheck size={14} className="text-success" /> Verified Citizen
                                        </h6>
                                    </div>
                                </div>

                                {/* ADDRESS (Editable in Edit Mode) */}
                                <div className="col-12">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">Residential Address</label>
                                    <div className={`p-4 rounded-4 border-2 transition-all d-flex align-items-start gap-2
                                        ${editMode ? 'bg-white border-primary border-opacity-30' : 'bg-light bg-opacity-50 border-transparent text-muted'}
                                    `} style={editMode ? { borderColor: PRIMARY_COLOR } : {}}>
                                        <MapPin size={16} className={`mt-1 ${editMode ? 'text-primary' : 'text-muted'}`} style={editMode ? { color: PRIMARY_COLOR } : {}} />
                                        <textarea
                                            disabled={!editMode}
                                            rows="2"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="form-control border-0 bg-transparent fw-black p-0 shadow-none text-dark mb-0 h6 ls-tight"
                                            placeholder="POSTAL ADDRESS"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="password-modal-overlay">
                    <div className="card border-0 shadow-premium rounded-4 overflow-hidden animate-zoomIn bg-white" style={{ maxWidth: '450px', width: '90%' }}>
                        <div className="p-5 text-center text-white" style={{ backgroundColor: '#0f172a' }}>
                            <div className="bg-white bg-opacity-10 rounded-4 d-inline-flex p-4 mb-4 border border-white border-opacity-5">
                                <Key size={44} className="text-white" />
                            </div>
                            <h4 className="fw-black mb-1 uppercase tracking-tight">Security Vault</h4>
                            <p className="extra-small fw-bold opacity-60 uppercase tracking-widest m-0">Synchronize new credentials</p>
                        </div>
                        <div className="card-body p-5">
                            <div className="mb-4">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-60">Current Credential</label>
                                <div className="position-relative">
                                    <input type={showPasswords.current ? 'text' : 'password'} value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="form-control rounded-pill border-0 bg-light py-3 px-4 shadow-none fw-black extra-small tracking-widest" placeholder="••••••••" />
                                    <button onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-muted shadow-none">
                                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-60">New Credential</label>
                                <div className="position-relative">
                                    <input type={showPasswords.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-control rounded-pill border-0 bg-light py-3 px-4 shadow-none fw-black extra-small tracking-widest" placeholder="••••••••" />
                                    <button onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-muted shadow-none">
                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-60">Confirm New Credential</label>
                                <div className="position-relative">
                                    <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-control rounded-pill border-0 bg-light py-3 px-4 shadow-none fw-black extra-small tracking-widest" placeholder="••••••••" />
                                    <button onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-muted shadow-none">
                                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="d-grid gap-3 mt-5">
                                <button className="btn btn-primary py-3 w-100 fw-black extra-small tracking-widest text-white shadow-lg border-0 rounded-pill" onClick={handleChangePassword} disabled={saving} style={{ backgroundColor: PRIMARY_COLOR }}>
                                    {saving ? 'UPDATING...' : 'CONFIRM SYNC'}
                                </button>
                                <button className="btn btn-light py-3 w-100 fw-black extra-small tracking-widest rounded-pill border" onClick={() => setShowPasswordModal(false)}>CANCEL</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .citizen-profile { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .tracking-tight { letter-spacing: -0.01em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .transition-standard { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-scale:hover { transform: scale(1.02); }
                .hover-up-tiny:hover { transform: translateY(-3px); }
                .password-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default CitizenProfile;
