import React, { useState, useEffect } from 'react';
import {
    Users, Mail, Phone, Building2, MapPin, RefreshCw, AlertCircle,
    User, Shield, Loader, Search, ChevronRight, AtSign, Info, Filter,
    Briefcase, Calendar, Star, MessageSquare, ExternalLink, X, ShieldCheck, Zap, CheckCircle
} from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import DashboardHeader from '../../components/layout/DashboardHeader';

const OfficerDirectory = () => {
    const { showToast } = useToast();
    const [wardOfficer, setWardOfficer] = useState(null);
    const [deptOfficers, setDeptOfficers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filterDepartment, setFilterDepartment] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOfficerId, setSelectedOfficerId] = useState(null);
    const [officerDetail, setOfficerDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const brandColor = '#1254AF';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [wardRes, deptsRes, masterDeptsRes] = await Promise.allSettled([
                apiService.citizen.getWardOfficer(),
                apiService.citizen.getDepartmentOfficers(),
                apiService.masterData.getDepartments()
            ]);

            if (wardRes.status === 'fulfilled') {
                setWardOfficer(wardRes.value.data || wardRes.value);
            }

            if (deptsRes.status === 'fulfilled') {
                setDeptOfficers(deptsRes.value.data || deptsRes.value || []);
            } else {
                setError('Unable to load department contacts.');
            }

            if (masterDeptsRes.status === 'fulfilled') {
                const data = masterDeptsRes.value.data !== undefined ? masterDeptsRes.value.data : masterDeptsRes.value;
                setDepartments(Array.isArray(data) ? data : []);
            }

        } catch (err) {
            setError('Unable to load the directory.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOfficerDetails = async (id) => {
        try {
            setDetailLoading(true);
            setSelectedOfficerId(id);
            const res = await apiService.citizen.getOfficerDetails(id);
            setOfficerDetail(res.data || res);
        } catch (err) {
            showToast('Unable to load profile details.', 'error');
            setSelectedOfficerId(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredDeptOfficers = (Array.isArray(deptOfficers) ? deptOfficers : []).filter(o => {
        const matchesDept = filterDepartment === 'ALL' ||
            o.departmentId?.toString() === filterDepartment ||
            o.department?.departmentId?.toString() === filterDepartment;
        const matchesSearch = !searchTerm ||
            o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDept && matchesSearch;
    });

    if (loading && !wardOfficer && deptOfficers.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary" size={64} style={{ color: brandColor }} />
                <h5 className="fw-bold text-muted mt-4">Loading directory...</h5>
            </div>
        );
    }

    const OfficerCard = ({ officer, isWardOfficer = false }) => (
        <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white p-2`}
            style={{ border: isWardOfficer ? `2px solid ${brandColor}11` : 'none' }}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="position-relative">
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center border border-4 border-white shadow-sm"
                            style={{ width: '70px', height: '70px', backgroundColor: isWardOfficer ? brandColor : '#64748B', fontSize: '1.5rem', fontWeight: '700' }}>
                            {officer.name?.charAt(0)}
                        </div>
                        {isWardOfficer && (
                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white border-2" style={{ width: '18px', height: '18px' }}></div>
                        )}
                    </div>
                    {isWardOfficer && (
                        <div className="badge rounded-pill px-3 py-2 small fw-bold" style={{ backgroundColor: `${brandColor}11`, color: brandColor }}>Ward Officer</div>
                    )}
                </div>

                <h5 className="fw-bold text-dark mb-1">{officer.name}</h5>
                <div className="d-flex align-items-center gap-2 mb-4">
                    <Building2 size={12} className="text-muted" />
                    <span className="small text-muted fw-bold">
                        {isWardOfficer
                            ? `${officer.wardName || 'PMC neighborhood'}`
                            : (officer.departmentName || officer.department?.name || 'Department official')}
                    </span>
                </div>

                <div className="p-3 rounded-4 bg-light bg-opacity-50 border border-white mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <Mail size={14} className="text-muted" />
                        <span className="small text-dark text-truncate">{officer.email}</span>
                    </div>
                    {officer.mobile && (
                        <div className="d-flex align-items-center gap-2">
                            <Phone size={14} className="text-muted" />
                            <span className="small text-dark">{officer.mobile}</span>
                        </div>
                    )}
                </div>

                <div className="d-grid">
                    <button
                        onClick={() => fetchOfficerDetails(officer.userId || officer.id)}
                        className="btn btn-primary rounded-pill py-3 fw-bold small d-flex align-items-center justify-content-center gap-2 shadow-sm border-0"
                        style={{ backgroundColor: brandColor }}
                    >
                        View profile <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC Citizen Portal"
                userName="District officials"
                wardName="Official contacts"
                subtitle="Reach out to the officials responsible for maintaining your neighborhood."
                icon={Users}
            />

            <div className="container" style={{ maxWidth: '1200px', marginTop: '-20px' }}>
                {/* Search & Filter Bar */}
                <div className="card border-0 shadow-sm rounded-4 mb-5 bg-white">
                    <div className="card-body p-4 p-md-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-lg-5">
                                <div className="position-relative">
                                    <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-4 text-muted" />
                                    <input
                                        type="text"
                                        className="form-control ps-5 py-3 rounded-pill border-0 bg-light fw-medium shadow-none"
                                        style={{ paddingLeft: '55px !important' }}
                                        placeholder="Search by name or department..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="d-flex align-items-center gap-3">
                                    <select
                                        className="form-select py-3 rounded-pill border-0 bg-light fw-bold px-4 shadow-none"
                                        value={filterDepartment}
                                        onChange={(e) => setFilterDepartment(e.target.value)}
                                    >
                                        <option value="ALL">All departments</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId} value={d.departmentId}>{d.name || d.departmentName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-3 text-lg-end">
                                <button className="btn btn-white bg-white shadow-sm border-0 rounded-circle p-0" style={{ width: '54px', height: '54px' }} onClick={loadData}>
                                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} style={{ color: brandColor }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-5">
                    {/* Ward Leadership Section */}
                    {wardOfficer && (
                        <div className="col-12 mb-4">
                            <h6 className="small fw-bold text-muted uppercase tracking-wider mb-4 d-flex align-items-center gap-3 opacity-75">
                                <Shield size={16} style={{ color: brandColor }} /> Ward leadership
                            </h6>
                            <div className="row g-4">
                                <div className="col-md-5 col-xl-4">
                                    <OfficerCard officer={wardOfficer} isWardOfficer={true} />
                                </div>
                                <div className="col-md-7 col-xl-8">
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                                        <div className="card-body p-4 p-md-5 d-flex flex-column justify-content-center">
                                            <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                                                <div className="p-3 rounded-4 bg-primary bg-opacity-10" style={{ color: brandColor }}>
                                                    <Briefcase size={28} />
                                                </div>
                                                <div>
                                                    <h4 className="fw-bold text-dark mb-0">Ward Officer Duties</h4>
                                                    <span className="small fw-bold text-muted opacity-60">Primary municipal contact for citizens</span>
                                                </div>
                                            </div>
                                            <p className="text-muted mb-5 lh-lg">
                                                The Ward Officer is your direct link to city services. They manage resources in your neighborhood and ensure that every report you file is handled by the right department and resolved on time.
                                            </p>
                                            <div className="row g-4">
                                                <div className="col-6 col-md-4">
                                                    <div className="p-3 rounded-4 bg-light text-center">
                                                        <Zap size={20} className="text-warning mb-2" />
                                                        <div className="small fw-bold text-dark">Quick Response</div>
                                                    </div>
                                                </div>
                                                <div className="col-6 col-md-4">
                                                    <div className="p-3 rounded-4 bg-light text-center">
                                                        <CheckCircle size={20} className="text-success mb-2" />
                                                        <div className="small fw-bold text-dark">Quality Control</div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <div className="p-3 rounded-4 bg-light text-center">
                                                        <Users size={20} className="text-primary mb-2" />
                                                        <div className="small fw-bold text-dark">Citizen Help</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Department Officials */}
                    <div className="col-12 mt-5">
                        <h6 className="small fw-bold text-muted uppercase tracking-wider mb-4 d-flex align-items-center gap-3 opacity-75">
                            <Building2 size={16} style={{ color: brandColor }} /> Department officials
                        </h6>
                        {filteredDeptOfficers.length === 0 ? (
                            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border-dashed border-2">
                                <Users size={48} className="text-muted opacity-25 mb-3 mx-auto" />
                                <h5 className="fw-bold text-dark mb-2">No officials matching search</h5>
                                <p className="text-muted small fw-bold opacity-50">Try searching for a different name or department.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredDeptOfficers.map((officer) => (
                                    <div key={officer.id || officer.userId} className="col-md-6 col-lg-4">
                                        <OfficerCard officer={officer} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Officer Profile Modal */}
            {(selectedOfficerId || detailLoading) && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000 }}>
                    <div className="position-absolute w-100 h-100 bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }} onClick={() => setSelectedOfficerId(null)}></div>
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative animate-zoomIn" style={{ maxWidth: '500px', width: '90%' }}>
                        {detailLoading ? (
                            <div className="p-5 text-center bg-white">
                                <RefreshCw className="animate-spin text-primary mb-3 mx-auto" size={40} style={{ color: brandColor }} />
                                <h6 className="fw-bold text-muted">Loading profile...</h6>
                            </div>
                        ) : officerDetail && (
                            <>
                                <div className="p-5 text-white position-relative" style={{ background: brandColor }}>
                                    <button onClick={() => setSelectedOfficerId(null)} className="btn btn-link text-white p-0 position-absolute top-0 end-0 m-4 opacity-50"><X size={24} /></button>

                                    <div className="d-flex align-items-center gap-4">
                                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary border border-4 border-white shadow-sm" style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: '700', color: brandColor }}>
                                            {officerDetail.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-1">{officerDetail.name}</h3>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                                <span className="small fw-bold text-white opacity-75">
                                                    {officerDetail.role?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-4 p-md-5 bg-white">
                                    <div className="d-flex align-items-center gap-4 p-4 rounded-4 bg-light mb-5">
                                        <div className="p-3 rounded-circle bg-white shadow-sm text-primary">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <div className="small fw-bold text-muted mb-1 opacity-50">Department / Area</div>
                                            <div className="fw-bold text-dark">
                                                {officerDetail.role === 'WARD_OFFICER'
                                                    ? `${officerDetail.wardName || 'PMC neighborhood'}`
                                                    : `${officerDetail.departmentName || 'City department'}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="small fw-bold text-muted uppercase tracking-wider mb-4 opacity-50">Contact channels</h6>
                                        <div className="d-grid gap-3">
                                            <a href={`mailto:${officerDetail.email}`} className="btn btn-primary rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-3 shadow-sm border-0" style={{ backgroundColor: brandColor }}>
                                                <Mail size={18} /> Send email
                                            </a>
                                            {officerDetail.mobile && (
                                                <a href={`tel:${officerDetail.mobile}`} className="btn btn-light rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-3 border-0 shadow-sm">
                                                    <Phone size={18} /> Call official
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-top text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <ShieldCheck size={18} className="text-success" />
                                            <span className="small fw-bold text-muted">Verified municipal official</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
                .border-dashed { border: 2px dashed #E2E8F0 !important; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}} />
        </div>
    );
};

export default OfficerDirectory;
