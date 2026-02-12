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
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        wardId: ''
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

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileRes, wardsRes] = await Promise.all([
                apiService.profile.getProfile(),
                apiService.masterData.getWards()
            ]);

            const rawData = profileRes.data || profileRes;
            const data = {
                ...rawData,
                role: rawData.role?.replace('ROLE_', '')
            };

            setProfile(data);
            setWards(wardsRes.data || wardsRes || []);
            setFormData({
                name: data.name || '',
                mobile: data.mobile || '',
                address: data.addressLine1 || '',
                wardId: data.wardId || ''
            });
        } catch (error) {
            console.error('Data sync failed:', error);
            showToast('Operational Feed Error: Profile synchronization failed.', 'error');
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
                promises.push(apiService.profile.citizenUpdateAddress({
                    addressLine1: formData.address,
                    city: 'Pune', // Default for this context
                    pincode: profile.pincode || ''
                }));
            }
            if (formData.wardId !== profile.wardId) {
                promises.push(apiService.profile.citizenUpdateWard({ wardId: formData.wardId }));
            }

            if (promises.length > 0) {
                await Promise.all(promises);
                showToast('Operational Profile Synchronized', 'success');
                if (formData.name !== profile.name) localStorage.setItem('name', formData.name);
            }

            setEditMode(false);
            loadData();
        } catch (error) {
            console.error('Sync failed:', error);
            showToast('Failed to commit profile changes.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showToast('Security fields required.', 'warning');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Credential mismatch.', 'error');
            return;
        }
        try {
            setSaving(true);
            await apiService.profile.updatePassword(passwordData.currentPassword, passwordData.newPassword);
            showToast('Security credentials updated.', 'success');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast('Current credential verification failed.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
            <Activity className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
            <p className="fw-black text-muted text-uppercase tracking-[0.2em] extra-small">Synchronizing Personnel Ledger...</p>
        </div>
    );

    return (
        <div className="citizen-profile min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="CITIZEN COMMAND"
                userName="PERSONNEL REGISTRY"
                wardName={profile?.wardName || "LOCAL SECTOR"}
                subtitle="Secure management of citizen identity and tactical operational data"
                icon={User}
            />

            <div className="container-fluid px-5" style={{ marginTop: '-40px' }}>
                <div className="row g-5">
                    {/* Personnel Identification */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-premium rounded-5 bg-white overflow-hidden mb-4 border-top border-5" style={{ borderColor: PRIMARY_COLOR }}>
                            <div className="p-5 text-center position-relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
                                <div className="strategic-grid opacity-10 position-absolute w-100 h-100 top-0 start-0"></div>
                                <Shield size={140} className="position-absolute text-white opacity-5" style={{ right: '-30px', bottom: '-40px' }} />
                                <div className="d-inline-flex p-3 rounded-circle bg-white bg-opacity-5 mb-4 mx-auto shadow-lg border border-white border-opacity-10 position-relative">
                                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center text-dark display-4 fw-black shadow-inner" style={{ width: '100px', height: '100px' }}>
                                        {profile?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-4 border-dark p-1 translate-middle-x">
                                        <ShieldCheck size={20} className="text-white" />
                                    </div>
                                </div>
                                <h3 className="fw-black text-white mb-2 uppercase tracking-tight">{profile?.name}</h3>
                                <div className="badge bg-primary text-white rounded-pill px-4 py-2 extra-small fw-black tracking-[0.2em] border border-white border-opacity-20 shadow-lg">
                                    VERIFIED CITIZEN
                                </div>
                            </div>
                            <div className="p-5 bg-white">
                                <div className="d-flex flex-column gap-4">
                                    <div className={`p-4 rounded-5 border-2 transition-standard ${!profile?.wardId ? 'border-warning bg-warning bg-opacity-5 anim-pulse' : 'border-dashed bg-light bg-opacity-30'}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <p className="extra-small fw-black text-muted uppercase tracking-widest opacity-60 m-0">Legislative Sector</p>
                                            {!profile?.wardId && <Zap size={14} className="text-warning" />}
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <Building2 size={20} className={!profile?.wardId ? 'text-warning' : 'text-primary'} style={profile?.wardId ? { color: PRIMARY_COLOR } : {}} />
                                            <div>
                                                <h6 className="fw-black mb-0 text-dark uppercase tracking-widest">
                                                    {profile?.wardName || (profile?.wardId ? `Sector ${profile.wardId}` : 'PENDING ASSIGNMENT')}
                                                </h6>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-light bg-opacity-30 rounded-5 border border-dashed border-2">
                                        <p className="extra-small fw-black text-muted mb-2 uppercase tracking-widest opacity-60 m-0">Master District</p>
                                        <div className="d-flex align-items-center gap-3">
                                            <Map size={20} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                            <h6 className="fw-black mb-0 text-dark uppercase tracking-widest">{profile?.city || 'PMC CENTRAL'}</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <button onClick={() => setShowPasswordModal(true)} className="btn btn-dark w-100 py-4 rounded-5 fw-black extra-small tracking-[0.2em] transition-standard hover-up-tiny d-flex align-items-center justify-content-center gap-3 shadow-lg border-0">
                                        <Key size={18} /> ROTATE SECURITY KEYS
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-5 bg-white shadow-premium border-start border-5 border-info transition-standard hover-up-tiny mt-4 d-flex align-items-start gap-4">
                            <div className="p-3 bg-light border shadow-inner rounded-circle text-info">
                                <Info size={24} />
                            </div>
                            <div>
                                <h6 className="fw-black text-dark mb-1 uppercase tracking-widest">REGISTRY NOTICE</h6>
                                <p className="extra-small text-muted fw-bold mb-0 opacity-60 uppercase tracking-widest lh-lg">Personnel data is cryptographically secured. Changes require administrative verification.</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Registry Data */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-premium bg-white p-5 rounded-5 h-100 border-top border-5" style={{ borderColor: PRIMARY_COLOR }}>
                            <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-5">
                                <div>
                                    <h4 className="fw-black text-dark mb-1 uppercase tracking-tight">Personnel Protocols</h4>
                                    <p className="extra-small text-muted fw-black uppercase tracking-widest opacity-40">Operational parameters for individual citizen identification</p>
                                </div>
                                <div className="d-flex gap-3">
                                    {!editMode ? (
                                        <button onClick={() => setEditMode(true)} className="btn bg-white text-dark px-5 py-3 extra-small fw-black tracking-widest border-2 shadow-sm transition-standard hover-up-tiny rounded-pill d-flex align-items-center gap-3">
                                            <Edit2 size={16} style={{ color: PRIMARY_COLOR }} /> INITIALIZE OVERRIDE
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-3">
                                            <button onClick={() => setEditMode(false)} className="btn btn-light px-4 py-3 extra-small fw-black tracking-widest rounded-pill border-2">ABORT</button>
                                            <button onClick={handleSave} disabled={saving} className="btn btn-primary px-5 py-3 extra-small fw-black tracking-widest shadow-lg border-0 d-flex align-items-center gap-3 rounded-pill" style={{ backgroundColor: PRIMARY_COLOR }}>
                                                {saving ? 'COMMITTING...' : <><Save size={16} /> COMMIT SYNC</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="row g-5">
                                <div className="col-12">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60 d-block">Legal Identification Moniker</label>
                                    <div className={`p-4 rounded-4 border-2 transition-standard d-flex align-items-center gap-4
                                        ${editMode ? 'bg-white border-primary border-opacity-40 shadow-inner' : 'bg-light bg-opacity-30 border-transparent'}
                                    `} style={editMode ? { borderColor: PRIMARY_COLOR } : {}}>
                                        <User size={20} className={editMode ? 'text-primary' : 'text-muted'} style={editMode ? { color: PRIMARY_COLOR } : {}} />
                                        <input
                                            type="text"
                                            disabled={!editMode}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="form-control border-0 bg-transparent fw-black p-0 shadow-none text-dark display-6 m-0 uppercase tracking-tight"
                                            placeholder="UNREGISTERED_ENTITY"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60 d-block">Digital Comm-Port</label>
                                    <div className="p-4 rounded-4 bg-light bg-opacity-30 border-2 border-transparent d-flex align-items-center gap-4 shadow-inner">
                                        <Mail size={18} className="text-muted opacity-40" />
                                        <h6 className="fw-black text-dark mb-0 uppercase opacity-60 text-truncate tracking-wider">{profile?.email}</h6>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60 d-block">Mobile Link Frequency</label>
                                    <div className={`p-4 rounded-4 border-2 transition-standard d-flex align-items-center gap-4
                                        ${editMode ? 'bg-white border-primary border-opacity-40 shadow-inner' : 'bg-light bg-opacity-30 border-transparent'}
                                    `} style={editMode ? { borderColor: PRIMARY_COLOR } : {}}>
                                        <Smartphone size={18} className={editMode ? 'text-primary' : 'text-muted'} style={editMode ? { color: PRIMARY_COLOR } : {}} />
                                        <input
                                            type="tel"
                                            disabled={!editMode}
                                            value={formData.mobile}
                                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                            className="form-control border-0 bg-transparent fw-black p-0 shadow-none text-dark h6 m-0 tracking-widest"
                                            placeholder="NODE_CONNECTION_MISSING"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60 d-block">Administrative Sector Assignment</label>
                                    <div className={`p-4 rounded-4 border-2 transition-standard d-flex align-items-center gap-4
                                        ${editMode ? 'bg-white border-primary border-opacity-40 shadow-inner' : 'bg-primary bg-opacity-5 border-transparent'}
                                    `} style={editMode ? { borderColor: PRIMARY_COLOR } : {}}>
                                        <MapPin size={18} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                        {editMode ? (
                                            <select
                                                className="form-select border-0 bg-transparent fw-black p-0 shadow-none text-dark h6 m-0 tracking-widest"
                                                value={formData.wardId}
                                                onChange={e => setFormData({ ...formData, wardId: e.target.value })}
                                            >
                                                <option value="">-- SELECT SECTOR --</option>
                                                {wards.map(w => <option key={w.wardId} value={w.wardId}>SECTOR {w.wardNumber || w.wardId}: {w.wardName.toUpperCase()}</option>)}
                                            </select>
                                        ) : (
                                            <h6 className="fw-black text-primary mb-0 uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>
                                                {profile?.wardName?.toUpperCase() || (profile?.wardId ? `SECTOR ${profile.wardId}` : 'NOT_ASSIGNED')}
                                            </h6>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60 d-block">Security Clearance Status</label>
                                    <div className="p-4 rounded-4 bg-primary bg-opacity-10 border-2 border-transparent d-flex align-items-center gap-4">
                                        <ShieldCheck size={18} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                        <h6 className="fw-black text-primary mb-0 uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>COMMAND_LEVEL_VERIFIED</h6>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-3 opacity-60 d-block">Primary Operational Host Address</label>
                                    <div className={`p-4 rounded-4 border-2 transition-standard d-flex align-items-start gap-4
                                        ${editMode ? 'bg-white border-primary border-opacity-40 shadow-inner' : 'bg-light bg-opacity-30 border-transparent'}
                                    `} style={editMode ? { borderColor: PRIMARY_COLOR } : {}}>
                                        <Map size={18} className={`mt-1 ${editMode ? 'text-primary' : 'text-muted'}`} style={editMode ? { color: PRIMARY_COLOR } : {}} />
                                        <textarea
                                            disabled={!editMode}
                                            rows="3"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="form-control border-0 bg-transparent fw-black p-0 shadow-none text-dark h6 m-0 tracking-widest lh-base"
                                            placeholder="ENTER FULL COORDINATES FOR DISPATCH COMPLIANCE"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Key Vault Modal */}
            {showPasswordModal && (
                <div className="password-modal-overlay">
                    <div className="card border-0 shadow-premium-lg rounded-5 overflow-hidden animate-zoomIn bg-white" style={{ maxWidth: '500px', width: '90%' }}>
                        <div className="p-5 text-center text-white" style={{ backgroundColor: '#0f172a' }}>
                            <div className="bg-white bg-opacity-10 rounded-pill d-inline-flex p-4 mb-4 border border-white border-opacity-10 anim-float">
                                <Key size={48} className="text-white" />
                            </div>
                            <h3 className="fw-black mb-1 uppercase tracking-tight">Security Vault</h3>
                            <p className="extra-small fw-black opacity-60 uppercase tracking-widest m-0">Synchronizing Key mutation</p>
                        </div>
                        <div className="card-body p-5">
                            <div className="mb-4">
                                <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-60">Authentication Key</label>
                                <div className="position-relative">
                                    <input type={showPasswords.current ? 'text' : 'password'} value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="form-control rounded-4 border-0 bg-light py-4 px-4 shadow-inner fw-black extra-small tracking-widest" placeholder="••••••••" />
                                    <button onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none">
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="row g-4 mb-4">
                                <div className="col-12">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-60">New Master Key</label>
                                    <div className="position-relative">
                                        <input type={showPasswords.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-control rounded-4 border-0 bg-light py-4 px-4 shadow-inner fw-black extra-small tracking-widest" placeholder="••••••••" />
                                        <button onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none">
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-2 d-block opacity-60">Confirm Key Mutation</label>
                                    <div className="position-relative">
                                        <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-control rounded-4 border-0 bg-light py-4 px-4 shadow-inner fw-black extra-small tracking-widest" placeholder="••••••••" />
                                        <button onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted shadow-none">
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="d-grid gap-3 mt-5">
                                <button className="btn btn-primary py-4 w-100 fw-black extra-small tracking-widest text-white shadow-premium border-0 rounded-pill" onClick={handleChangePassword} disabled={saving} style={{ backgroundColor: PRIMARY_COLOR }}>
                                    {saving ? 'UPDATING VAULT...' : 'CONFIRM SYNC'}
                                </button>
                                <button className="btn btn-light py-3 w-100 fw-black extra-small tracking-widest rounded-pill border-2" onClick={() => setShowPasswordModal(false)}>ABORT MISSION</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .citizen-profile { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 950; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .shadow-premium { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08), 0 5px 20px -5px rgba(0,0,0,0.03); }
                .shadow-premium-lg { box-shadow: 0 25px 60px -12px rgba(0,0,0,0.2); }
                .transition-standard { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up-tiny:hover { transform: translateY(-5px); }
                .password-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(15px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes zoomIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-spin { animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .anim-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; border-color: rgba(255, 193, 7, 1); shadow: 0 0 15px rgba(255, 193, 7, 0.3); } 50% { opacity: 0.7; border-color: rgba(255, 193, 7, 0.4); } }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
                .strategic-grid { background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; }
            `}} />
        </div>
    );
};

export default CitizenProfile;
