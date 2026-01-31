import api from '../api/axios';

/**
 * Ward Officer Service
 * Handles all ward officer-related API calls
 */

// ==================== DASHBOARD ====================

/**
 * Get ward officer dashboard data
 * @returns {Promise} Dashboard data
 */
export const getDashboard = async () => {
    const response = await api.get('/ward-officer/dashboard');
    return response.data;
};

/**
 * Get pending approvals
 * @returns {Promise} Pending approvals list
 */
export const getPendingApprovals = async () => {
    const response = await api.get('/ward-officer/dashboard/pending-approvals');
    return response.data;
};

// ==================== COMPLAINTS ====================

/**
 * Get all ward complaints
 * @param {Object} params - Query parameters (status, category, page, size)
 * @returns {Promise} Paginated complaints list
 */
export const getWardComplaints = async (params = {}) => {
    const response = await api.get('/ward-officer/complaints', { params });
    return response.data;
};

/**
 * Approve complaint
 * @param {number} complaintId - Complaint ID
 * @param {Object} approvalData - Approval data (priority, departmentId, assignedOfficerId, remarks)
 * @returns {Promise} Response data
 */
export const approveComplaint = async (complaintId, approvalData) => {
    const response = await api.put(`/ward-officer/complaints/${complaintId}/approve`, approvalData);
    return response.data;
};

/**
 * Reject complaint
 * @param {number} complaintId - Complaint ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} Response data
 */
export const rejectComplaint = async (complaintId, reason) => {
    const response = await api.put(`/ward-officer/complaints/${complaintId}/reject`, { reason });
    return response.data;
};

// ==================== WARD CHANGE ====================

/**
 * Get pending ward change requests
 * @returns {Promise} Pending ward change requests
 */
export const getPendingWardChanges = async () => {
    const response = await api.get('/ward-change/pending');
    return response.data;
};

/**
 * Approve ward change request
 * @param {number} requestId - Request ID
 * @returns {Promise} Response data
 */
export const approveWardChange = async (requestId) => {
    const response = await api.put(`/ward-change/${requestId}/approve`);
    return response.data;
};

/**
 * Reject ward change request
 * @param {number} requestId - Request ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} Response data
 */
export const rejectWardChange = async (requestId, reason) => {
    const response = await api.put(`/ward-change/${requestId}/reject`, { reason });
    return response.data;
};

// ==================== OFFICER MANAGEMENT ====================

/**
 * Register department officer
 * @param {Object} officerData - Officer registration data
 * @returns {Promise} Response data
 */
export const registerDepartmentOfficer = async (officerData) => {
    const response = await api.post('/ward-officer/register/department-officer', officerData);
    return response.data;
};

/**
 * Get department officers in ward
 * @returns {Promise} Department officers list
 */
export const getDepartmentOfficers = async () => {
    const response = await api.get('/ward-officer/department-officers');
    return response.data;
};

// ==================== ANALYTICS ====================

/**
 * Get ward analytics
 * @param {Object} params - Query parameters (startDate, endDate)
 * @returns {Promise} Analytics data
 */
export const getAnalytics = async (params = {}) => {
    const response = await api.get('/ward-officer/analytics', { params });
    return response.data;
};

// ==================== MAP ====================

/**
 * Get ward map data
 * @returns {Promise} Map data
 */
export const getMapView = async () => {
    const response = await api.get('/ward/map');
    return response.data;
};

const wardOfficerService = {
    getDashboard,
    getPendingApprovals,
    getWardComplaints,
    approveComplaint,
    rejectComplaint,
    getPendingWardChanges,
    approveWardChange,
    rejectWardChange,
    registerDepartmentOfficer,
    getDepartmentOfficers,
    getAnalytics,
    getMapView
};

export default wardOfficerService;
