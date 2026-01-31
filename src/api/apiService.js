/**
 * 🚀 CivicConnect - Complete API Service
 * Last Updated: January 31, 2026
 * Base URL: http://localhost:8083/api
 * 
 * This service provides a complete interface to all backend APIs
 * with proper error handling, authentication, and request formatting.
 */

import api from './axios';

const apiService = {
    // ========================================
    // 1. AUTHENTICATION & PROFILE APIs
    // ========================================
    auth: {
        /**
         * Login user
         * POST /api/auth/login
         */
        login: (credentials) => api.post('/auth/login', credentials),

        /**
         * Register a new citizen
         * POST /api/auth/register
         */
        register: (data) => api.post('/citizens/register', {
            name: data.name,
            email: data.email,
            password: data.password,
            mobile: data.mobile,
            ...(data.wardId && { wardId: data.wardId }),
            role: "CITIZEN"
        }),
    },

    profile: {
        /**
         * Get logged-in user details
         * GET /api/profile
         */
        getProfile: () => api.get('/profile'),

        /**
         * Update name
         * PUT /api/profile/name
         */
        updateName: (name) => api.put('/profile/name', { name }),

        /**
         * Update password
         * PUT /api/profile/password
         */
        updatePassword: (currentPassword, newPassword) => api.put('/profile/password', { currentPassword, newPassword }),

        /**
         * Request OTP for mobile update
         * POST /api/profile/mobile/request-otp
         */
        requestMobileOtp: (mobileNumber) => api.post('/profile/mobile/request-otp', { mobileNumber }),

        /**
         * Verify OTP and update mobile number
         * POST /api/profile/mobile/verify-otp
         */
        verifyMobileOtp: (otp, newMobileNumber) => api.post('/profile/mobile/verify-otp', { otp, newMobileNumber }),
    },

    // ========================================
    // 2. CITIZEN MODULE APIs
    // ========================================
    citizen: {
        /**
         * Get citizen dashboard stats
         * GET /api/citizen/dashboard
         */
        getDashboard: () => api.get('/citizen/dashboard'),

        /**
         * List my complaints (CitizenComplaintListController)
         * GET /api/citizen/my-complaints
         */
        getMyComplaints: (params) => api.get('/citizen/my-complaints', { params }),

        /**
         * Create new complaint
         * POST /api/citizens/complaints
         */
        createComplaint: (data) => api.post('/citizens/complaints', data),

        /**
         * Upload complaint image
         * POST /api/complaints/{id}/images
         */
        uploadImage: (id, formData) => api.post(`/complaints/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

        /**
         * Get complaint details
         * GET /api/complaints/{id}/details
         */
        getComplaintDetails: (id) => api.get(`/complaints/${id}/details`),

        /**
         * Reopen a resolved complaint
         * PUT /api/citizens/complaints/{id}/reopen
         */
        reopenComplaint: (id) => api.put(`/citizens/complaints/${id}/reopen`),

        /**
         * Give feedback ratings
         * POST /api/complaints/{id}/feedback
         */
        submitFeedback: (id, rating, comment) => api.post(`/complaints/${id}/feedback`, { rating, comment }),

        /**
         * Get area complaints (Controller: CitizenAreaComplaintsController)
         * GET /api/citizen/area-complaints
         */
        getAreaComplaints: (params) => api.get('/citizen/area-complaints', { params }),

        /**
         * Get complaints in my ward (Legacy alias, pointing to area-complaints)
         * GET /api/citizen/area-complaints
         */
        getWardComplaints: (params) => api.get('/citizen/area-complaints', { params }),

        /**
         * Update citizen address
         * PUT /api/profile/citizen/address
         */
        updateAddress: (data) => api.put('/profile/citizen/address', data),

        /**
         * Request ward change
         * PUT /api/profile/citizen/ward
         */
        requestWardChange: (data) => api.put('/profile/citizen/ward', data),

        /**
         * Get officer directory for my ward
         * GET /api/citizens/officers
         */
        getOfficers: () => api.get('/citizens/officers'),
    },

    // Alias for getWardComplaints to handle legacy calls
    complaint: {
        getWardComplaints: (params) => api.get('/citizen/area-complaints', { params }),
        getById: (id) => api.get(`/complaints/${id}/details`),
        reopen: (id, reason) => api.put(`/citizens/complaints/${id}/reopen`, { reason }),
        submitFeedback: (id, rating, comment) => api.post(`/complaints/${id}/feedback`, { rating, comment })
    },

    // ========================================
    // 3. WARD OFFICER MODULE APIs
    // ========================================
    wardOfficer: {
        /**
         * Get ward officer dashboard stats
         * GET /api/ward-officer/dashboard (Assuming this exists or use analytics)
         */
        getDashboard: () => api.get('/ward-officer/dashboard'),

        /**
         * List complaints waiting for approval
         * GET /api/ward-officer/dashboard/pending-approvals
         */
        getPendingApprovals: () => api.get('/ward-officer/dashboard/pending-approvals'),

        /**
         * Approve complaint
         * PUT /api/ward-officer/complaints/{id}/approve
         */
        approveComplaint: (id, data) => api.put(`/ward-officer/complaints/${id}/approve`, {
            remarks: data.remarks || "Approved",
            // Controller doesn't seem to take priority/dept here in the latest code? 
            // The provided code shows ComplaintDecisionDTO { remarks }.
            // Retaining original params just in case, but remarks is key.
            priority: data.priority,
            departmentId: data.departmentId,
            assignedOfficerId: data.assignedOfficerId
        }),

        /**
         * Reject complaint
         * PUT /api/ward-officer/complaints/{id}/reject
         */
        rejectComplaint: (id, remarks) => api.put(`/ward-officer/complaints/${id}/reject`, { remarks }),

        /**
         * All complaints in the ward (Controller: WardComplaintController)
         * GET /api/ward/complaints
         */
        getAllComplaints: () => api.get('/ward/complaints'),

        /**
         * Create a new Dept Officer under this ward
         * POST /api/ward-officer/register/department-officer
         */
        registerDepartmentOfficer: (data) => api.post('/ward-officer/register/department-officer', data),

        /**
         * List all Dept Officers in this ward
         * GET /api/ward-officer/department-officers
         */
        getDepartmentOfficers: () => api.get('/ward-officer/department-officers'),

        /**
         * Approve Ward Change
         * PUT /api/ward-officer/ward-change/{id}/approve
         */
        approveWardChange: (id) => api.put(`/ward-officer/ward-change/${id}/approve`)
    },

    // ========================================
    // 4. DEPARTMENT OFFICER MODULE APIs
    // ========================================
    departmentOfficer: {
        /**
         * Get department officer dashboard stats
         * GET /api/department/dashboard/summary
         */
        getDashboard: () => api.get('/department/dashboard/summary'),

        /**
         * Get assigned complaints
         * GET /api/department/dashboard/assigned
         */
        getAssignedComplaints: (params) => api.get('/department/dashboard/assigned', { params }),

        /**
         * List assigned complaints (Legacy/Alias)
         * GET /api/department/dashboard/assigned
         */
        getComplaints: () => api.get('/department/dashboard/assigned'),

        /**
         * Update complaint status
         * PUT /api/department/complaints/{id}/status
         */
        updateStatus: (id, status) => api.put(`/department/complaints/${id}/status`, { status }),

        /**
         * Start work on complaint
         * PUT /api/department/complaints/{id}/start
         */
        startWork: (id) => api.put(`/department/complaints/${id}/start`),

        /**
         * Add a progress text log/comment
         * POST /api/department/complaints/{id}/update (Assuming this still exists or needs to be added to controller)
         */
        addUpdateLog: (id, comment) => api.post(`/department/complaints/${id}/update`, comment),

        /**
         * Resolve complaint
         * PUT /api/department/complaints/{id}/resolve
         * Content-Type: multipart/form-data
         */
        resolveComplaint: (id, formData) => api.put(`/department/complaints/${id}/resolve`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

        /**
         * Get Ward Officer
         * GET /api/department/officers/ward-officer
         */
        getWardOfficer: () => api.get('/department/officers/ward-officer'),
    },

    // ========================================
    // 5. ADMIN MODULE APIs
    // ========================================
    admin: {
        /**
         * System-wide stats
         * GET /api/admin/dashboard
         */
        /**
         * System-wide stats (Analytics Dashboard)
         * GET /api/admin/analytics/dashboard
         */
        getDashboard: () => api.get('/admin/analytics/dashboard'),

        /**
         * Get complaints ready to close (AdminDashboardController)
         * GET /api/admin/dashboard/ready-to-close
         */
        getReadyToClose: () => api.get('/admin/dashboard/ready-to-close'),

        /**
         * Manage all users
         * GET /api/admin/users
         */
        getUsers: () => api.get('/admin/users'),

        /**
         * View all complaints
         * GET /api/admin/complaints
         */
        getComplaints: (params) => api.get('/admin/complaints', { params }),

        /**
         * Manually escalate priority
         * PUT /api/admin/complaints/{id}/escalate
         */
        escalateComplaint: (id) => api.put(`/admin/complaints/${id}/escalate`),

        // Charts
        getComplaintsByWard: () => api.get('/admin/charts/complaints-by-ward'),
        getComplaintsByDepartment: () => api.get('/admin/charts/complaints-by-department'),
        getSlaStats: () => api.get('/admin/charts/sla-stats'),

        // Audit
        getAuditLogs: (params) => api.get('/admin/audit/logs', { params }),
        getAuditSummary: () => api.get('/admin/audit/summary'),
    },

    // ========================================
    // 6. NOTIFICATIONS & COMMON APIs
    // ========================================
    notifications: {
        /**
         * Get notification stats (unread/unseen count)
         * GET /api/notifications/stats
         */
        getStats: () => api.get('/notifications/stats'),

        /**
         * List unread items
         * GET /api/notifications/unread
         */
        getUnread: () => api.get('/notifications/unread'),

        /**
         * Mark specific item as read
         * PUT /api/notifications/{id}/read
         */
        markAsRead: (id) => api.put(`/notifications/${id}/read`),

        /**
         * Mark all as read
         * PUT /api/notifications/read-all
         */
        markAllAsRead: () => api.put('/notifications/read-all'),
    },

    // ========================================
    // 8. MAP & ANALYTICS APIs
    // ========================================
    map: {
        getActiveComplaints: (params) => api.get('/map/active-complaints', { params }), // Citizen Map
        getStatistics: (params) => api.get('/map/statistics', { params }),
        getHotspots: () => api.get('/map/hotspots'),
        getDepartmentMap: () => api.get('/department/map'),
        getWardMap: () => api.get('/ward/map')
    },

    analytics: {
        getSlaStats: () => api.get('/dashboard/sla'), // Generic SLA for logged in user

        // Department Officer Analytics
        department: {
            getDashboard: () => api.get('/department/analytics/dashboard'),
            getPendingWork: () => api.get('/department/analytics/pending-work'),
            getTrends: () => api.get('/department/analytics/trends'),
            getSlaReport: () => api.get('/department/analytics/sla')
        },

        // Admin Analytics
        admin: {
            getOverallSla: () => api.get('/admin/analytics/sla/overall'),
            getDepartmentSla: (deptId) => api.get(`/admin/analytics/sla/department/${deptId}`)
        }
    },

    // ========================================
    // 9. PUBLIC/MASTER DATA
    // ========================================
    masterData: {
        getWards: () => api.get('/wards'),
        getDepartments: () => api.get('/departments')
    },

    // ========================================
    // 10. WARD CHANGE APIs
    // ========================================
    wardChange: {
        request: (data) => api.post('/ward-change/request', data),
        getMyRequests: () => api.get('/ward-change/my-requests'),
        getPending: () => api.get('/ward-change/pending'), // For Ward Officer
        approve: (id, remarks) => api.put(`/ward-change/${id}/approve`, { remarks }),
        reject: (id, remarks) => api.put(`/ward-change/${id}/reject`, { remarks })
    }
};

/**
 * Helper function to create FormData for complaint creation
 * @param {Object} complaintData - Complaint data object
 * @returns {FormData} Formatted FormData ready for submission
 */
export const createComplaintFormData = (complaintData) => {
    const formData = new FormData();

    // Required fields per guide
    formData.append('title', complaintData.title);
    formData.append('description', complaintData.description);
    formData.append('category', complaintData.category);
    formData.append('wardId', complaintData.wardId);
    formData.append('latitude', complaintData.latitude);
    formData.append('longitude', complaintData.longitude);
    formData.append('address', complaintData.address);

    // Images
    if (complaintData.images && complaintData.images.length > 0) {
        // If it's an array of files/blobs
        Array.from(complaintData.images).forEach(image => {
            formData.append('images', image);
        });
    }

    return formData;
};

/**
 * Helper function to create FormData for resolving complaint
 * @param {string} resolutionNotes
 * @param {Array} completionImages
 * @returns {FormData}
 */
export const createResolutionFormData = (resolutionNotes, completionImages) => {
    const formData = new FormData();
    formData.append('resolutionNotes', resolutionNotes);

    if (completionImages && completionImages.length > 0) {
        Array.from(completionImages).forEach(image => {
            formData.append('completionImages', image);
        });
    }
    return formData;
};

export default apiService;
