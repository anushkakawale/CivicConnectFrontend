/**
 * Admin Officer Directory Page
 * View all ward and department officers grouped by Ward
 */

import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Building2, MapPin, ChevronDown, ChevronRight, UserPlus, Info } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { WARDS, DEPARTMENTS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import './AdminOfficerDirectory.css';

const AdminOfficerDirectory = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedWards, setExpandedWards] = useState({});
    const { showToast } = useToast();

    useEffect(() => {
        fetchOfficers();
        // Expand all wards by default
        const initialExpanded = {};
        WARDS.forEach(w => initialExpanded[w.wardId] = true);
        setExpandedWards(initialExpanded);
    }, []);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            // Fetch real officers from API
            const data = await apiService.admin.getAllOfficers();
            setOfficers(data);

            if (data.length === 0) {
                showToast('No officers found. Officers will appear once complaints are assigned.', 'info');
            }
        } catch (error) {
            console.error('Error fetching officers:', error);
            showToast('Failed to load officers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleWard = (wardId) => {
        setExpandedWards(prev => ({
            ...prev,
            [wardId]: !prev[wardId]
        }));
    };

    const getDepartmentName = (id) => {
        const dept = DEPARTMENTS.find(d => d.department_id === id);
        return dept ? dept.name : 'Unknown Dept';
    };

    // Group officers by Ward
    const getWardData = (wardId) => {
        const wardOfficers = officers.filter(o => o.wardId === wardId && o.type === 'WARD_OFFICER');
        const deptOfficers = officers.filter(o => o.wardId === wardId && o.type === 'DEPARTMENT_OFFICER');

        // Filter by search term if active
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            const filterFn = o => o.name.toLowerCase().includes(lowerSearch) || o.email.toLowerCase().includes(lowerSearch);

            // If any officer in this ward matches, show the ward (but only matching officers?)
            // Or if ward name matches?
            // Let's filter the lists.
            return {
                wardOfficers: wardOfficers.filter(filterFn),
                deptOfficers: deptOfficers.filter(filterFn),
                hasMatches: wardOfficers.some(filterFn) || deptOfficers.some(filterFn)
            };
        }

        return { wardOfficers, deptOfficers, hasMatches: true };
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h2 className="fw-bold mb-1">
                                <Shield size={32} className="me-2 text-primary" />
                                Officer Directory
                            </h2>
                            <p className="text-muted mb-0">Manage and view officers across all wards</p>
                        </div>
                        <div className="d-flex gap-2">
                            {/* Admin can only add Ward Officers */}
                            <button className="btn btn-primary" onClick={() => window.location.href = '/admin/register-ward-officer'}>
                                <UserPlus size={18} className="me-2" />
                                Register Ward Officer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-white border-end-0">
                            <Search size={20} className="text-muted" />
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search officers by name, email or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Wards List */}
            <div className="row g-4">
                {WARDS.map(ward => {
                    const { wardOfficers, deptOfficers, hasMatches } = getWardData(ward.wardId);

                    if (!hasMatches && searchTerm) return null;

                    const isExpanded = expandedWards[ward.wardId];

                    return (
                        <div key={ward.wardId} className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div
                                    className="card-header bg-white py-3 clickable-header"
                                    onClick={() => toggleWard(ward.wardId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            {isExpanded ? <ChevronDown size={20} className="me-2 text-muted" /> : <ChevronRight size={20} className="me-2 text-muted" />}
                                            <h5 className="mb-0 fw-bold">Ward {ward.number} - {ward.area_name}</h5>
                                            <span className="badge bg-light text-dark ms-3 border">
                                                {wardOfficers.length + deptOfficers.length} Officers
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="card-body bg-light bg-opacity-10">
                                        {/* Ward Officers Section */}
                                        <div className="mb-4">
                                            <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">
                                                Ward Authority
                                            </h6>
                                            {wardOfficers.length > 0 ? (
                                                <div className="row g-3">
                                                    {wardOfficers.map(officer => (
                                                        <div key={officer.id} className="col-md-6 col-lg-4">
                                                            <div className="card h-100 border-primary border-start border-4 shadow-sm">
                                                                <div className="card-body">
                                                                    <div className="d-flex align-items-start">
                                                                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                                                                            <Shield size={24} className="text-primary" />
                                                                        </div>
                                                                        <div>
                                                                            <h6 className="fw-bold mb-1">{officer.name}</h6>
                                                                            <div className="small text-muted mb-1">{officer.email}</div>
                                                                            <div className="small text-muted">{officer.mobile}</div>
                                                                            <span className="badge bg-primary mt-2">Ward Officer</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="alert alert-warning d-flex align-items-center">
                                                    <Info size={18} className="me-2" />
                                                    No Ward Officer assigned yet.
                                                </div>
                                            )}
                                        </div>

                                        {/* Dept Officers Section */}
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                                <h6 className="text-uppercase text-muted fw-bold small mb-0">
                                                    Department Officers
                                                </h6>
                                                {/* Hint for admin */}
                                                <small className="text-muted fst-italic">
                                                    *Managed by Ward Officer
                                                </small>
                                            </div>

                                            {deptOfficers.length > 0 ? (
                                                <div className="row g-3">
                                                    {deptOfficers.map(officer => (
                                                        <div key={officer.id} className="col-md-6 col-lg-4">
                                                            <div className="card h-100 border-0 shadow-sm">
                                                                <div className="card-body">
                                                                    <div className="d-flex align-items-start">
                                                                        <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                                                                            <Building2 size={24} className="text-success" />
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="fw-bold mb-1">{officer.name}</h6>
                                                                            {/* Department Badge */}
                                                                            <span className="badge bg-light text-success border border-success mb-2">
                                                                                {getDepartmentName(officer.departmentId)}
                                                                            </span>
                                                                            <div className="small text-muted mb-1">{officer.email}</div>
                                                                            <div className="small text-muted">{officer.mobile}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-muted border rounded bg-white border-dashed">
                                                    <Users size={24} className="mb-2 opacity-50" />
                                                    <p className="mb-0 small">No Department Officers found in this ward.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {Object.keys(expandedWards).length === 0 && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOfficerDirectory;
