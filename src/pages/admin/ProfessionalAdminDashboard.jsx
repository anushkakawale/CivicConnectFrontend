import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    Building2,
    MapPin,
    Eye,
    RefreshCw,
    UserPlus,
    Shield,
    BarChart3,
    PieChart as PieChartIcon
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line
} from 'recharts';
import apiService from '../../api/apiService';
import './ProfessionalAdminDashboard.css';

const ProfessionalAdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [users, setUsers] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading admin dashboard data...');

            // Load all data in parallel
            const [dashboardRes, complaintsRes, usersRes, officersRes] = await Promise.allSettled([
                apiService.admin.getDashboard(),
                apiService.admin.getAllComplaints(0, 10),
                apiService.admin.getAllUsers(0, 10),
                apiService.admin.getOfficerDirectory()
            ]);

            // Handle dashboard data
            if (dashboardRes.status === 'fulfilled') {
                console.log('✅ Dashboard data loaded:', dashboardRes.value);
                setDashboardData(dashboardRes.value);
            } else {
                console.warn('⚠️ Dashboard data failed:', dashboardRes.reason);
                // Set default data
                setDashboardData({
                    statistics: { totalComplaints: 0, pending: 0, resolved: 0, inProgress: 0 },
                    wardStats: [],
                    departmentStats: []
                });
            }

            // Handle complaints
            if (complaintsRes.status === 'fulfilled') {
                const data = complaintsRes.value;
                console.log('✅ Complaints loaded:', data);
                setComplaints(data.content || data || []);
            } else {
                console.warn('⚠️ Complaints failed:', complaintsRes.reason);
                setComplaints([]);
            }

            // Handle users
            if (usersRes.status === 'fulfilled') {
                const data = usersRes.value;
                console.log('✅ Users loaded:', data);
                setUsers(data.content || data || []);
            } else {
                console.warn('⚠️ Users failed:', usersRes.reason);
                setUsers([]);
            }

            // Handle officers
            if (officersRes.status === 'fulfilled') {
                console.log('✅ Officers loaded:', officersRes.value);
                setOfficers(officersRes.value || []);
            } else {
                console.warn('⚠️ Officers failed:', officersRes.reason);
                setOfficers([]);
            }

        } catch (err) {
            console.error('❌ Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = dashboardData?.statistics || {
        totalComplaints: complaints.length,
        pending: complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'APPROVED').length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length,
        resolved: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length
    };

    const wardData = (dashboardData?.wardStats || []).map(w => ({
        name: w.wardName || w.name || 'Unknown',
        complaints: w.total || w.count || 0
    }));

    const deptData = (dashboardData?.departmentStats || []).map(d => ({
        name: d.departmentName || d.name || 'Unknown',
        value: d.total || d.count || 0
    }));

    const statusData = [
        { name: 'Pending', value: stats.pending, color: '#f59e0b' },
        { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
        { name: 'Resolved', value: stats.resolved, color: '#10b981' }
    ];

    const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-title">
                        <LayoutDashboard className="w-8 h-8" />
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Complete system overview and management</p>
                        </div>
                    </div>
                    <button onClick={loadAllData} className="btn-refresh" disabled={loading}>
                        <RefreshCw className={`w-5 h-5 ${loading ? 'spinning' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="statistics-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalComplaints || 0}</div>
                        <div className="stat-label">Total Complaints</div>
                    </div>
                    <div className="stat-trend">
                        <TrendingUp className="w-4 h-4" />
                        <span>All time</span>
                    </div>
                </div>

                <div className="stat-card stat-users">
                    <div className="stat-icon">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-action">
                        <button onClick={() => navigate('/admin/users')} className="btn-stat-action">
                            View All
                        </button>
                    </div>
                </div>

                <div className="stat-card stat-officers">
                    <div className="stat-icon">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{officers.length}</div>
                        <div className="stat-label">Officers</div>
                    </div>
                    <div className="stat-action">
                        <button onClick={() => navigate('/admin/officers')} className="btn-stat-action">
                            View All
                        </button>
                    </div>
                </div>

                <div className="stat-card stat-pending">
                    <div className="stat-icon">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.pending || 0}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-trend">
                        <AlertCircle className="w-4 h-4" />
                        <span>Needs attention</span>
                    </div>
                </div>

                <div className="stat-card stat-progress">
                    <div className="stat-icon">
                        <RefreshCw className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inProgress || 0}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-trend">
                        <TrendingUp className="w-4 h-4" />
                        <span>Active work</span>
                    </div>
                </div>

                <div className="stat-card stat-resolved">
                    <div className="stat-icon">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.resolved || 0}</div>
                        <div className="stat-label">Resolved</div>
                    </div>
                    <div className="stat-trend">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                            {stats.totalComplaints > 0
                                ? `${Math.round((stats.resolved / stats.totalComplaints) * 100)}%`
                                : '0%'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`tab ${activeTab === 'complaints' ? 'active' : ''}`}
                    >
                        <FileText className="w-4 h-4" />
                        Recent Complaints
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    >
                        <Users className="w-4 h-4" />
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('officers')}
                        className={`tab ${activeTab === 'officers' ? 'active' : ''}`}
                    >
                        <Shield className="w-4 h-4" />
                        Officers
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`tab ${activeTab === 'map' ? 'active' : ''}`}
                    >
                        <MapPin className="w-4 h-4" />
                        Map View
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner-large"></div>
                    <p>Loading dashboard data...</p>
                </div>
            ) : (
                <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="tab-content">
                            <div className="charts-grid">
                                {/* Ward Statistics */}
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <h3>Complaints by Ward</h3>
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="chart-body">
                                        {wardData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={wardData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="complaints" fill="#ef4444" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="empty-chart">No ward data available</div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Distribution */}
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <h3>Status Distribution</h3>
                                        <PieChartIcon className="w-5 h-5" />
                                    </div>
                                    <div className="chart-body">
                                        {statusData.some(d => d.value > 0) ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={statusData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {statusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="empty-chart">No status data available</div>
                                        )}
                                    </div>
                                </div>

                                {/* Department Statistics */}
                                <div className="chart-card full-width">
                                    <div className="chart-header">
                                        <h3>Complaints by Department</h3>
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="chart-body">
                                        {deptData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={deptData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="empty-chart">No department data available</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complaints Tab */}
                    {activeTab === 'complaints' && (
                        <div className="tab-content">
                            <div className="content-header">
                                <h2>Recent Complaints</h2>
                                <button onClick={() => navigate('/admin/complaints')} className="btn-primary">
                                    View All Complaints
                                </button>
                            </div>
                            {complaints.length > 0 ? (
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Title</th>
                                                <th>Ward</th>
                                                <th>Department</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {complaints.slice(0, 10).map((complaint) => (
                                                <tr key={complaint.complaintId}>
                                                    <td>CMP-{complaint.complaintId}</td>
                                                    <td className="complaint-title">{complaint.title}</td>
                                                    <td>{complaint.ward?.wardName || 'N/A'}</td>
                                                    <td>{complaint.department?.departmentName || 'N/A'}</td>
                                                    <td>
                                                        <span className={`status-badge status-${complaint.status?.toLowerCase()}`}>
                                                            {complaint.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                                                            className="btn-action"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FileText className="w-16 h-16" />
                                    <h3>No Complaints Found</h3>
                                    <p>No complaints have been registered yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="tab-content">
                            <div className="content-header">
                                <h2>System Users</h2>
                                <button onClick={() => navigate('/admin/users')} className="btn-primary">
                                    <UserPlus className="w-4 h-4" />
                                    Manage Users
                                </button>
                            </div>
                            {users.length > 0 ? (
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Ward</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.slice(0, 10).map((user) => (
                                                <tr key={user.userId}>
                                                    <td>{user.userId}</td>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>{user.ward?.wardName || 'N/A'}</td>
                                                    <td>
                                                        <span className="status-badge status-active">Active</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Users className="w-16 h-16" />
                                    <h3>No Users Found</h3>
                                    <p>No users in the system yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Officers Tab */}
                    {activeTab === 'officers' && (
                        <div className="tab-content">
                            <div className="content-header">
                                <h2>Officer Directory</h2>
                                <button onClick={() => navigate('/admin/register-ward-officer')} className="btn-primary">
                                    <UserPlus className="w-4 h-4" />
                                    Register Officer
                                </button>
                            </div>
                            {officers.length > 0 ? (
                                <div className="officers-grid">
                                    {officers.slice(0, 12).map((officer) => (
                                        <div key={officer.userId} className="officer-card">
                                            <div className="officer-avatar">
                                                <Shield className="w-8 h-8" />
                                            </div>
                                            <div className="officer-info">
                                                <h4>{officer.name}</h4>
                                                <p className="officer-role">{officer.role}</p>
                                                <p className="officer-email">{officer.email}</p>
                                                {officer.ward && (
                                                    <p className="officer-ward">
                                                        <MapPin className="w-3 h-3" />
                                                        {officer.ward.wardName}
                                                    </p>
                                                )}
                                                {officer.department && (
                                                    <p className="officer-dept">
                                                        <Building2 className="w-3 h-3" />
                                                        {officer.department.departmentName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Shield className="w-16 h-16" />
                                    <h3>No Officers Found</h3>
                                    <p>No officers registered in the system</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Map Tab */}
                    {activeTab === 'map' && (
                        <div className="tab-content">
                            <div className="content-header">
                                <h2>Complaint Map View</h2>
                                <button onClick={() => navigate('/admin/map')} className="btn-primary">
                                    <MapPin className="w-4 h-4" />
                                    Full Map
                                </button>
                            </div>
                            <div className="map-placeholder">
                                <MapPin className="w-16 h-16" />
                                <h3>Map View</h3>
                                <p>Interactive map showing complaint locations</p>
                                <p className="text-muted">Click "Full Map" to view detailed map with all complaints</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfessionalAdminDashboard;
