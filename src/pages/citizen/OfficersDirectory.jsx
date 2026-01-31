import React, { useState, useEffect } from 'react';
import citizenService from '../../services/citizenService';
import { DEPARTMENTS } from '../../constants';
import { Users, Phone, Mail, Building2, User, Shield, AlertCircle } from 'lucide-react';

const OfficersDirectory = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchOfficers();
    }, []);

    const fetchProfile = async () => {
        try {
            const profileData = await citizenService.getProfile();
            setProfile(profileData);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const response = await citizenService.getWardOfficers();
            const data = Array.isArray(response) ? response : (response?.data || []);
            setOfficers(data);
        } catch (err) {
            setError('Failed to load officers directory');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDepartmentInfo = (departmentId) => {
        const dept = DEPARTMENTS.find(d => d.department_id === parseInt(departmentId));
        return dept || { name: 'General', icon: '📋', color: 'secondary' };
    };

    const groupOfficersByRole = () => {
        const grouped = {
            WARD_OFFICER: [],
            DEPARTMENT_OFFICER: []
        };
        officers.forEach(officer => {
            if (grouped[officer.role]) {
                grouped[officer.role].push(officer);
            }
        });
        return grouped;
    };

    if (loading) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted fw-semibold">Loading officers directory...</p>
                </div>
            </div>
        );
    }

    const groupedOfficers = groupOfficersByRole();

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold mb-1">
                        <Users size={28} className="me-2 text-primary" />
                        Officers Directory
                    </h2>
                    <p className="text-muted mb-0">
                        Contact information for officers in your ward
                        {profile?.wardNumber && (
                            <span className="badge bg-primary ms-2">Ward {profile.wardNumber}</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <AlertCircle size={18} className="me-2" />
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Info Alert */}
            <div className="alert alert-info mb-4">
                <AlertCircle size={18} className="me-2" />
                <strong>Transparency Feature:</strong> This directory shows all officers working in your ward.
                You can contact them directly for urgent matters related to your complaints.
            </div>

            {/* Ward Officers */}
            {groupedOfficers.WARD_OFFICER.length > 0 && (
                <div className="mb-4">
                    <h4 className="fw-bold mb-3">
                        <Shield size={22} className="me-2 text-primary" />
                        Ward Officers
                    </h4>
                    <div className="row g-3">
                        {groupedOfficers.WARD_OFFICER.map((officer, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-start gap-3 mb-3">
                                            <div className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px' }}>
                                                <Shield size={28} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h5 className="fw-bold mb-1">{officer.name}</h5>
                                                <span className="badge bg-primary">Ward Officer</span>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <small className="text-muted d-block mb-1">
                                                <Phone size={14} className="me-1" />
                                                Phone
                                            </small>
                                            <a href={`tel:${officer.mobile}`} className="text-decoration-none fw-semibold">
                                                {officer.mobile}
                                            </a>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block mb-1">
                                                <Mail size={14} className="me-1" />
                                                Email
                                            </small>
                                            <a href={`mailto:${officer.email}`} className="text-decoration-none small">
                                                {officer.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Department Officers */}
            {groupedOfficers.DEPARTMENT_OFFICER.length > 0 && (
                <div>
                    <h4 className="fw-bold mb-3">
                        <Building2 size={22} className="me-2 text-primary" />
                        Department Officers
                    </h4>
                    <div className="row g-3">
                        {groupedOfficers.DEPARTMENT_OFFICER.map((officer, index) => {
                            const dept = getDepartmentInfo(officer.departmentId);
                            return (
                                <div key={index} className="col-md-6 col-lg-4">
                                    <div className="card shadow-sm border-0 h-100">
                                        <div className="card-body">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                                <div className={`bg-${dept.color} bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '56px', height: '56px' }}>
                                                    <User size={28} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h5 className="fw-bold mb-1">{officer.name}</h5>
                                                    <span className={`badge bg-${dept.color}`}>
                                                        {dept.icon} {dept.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <small className="text-muted d-block mb-1">
                                                    <Phone size={14} className="me-1" />
                                                    Phone
                                                </small>
                                                <a href={`tel:${officer.mobile}`} className="text-decoration-none fw-semibold">
                                                    {officer.mobile}
                                                </a>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block mb-1">
                                                    <Mail size={14} className="me-1" />
                                                    Email
                                                </small>
                                                <a href={`mailto:${officer.email}`} className="text-decoration-none small">
                                                    {officer.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {officers.length === 0 && !error && (
                <div className="text-center py-5">
                    <Users size={48} className="text-muted mb-3 opacity-50" />
                    <h5 className="text-muted">No officers found</h5>
                    <p className="text-muted mb-0">
                        No officers have been assigned to your ward yet
                    </p>
                </div>
            )}

            {/* Statistics */}
            {officers.length > 0 && (
                <div className="row mt-4">
                    <div className="col-md-4">
                        <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                                <h3 className="mb-0 text-primary">{officers.length}</h3>
                                <small className="text-muted">Total Officers</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                                <h3 className="mb-0 text-success">{groupedOfficers.WARD_OFFICER.length}</h3>
                                <small className="text-muted">Ward Officers</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                                <h3 className="mb-0 text-info">{groupedOfficers.DEPARTMENT_OFFICER.length}</h3>
                                <small className="text-muted">Department Officers</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficersDirectory;
