import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import wardOfficerService from '../../services/wardOfficerService';
import apiService from '../../api/apiService';
import {
    UserPlus, AlertCircle, ArrowLeft, Mail, Phone, Lock,
    Shield, Briefcase, MapPin, CheckCircle, Loader, Eye, EyeOff, Check,
    Building2, AtSign, Smartphone, Key, Activity, User, ShieldCheck, Info
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { useToast } from '../../hooks/useToast';
import { useMasterData } from '../../contexts/MasterDataContext';

const RegisterDepartmentOfficer = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { departments: masterDepartments, loading: masterLoading } = useMasterData();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [wardInfo, setWardInfo] = useState(null);
    const [departments, setDepartments] = useState([]);

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use master data if available, otherwise fetch
                if (masterDepartments && masterDepartments.length > 0) {
                    setDepartments(masterDepartments);
                } else {
                    const dRes = await apiService.common.getDepartments();
                    const dData = Array.isArray(dRes) ? dRes : (dRes.data || []);
                    setDepartments(dData);
                }

                // Resolve Ward Info
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const profileRes = await apiService.profile.getProfile();
                    const profile = profileRes.data || profileRes;
                    setWardInfo(profile.ward || user.ward || null);
                }
            } catch (err) {
                console.error('Failed to fetch initial data', err);
            }
        };
        fetchData();
    }, [masterDepartments]);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            departmentId: ''
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Name is too short')
                .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
                .required('Full official name is required'),
            email: Yup.string()
                .email('Invalid email address')
                .required('Official email is required'),
            mobile: Yup.string()
                .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
                .required('Mobile number is required'),
            password: Yup.string()
                .min(8, 'Minimum 8 characters')
                .matches(/[A-Z]/, 'Must contain an uppercase letter')
                .matches(/[0-9]/, 'Must contain a number')
                .matches(/[^A-Za-z0-9]/, 'Must contain a special character')
                .required('Password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Please confirm password'),
            departmentId: Yup.string().required('Department assignment is required')
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const payload = {
                    name: values.name,
                    email: values.email,
                    mobile: values.mobile,
                    password: values.password,
                    departmentId: parseInt(values.departmentId),
                    wardId: wardInfo?.wardId || wardInfo?.id
                };

                await wardOfficerService.registerDepartmentOfficer(payload);
                showToast('Department Officer registered successfully!', 'success');
                setTimeout(() => navigate('/ward-officer/officers'), 2000);
            } catch (err) {
                showToast(err.response?.data?.message || 'Failed to register officer.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    });

    const getPasswordChecklist = () => [
        { label: 'Minimum 8 characters', met: formik.values.password.length >= 8 },
        { label: 'Capitalized character', met: /[A-Z]/.test(formik.values.password) },
        { label: 'Numeric character', met: /[0-9]/.test(formik.values.password) },
        { label: 'Symbolic character', met: /[^A-Za-z0-9]/.test(formik.values.password) }
    ];

    return (
        <div className="admin-enrollment-view min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="Ward Dashboard"
                userName="Add Officer"
                wardName={wardInfo ? `WARD ${wardInfo.wardNumber} - ${wardInfo.areaName}` : 'PMC Ward'}
                subtitle="Register a new officer for your ward"
                icon={UserPlus}
                actions={
                    <button onClick={() => navigate('/ward-officer/dashboard')} className="btn bg-white border shadow-sm rounded-pill px-4 py-1.5 extra-small fw-black tracking-widest text-primary d-flex align-items-center gap-2" style={{ color: PRIMARY_COLOR }}>
                        <ArrowLeft size={16} /> BACK
                    </button>
                }
            />

            <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-30px' }}>
                <div className="row g-5">
                    {/* Enrollment Core */}
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-premium rounded-4 bg-white p-4 p-xl-5 overflow-hidden position-relative">
                            <div className="position-absolute end-0 top-0 p-5 opacity-5"><UserPlus size={150} /></div>

                            <div className="d-flex align-items-center gap-3 mb-5 border-bottom pb-4 position-relative z-1">
                                <div className="rounded-4 d-flex align-items-center justify-content-center text-white p-3 shadow-lg" style={{ backgroundColor: PRIMARY_COLOR }}>
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h5 className="fw-black text-dark mb-1 uppercase">Department Officer</h5>
                                    <p className="extra-small text-muted fw-bold uppercase opacity-60">Register a new officer for {wardInfo ? `WARD ${wardInfo.wardNumber}` : 'your ward'}</p>
                                </div>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="row g-4 position-relative z-1">
                                <div className="col-lg-12">
                                    <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Full Name</label>
                                    <div className={`p-4 rounded-4 transition-all border-2 ${formik.values.name ? 'border-primary bg-white shadow-sm' : 'bg-light border-dashed'}`} style={formik.values.name ? { borderColor: PRIMARY_COLOR } : {}}>
                                        <div className="d-flex align-items-center gap-4">
                                            <User size={20} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} />
                                            <input type="text" {...formik.getFieldProps('name')} className="form-control border-0 bg-transparent fw-black p-0 shadow-none text-dark display-6 h4 mb-0" placeholder="FULL LEGAL NAME" />
                                        </div>
                                    </div>
                                    {formik.touched.name && formik.errors.name && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase tracking-widest">{formik.errors.name}</div>}
                                </div>

                                <div className="col-lg-6">
                                    <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Email Address</label>
                                    <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                                        <span className="input-group-text bg-transparent border-0"><AtSign size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                                        <input type="email" {...formik.getFieldProps('email')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark tracking-widest" placeholder="OFFICIAL@PMC.GOV" />
                                    </div>
                                    {formik.touched.email && formik.errors.email && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase tracking-widest">{formik.errors.email}</div>}
                                </div>

                                <div className="col-lg-6">
                                    <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Phone Number</label>
                                    <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                                        <span className="input-group-text bg-transparent border-0"><Smartphone size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                                        <input type="text" {...formik.getFieldProps('mobile')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark tracking-widest" placeholder="+91 0000 0000" />
                                    </div>
                                    {formik.touched.mobile && formik.errors.mobile && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase tracking-widest">{formik.errors.mobile}</div>}
                                </div>

                                <div className="col-lg-12">
                                    <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Department</label>
                                    <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow animate-slideDown">
                                        <span className="input-group-text bg-transparent border-0"><Building2 size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                                        <select {...formik.getFieldProps('departmentId')} className="form-select border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark tracking-widest">
                                            <option value="">SELECT FUNCTIONAL UNIT</option>
                                            {departments.map(d => (
                                                <option key={d.departmentId || d.id} value={d.departmentId || d.id}>
                                                    {(d.departmentName || d.name || 'Unknown Unit').toUpperCase().replace(/_/g, ' ')} UNIT {wardInfo ? `(WARD ${wardInfo.wardNumber})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formik.touched.departmentId && formik.errors.departmentId && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase tracking-widest">{formik.errors.departmentId}</div>}
                                </div>

                                <div className="col-lg-6">
                                    <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Password</label>
                                    <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                                        <span className="input-group-text bg-transparent border-0"><Lock size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                                        <input type={showPassword ? 'text' : 'password'} {...formik.getFieldProps('password')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark tracking-widest font-monospace" placeholder="••••••••" />
                                        <button type="button" className="btn border-0 py-0" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}</button>
                                    </div>
                                    {formik.touched.password && formik.errors.password && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase tracking-widest">{formik.errors.password}</div>}
                                </div>

                                <div className="col-lg-6">
                                    <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Confirm Password</label>
                                    <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                                        <span className="input-group-text bg-transparent border-0"><Key size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                                        <input type={showPassword ? 'text' : 'password'} {...formik.getFieldProps('confirmPassword')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark tracking-widest font-monospace" placeholder="••••••••" />
                                    </div>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase tracking-widest">{formik.errors.confirmPassword}</div>}
                                </div>

                                {/* Password Analysis Checklist */}
                                <div className="col-12 mt-4">
                                    <div className="p-4 rounded-4 bg-light border-dashed border">
                                        <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-2">
                                            <Activity size={16} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                            <span className="extra-small fw-black text-dark uppercase tracking-widest">Security Validation Checklist</span>
                                        </div>
                                        <div className="row g-3">
                                            {getPasswordChecklist().map((item, i) => (
                                                <div key={i} className="col-sm-6">
                                                    <div className={`d-flex align-items-center gap-2 extra-small fw-black uppercase tracking-widest transition-all ${item.met ? 'text-success' : 'text-muted opacity-40'}`}>
                                                        {item.met ? <CheckCircle size={14} className="text-success" /> : <div style={{ width: 14 }}></div>}
                                                        {item.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 mt-5">
                                    <button type="submit" disabled={isLoading} className="btn btn-primary w-100 py-3 rounded-pill shadow-premium border-0 fw-black extra-small uppercase d-flex align-items-center justify-content-center gap-3 transition-all hover-up" style={{ backgroundColor: PRIMARY_COLOR }}>
                                        {isLoading ? <Loader size={20} className="animate-spin" /> : <><UserPlus size={20} /> REGISTER OFFICER</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Tactical Context */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-premium rounded-4 bg-white p-5 h-100">
                            <div className="d-flex align-items-center gap-3 mb-5">
                                <div className="rounded-circle p-3 bg-light text-primary shadow-sm" style={{ color: PRIMARY_COLOR }}>
                                    <Activity size={24} strokeWidth={2.5} />
                                </div>
                                <h6 className="mb-0 fw-black text-dark uppercase">About Roles</h6>
                            </div>

                            <div className="d-flex flex-column gap-4">
                                {[
                                    { icon: MapPin, title: 'Ward Officer', desc: 'Direct oversight of ward-level infrastructure and citizen concerns.', color: PRIMARY_COLOR },
                                    { icon: Building2, title: 'Department Officer', desc: 'Technical execution of tasks related to specific city departments.', color: '#10B981' },
                                    { icon: Shield, title: 'Secure Access', desc: 'Encrypted login ensures that only authorized staff can access the portal.', color: '#6366F1' }
                                ].map((m, i) => (
                                    <div key={i} className="d-flex gap-4 p-4 rounded-4 bg-light bg-opacity-50 transition-all hover-white-shadow">
                                        <div className="rounded-4 p-3 bg-white shadow-sm flex-shrink-0" style={{ color: m.color }}>
                                            <m.icon size={22} />
                                        </div>
                                        <div>
                                            <div className="extra-small fw-black text-dark uppercase mb-1">{m.title}</div>
                                            <p className="extra-small text-muted fw-bold mb-0 opacity-70 lh-base">{m.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-5 border-top mt-5">
                                <div className="card border-0 bg-primary bg-opacity-10 p-4 rounded-4 position-relative overflow-hidden">
                                    <Activity size={80} className="position-absolute opacity-10" style={{ right: '-20px', bottom: '-20px', color: PRIMARY_COLOR }} />
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <Info size={16} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                                        <span className="extra-small fw-black text-primary uppercase" style={{ color: PRIMARY_COLOR }}>Important Note</span>
                                    </div>
                                    <p className="extra-small fw-bold text-muted mb-0 opacity-80 uppercase">
                                        All registration activities are recorded for system safety and auditing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-enrollment-view { font-family: 'Outfit', 'Inter', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .tracking-tight { letter-spacing: -0.01em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-8px); }
                .hover-white-shadow:hover { background-color: #FFFFFF !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03); }
                .focus-within-shadow:focus-within { border-color: ${PRIMARY_COLOR} !important; box-shadow: 0 0 0 4px ${PRIMARY_COLOR}10; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}} />
        </div>
    );
};

export default RegisterDepartmentOfficer;
