import React, { useState, useEffect } from 'react';
import {
    Users,
    Mail,
    Phone,
    Building2,
    MapPin,
    RefreshCw,
    AlertCircle,
    Filter,
    User,
    Shield
} from 'lucide-react';
import apiService from '../../api/apiService';
import './OfficerDirectory.css';

const OfficerDirectory = () => {
    const [officers, setOfficers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('ALL');
    const [filterRole, setFilterRole] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');

        // 1. Load Departments (Public Data)
        try {
            const depts = await apiService.masterData.getDepartments();
            setDepartments(Array.isArray(depts.data) ? depts.data : (Array.isArray(depts) ? depts : []));
        } catch (err) {
            console.error('❌ Failed to fetch departments:', err);
            // Non-critical, continue
        }

        // 2. Load Officers (Protected Data)
        try {
            console.log('🔄 Fetching officers...');
            const response = await apiService.citizen.getOfficers();
            console.log('✅ Officers response:', response);
            setOfficers(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
        } catch (err) {
            console.error('❌ Failed to fetch officers:', err);
            setError('Failed to load officers directory. Please try again later.');
            setOfficers([]);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            'WARD_OFFICER': { class: 'role-ward', icon: Shield, text: 'Ward Officer' },
            'DEPARTMENT_OFFICER': { class: 'role-dept', icon: Building2, text: 'Department Officer' },
            'ADMIN': { class: 'role-admin', icon: Shield, text: 'Admin' }
        };
        return badges[role] || { class: 'role-other', icon: User, text: role };
    };

    const filterOfficers = () => {
        let filtered = officers;

        if (filterDepartment !== 'ALL') {
            filtered = filtered.filter(o =>
                o.department?.departmentId === parseInt(filterDepartment)
            );
        }

        if (filterRole !== 'ALL') {
            filtered = filtered.filter(o => o.role === filterRole);
        }

        return filtered;
    };

    const filteredOfficers = filterOfficers();

    // Group officers by role
    const officersByRole = {
        wardOfficers: filteredOfficers.filter(o => o.role === 'WARD_OFFICER'),
        deptOfficers: filteredOfficers.filter(o => o.role === 'DEPARTMENT_OFFICER'),
        others: filteredOfficers.filter(o => o.role !== 'WARD_OFFICER' && o.role !== 'DEPARTMENT_OFFICER')
    };

    if (loading) {
        return (
            <div className="officer-directory-container">
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Loading officers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="officer-directory-container">
            {/* Header */}
            <div className="directory-header">
                <div className="header-content">
                    <div className="header-title">
                        <Users className="w-8 h-8" />
                        <div>
                            <h1>Officer Directory</h1>
                            <p>Contact information for officers in your ward</p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        className="btn-refresh"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="alert-close">×</button>
                </div>
            )}

            {/* Statistics */}
            <div className="statistics-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{officers.length}</div>
                        <div className="stat-label">Total Officers</div>
                    </div>
                </div>
                <div className="stat-card stat-ward">
                    <div className="stat-icon">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{officersByRole.wardOfficers.length}</div>
                        <div className="stat-label">Ward Officers</div>
                    </div>
                </div>
                <div className="stat-card stat-dept">
                    <div className="stat-icon">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{officersByRole.deptOfficers.length}</div>
                        <div className="stat-label">Department Officers</div>
                    </div>
                </div>
                <div className="stat-card stat-depts">
                    <div className="stat-icon">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{departments.length}</div>
                        <div className="stat-label">Departments</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filters-header">
                    <Filter className="w-5 h-5" />
                    <span>Filter Officers</span>
                </div>
                <div className="filter-groups">
                    <div className="filter-group">
                        <label>Role</label>
                        <div className="filter-buttons">
                            <button
                                onClick={() => setFilterRole('ALL')}
                                className={`filter-btn ${filterRole === 'ALL' ? 'active' : ''}`}
                            >
                                All Roles
                            </button>
                            <button
                                onClick={() => setFilterRole('WARD_OFFICER')}
                                className={`filter-btn ${filterRole === 'WARD_OFFICER' ? 'active' : ''}`}
                            >
                                Ward Officers
                            </button>
                            <button
                                onClick={() => setFilterRole('DEPARTMENT_OFFICER')}
                                className={`filter-btn ${filterRole === 'DEPARTMENT_OFFICER' ? 'active' : ''}`}
                            >
                                Department Officers
                            </button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Department</label>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="department-select"
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.departmentId} value={dept.departmentId}>
                                    {dept.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Officers List */}
            {filteredOfficers.length === 0 ? (
                <div className="empty-state">
                    <Users className="w-16 h-16" />
                    <h3>No Officers Found</h3>
                    <p>
                        {filterRole === 'ALL' && filterDepartment === 'ALL'
                            ? "No officers available in your ward"
                            : "No officers match your filters"}
                    </p>
                </div>
            ) : (
                <div className="officers-grid">
                    {filteredOfficers.map((officer) => {
                        const roleInfo = getRoleBadge(officer.role);
                        const RoleIcon = roleInfo.icon;

                        return (
                            <div key={officer.userId} className="officer-card">
                                {/* Card Header */}
                                <div className="card-header">
                                    <div className="officer-avatar">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div className={`role-badge ${roleInfo.class}`}>
                                        <RoleIcon className="w-4 h-4" />
                                        <span>{roleInfo.text}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="card-body">
                                    <h3 className="officer-name">{officer.name}</h3>

                                    <div className="officer-details">
                                        <div className="detail-item">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${officer.email}`} className="detail-link">
                                                {officer.email}
                                            </a>
                                        </div>

                                        {officer.mobile && (
                                            <div className="detail-item">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${officer.mobile}`} className="detail-link">
                                                    {officer.mobile}
                                                </a>
                                            </div>
                                        )}

                                        {officer.department && (
                                            <div className="detail-item">
                                                <Building2 className="w-4 h-4" />
                                                <span className="detail-text">
                                                    {officer.department.departmentName}
                                                </span>
                                            </div>
                                        )}

                                        {officer.ward && (
                                            <div className="detail-item">
                                                <MapPin className="w-4 h-4" />
                                                <span className="detail-text">
                                                    {officer.ward.wardName}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {officer.specialization && (
                                        <div className="specialization">
                                            <span className="spec-label">Specialization:</span>
                                            <span className="spec-value">{officer.specialization}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="card-footer">
                                    <button
                                        onClick={() => window.location.href = `mailto:${officer.email}`}
                                        className="btn-contact"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Send Email
                                    </button>
                                    {officer.mobile && (
                                        <button
                                            onClick={() => window.location.href = `tel:${officer.mobile}`}
                                            className="btn-call"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Info Box */}
            <div className="info-box">
                <h4>📞 Contact Information</h4>
                <ul>
                    <li>Ward Officers handle complaint approval and assignment</li>
                    <li>Department Officers work on resolving assigned complaints</li>
                    <li>You can contact officers via email or phone for urgent matters</li>
                    <li>Please be respectful and provide complaint ID when contacting</li>
                </ul>
            </div>
        </div>
    );
};

export default OfficerDirectory;
