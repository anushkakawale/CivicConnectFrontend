import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Building2, Shield, Loader, MapPin,
    Calendar, Clock, Edit2, Save, X, Lock, Award,
    Activity, ChevronRight, CheckCircle2, AlertCircle, TrendingUp, RefreshCw,
    Signal, Briefcase, Key, ShieldCheck, ArrowLeft, Smartphone, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';

import PasswordChangeModal from '../../components/profile/PasswordChangeModal';

const WardOfficerProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const brandColor = '#173470';

    const [formData, setFormData] = useState({
        name: '',
        mobile: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiService.wardOfficer.getProfile();
            const data = response.data || response;
            setProfile(data);
            setFormData({
                name: data.name || '',
                mobile: data.mobile || data.mobileNumber || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            showToast('Unable to synchronize official profile data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiService.profile.updateName(formData.name);
            showToast('Official Identity synchronized successfully.', 'success');
            setProfile({ ...profile, name: formData.name, mobile: formData.mobile });
            setEditMode(false);
            // Update local storage
            localStorage.setItem('name', formData.name);
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            showToast('Failed to update official identity.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F0F2F5' }}>
            <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: brandColor }} />
            <p className="fw-black text-muted text-uppercase tracking-widest small">Synchronizing Official Identity...</p>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F0F2F5' }}>
            <div className="container" style={{ maxWidth: '1100px', paddingTop: '40px' }}>
                <div className="row g-4">
                    {/* Left Column: Identity Card */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-2xl rounded-0 overflow-hidden bg-white mb-4">
                            <div className="p-5 text-center position-relative mb-0" style={{ background: 'linear-gradient(135deg, #173470 0%, #112652 100%)', borderBottom: '5px solid #FFFFFF30' }}>
                                <div className="d-flex align-items-center justify-content-center mb-4 shadow-premium mx-auto transition-standard hover-scale"
                                    style={{
                                        width: '130px', height: '130px',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '12px',
                                        border: '4px solid rgba(255,255,255,0.4)',
                                        boxShadow: '0 0 40px rgba(0,0,0,0.2)'
                                    }}>
                                    <User size={70} style={{ color: brandColor }} strokeWidth={3} />
                                </div>
                                <h3 className="fw-black mb-1 text-uppercase tracking-wider text-white">{profile?.name || 'WARD OFFICER'}</h3>
                                <div className="d-inline-block px-4 py-2 mt-2 bg-white bg-opacity-20 border border-white border-opacity-20">
                                    <span className="extra-small fw-black tracking-[0.3em] uppercase" style={{ color: '#6366F1' }}>
                                        LEVEL 01 WARD COMMAND OFFICER
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 border-bottom bg-light bg-opacity-50">
                                {!editMode ? (
                                    <button onClick={() => setEditMode(true)} className="btn btn-primary w-100 rounded-0 py-3 fw-black extra-small tracking-widest d-flex align-items-center justify-content-center gap-2 shadow-lg transition-all hover-up-small" style={{ backgroundColor: brandColor }}>
                                        <Edit2 size={16} /> EDIT OFFICIAL IDENTITY
                                    </button>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <button onClick={() => setEditMode(false)} className="btn btn-light rounded-0 px-4 py-3 fw-bold extra-small tracking-widest border border-light shadow-sm">CANCEL</button>
                                        <button onClick={handleSave} disabled={saving} className="btn btn-primary rounded-0 px-4 py-3 fw-black extra-small tracking-widest shadow-lg d-flex align-items-center justify-content-center gap-2 flex-grow-1" style={{ backgroundColor: brandColor }}>
                                            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={16} />} SYNC
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-3 d-block opacity-60">Verification Credentials</label>
                                <div className="d-flex align-items-center gap-3 mb-4 shadow-sm p-3 rounded-0 bg-light bg-opacity-30 border border-light">
                                    <div className="p-2 rounded-0 bg-white shadow-sm text-success">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <div className="extra-small fw-black text-muted uppercase tracking-widest mb-1">Authorization</div>
                                        <div className="small fw-black text-success uppercase">Verivied Officer</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-0 shadow-sm p-3 rounded-0 bg-light bg-opacity-30 border border-light">
                                    <div className="p-2 rounded-0 bg-white shadow-sm text-primary" style={{ color: brandColor }}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="extra-small fw-black text-muted uppercase tracking-widest mb-1">Service Started</div>
                                        <div className="small fw-black text-dark uppercase">Node Active 2024</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-2xl rounded-0 bg-white p-5 mb-4 position-relative overflow-hidden">
                            <h4 className="fw-black text-dark mb-5 text-uppercase tracking-widest d-flex align-items-center gap-3">
                                <div className="p-2 rounded-0 bg-primary bg-opacity-10 text-primary" style={{ color: brandColor }}>
                                    <User size={24} />
                                </div>
                                Administrative Details
                            </h4>

                            <div className="row g-4">
                                {/* NAME (Editable in Edit Mode) */}
                                <div className="col-12">
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-[0.2em] mb-2 d-block px-1">Full Official Name</label>
                                    <input
                                        type="text"
                                        disabled={!editMode}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className={`form-control p-4 rounded-4 border-2 transition-all h3 fw-black p-0 shadow-none text-dark mb-0 uppercase tracking-tight
                                            ${editMode ? 'bg-white border-primary border-opacity-30' : 'bg-light bg-opacity-50 border-transparent text-muted'}
                                        `}
                                        style={editMode ? { borderColor: brandColor, color: '#1E293B' } : {}}
                                    />
                                </div>

                                {/* EMAIL (Read-Only) */}
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-[0.2em] mb-2 d-block px-1">Official Connectivity (Email)</label>
                                    <div className="p-4 rounded-4 bg-light bg-opacity-50 border-2 border-transparent">
                                        <h6 className="fw-black text-dark mb-0 uppercase opacity-60 d-flex align-items-center gap-2">
                                            <Mail size={14} /> {profile?.email}
                                        </h6>
                                    </div>
                                </div>

                                {/* MOBILE (Editable in Edit Mode) */}
                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-[0.2em] mb-2 d-block px-1">Communication Port (Mobile)</label>
                                    <div className={`p-4 rounded-4 border-2 transition-all d-flex align-items-center gap-2
                                        ${editMode ? 'bg-white border-primary border-opacity-30' : 'bg-light bg-opacity-50 border-transparent text-muted'}
                                    `} style={editMode ? { borderColor: brandColor } : {}}>
                                        <Smartphone size={16} className={editMode ? 'text-primary' : 'text-muted'} style={editMode ? { color: brandColor } : {}} />
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
                            </div>
                        </div>

                        {/* Government Assignment Card */}
                        <div className="card border-0 shadow-2xl rounded-0 bg-white p-5 mb-4 border-top border-5" style={{ borderColor: brandColor }}>
                            <h4 className="fw-black text-dark mb-5 text-uppercase tracking-widest d-flex align-items-center gap-3">
                                <div className="p-2 rounded-0 bg-primary bg-opacity-10 text-primary" style={{ color: brandColor }}>
                                    <Building2 size={24} />
                                </div>
                                System Assignment
                            </h4>
                            <div className="p-5 rounded-0 bg-dark position-relative overflow-hidden mb-4" style={{ backgroundColor: '#0F172A' }}>
                                <div className="row g-4 position-relative z-1">
                                    <div className="col-md-6">
                                        <div className="p-4 rounded-0 bg-white shadow-sm">
                                            <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2 d-block">Authorized Ward</label>
                                            <h5 className="fw-black text-dark mb-0 text-uppercase">{profile?.wardName || profile?.wardNumber ? `Ward ${profile.wardNumber}` : 'PMC CENTRAL'}</h5>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-4 rounded-0 bg-white shadow-sm h-100">
                                            <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2 d-block">Designation</label>
                                            <h5 className="fw-black text-dark mb-0">WARD OFFICER</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Vault */}
                        <div className="card border-0 shadow-2xl rounded-0 bg-white p-5 border-top border-5" style={{ borderColor: '#EF4444' }}>
                            <div className="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom border-light">
                                <div className="p-3 rounded-0 bg-danger text-white shadow-lg">
                                    <Key size={24} />
                                </div>
                                <h4 className="fw-black text-dark mb-0 text-uppercase tracking-widest">Security Vault</h4>
                            </div>
                            <div className="p-4 rounded-0 bg-light border border-light shadow-inner d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="p-3 rounded-0 bg-white text-danger shadow-sm">
                                        <Lock size={24} />
                                    </div>
                                    <div>
                                        <h6 className="fw-black text-dark mb-1 text-uppercase tracking-wide">Account Access Security</h6>
                                        <p className="extra-small text-muted fw-bold mb-0 uppercase tracking-widest">ENCRYPTED CREDENTIALS</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPasswordModal(true)} className="btn btn-dark rounded-0 px-5 py-3 fw-black extra-small tracking-widest shadow-lg border-0 transition-all hover-up-small">
                                    CHANGE PASSWORD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <PasswordChangeModal
                    show={showPasswordModal}
                    onHide={() => setShowPasswordModal(false)}
                    onSuccess={() => {
                        setShowPasswordModal(false);
                        showToast('Password updated in secure registry.', 'success');
                    }}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.3em; }
                .tracking-tight { letter-spacing: -0.04em; }
                .tracking-wide { letter-spacing: 0.1em; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
                .shadow-inner { box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-up-small:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2) !important; }
            `}} />
        </div>
    );
};

export default WardOfficerProfile;
