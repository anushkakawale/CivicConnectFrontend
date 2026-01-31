import api from '../api/axios';

/**
 * Common Service
 * Handles common/shared API calls used across all roles
 */

// ==================== WARDS ====================

/**
 * Get all wards
 * @returns {Promise} Wards list
 */
export const getAllWards = async () => {
    const response = await api.get('/wards');
    return response.data;
};

// ==================== DEPARTMENTS ====================

/**
 * Get all departments
 * @returns {Promise} Departments list
 */
export const getAllDepartments = async () => {
    const response = await api.get('/departments');
    return response.data;
};

// ==================== OFFICERS ====================

/**
 * Get all officers
 * @returns {Promise} Officers list
 */
export const getAllOfficers = async () => {
    const response = await api.get('/officers/all');
    return response.data;
};

/**
 * Get ward officers only
 * @returns {Promise} Ward officers list
 */
export const getWardOfficers = async () => {
    const response = await api.get('/officers/ward-officers');
    return response.data;
};

/**
 * Get department officers only
 * @returns {Promise} Department officers list
 */
export const getDepartmentOfficers = async () => {
    const response = await api.get('/officers/department-officers');
    return response.data;
};

// ==================== SEARCH ====================

/**
 * Search complaints globally
 * @param {Object} params - Query parameters (query, category, status, page, size)
 * @returns {Promise} Search results
 */
export const searchComplaints = async (params = {}) => {
    const response = await api.get('/search/complaints', { params });
    return response.data;
};

// ==================== MAP ====================

/**
 * Get active complaints on map
 * @param {Object} params - Query parameters (category, status, wardId, departmentId)
 * @returns {Promise} Complaints for map
 */
export const getActiveComplaints = async (params = {}) => {
    const response = await api.get('/map/active-complaints', { params });
    return response.data;
};

/**
 * Get map statistics
 * @returns {Promise} Map statistics
 */
export const getMapStatistics = async () => {
    const response = await api.get('/map/statistics');
    return response.data;
};

/**
 * Get complaint hotspots
 * @param {Object} params - Query parameters (radius, minComplaints)
 * @returns {Promise} Hotspots data
 */
export const getHotspots = async (params = {}) => {
    const response = await api.get('/map/hotspots', { params });
    return response.data;
};

// ==================== FILE HANDLING ====================

/**
 * Upload complaint images
 * @param {number} complaintId - Complaint ID
 * @param {FormData} formData - Form data with images
 * @returns {Promise} Uploaded image URLs
 */
export const uploadComplaintImages = async (complaintId, formData) => {
    const response = await api.post(`/complaints/${complaintId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * Get complaint image URL
 * @param {number} complaintId - Complaint ID
 * @param {string} fileName - Image file name
 * @returns {string} Image URL
 */
export const getComplaintImageUrl = (complaintId, fileName) => {
    return `${api.defaults.baseURL}/images/${complaintId}/${fileName}`;
};

/**
 * Download complaint report
 * @param {number} complaintId - Complaint ID
 * @param {string} format - Report format (PDF, EXCEL)
 * @returns {Promise} File blob
 */
export const downloadComplaintReport = async (complaintId, format = 'PDF') => {
    const response = await api.get(`/complaints/${complaintId}/report`, {
        params: { format },
        responseType: 'blob'
    });
    return response.data;
};

const commonService = {
    getAllWards,
    getAllDepartments,
    getAllOfficers,
    getWardOfficers,
    getDepartmentOfficers,
    searchComplaints,
    getActiveComplaints,
    getMapStatistics,
    getHotspots,
    uploadComplaintImages,
    getComplaintImageUrl,
    downloadComplaintReport
};

export default commonService;
