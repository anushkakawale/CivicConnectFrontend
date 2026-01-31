/**
 * Ward Officer - Department Officers Directory
 * View and contact department officers
 */

import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Building2, Search, Filter } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import { DEPARTMENTS } from '../../constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const WardOfficerDirectory = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [officers, setOfficers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('ALL');

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const response = await apiService.wardOfficer.getDepartmentOfficers();
            setOfficers(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error('Error fetching department officers:', error);
            showToast('Failed to load department officers', 'error');
            // Mock data for development
            setOfficers([
                {
                    departmentOfficerId: 1,
                    name: 'Priya Sharma',
                    email: 'priya.sharma@civic.gov.in',
                    mobile: '9876543211',
                    departmentId: 1,
                    department: { name: 'Water Supply' }
                },
                {
                    departmentOfficerId: 2,
                    name: 'Amit Patel',
                    email: 'amit.patel@civic.gov.in',
                    mobile: '9876543212',
                    departmentId: 2,
                    department: { name: 'Roads & Infrastructure' }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getDepartmentInfo = (deptId) => {
        const dept = DEPARTMENTS.find(d => d.department_id === parseInt(deptId));
        return dept || { name: 'General', icon: '📋', color: 'secondary' };
    };

    const filteredOfficers = officers.filter(officer => {
        const matchesSearch = officer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            officer.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = filterDepartment === 'ALL' ||
            officer.departmentId === parseInt(filterDepartment);
        return matchesSearch && matchesDepartment;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold mb-1">
                        <Users className="me-2" size={32} />
                        Department Officers Directory
                    </h2>
                    <p className="text-muted">Contact information for all department officers</p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <Search size={18} className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <Filter size={18} className="text-muted" />
                                </span>
                                <select
                                    className="form-select border-start-0"
                                    value={filterDepartment}
                                    onChange={(e) => setFilterDepartment(e.target.value)}
                                >
                                    <option value="ALL">All Departments</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept.department_id} value={dept.department_id}>
                                            {dept.icon} {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Officers Grid */}
            <div className="row g-4">
                {filteredOfficers.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <Building2 size={48} className="text-muted mb-3" />
                                <h5 className="text-muted">No department officers found</h5>
                                <p className="text-muted mb-0">Try adjusting your search or filter criteria</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredOfficers.map((officer) => {
                        const dept = getDepartmentInfo(officer.departmentId);
                        return (
                            <div key={officer.departmentOfficerId} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-sm h-100 hover-shadow" style={{ transition: 'all 0.3s' }}>
                                    <div className={`card-header bg-${dept.color} bg-gradient text-white`}>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                                                <span style={{ fontSize: '1.5rem' }}>{dept.icon}</span>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Department Officer</h6>
                                                <small className="opacity-75">{dept.name}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="fw-bold mb-3">{officer.name}</h5>

                                        <div className="d-flex align-items-center mb-2">
                                            <Mail size={16} className="text-muted me-2" />
                                            <a href={`mailto:${officer.email}`} className="text-decoration-none small">
                                                {officer.email}
                                            </a>
                                        </div>

                                        <div className="d-flex align-items-center mb-3">
                                            <Phone size={16} className="text-muted me-2" />
                                            <a href={`tel:${officer.mobile}`} className="text-decoration-none">
                                                {officer.mobile}
                                            </a>
                                        </div>

                                        <div className="d-grid gap-2">
                                            <a
                                                href={`mailto:${officer.email}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                <Mail size={14} className="me-1" />
                                                Send Email
                                            </a>
                                            <a
                                                href={`tel:${officer.mobile}`}
                                                className="btn btn-outline-success btn-sm"
                                            >
                                                <Phone size={14} className="me-1" />
                                                Call Now
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style jsx>{`
                .hover-shadow:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
            `}</style>
        </div>
    );
};

export default WardOfficerDirectory;
