import api from '../api/axios';

/**
 * Admin Service
 * Handles all admin-related API calls
 */

// ==================== DASHBOARD ====================

/**
 * Get admin dashboard data
 * @returns {Promise} Dashboard data
 */
export const getDashboard = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

// ==================== COMPLAINTS ====================

/**
 * Get all complaints (admin view)
 * @param {Object} params - Query parameters (status, wardId, departmentId, priority, startDate, endDate, page, size)
 * @returns {Promise} Paginated complaints list
 */
export const getAllComplaints = async (params = {}) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
};

/**
 * Get complaint details (admin view)
 * @param {number} complaintId - Complaint ID
 * @returns {Promise} Complaint details with audit trail
 */
export const getComplaintDetails = async (complaintId) => {
    const response = await api.get(`/admin/complaints/${complaintId}`);
    return response.data;
};

/**
 * Escalate complaint
 * @param {number} complaintId - Complaint ID
 * @param {Object} escalationData - Escalation data (reason, newPriority, reassignTo)
 * @returns {Promise} Response data
 */
export const escalateComplaint = async (complaintId, escalationData) => {
    const response = await api.put(`/admin/complaints/${complaintId}/escalate`, escalationData);
    return response.data;
};

/**
 * Reassign complaint
 * @param {number} complaintId - Complaint ID
 * @param {Object} reassignData - Reassignment data (newOfficerId, reason)
 * @returns {Promise} Response data
 */
export const reassignComplaint = async (complaintId, reassignData) => {
    const response = await api.put(`/admin/complaints/${complaintId}/reassign`, reassignData);
    return response.data;
};

/**
 * Close complaint (force)
 * @param {number} complaintId - Complaint ID
 * @param {Object} closeData - Close data (reason, remarks)
 * @returns {Promise} Response data
 */
export const closeComplaint = async (complaintId, closeData) => {
    const response = await api.put(`/admin/complaints/${complaintId}/close`, closeData);
    return response.data;
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 * @param {Object} params - Query parameters (role, active, page, size)
 * @returns {Promise} Paginated users list
 */
export const getAllUsers = async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
};

/**
 * Activate user
 * @param {number} userId - User ID
 * @returns {Promise} Response data
 */
export const activateUser = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return response.data;
};

/**
 * Deactivate user
 * @param {number} userId - User ID
 * @returns {Promise} Response data
 */
export const deactivateUser = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/deactivate`);
    return response.data;
};

// ==================== OFFICER MANAGEMENT ====================

/**
 * Get all officers
 * @param {Object} params - Query parameters (role, wardId, departmentId, active)
 * @returns {Promise} Officers list
 */
export const getAllOfficers = async (params = {}) => {
    const response = await api.get('/admin/officers', { params });
    return response.data;
};

/**
 * Create ward officer
 * @param {Object} officerData - Ward officer data
 * @returns {Promise} Response data
 */
export const createWardOfficer = async (officerData) => {
    const response = await api.post('/admin/officers/ward-officer', officerData);
    return response.data;
};

/**
 * Create department officer
 * @param {Object} officerData - Department officer data
 * @returns {Promise} Response data
 */
export const createDepartmentOfficer = async (officerData) => {
    const response = await api.post('/admin/officers/department-officer', officerData);
    return response.data;
};

// ==================== ANALYTICS ====================

/**
 * Get system analytics
 * @param {Object} params - Query parameters (startDate, endDate, groupBy)
 * @returns {Promise} Analytics data
 */
export const getAnalytics = async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
};

/**
 * Get SLA analytics
 * @returns {Promise} SLA analytics data
 */
export const getSLAAnalytics = async () => {
    const response = await api.get('/admin/analytics/sla');
    return response.data;
};

/**
 * Get chart data for complaints
 * @param {Object} params - Query parameters (period, startDate, endDate)
 * @returns {Promise} Chart data
 */
export const getChartData = async (params = {}) => {
    const response = await api.get('/admin/charts/complaints', { params });
    return response.data;
};

// ==================== AUDIT TRAIL ====================

/**
 * Get audit logs
 * @param {Object} params - Query parameters (action, userId, startDate, endDate, page, size)
 * @returns {Promise} Paginated audit logs
 */
export const getAuditLogs = async (params = {}) => {
    const response = await api.get('/admin/audit', { params });
    return response.data;
};

// ==================== EXPORT ====================

/**
 * Export data
 * @param {Object} params - Query parameters (format, dataType, startDate, endDate, wardId, departmentId)
 * @returns {Promise} File blob
 */
export const exportData = async (params = {}) => {
    const response = await api.get('/admin/export', {
        params,
        responseType: 'blob'
    });
    return response.data;
};

// ==================== MAP ====================

/**
 * Get admin map view
 * @returns {Promise} Map data
 */
export const getMapView = async () => {
    const response = await api.get('/admin/map');
    return response.data;
};

const adminService = {
    getDashboard,
    getAllComplaints,
    getComplaintDetails,
    escalateComplaint,
    reassignComplaint,
    closeComplaint,
    getAllUsers,
    activateUser,
    deactivateUser,
    getAllOfficers,
    createWardOfficer,
    createDepartmentOfficer,
    getAnalytics,
    getSLAAnalytics,
    getChartData,
    getAuditLogs,
    exportData,
    getMapView
};

export default adminService;
