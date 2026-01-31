import api from '../api/axios';

/**
 * Citizen Service
 * Handles all citizen-related API calls
 */

// ==================== DASHBOARD ====================

/**
 * Get citizen dashboard data
 * @returns {Promise} Dashboard data
 */
export const getDashboard = async () => {
    const response = await api.get('/citizen/dashboard');
    return response.data;
};

// ==================== COMPLAINTS ====================

/**
 * Create new complaint
 * @param {FormData} formData - Complaint data with images
 * @returns {Promise} Created complaint data
 */
export const createComplaint = async (formData) => {
    const response = await api.post('/citizen/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * Get my complaints
 * @param {Object} params - Query parameters (status, page, size)
 * @returns {Promise} Paginated complaints list
 */
export const getMyComplaints = async (params = {}) => {
    const response = await api.get('/citizen/complaints', { params });
    return response.data;
};

/**
 * Get complaint details
 * @param {number} complaintId - Complaint ID
 * @returns {Promise} Complaint details
 */
export const getComplaintDetails = async (complaintId) => {
    const response = await api.get(`/citizen/complaints/${complaintId}`);
    return response.data;
};

/**
 * Track complaint status
 * @param {number} complaintId - Complaint ID
 * @returns {Promise} Complaint tracking data
 */
export const trackComplaint = async (complaintId) => {
    const response = await api.get(`/citizen/complaints/${complaintId}/track`);
    return response.data;
};

/**
 * Reopen complaint
 * @param {number} complaintId - Complaint ID
 * @param {string} reason - Reason for reopening
 * @returns {Promise} Response data
 */
export const reopenComplaint = async (complaintId, reason) => {
    const response = await api.put(`/citizen/complaints/${complaintId}/reopen`, { reason });
    return response.data;
};

/**
 * Provide feedback on complaint
 * @param {number} complaintId - Complaint ID
 * @param {Object} feedback - Feedback data (rating, comment)
 * @returns {Promise} Response data
 */
export const provideFeedback = async (complaintId, feedback) => {
    const response = await api.post(`/citizen/complaints/${complaintId}/feedback`, feedback);
    return response.data;
};

// ==================== AREA COMPLAINTS ====================

/**
 * Get complaints in my area
 * @param {number} radius - Radius in km (optional)
 * @returns {Promise} Area complaints list
 */
export const getAreaComplaints = async (radius = 5) => {
    const response = await api.get('/citizen/area-complaints', {
        params: { radius }
    });
    return response.data;
};

// ==================== MAP ====================

/**
 * Get citizen map view data
 * @returns {Promise} Map data with complaints
 */
export const getMapView = async () => {
    const response = await api.get('/citizen/map');
    return response.data;
};

// ==================== OFFICERS ====================

/**
 * Get ward officers
 * @returns {Promise} Ward officers list
 */
export const getWardOfficers = async () => {
    const response = await api.get('/citizen/officers/ward-officers');
    return response.data;
};

/**
 * Get department officers
 * @returns {Promise} Department officers list
 */
export const getDepartmentOfficers = async () => {
    const response = await api.get('/citizen/officers/department-officers');
    return response.data;
};

// ==================== WARD CHANGE ====================

/**
 * Request ward change
 * @param {number} newWardId - New ward ID
 * @param {string} reason - Reason for change
 * @returns {Promise} Response data
 */
export const requestWardChange = async (newWardId, reason) => {
    const response = await api.post('/ward-change/request', { newWardId, reason });
    return response.data;
};

/**
 * Get my ward change requests
 * @returns {Promise} Ward change requests list
 */
export const getMyWardChangeRequests = async () => {
    const response = await api.get('/ward-change/my-requests');
    return response.data;
};

const citizenService = {
    getDashboard,
    createComplaint,
    getMyComplaints,
    getComplaintDetails,
    trackComplaint,
    reopenComplaint,
    provideFeedback,
    getAreaComplaints,
    getMapView,
    getWardOfficers,
    getDepartmentOfficers,
    requestWardChange,
    getMyWardChangeRequests
};

export default citizenService;
