/**
 * Admin User Management Page
 * Manage all users in the system
 */

import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, UserCheck, UserX, Shield } from 'lucide-react';
import apiService from '../../api/apiService';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const { showToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // This would be an admin-specific endpoint
            const data = await apiService.admin.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to load users', 'error');
            // Mock data for demonstration
            setUsers([
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'CITIZEN', active: true },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'WARD_OFFICER', active: true },
                { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'DEPARTMENT_OFFICER', active: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            // This would call an admin endpoint to activate/deactivate user
            await apiService.toggleUserStatus?.(userId, !currentStatus);
            showToast(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            showToast('Failed to update user status', 'error');
        }
    };

    const getRoleBadge = (role) => {
        const roleColors = {
            ADMIN: 'badge-admin',
            WARD_OFFICER: 'badge-ward',
            DEPARTMENT_OFFICER: 'badge-dept',
            CITIZEN: 'badge-citizen'
        };
        return roleColors[role] || 'badge-default';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="admin-user-management-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <Users size={32} />
                        User Management
                    </h1>
                    <p>Manage all users and their access levels</p>
                </div>
                {/* Add User button removed as per requirements */}
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="role-filter"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="CITIZEN">Citizens</option>
                    <option value="WARD_OFFICER">Ward Officers</option>
                    <option value="DEPARTMENT_OFFICER">Department Officers</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    <Users size={48} />
                                    <p>No users found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-name">
                                            <Shield size={18} />
                                            {user.name}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadge(user.role)}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}>
                                            {user.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`btn-action ${user.active ? 'btn-deactivate' : 'btn-activate'}`}
                                            onClick={() => handleToggleActive(user.id, user.active)}
                                        >
                                            {user.active ? (
                                                <><UserX size={16} /> Deactivate</>
                                            ) : (
                                                <><UserCheck size={16} /> Activate</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                <p>Showing {filteredUsers.length} of {users.length} users</p>
            </div>
        </div>
    );
};

export default AdminUserManagement;
