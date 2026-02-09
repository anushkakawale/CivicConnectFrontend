import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Building2, Shield, Loader, MapPin,
    Calendar, Clock, Edit2, Save, X, Lock, Award,
    Activity, ChevronRight, CheckCircle2, AlertCircle, TrendingUp, RefreshCw,
    Signal, Briefcase, Key, ShieldCheck
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { DEPARTMENTS } from '../../constants';
import PasswordChangeModal from '../../components/profile/PasswordChangeModal';

const DepartmentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { showToast } = useToast();
    const brandColor = '#1254AF';

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await apiService.profile.getProfile();
            setProfile(data);
            setFormData({
                name: data.name || '',
                mobile: data.mobile || data.mobileNumber || '',
                email: data.email || ''
            });
        } catch (error) {
            showToast('Could not load profile data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiService.profile.updateName(formData.name);
            // If mobile update is separate, we'd call it here too.
            showToast('Profile updated successfully.', 'success');
            setProfile({ ...profile, ...formData });
            setEditMode(false);
        } catch (error) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getDepartmentInfo = (departmentId) => {
        const dept = DEPARTMENTS.find(d => d.department_id === parseInt(departmentId));
        return dept || { name: profile?.departmentName || 'General Services', icon: '📋', color: '#1254AF' };
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8F9FA' }}>
            <div className="spinner-border text-primary mb-3" style={{ color: brandColor, width: '3rem', height: '3rem' }}></div>
            <p className="fw-black text-primary text-uppercase tracking-widest small">Synchronizing Profile...</p>
        </div>
    );

    const deptInfo = getDepartmentInfo(profile.departmentId);

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F2F5F8' }}>
            <div className="container py-5">
                <div className="row g-4">
                    {/* Left Column: Essential Profile Identity */}
                    <div className="col-lg-4 col-xl-3">
                        <div className="card border-0 shadow-lg rounded-0 overflow-hidden bg-white mb-4">
                            {/* Simple Header Area */}
                            <div className="p-5 text-center position-relative mb-0" style={{ background: 'linear-gradient(135deg, #1254AF 0%, #0A3D82 100%)', borderBottom: '5px solid #FFFFFF30' }}>
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
                                <h3 className="fw-black mb-1 text-uppercase tracking-wider text-white">{profile?.name || 'DEPT OFFICER'}</h3>
                                <div className="d-inline-block px-4 py-2 mt-2 bg-white bg-opacity-20 border border-white border-opacity-20">
                                    <span className="extra-small fw-black tracking-[0.3em] uppercase" style={{ color: '#F97316' }}>
                                        LEVEL 01 DEPARTMENT FIELD OFFICER
                                    </span>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="p-4 text-center border-bottom bg-light bg-opacity-50">
                                {!editMode ? (
                                    <button onClick={() => setEditMode(true)} className="btn btn-primary w-100 rounded-0 py-3 fw-black extra-small tracking-widest d-flex align-items-center justify-content-center gap-2 shadow-lg transition-all hover-up-small" style={{ backgroundColor: brandColor }}>
                                        <Edit2 size={16} /> EDIT PROFILE
                                    </button>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <button onClick={() => setEditMode(false)} className="btn btn-light rounded-0 px-4 py-3 fw-bold extra-small tracking-widest border border-light shadow-sm">CANCEL</button>
                                        <button onClick={handleSave} disabled={saving} className="btn btn-primary rounded-0 px-4 py-3 fw-black extra-small tracking-widest shadow-lg d-flex align-items-center justify-content-center gap-2 flex-grow-1" style={{ backgroundColor: brandColor }}>
                                            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={16} />} SAVE
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Verification Badges Area */}
                            <div className="p-4">
                                <div className="mb-4">
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-3 d-block opacity-60">Account Status</label>
                                    <div className="p-3 rounded-0 bg-light border border-light d-flex align-items-center gap-3 shadow-inner">
                                        <div className="p-2 rounded-0 bg-white text-success shadow-sm">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="mb-0 fw-black text-dark small text-uppercase">Verified Active</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-3 d-block opacity-60">Member Since</label>
                                    <div className="p-3 rounded-0 bg-light border border-light d-flex align-items-center gap-3 shadow-inner">
                                        <div className="p-2 rounded-0 bg-white text-primary shadow-sm" style={{ color: brandColor }}>
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="mb-0 fw-black text-dark small text-uppercase">Joined 2024</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Information Blocks */}
                    <div className="col-lg-8 col-xl-9">
                        {/* PERSONAL DETAILS SECTION */}
                        <div className="card border-0 shadow-lg rounded-0 bg-white p-5 mb-4 position-relative overflow-hidden">
                            <div className="position-absolute top-0 end-0 p-5 mt-5 opacity-5">
                                <User size={150} />
                            </div>
                            <div className="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom border-light">
                                <div className="p-3 rounded-0 bg-dark text-white shadow-lg">
                                    <User size={24} />
                                </div>
                                <h4 className="fw-black text-dark mb-0 text-uppercase tracking-widest">Personal Details</h4>
                            </div>

                            <div className="row g-4 position-relative z-1">
                                <div className="col-md-12">
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-[0.2em] mb-3 d-block px-1">Full Name</label>
                                    <div className={`p-4 rounded-0 transition-all ${editMode ? 'bg-white border-2 border-primary shadow-sm' : 'bg-light bg-opacity-40 border border-light shadow-inner'}`}>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-transparent p-0 fw-bold fs-5 shadow-none text-dark"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        ) : (
                                            <p className="mb-0 fw-bold fs-5 text-dark fw-black">{profile.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-[0.2em] mb-3 d-block px-1">Official Email Address</label>
                                    <div className="p-4 rounded-0 bg-light bg-opacity-40 border border-light shadow-inner d-flex align-items-center gap-3">
                                        <Mail className="text-muted" size={20} />
                                        <p className="mb-0 fw-bold fs-6 text-dark">{profile.email}</p>
                                        <div className="ms-auto">
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 rounded-0 extra-small fw-black px-3 py-1">VERIFIED</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted text-uppercase tracking-[0.2em] mb-3 d-block px-1">Registered Mobile</label>
                                    <div className={`p-4 rounded-0 transition-all d-flex align-items-center ${editMode ? 'bg-white border-2 border-primary shadow-sm' : 'bg-light bg-opacity-40 border border-light shadow-inner'}`}>
                                        <Phone className="text-muted me-3" size={20} />
                                        {editMode ? (
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-transparent p-0 fw-bold fs-6 shadow-none text-dark"
                                                value={formData.mobile}
                                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                            />
                                        ) : (
                                            <>
                                                <p className="mb-0 fw-bold fs-6 text-dark">{profile.mobile || profile.mobileNumber || 'Not provided'}</p>
                                                <button className="ms-auto btn btn-link text-primary text-decoration-none fw-black extra-small tracking-widest p-0 uppercase" style={{ color: brandColor }}>[ Change ]</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* GOVERNMENT CREDENTIALS SECTION */}
                        <div className="card border-0 shadow-lg rounded-0 bg-white p-5 mb-4 border-top border-5" style={{ borderColor: brandColor }}>
                            <div className="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom border-light">
                                <div className="p-3 rounded-0 bg-dark text-white shadow-lg" style={{ backgroundColor: '#1E293B' }}>
                                    <Briefcase size={24} />
                                </div>
                                <h4 className="fw-black text-dark mb-0 text-uppercase tracking-widest">Government Official Credentials</h4>
                            </div>

                            <div className="p-5 rounded-0 bg-dark position-relative overflow-hidden mb-4" style={{ backgroundColor: '#0F172A' }}>
                                <div className="position-absolute start-0 top-0 w-100 h-100 opacity-10 bg-grid-white"></div>
                                <div className="row g-4 position-relative z-1">
                                    <div className="col-md-6">
                                        <div className="p-4 rounded-0 bg-white shadow-sm border border-white border-opacity-10">
                                            <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2 d-block">Official Node ID</label>
                                            <h5 className="fw-black text-dark mb-0">AUTHORISED</h5>
                                            <p className="extra-small text-muted fw-bold uppercase mt-2 mb-0">ID: #{profile.id || profile.userId || 'PMC_OFFICER'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-4 rounded-0 bg-white shadow-sm border border-white border-opacity-10 h-100">
                                            <label className="extra-small fw-black text-muted text-uppercase tracking-widest mb-2 d-block">Jurisdiction / Dept</label>
                                            <h5 className="fw-black text-dark mb-0 uppercase">{deptInfo.name}</h5>
                                            <p className="extra-small text-muted fw-bold uppercase mt-2 mb-0">
                                                Assigned Ward: {profile.wardNumber ? `NO. ${profile.wardNumber} - ` : ''}{profile.wardName || 'PMC AREA'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECURITY VAULT SECTION */}
                        <div className="card border-0 shadow-lg rounded-0 bg-white p-5 border-top border-5" style={{ borderColor: '#EF4444' }}>
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
                                        <p className="extra-small text-muted fw-bold mb-0 uppercase tracking-widest">Last updated 3 months ago</p>
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
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
                .shadow-inner { box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-up-small:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2) !important; }
                .bg-grid-white { background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px); background-size: 20px 20px; }
            `}} />
        </div>
    );
};

export default DepartmentProfile;
