/**
 * Department Officer Service
 * Handles all API calls for department officer operations
 * Delegates to centralized apiService
 */

import apiService from '../api/apiService';

class DepartmentOfficerService {
    async getAssignedComplaints(page = 0, size = 10) {
        return apiService.department.getMyComplaints(page, size);
    }

    async getComplaintById(complaintId) {
        return apiService.complaints.getDetails(complaintId);
    }

    async startWork(complaintId, remarks = 'Work started') {
        return apiService.complaints.updateStatus(complaintId, 'IN_PROGRESS', remarks);
    }

    async resolveComplaint(complaintId, remarks, images) {
        return apiService.complaints.resolve(complaintId, remarks, images);
    }

    async uploadImage(complaintId, imageStage, images) {
        return apiService.common.uploadImages(complaintId, imageStage, images);
    }

    async getComplaintImages(complaintId) {
        return apiService.common.getComplaintImages(complaintId);
    }

    async getSLAInfo(complaintId) {
        // SLA details are included in complaint details
        return apiService.complaints.getDetails(complaintId);
    }

    async getSLAAnalytics() {
        // Dashboard contains SLA stats
        return apiService.department.getDashboard();
    }

    async getMapComplaints() {
        // Use generic map endpoint, potentially filtering by user's department which is handled by backend or filtered here
        // Current documentation implies /map/active-complaints shows all or filtered by params.
        // Department officer should probably only see their department's? backend might enforce it or we pass params.
        // For now, call the common one.
        return apiService.common.getMapActiveComplaints();
    }

    async getNotifications() {
        return apiService.common.getNotifications();
    }

    async markNotificationAsRead(notificationId) {
        return apiService.common.markNotificationRead(notificationId);
    }

    async getProfile() {
        return apiService.common.getProfile();
    }

    async updatePassword(passwordData) {
        return apiService.common.changePassword(passwordData.currentPassword, passwordData.newPassword);
    }

    async getFeedback() {
        // Not implemented in documented APIs
        return { data: [] };
    }
}

export default new DepartmentOfficerService();
