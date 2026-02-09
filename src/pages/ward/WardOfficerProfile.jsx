import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Shield, Edit2, Lock,
    Smartphone, Save, X, Loader, ShieldCheck, ArrowLeft,
    Activity, CheckCircle, Clock, ChevronRight, Key, Award, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import { useToast } from '../../hooks/useToast';
import PasswordChangeModal from '../../components/profile/PasswordChangeModal';


const WardOfficerProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [activeTab, setActiveTab] = useState('identity'); // identity, security, stats

    const [editedProfile, setEditedProfile] = useState({
        name: '',
        email: '',
        mobile: ''
    });

    const brandColor = '#1254AF';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getOfficerProfile();
            setProfile(data);
            setEditedProfile({
                name: data.name || '',
                email: data.email || '',
                mobile: data.mobile || ''
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
            showToast('Failed to load profile data', 'error');
            // Fallback for development
            if (process.env.NODE_ENV === 'development') {
                const mock = {
                    name: 'Ward Officer (Dev)',
                    email: 'ward.officer@example.com',
                    mobile: '9876543210',
                    wardName: 'Pune Ward 04',
                    userId: '772',
                    createdAt: new Date().toISOString(),
                    stats: { totalApprovals: 42, pendingReviews: 12, officersManaged: 8 }
                };
                setProfile(mock);
                setEditedProfile({ name: mock.name, email: mock.email, mobile: mock.mobile });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await profileService.updateOfficerProfile(editedProfile);
            showToast('Profile updated successfully', 'success');
            await fetchProfile();
            setEditing(false);
        } catch (err) {
            showToast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8F9FA' }}>
            <Loader className="animate-spin text-primary mb-4" size={56} style={{ color: brandColor }} />
            <p className="fw-black text-muted text-uppercase tracking-widest small">Loading Profile...</p>
        </div>
    );

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="card border-0 shadow-sm rounded-0 p-4 bg-white h-100 transition-all hover-up-sm border-bottom border-4" style={{ borderColor: color }}>
            <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-0" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                </div>
                <div>
                    <h5 className="fw-black mb-0 text-dark">{value}</h5>
                    <p className="text-muted extra-small fw-bold text-uppercase tracking-widest mb-0">{label}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F0F2F5' }}>
            <div className="container px-4 py-5">
                <div className="row g-4 mb-5">
                    <div className="col-md-4"><StatCard icon={CheckCircle} label="Approvals" value={profile?.stats?.totalApprovals || 0} color="#10B981" /></div>
                    <div className="col-md-4"><StatCard icon={Activity} label="Pending Tasks" value={profile?.stats?.pendingReviews || 0} color="#F59E0B" /></div>
                    <div className="col-md-4"><StatCard icon={User} label="Team Members" value={profile?.stats?.officersManaged || 0} color="#1254AF" /></div>
                </div>

                <div className="row g-4">
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-lg rounded-0 overflow-hidden bg-white p-3">
                            <div className="d-flex flex-column gap-2">
                                {[
                                    { id: 'identity', label: 'My Profile', icon: User },
                                    { id: 'security', label: 'Security Settings', icon: Lock },
                                    { id: 'history', label: 'Account Info', icon: FileText }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`btn w-100 rounded-0 py-3 px-4 text-start d-flex align-items-center justify-content-between transition-all ${activeTab === tab.id ? 'btn-dark shadow-lg' : 'btn-light bg-transparent border-0 text-muted'}`}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <tab.icon size={18} />
                                            <span className="fw-black extra-small tracking-widest uppercase">{tab.label}</span>
                                        </div>
                                        <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-9">
                        {activeTab === 'identity' && (
                            <div className="card border-0 shadow-lg rounded-0 bg-white p-5 animate-fadeIn border-top border-5" style={{ borderColor: brandColor }}>
                                <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
                                    <h5 className="fw-black mb-0 tracking-widest uppercase text-dark">Personal Identity</h5>
                                    {!editing ? (
                                        <button onClick={() => setEditing(true)} className="btn btn-primary rounded-0 px-4 py-2 fw-black extra-small tracking-widest d-flex align-items-center gap-2 shadow-lg" style={{ backgroundColor: brandColor }}>
                                            <Edit2 size={14} /> EDIT INFO
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button onClick={() => setEditing(false)} className="btn btn-light rounded-0 px-4 py-2 fw-black extra-small tracking-widest border">CANCEL</button>
                                            <button onClick={handleSave} disabled={saving} className="btn btn-success rounded-0 px-4 py-2 fw-black extra-small tracking-widest shadow-lg d-flex align-items-center gap-2">
                                                {saving ? 'SAVING...' : <Save size={14} />} SAVE
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="row g-5">
                                    <div className="col-md-6">
                                        <label className="extra-small fw-black text-muted tracking-widest uppercase mb-2 d-block px-1">Legal Name</label>
                                        <div className={`p-4 rounded-0 transition-all ${editing ? 'bg-white border-primary border-2 shadow-sm' : 'bg-light border-light bg-opacity-50'}`}>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-transparent p-0 fw-bold fs-5 shadow-none"
                                                    value={editedProfile.name}
                                                    onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                                />
                                            ) : (
                                                <p className="mb-0 fw-bold fs-5 text-dark">{profile.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small fw-black text-muted tracking-widest uppercase mb-2 d-block px-1">Officer Role</label>
                                        <div className="p-4 rounded-0 bg-light bg-opacity-50 border border-light">
                                            <div className="badge bg-primary rounded-0 px-3 py-1 fw-black extra-small tracking-widest uppercase">Ward Officer</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small fw-black text-muted tracking-widest uppercase mb-2 d-block px-1">Mobile Number</label>
                                        <div className={`p-4 rounded-0 transition-all ${editing ? 'bg-white border-primary border-2 shadow-sm' : 'bg-light border-light bg-opacity-50'}`}>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-transparent p-0 fw-bold fs-5 shadow-none"
                                                    value={editedProfile.mobile}
                                                    onChange={e => setEditedProfile({ ...editedProfile, mobile: e.target.value })}
                                                />
                                            ) : (
                                                <p className="mb-0 fw-bold fs-5 text-dark">{profile.mobile || 'Not set'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="extra-small fw-black text-muted tracking-widest uppercase mb-2 d-block px-1">Email Address</label>
                                        <div className="p-4 rounded-0 bg-light bg-opacity-50 border border-light opacity-75">
                                            <p className="mb-0 fw-bold fs-5 text-dark">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="extra-small fw-black text-muted tracking-widest uppercase mb-2 d-block px-1">Assigned Ward Presence</label>
                                        <div className="p-4 rounded-0 bg-light bg-opacity-50 border border-light">
                                            <div className="d-flex align-items-center gap-4">
                                                <div className="p-3 rounded-0 bg-white shadow-sm text-primary">
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <p className="mb-0 fw-black text-dark fs-5">{profile?.ward?.name || profile?.wardName || 'PMC AREA'}</p>
                                                    <p className="mb-0 extra-small fw-bold text-muted uppercase tracking-widest mt-1">Ward Identifier: <span className="text-primary">#{profile?.ward?.wardId || profile?.wardId || 'N/A'}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="card border-0 shadow-lg rounded-0 bg-white p-5 animate-fadeIn border-top border-5" style={{ borderColor: '#6366F1' }}>
                                <h4 className="fw-black mb-5 tracking-widest uppercase text-dark">Account Security</h4>
                                <div className="p-5 rounded-0 bg-light d-flex flex-column flex-md-row align-items-center gap-5">
                                    <div className="p-4 rounded-0 bg-white shadow-sm" style={{ color: '#6366F1' }}>
                                        <Key size={60} />
                                    </div>
                                    <div className="flex-grow-1 text-center text-md-start">
                                        <h5 className="fw-black text-dark mb-2 uppercase tracking-wide">Account Password</h5>
                                        <p className="text-muted fw-bold mb-4 small">Update your password regularly to keep your account safe.</p>
                                        <button onClick={() => setShowPasswordModal(true)} className="btn btn-dark rounded-0 px-5 py-3 fw-black extra-small tracking-widest shadow-lg transition-all hover-up border-0">
                                            CHANGE PASSWORD
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="card border-0 shadow-lg rounded-0 bg-white p-5 animate-fadeIn border-top border-5" style={{ borderColor: '#10B981' }}>
                                <h4 className="fw-black mb-5 tracking-widest uppercase text-dark">Account Info</h4>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="p-4 rounded-0 bg-light border-start border-5 border-success h-100">
                                            <label className="extra-small fw-black text-muted tracking-widest uppercase mb-1 d-block">Official Status</label>
                                            <div className="badge bg-success rounded-0 px-3 py-1 fw-black extra-small tracking-widest uppercase">STABLE / ACTIVE</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-4 rounded-0 bg-light border-start border-5 border-primary h-100">
                                            <label className="extra-small fw-black text-muted tracking-widest uppercase mb-1 d-block">Join Date</label>
                                            <p className="mb-0 fw-black text-dark">
                                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active Member'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="p-4 rounded-0 bg-light border-start border-5 border-info">
                                            <label className="extra-small fw-black text-muted tracking-widest uppercase mb-1 d-block">Officer Identifier</label>
                                            <p className="mb-0 fw-bold font-monospace">#{profile.userId || profile.id || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <PasswordChangeModal
                    show={showPasswordModal}
                    onHide={() => setShowPasswordModal(false)}
                    onSuccess={() => setShowPasswordModal(false)}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-black { font-weight: 800; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.25em; }
                .tracking-wide { letter-spacing: 0.1em; }
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-up:hover { transform: translateY(-8px); filter: brightness(1.1); }
                .hover-up-sm:hover { transform: translateY(-3px); }
                .border-primary { border-color: ${brandColor} !important; }
            `}} />
        </div>
    );
};

export default WardOfficerProfile;
