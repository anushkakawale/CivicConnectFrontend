/**
 * 🏛️ Professional Admin Personnel Enrollment Console
 * State-of-the-art UI for registering and authenticating city-wide operatives.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Shield,
  MapPin, Building2, RefreshCw, UserPlus, ArrowRight,
  Zap, HardDrive, Key, UserCheck, Activity, Info,
  CheckCircle2, XCircle, ShieldCheck, Smartphone, AtSign
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';

const AdminWardOfficerRegistration = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [officerType, setOfficerType] = useState('WARD'); // WARD or DEPARTMENT
  const PRIMARY_COLOR = '#173470';

  // Master Data
  const [wards, setWards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fetchingMaster, setFetchingMaster] = useState(true);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [wRes, dRes] = await Promise.all([
          apiService.common.getWards(),
          apiService.common.getDepartments()
        ]);
        setWards(wRes.data || wRes || []);
        setDepartments(dRes.data || dRes || []);
      } catch (err) {
        console.error('Master data sync failed:', err);
      } finally {
        setFetchingMaster(false);
      }
    };
    fetchMaster();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      mobile: '',
      wardId: '',
      departmentId: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Legal name is mandatory'),
      email: Yup.string().email('Invalid email protocol').required('Official email required'),
      mobile: Yup.string().matches(/^[0-9]{10}$/, '10-digit mobile required').required('Contact number required'),
      wardId: officerType === 'WARD' ? Yup.string().required('Ward assignment required') : Yup.string(),
      departmentId: officerType === 'DEPARTMENT' ? Yup.string().required('Functional unit required') : Yup.string(),
      password: Yup.string()
        .min(8, 'Security key must be at least 8 characters')
        .matches(/[A-Z]/, 'Requires 1 uppercase character')
        .matches(/[0-9]/, 'Requires 1 numeric character')
        .matches(/[^A-Za-z0-9]/, 'Requires 1 special character')
        .required('Security access key required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Access keys do not match')
        .required('Identity verification required')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          name: values.name,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          role: officerType === 'WARD' ? 'WARD_OFFICER' : 'DEPARTMENT_OFFICER',
          wardId: officerType === 'WARD' || officerType === 'DEPARTMENT' ? Number(values.wardId) : undefined,
          departmentId: officerType === 'DEPARTMENT' ? Number(values.departmentId) : undefined
        };

        // Note: For Department officers, we still typically need a Ward assignment in the architecture
        if (officerType === 'DEPARTMENT' && !values.wardId) {
          showToast('Department operatives must be assigned to an administrative ward', 'warning');
          setLoading(false);
          return;
        }

        await apiService.admin.registerOfficer(payload);
        showToast(`Operative ${values.name} successfully enrolled in the system`, 'success');
        formik.resetForm();
        setTimeout(() => navigate('/admin/officers'), 1500);
      } catch (error) {
        showToast(error.response?.data?.message || 'Enrollment rejected: Security validation failed', 'error');
      } finally {
        setLoading(false);
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
        portalName="Register Officer"
        userName="Add New Staff"
        wardName="Admin Control"
        subtitle="Register new ward and department officers to the system"
        icon={UserPlus}
        actions={
          <div className="bg-white p-1 rounded-pill shadow-sm border d-flex gap-1">
            {['WARD', 'DEPARTMENT'].map(type => (
              <button
                key={type}
                onClick={() => { setOfficerType(type); formik.resetForm(); }}
                className={`btn rounded-pill px-4 py-1.5 extra-small fw-black transition-all ${officerType === type ? 'bg-primary text-white shadow-sm' : 'text-muted opacity-60'}`}
                style={officerType === type ? { backgroundColor: PRIMARY_COLOR } : {}}
              >
                {type} OFFICER
              </button>
            ))}
          </div>
        }
      />

      <div className="container-fluid px-3 px-lg-5" style={{ marginTop: '-30px' }}>
        <div className="row g-5">
          {/* Enrollment Core */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-premium rounded-4 bg-white p-4 p-xl-5 overflow-hidden position-relative">
              <div className="position-absolute end-0 top-0 p-5 opacity-5"><ShieldCheck size={180} /></div>

              <div className="d-flex align-items-center gap-3 mb-5 border-bottom pb-4 position-relative z-1">
                <div className="rounded-4 d-flex align-items-center justify-content-center text-white p-3 shadow-lg" style={{ backgroundColor: PRIMARY_COLOR }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h5 className="fw-black text-dark mb-1 uppercase">Officer Details</h5>
                  <p className="extra-small text-muted fw-bold uppercase opacity-60">Complete the form to register a new {officerType.toLowerCase()} officer</p>
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
                  {formik.touched.name && formik.errors.name && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase">{formik.errors.name}</div>}
                </div>

                <div className="col-lg-6">
                  <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Email Address</label>
                  <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                    <span className="input-group-text bg-transparent border-0"><AtSign size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                    <input type="email" {...formik.getFieldProps('email')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark" placeholder="OFFICIAL@PMC.GOV" />
                  </div>
                  {formik.touched.email && formik.errors.email && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase">{formik.errors.email}</div>}
                </div>

                <div className="col-lg-6">
                  <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Phone Number</label>
                  <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                    <span className="input-group-text bg-transparent border-0"><Smartphone size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                    <input type="text" {...formik.getFieldProps('mobile')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark" placeholder="+91 0000 0000" />
                  </div>
                  {formik.touched.mobile && formik.errors.mobile && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase">{formik.errors.mobile}</div>}
                </div>

                <div className="col-lg-6">
                  <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Assign Ward</label>
                  <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                    <span className="input-group-text bg-transparent border-0"><MapPin size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                    <select {...formik.getFieldProps('wardId')} className="form-select border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark">
                      <option value="">SELECT JURISDICTION</option>
                      {wards.map(w => (
                        <option key={w.wardId || w.id} value={w.wardId || w.id}>
                          WARD {w.wardNumber || (w.wardId || w.id)} - {w.areaName?.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formik.touched.wardId && formik.errors.wardId && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase">{formik.errors.wardId}</div>}
                </div>

                {officerType === 'DEPARTMENT' && (
                  <div className="col-lg-6">
                    <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Assign Department</label>
                    <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow animate-slideDown">
                      <span className="input-group-text bg-transparent border-0"><Building2 size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                      <select {...formik.getFieldProps('departmentId')} className="form-select border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark">
                        <option value="">SELECT FUNCTIONAL UNIT</option>
                        {departments.map(d => {
                          const selectedWard = wards.find(w => (w.wardId || w.id) == formik.values.wardId);
                          const deptName = d.departmentName || d.name || 'Unknown Department';
                          return (
                            <option key={d.departmentId || d.id} value={d.departmentId || d.id}>
                              {deptName.toUpperCase().replace(/_/g, ' ')} UNIT {selectedWard ? `(WARD ${selectedWard.wardNumber || selectedWard.id})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {formik.touched.departmentId && formik.errors.departmentId && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase">{formik.errors.departmentId}</div>}
                  </div>
                )}

                <div className="col-lg-6">
                  <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Password</label>
                  <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                    <span className="input-group-text bg-transparent border-0"><Lock size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                    <input type={showPassword ? 'text' : 'password'} {...formik.getFieldProps('password')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark font-monospace" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-link text-muted border-0 shadow-none">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="col-lg-6">
                  <label className="extra-small fw-black text-muted uppercase mb-3 d-block opacity-60">Confirm Password</label>
                  <div className="input-group border bg-light bg-opacity-50 rounded-4 px-3 overflow-hidden transition-all focus-within-shadow">
                    <span className="input-group-text bg-transparent border-0"><Key size={18} className="text-primary opacity-40" style={{ color: PRIMARY_COLOR }} /></span>
                    <input type={showPassword ? 'text' : 'password'} {...formik.getFieldProps('confirmPassword')} className="form-control border-0 bg-transparent py-3 extra-small fw-black shadow-none text-dark font-monospace" placeholder="••••••••" />
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="extra-small text-danger fw-black mt-2 ps-2 uppercase">{formik.errors.confirmPassword}</div>}
                </div>

                {/* Password Analysis Checklist */}
                <div className="col-12 mt-4">
                  <div className="p-4 rounded-4 bg-light border-dashed border">
                    <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-2">
                      <Activity size={16} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                      <span className="extra-small fw-black text-dark uppercase">Password Requirements</span>
                    </div>
                    <div className="row g-3">
                      {getPasswordChecklist().map((item, i) => (
                        <div key={i} className="col-sm-6">
                          <div className={`d-flex align-items-center gap-2 extra-small fw-black uppercase transition-all ${item.met ? 'text-success' : 'text-muted opacity-40'}`}>
                            {item.met ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-5">
                  <button type="submit" disabled={loading} className="btn btn-primary w-100 py-3 rounded-pill shadow-premium border-0 fw-black extra-small uppercase d-flex align-items-center justify-content-center gap-3 transition-all hover-up" style={{ backgroundColor: PRIMARY_COLOR }}>
                    {loading ? <RefreshCw size={20} className="animate-spin" /> : <><UserPlus size={20} /> REGISTER OFFICER</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tactical Context */}
          <div className="col-lg-5">
            <div className="row g-4 h-100">
              <div className="col-12">
                <div className="card border-0 shadow-premium rounded-4 bg-white p-5 h-100">
                  <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="rounded-circle p-3 bg-light text-primary shadow-sm" style={{ color: PRIMARY_COLOR }}>
                      <Activity size={24} strokeWidth={2.5} />
                    </div>
                    <h6 className="mb-0 fw-black text-dark uppercase">Role Descriptions</h6>
                  </div>

                  <div className="d-flex flex-column gap-4">
                    {[
                      { icon: MapPin, title: 'Ward Officer', desc: 'Manages all issues and staff within a specific ward area.', color: PRIMARY_COLOR },
                      { icon: Building2, title: 'Department Officer', desc: 'Handles specialized tasks like water or electricity within a ward.', color: '#10B981' },
                      { icon: Shield, title: 'Secure Access', desc: 'Ensures all officer data and communication remains private and secure.', color: '#6366F1' }
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
                      <Zap size={80} className="position-absolute opacity-10" style={{ right: '-20px', bottom: '-20px', color: PRIMARY_COLOR }} />
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <Info size={16} className="text-primary" style={{ color: PRIMARY_COLOR }} />
                        <span className="extra-small fw-black text-primary uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>Important Note</span>
                      </div>
                      <p className="extra-small fw-bold text-muted mb-0 opacity-80 uppercase tracking-tight">
                        All registration activities are recorded for system safety and auditing.
                      </p>
                    </div>
                  </div>
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

export default AdminWardOfficerRegistration;
