import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Building, Award, TrendingUp } from 'lucide-react';
import apiService from '../../api/apiService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { DEPARTMENTS } from '../../constants';

const DepartmentOfficersManagement = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDepartment, setFilterDepartment] = useState('all');

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        try {
            setLoading(true);
            const response = await apiService.wardOfficer.getDepartmentOfficers();
            setOfficers(response.data || response || []);
        } catch (error) {
            console.error('Error fetching officers:', error);
            setOfficers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOfficers = filterDepartment === 'all'
        ? officers
        : officers.filter(officer => officer.department?.departmentId === parseInt(filterDepartment));

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-3">
                        <Users className="me-2" size={32} />
                        Department Officers
                    </h2>
                    <p className="text-muted">
                        Manage and monitor department officers in your ward
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Total Officers</p>
                                    <h3 className="mb-0">{officers.length}</h3>
                                </div>
                                <Users size={40} className="text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Active</p>
                                    <h3 className="mb-0 text-success">
                                        {officers.filter(o => o.isActive).length}
                                    </h3>
                                </div>
                                <Award size={40} className="text-success opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Departments</p>
                                    <h3 className="mb-0">{DEPARTMENTS.length}</h3>
                                </div>
                                <Building size={40} className="text-info opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1">Avg. Workload</p>
                                    <h3 className="mb-0">
                                        {officers.length > 0
                                            ? Math.round(officers.reduce((sum, o) => sum + (o.assignedComplaints || 0), 0) / officers.length)
                                            : 0
                                        }
                                    </h3>
                                </div>
                                <TrendingUp size={40} className="text-warning opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                    >
                        <option value="all">All Departments</option>
                        {DEPARTMENTS.map(dept => (
                            <option key={dept.department_id} value={dept.department_id}>
                                {dept.icon} {dept.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Officers List */}
            <div className="row">
                {filteredOfficers.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <Users size={64} className="text-muted mb-3" />
                                <h5>No officers found</h5>
                                <p className="text-muted">
                                    {filterDepartment === 'all'
                                        ? 'No department officers registered yet.'
                                        : 'No officers found for the selected department.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredOfficers.map(officer => (
                        <div key={officer.userId} className="col-md-6 col-lg-4 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h5 className="mb-1">{officer.name}</h5>
                                            <span className={`badge bg-${officer.isActive ? 'success' : 'secondary'}`}>
                                                {officer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-muted d-block">Workload</small>
                                            <h4 className="mb-0 text-primary">{officer.assignedComplaints || 0}</h4>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <Building size={16} className="text-muted me-2" />
                                        <strong>{officer.department?.name || 'Not assigned'}</strong>
                                    </div>

                                    <div className="mb-2">
                                        <Mail size={16} className="text-muted me-2" />
                                        <small>{officer.email}</small>
                                    </div>

                                    <div className="mb-3">
                                        <Phone size={16} className="text-muted me-2" />
                                        <small>{officer.mobile || 'Not provided'}</small>
                                    </div>

                                    {officer.assignedComplaints > 0 && (
                                        <div className="mt-3 pt-3 border-top">
                                            <div className="row text-center">
                                                <div className="col-4">
                                                    <small className="text-muted d-block">Pending</small>
                                                    <strong className="text-warning">{officer.pendingCount || 0}</strong>
                                                </div>
                                                <div className="col-4">
                                                    <small className="text-muted d-block">In Progress</small>
                                                    <strong className="text-info">{officer.inProgressCount || 0}</strong>
                                                </div>
                                                <div className="col-4">
                                                    <small className="text-muted d-block">Resolved</small>
                                                    <strong className="text-success">{officer.resolvedCount || 0}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DepartmentOfficersManagement;
