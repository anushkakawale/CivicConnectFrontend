import api from '../api/axios';

/**
 * Profile Service
 * Handles all profile-related API calls
 */

/**
 * Get user profile
 * @returns {Promise} Profile data
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

/**
 * Get citizen profile
 * @returns {Promise} Citizen profile data
 */
export const getCitizenProfile = async () => {
    try {
        const response = await api.get('/profile/citizen');
        return response.data;
    } catch (error) {
        console.error('Error fetching citizen profile:', error);
        throw error;
    }
};

/**
 * Update user name
 * @param {string} name - New name
 * @returns {Promise} Response data
 */
export const updateName = async (name) => {
    try {
        const response = await api.put('/profile/name', { name });
        return response.data;
    } catch (error) {
        console.error('Error updating name:', error);
        throw error;
    }
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} Response data
 */
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await api.put('/profile/password', {
            currentPassword,
            newPassword
        });
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

/**
 * Update citizen address
 * @param {string} address - New address
 * @returns {Promise} Response data
 */
export const updateAddress = async (address) => {
    try {
        const response = await api.put('/profile/citizen/address', { address });
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

/**
 * Update citizen ward
 * @param {number} wardId - New ward ID
 * @returns {Promise} Response data
 */
export const updateWard = async (wardId) => {
    try {
        const response = await api.put('/profile/citizen/ward', { wardId });
        return response.data;
    } catch (error) {
        console.error('Error updating ward:', error);
        throw error;
    }
};

/**
 * Request OTP for mobile number change
 * @param {string} newMobile - New mobile number
 * @returns {Promise} Response data with OTP (in development)
 */
export const requestMobileOTP = async (newMobile) => {
    try {
        const response = await api.post('/profile/mobile/request-otp', { newMobile });
        return response.data;
    } catch (error) {
        console.error('Error requesting OTP:', error);
        throw error;
    }
};

/**
 * Verify OTP and update mobile number
 * @param {string} otp - OTP code
 * @returns {Promise} Response data
 */
export const verifyMobileOTP = async (otp, newMobile) => {
    try {
        const response = await api.post('/profile/mobile/verify-otp', { otp, newMobile });
        return response.data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Get ward change requests (Citizen)
 * @returns {Promise} Ward change requests
 */
export const getMyWardChangeRequests = async () => {
    try {
        const response = await api.get('/ward-change/my-requests');
        return response.data;
    } catch (error) {
        console.error('Error fetching ward change requests:', error);
        throw error;
    }
};

/**
 * Request ward change (Citizen)
 * @param {number} wardId - New ward ID
 * @returns {Promise} Response data
 */
export const requestWardChange = async (wardId) => {
    try {
        const response = await api.post('/ward-change/request', { wardId });
        return response.data;
    } catch (error) {
        console.error('Error requesting ward change:', error);
        throw error;
    }
};

/**
 * Get pending ward change requests (Ward Officer)
 * @returns {Promise} Pending ward change requests
 */
export const getPendingWardChanges = async () => {
    try {
        const response = await api.get('/ward-change/pending');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending ward changes:', error);
        throw error;
    }
};

/**
 * Approve ward change request (Ward Officer)
 * @param {number} requestId - Request ID
 * @param {string} remarks - Approval remarks
 * @returns {Promise} Response data
 */
export const approveWardChange = async (requestId, remarks = '') => {
    try {
        const response = await api.put(`/ward-change/${requestId}/approve`, { remarks });
        return response.data;
    } catch (error) {
        console.error('Error approving ward change:', error);
        throw error;
    }
};

/**
 * Reject ward change request (Ward Officer)
 * @param {number} requestId - Request ID
 * @param {string} remarks - Rejection remarks
 * @returns {Promise} Response data
 */
export const rejectWardChange = async (requestId, remarks) => {
    try {
        const response = await api.put(`/ward-change/${requestId}/reject`, { remarks });
        return response.data;
    } catch (error) {
        console.error('Error rejecting ward change:', error);
        throw error;
    }
};

const profileService = {
    getProfile,
    getCitizenProfile,
    updateName,
    changePassword,
    updateAddress,
    updateWard,
    requestMobileOTP,
    verifyMobileOTP,
    getMyWardChangeRequests,
    requestWardChange,
    getPendingWardChanges,
    approveWardChange,
    rejectWardChange
};

export default profileService;
