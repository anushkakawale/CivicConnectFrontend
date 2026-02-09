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
    },

    citizen: {
        getDashboard: () => api.get('/citizen/dashboard').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ /citizen/dashboard is forbidden. Returning empty stats.');
                return { data: { totalComplaints: 0, pendingComplaints: 0, resolvedComplaints: 0, closedComplaints: 0, slaBreached: 0, recentComplaints: [] } };
            }
            throw err;
        }),
        getMyComplaints: (params) => api.get('/citizens/complaints', { params }), // Corrected path
        createComplaint: (data) => api.post('/citizens/complaints', data),
        getComplaintDetails: (id) => api.get(`/citizens/complaints/${id}`), // Reverted to plural for consistency
        getTimeline: (id) => api.get(`/citizens/complaints/${id}/timeline`), // Plural citizens
        getSlaDetails: (complaintId) => api.get(`/citizens/complaints/${complaintId}/sla`),
        getSlaCountdown: (complaintId) => api.get(`/citizens/complaints/${complaintId}/sla/countdown`),
        getWardComplaints: () => api.get('/citizens/complaints/ward'),
        getAreaComplaints: (params) => api.get('/citizen/area-complaints', { params }),
        getWardOfficer: () => api.get('/citizen/officers/ward-officer'),
        getDepartmentOfficers: () => api.get('/citizen/officers/department-officers'),
        getOfficerDetails: (id) => api.get(`/citizen/officers/${id}`),
        getMapData: () => api.get('/citizens/map/ward'),
        getWards: () => api.get('/wards'),
        getDepartments: () => api.get('/departments')
    },

    complaint: {
        getDetails: (id) => api.get(`/complaints/${id}/details`),
        reopen: (id, remarks) => api.put(`/citizens/complaints/${id}/reopen`, { remarks }), // Corrected to match user documentation
        submitFeedback: (id, rating, comment) => api.post(`/citizens/feedback/${id}`, { rating, comment }),
        uploadImage: (id, formData) => api.post(`/complaints/${id}/images`, formData),
        getImages: (id) => api.get(`/complaints/${id}/images`)
    },

    wardOfficer: {
        // Analytics - Combined for optimization
        getAnalytics: () => api.get('/ward-officer/management/analytics'),
        getDashboardAnalytics: () => api.get('/ward-officer/analytics/dashboard'),

        // Complaints
        getComplaints: (params) => api.get('/ward-officer/management/complaints', { params }), // Corrected to match management spec
        getWardComplaints: () => api.get('/ward-officer/complaints/all'),
        getPendingApprovals: () => api.get('/ward-officer/dashboard/pending-approvals'),
        approveComplaint: (id, data) => api.put(`/ward-officer/complaints/${id}/approve`, data),
        rejectComplaint: (id, data) => api.put(`/ward-officer/complaints/${id}/reject`, data),
        assignComplaint: (id, data) => api.put(`/ward-officer/complaints/${id}/assign`, data),

        // Ward Changes
        getPendingWardChanges: () => api.get('/ward-officer/management/ward-changes'),
        getWardChangeHistory: () => api.get('/ward-officer/management/ward-changes/history'),
        approveWardChange: (id, remarks) => api.put(`/ward-officer/management/ward-changes/${id}/approve`, { remarks }),
        rejectWardChange: (id, remarks) => api.put(`/ward-officer/management/ward-changes/${id}/reject`, { remarks }),

        // Management
        registerDepartmentOfficer: (data) => api.post('/ward-officer/management/register-officer', data),
        getDepartmentOfficers: () => api.get('/ward-officer/department-officers'),
        getOfficers: () => api.get('/ward-officer/department-officers'),

        // Map
        getMapData: () => api.get('/ward/map'),
        getDashboard: () => api.get('/ward-officer/dashboard'),
    },

    departmentOfficer: {
        getDashboardSummary: () => api.get('/department-officer/analytics/dashboard'),
        getAssignedComplaints: (params) => api.get('/department-officer/complaints', { params }),
        getComplaintDetails: (id) => api.get(`/department-officer/complaints/${id}`),
        startWork: (id) => api.put(`/department-officer/complaints/${id}/start`, {}),
        resolveComplaint: (id) => api.put(`/department-officer/complaints/${id}/resolve`, {}),
        getResolvedHistory: () => api.get('/department-officer/dashboard/resolved'),
        getColleagues: () => api.get('/department-officer/officers/colleagues'),
        getSlaAnalytics: () => api.get('/department-officer/analytics/sla'),
        getWardOfficer: () => api.get('/department-officer/officers/ward-officer'),
        getMapData: () => api.get('/department-officer/map'),
        getProfile: () => api.get('/department-officer/profile')
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
        getOfficers: () => api.get('/admin/officers'),
        registerWardOfficer: (data) => api.post('/admin/register/ward-officer', data),
        registerDepartmentOfficer: (data) => api.post('/admin/register/department-officer', data),
        registerOfficer: (data) => {
            if (data.role === 'WARD_OFFICER' || (data.wardId && !data.departmentId))
                return api.post('/admin/register/ward-officer', data);
            return api.post('/admin/register/department-officer', data);
        },
        getCityMap: () => api.get('/admin/map/data').catch(err => {
            if (err.response?.status === 403) {
                console.warn('⚠️ City Map access restricted (403). Returning empty data set.');
                return { data: { complaints: [], stats: { total: 0, critical: 0, active: 0, resolved: 0 } } };
            }
            throw err;
        }),
        searchComplaints: (params) => api.get('/search/complaints', { params }),
        getReadyToClose: () => api.get('/admin/dashboard/ready-to-close'),
        getDetails: (id) => api.get(`/admin/complaints/${id}`),
        closeComplaint: (id, data) => api.put(`/admin/complaints/${id}/close`, data || {}),
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
        getOfficerWorkload: () => api.get('/admin/analytics/officer-workload').catch(() => ({ data: [] })),
        downloadComplaintsPdf: (params) => api.get('/admin/reports/complaints/pdf', { params, responseType: 'blob' }),
        downloadComplaintsExcel: (params) => api.get('/admin/reports/complaints/excel', { params, responseType: 'blob' }),
    },

    feedback: {
        submit: (complaintId, data) => api.post(`/citizens/feedback/${complaintId}`, data),
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
        getUnread: () => api.get('/notifications/unread'),
        getUnreadCount: () => api.get('/notifications/unread/count'),
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
        getDepartments: () => api.get('/departments')
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
        getActiveComplaints: (params) => api.get('/map/active-complaints', { params }),
        getMyScope: () => api.get('/map/my-scope'),
        getStatistics: (params) => api.get('/map/statistics', { params })
    },

    getImageUrl: (path, complaintId) => getImageUrl(path, complaintId)
};

export const createComplaintFormData = (complaintData) => {
    const formData = new FormData();

    // Unified Registration Data Structure
    const requestData = {
        title: complaintData.title,
        description: complaintData.description,
        category: complaintData.category,
        wardId: Number(complaintData.wardId),
        latitude: Number(complaintData.latitude),
        longitude: Number(complaintData.longitude),
        address: complaintData.address,
        departmentId: Number(complaintData.departmentId)
    };

    // Add the core request as a JSON Blob
    formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

    // Add the single primary image if available
    // Add multiple images
    if (complaintData.images && (complaintData.images instanceof FileList || Array.isArray(complaintData.images)) && complaintData.images.length > 0) {
        Array.from(complaintData.images).forEach(image => {
            formData.append('images', image);
        });
    } else if (complaintData.images instanceof File) {
        formData.append('images', complaintData.images);
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
