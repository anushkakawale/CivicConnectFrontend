import api from '../api/axios';

/**
 * Department Officer Service
 * Handles all department officer-related API calls
 */

// ==================== DASHBOARD ====================

/**
 * Get department officer dashboard data
 * @returns {Promise} Dashboard data
 */
export const getDashboard = async () => {
    const response = await api.get('/department/dashboard');
    return response.data;
};

// ==================== COMPLAINTS ====================

/**
 * Get assigned complaints
 * @param {Object} params - Query parameters (status, priority, page, size)
 * @returns {Promise} Paginated complaints list
 */
export const getAssignedComplaints = async (params = {}) => {
    const response = await api.get('/department/complaints', { params });
    return response.data;
};

/**
 * Update complaint status
 * @param {number} complaintId - Complaint ID
 * @param {Object} statusData - Status data (status, remarks)
 * @returns {Promise} Response data
 */
export const updateComplaintStatus = async (complaintId, statusData) => {
    const response = await api.put(`/department/complaints/${complaintId}/status`, statusData);
    return response.data;
};

/**
 * Mark complaint as resolved
 * @param {number} complaintId - Complaint ID
 * @param {FormData} resolutionData - Resolution data with completion images
 * @returns {Promise} Response data
 */
export const resolveComplaint = async (complaintId, resolutionData) => {
    const response = await api.put(`/department/complaints/${complaintId}/resolve`, resolutionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * Add progress update to complaint
 * @param {number} complaintId - Complaint ID
 * @param {Object} updateData - Update data (updateText, estimatedCompletion)
 * @returns {Promise} Response data
 */
export const addProgressUpdate = async (complaintId, updateData) => {
    const response = await api.post(`/department/complaints/${complaintId}/update`, updateData);
    return response.data;
};

// ==================== ANALYTICS ====================

/**
 * Get department analytics
 * @param {Object} params - Query parameters (startDate, endDate)
 * @returns {Promise} Analytics data
 */
export const getAnalytics = async (params = {}) => {
    const response = await api.get('/department/analytics', { params });
    return response.data;
};

// ==================== MAP ====================

/**
 * Get department map data
 * @returns {Promise} Map data
 */
export const getMapView = async () => {
    const response = await api.get('/department/map');
    return response.data;
};

const departmentService = {
    getDashboard,
    getAssignedComplaints,
    updateComplaintStatus,
    resolveComplaint,
    addProgressUpdate,
    getAnalytics,
    getMapView
};

export default departmentService;
