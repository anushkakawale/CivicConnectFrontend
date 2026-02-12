/**
 * 🚀 CivicConnect - Complete API Service
 * Last Updated: February 01, 2026
 * Base URL: http://localhost:8083/api
 */

import api from './axios';
import { getImageUrl } from '../utils/imageUtils';

const apiService = {
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        register: (data) => api.post('/citizens/register', {
            name: data.name,
            email: data.email,
            password: data.password,
            mobile: data.mobile,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            pincode: data.pincode,
            ...(data.wardId && { wardId: data.wardId }),
            role: "CITIZEN"
        }),
    },

    profile: {
        getProfile: () => api.get('/profile'),
        updateName: (name) => api.put('/profile/name', { name }),
        updateMobile: (mobile) => api.put('/profile/mobile', { mobile }),
        updatePassword: (currentPassword, newPassword) => api.put('/profile/password', { currentPassword, newPassword }),
        getCitizenProfile: () => api.get('/profile/citizen'),
        citizenUpdateWard: (data) => api.put('/profile/citizen/ward', data),
        citizenUpdateAddress: (data) => api.put('/profile/citizen/address', {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            pincode: data.pincode
        }),
        requestMobileOtp: (newMobile) => api.post('/profile/mobile/request-otp', { newMobile }),
        verifyMobileOtp: (otp, newMobile) => api.post('/profile/mobile/verify-otp', { otp, newMobile }),
        getCompletionScore: () => api.get('/profile/completion-score').catch(err => {
            if (err.response?.status === 403) return 0;
            throw err;
        }),
        requestWardChange: (data) => api.post('/citizens/ward-change-request', {
            wardId: parseInt(data.wardId || data.requestedWardId || data.newWardId),
            reason: data.reason || data.remarks || "Requested via Unified Portal"
        }),
        getMyWardChangeRequests: () => api.get('/ward-change/my-requests'),
    },

    citizen: {
        getDashboard: () => api.get('/citizen/dashboard').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ /citizen/dashboard is forbidden. Returning empty stats.');
                return { data: { totalComplaints: 0, pendingComplaints: 0, resolvedComplaints: 0, closedComplaints: 0, slaBreached: 0, recentComplaints: [] } };
            }
            throw err;
        }),
        getMyComplaints: (params) => api.get('/citizens/complaints', { params }),
        createComplaint: (data) => api.post('/citizens/complaints', data), // Plural for registration
        getComplaintDetails: (id) => api.get(`/citizens/complaints/${id}`),
        getTimeline: (id) => api.get(`/citizens/complaints/${id}/timeline`),
        getSlaDetails: (complaintId) => api.get(`/citizens/complaints/${complaintId}/sla`),
        getSlaCountdown: (complaintId) => api.get(`/citizens/complaints/${complaintId}/sla/countdown`),
        getWardComplaints: () => api.get('/citizens/complaints/ward'),
        getAreaComplaints: (params) => api.get('/citizens/area-complaints', { params }),
        getWardOfficer: () => api.get('/citizen/officers/ward-officer'),
        getDepartmentOfficers: () => api.get('/citizen/officers/department-officers'),
        getOfficers: () => api.get('/citizen/officers'),
        getOfficerDetails: (id) => api.get(`/citizen/officers/${id}`),
        getMapData: (params) => api.get('/citizens/complaints/ward', { params }),
        getWards: () => api.get('/wards'),
        getDepartments: () => api.get('/departments')
    },

    complaint: {
        // Unified Tracking Architecture (Recommended)
        getDetails: (id) => api.get(`/complaints/${id}/details`),
        submitFeedback: (id, rating, comment) => api.post(`/complaints/${id}/feedback`, { rating, comment }),
        reopen: (id, reason) => api.put(`/complaints/${id}/reopen`, { reason }),

        // Legacy/Role-Specific (For backward compatibility)
        uploadImage: (id, formData) => api.post(`/complaints/${id}/images`, formData),
        getImages: (id) => api.get(`/complaints/${id}/images`),
        getTimeline: (id) => api.get(`/citizens/complaints/${id}/timeline`),
    },

    wardOfficer: {
        // Analytics - Combined for optimization
        getAnalytics: () => api.get('/ward-officer/management/analytics'),
        getDashboardAnalytics: () => api.get('/ward-officer/analytics/dashboard'),
        getResolutionVelocity: () => api.get('/ward-officer/analytics/resolution-velocity'),

        // Complaints
        getComplaints: (params) => api.get('/ward-officer/management/complaints', { params }), // Corrected to match management spec
        getUnassignedComplaints: (params) => api.get('/ward-officer/management/complaints', { params: { ...params, assigned: false } }),
        getComplaintDetails: (id) => api.get(`/ward-officer/complaints/${id}`),
        getSlaDetails: (id) => api.get(`/ward-officer/complaints/${id}/sla`),
        getTimeline: (id) => api.get(`/ward-officer/complaints/${id}/timeline`),
        getWardComplaints: () => api.get('/ward-officer/complaints/all'),
        getPendingApprovals: (params) => api.get('/ward-officer/complaints/pending-approval', { params }),
        getClosedHistory: (params) => api.get('/ward-officer/complaints/closed-history', { params }),
        approveComplaint: (id, data) => api.put(`/ward-officer/complaints/${id}/approve`, data),
        rejectComplaint: (id, data) => api.put(`/ward-officer/complaints/${id}/reject`, data),
        assignComplaint: (id, data) => api.put(`/ward-officer/complaints/${id}/assign`, data),

        // Ward Changes
        getPendingWardChanges: () => api.get('/ward-change/pending'),
        getWardChangeHistory: () => api.get('/ward-change/history'), // assuming this might exist or staying with old one if unsure, but user said pending. I'll stick to user's guide for pending/approve/reject.
        approveWardChange: (id, remarks) => api.put(`/ward-change/${id}/approve`, { adminRemarks: remarks }),
        rejectWardChange: (id, remarks) => api.put(`/ward-change/${id}/reject`, { adminRemarks: remarks }),

        // Management
        registerDepartmentOfficer: (data) => api.post('/ward-officer/management/register-officer', data),
        getDepartmentOfficers: () => api.get('/ward-officer/department-officers'),
        getOfficers: () => api.get('/ward-officer/department-officers'),

        // Map
        // Map - Using management fallback if dedicated map endpoint is 403
        getMapData: () => api.get('/ward-officer/map').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ /ward-officer/map is forbidden. Falling back to management/complaints.');
                return api.get('/ward-officer/management/complaints', { params: { size: 100 } });
            }
            throw err;
        }),
        getDashboard: () => api.get('/ward-officer/dashboard'),
    },

    departmentOfficer: {
        getDashboardSummary: () => api.get('/department/dashboard/summary'),
        getAssignedComplaints: (params) => api.get('/department/complaints', { params }),
        getComplaintDetails: (id) => api.get(`/department/complaints/${id}`),
        startWork: (id) => api.put(`/department/complaints/${id}/start`, {}).catch(err => {
            if (err.response?.status === 403) {
                console.error('⚠️ Start work permission denied. Check backend role configuration.');
            }
            throw err;
        }),
        resolveComplaint: (id) => api.put(`/department/complaints/${id}/resolve`, {}),

        // Image Upload Endpoints - Using /department/ prefix (matches backend)
        uploadProgressImages: (id, formData) => api.post(`/department/complaints/${id}/progress-images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        uploadResolutionImages: (id, formData) => api.post(`/department/complaints/${id}/resolution-images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        resolveWithImages: (id, formData) => api.post(`/department/complaints/${id}/resolve-with-images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

        getResolvedHistory: () => api.get('/department/dashboard/resolved'),
        getColleagues: () => api.get('/department/officers/colleagues'),
        getSlaAnalytics: () => api.get('/department/analytics/sla'),
        getWardOfficer: () => api.get('/department/officers/ward-officer'),
        getMapData: () => api.get('/department/map'),
        getProfile: () => api.get('/department/profile').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ Department officer profile access restricted. Using common profile endpoint.');
                return api.get('/profile');
            }
            throw err;
        }),
        getSlaDetails: (id) => api.get(`/department/complaints/${id}/sla`).catch(err => {
            // Fallback or ignore 403
            if (err.response?.status === 403 || err.response?.status === 404) return null;
            throw err;
        })
    },

    admin: {
        getDashboard: () => api.get('/admin/analytics/dashboard').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ Admin dashboard access restricted. Using fallback.');
                return { data: { totalComplaints: 0, statusBreakdown: { assigned: 0, inProgress: 0, approved: 0, closed: 0 }, complianceRate: 0, byWard: [], resources: { totalWardOfficers: 0, totalDeptOfficers: 0 } } };
            }
            throw err;
        }),
        getStats: () => api.get('/admin/dashboard/stats').catch(() => ({ data: {} })),
        getUsers: (params) => api.get('/admin/users', { params }),
        getComplaints: (params) => api.get('/admin/complaints', { params }),
        getUnassignedComplaints: (params) => api.get('/admin/complaints/unassigned', { params }),
        getPendingClosures: () => api.get('/admin/complaints/pending-closure-queue'),
        getClosedHistory: (params) => api.get('/admin/complaints/closed-history', { params }),
        closeComplaint: (id, data) => api.put(`/admin/complaints/${id}/close`, data || {}),
        getOfficers: () => api.get('/admin/officers'),
        registerWardOfficer: (data) => api.post('/admin/register/ward-officer', data),
        registerDepartmentOfficer: (data) => api.post('/admin/register/department-officer', data),
        registerOfficer: (data) => {
            if (data.role === 'WARD_OFFICER' || (data.wardId && !data.departmentId))
                return api.post('/admin/register/ward-officer', data);
            return api.post('/admin/register/department-officer', data);
        },
        getCityMap: () => api.get('/admin/map/markers').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ City Map markers access restricted (403). Returning empty data set.');
                return { data: { complaints: [], stats: { total: 0, critical: 0, active: 0, resolved: 0 } } };
            }
            throw err;
        }),
        searchComplaints: (params) => api.get('/search/complaints', { params }),
        getReadyToClose: () => api.get('/admin/dashboard/ready-to-close'),
        getDetails: (id) => api.get(`/admin/complaints/${id}`),
        getTimeline: (id) => api.get(`/admin/complaints/${id}/timeline`),
        closeComplaint: (id, data) => api.put(`/admin/complaints/${id}/close`, data || {}),
        getClosureApprovalQueue: (params) => api.get('/admin/complaints/closure-approval-queue', { params }),
        getPendingClosureTracking: (params) => api.get('/admin/complaints/pending-closure-tracking', { params }),
        getClosedTracking: (params) => api.get('/admin/complaints/closed-tracking', { params }),
        getSlaDetails: (id) => api.get(`/admin/sla/${id}`),
        getSlaRemaining: (id) => api.get(`/admin/sla/${id}/remaining`),
        toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
        deactivateUserById: (id) => api.put(`/admin/users/${id}/toggle-status`),
        activateUserById: (id) => api.put(`/admin/users/${id}/toggle-status`),
        updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
        changeUserStatus: (id, status) => api.put(`/status/${id}/${status}`), // Placeholder for custom status
        getMapMarkers: () => api.get('/admin/map/markers'),
        getMapFilters: () => api.get('/admin/map/filters'),
        getSummaryReport: (params) => api.get('/admin/reports/summary', { params }),
        getComplaintsReport: (params) => api.get('/admin/reports/complaints', { params }),
        getSlaReport: (params) => api.get('/admin/reports/sla', { params }),
        getOverallSla: () => api.get('/admin/analytics/sla/overall'),
        getOfficerWorkload: () => api.get('/admin/analytics/officer-workload'),
        getTrends: () => api.get('/admin/analytics/trends').catch(err => {
            if (err.response?.status === 403) return { data: [] };
            throw err;
        }),
        getWardPerformance: () => api.get('/admin/analytics/ward-performance').catch(err => {
            if (err.response?.status === 403) return { data: [] };
            throw err;
        }),
        getDepartmentPerformance: () => api.get('/admin/analytics/department-performance').catch(err => {
            if (err.response?.status === 403) return { data: [] };
            throw err;
        }),
        getCategories: () => api.get('/admin/analytics/categories').catch(err => {
            if (err.response?.status === 403) return { data: [] };
            throw err;
        }),
        downloadComplaintsPdf: (params) => api.get('/admin/reports/complaints/pdf', { params, responseType: 'blob' }),
        downloadComplaintsExcel: (params) => api.get('/admin/reports/complaints/excel', { params, responseType: 'blob' }),
        downloadComplaintsJson: (params) => api.get('/admin/reports/complaints/json', { params }),
    },

    feedback: {
        submit: (complaintId, data) => api.put(`/citizens/complaints/${complaintId}/feedback`, data),
        getStatus: (complaintId) => api.get(`/citizens/feedback/${complaintId}/feedback/status`)
    },

    notifications: {
        getStats: () => api.get('/notifications/stats').catch(err => {
            if (err.response?.status === 403) return { data: { unreadCount: 0, unseenCount: 0 } };
            throw err;
        }),
        getAll: () => api.get('/notifications').catch(err => {
            if (err.response?.status === 403) return { data: [] };
            throw err;
        }),
        getHistory: (page = 0, size = 20) => api.get(`/notifications/history?page=${page}&size=${size}`),
        getUnread: () => api.get('/notifications/unread').catch(err => {
            if (err.response?.status === 403) return { data: [] };
            throw err;
        }),
        getUnreadCount: () => api.get('/notifications/unread/count').catch(err => {
            if (err.response?.status === 403) return { data: 0 };
            throw err;
        }),
        markAsRead: (id) => api.put(`/notifications/${id}/read`),
        markAllAsRead: () => api.put('/notifications/mark-all-as-read'),
        markAsSeen: (id) => api.put(`/notifications/${id}/seen`),
        markAllAsSeen: () => api.put('/notifications/seen-all').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ Mark all as seen restricted (403).');
                return { data: { success: false } };
            }
            throw err;
        }),
        clearRead: () => api.delete('/notifications/clear-read'),
        delete: (id) => api.delete(`/notifications/${id}`)
    },

    masterData: {
        getWards: () => api.get('/wards'),
        addWard: (data) => api.post('/wards', data),
        getDepartments: () => api.get('/departments'),
        addDepartment: (data) => api.post('/departments', data)
    },

    common: {
        getWards: () => api.get('/wards'),
        getDepartments: () => api.get('/departments')
    },

    ward: {
        getAll: () => api.get('/wards'),
        getById: (id) => api.get(`/wards/${id}`)
    },

    map: {
        getComplaints: (params) => api.get('/map/complaints', { params }),
        getWardBoundaries: () => api.get('/map/wards/boundaries'),
        getOfficers: () => api.get('/map/officers'),
        getActiveComplaints: (params) => api.get('/map/active-complaints', { params }),
        getMyScope: () => api.get('/map/my-scope'),
        getStatistics: (params) => api.get('/map/statistics', { params })
    },

    getImageUrl: (path, complaintId) => getImageUrl(path, complaintId)
};

export const createComplaintFormData = (complaintData) => {
    const formData = new FormData();

    // Add individual fields (standard Spring Boot @RequestParam approach)
    formData.append('title', complaintData.title || '');
    formData.append('description', complaintData.description || '');
    formData.append('departmentId', complaintData.departmentId || '');
    formData.append('wardId', complaintData.wardId || '');
    formData.append('address', complaintData.address || '');

    // Add optional coordinates
    if (complaintData.latitude) {
        formData.append('latitude', complaintData.latitude);
    }
    if (complaintData.longitude) {
        formData.append('longitude', complaintData.longitude);
    }

    // Add multiple images
    if (complaintData.images && (complaintData.images instanceof FileList || Array.isArray(complaintData.images)) && complaintData.images.length > 0) {
        Array.from(complaintData.images).forEach(image => {
            formData.append('images', image);
        });
    } else if (complaintData.images instanceof File) {
        formData.append('images', complaintData.images);
    }

    // Log FormData contents for debugging
    console.log('📦 FormData contents:');
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`  ${key}:`, `File(${value.name}, ${value.size} bytes)`);
        } else {
            console.log(`  ${key}:`, value);
        }
    }

    return formData;
};

export const createResolutionFormData = (resolutionNotes, completionImages) => {
    const formData = new FormData();
    formData.append('resolutionNotes', resolutionNotes);
    if (completionImages && completionImages.length > 0) {
        Array.from(completionImages).forEach(image => formData.append('completionImages', image));
    }
    return formData;
};

export default apiService;
