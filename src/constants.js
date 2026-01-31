/**
 * Application Constants
 * Defines all status codes, departments, and workflow configurations
 */

// User Roles
export const USER_ROLES = {
    CITIZEN: 'CITIZEN',
    DEPARTMENT_OFFICER: 'DEPARTMENT_OFFICER',
    WARD_OFFICER: 'WARD_OFFICER',
    ADMIN: 'ADMIN'
};

// Role-based default routes
export const ROLE_ROUTES = {
    CITIZEN: '/citizen/dashboard',
    DEPARTMENT_OFFICER: '/department/dashboard',
    WARD_OFFICER: '/ward-officer/dashboard',
    ADMIN: '/admin/dashboard'
};

// Complaint Status with UI metadata
export const COMPLAINT_STATUS = {
    SUBMITTED: {
        label: 'Submitted',
        color: 'secondary',
        icon: '📋',
        description: 'Complaint has been submitted and awaiting assignment'
    },
    ASSIGNED: {
        label: 'Assigned',
        color: 'info',
        icon: '📌',
        description: 'Assigned to department officer'
    },
    IN_PROGRESS: {
        label: 'In Progress',
        color: 'warning',
        icon: '🔧',
        description: 'Officer is working on the complaint'
    },
    RESOLVED: {
        label: 'Resolved',
        color: 'success',
        icon: '✅',
        description: 'Work completed, awaiting ward officer approval'
    },
    APPROVED: {
        label: 'Approved',
        color: 'success',
        icon: '✓',
        description: 'Approved by ward officer'
    },
    CLOSED: {
        label: 'Closed',
        color: 'dark',
        icon: '🔒',
        description: 'Complaint has been closed'
    },
    REOPENED: {
        label: 'Reopened',
        color: 'danger',
        icon: '🔁',
        description: 'Complaint has been reopened by citizen'
    },
    REJECTED: {
        label: 'Rejected',
        color: 'danger',
        icon: '❌',
        description: 'Rejected by ward officer'
    }
};

// Complaint Flow - defines allowed transitions and actions
export const COMPLAINT_FLOW = {
    SUBMITTED: {
        next: 'ASSIGNED',
        canEdit: false,
        description: 'System will auto-assign to department officer'
    },
    ASSIGNED: {
        next: 'IN_PROGRESS',
        canEdit: false,
        action: 'Start Work',
        allowedRoles: ['DEPARTMENT_OFFICER']
    },
    IN_PROGRESS: {
        next: 'RESOLVED',
        canEdit: true,
        action: 'Resolve',
        allowedRoles: ['DEPARTMENT_OFFICER'],
        canUploadImages: true
    },
    RESOLVED: {
        next: 'APPROVED',
        canEdit: false,
        requiresApproval: true,
        allowedRoles: ['WARD_OFFICER'],
        canUploadImages: true
    },
    APPROVED: {
        next: 'CLOSED',
        canEdit: false,
        allowedRoles: ['ADMIN']
    },
    CLOSED: {
        next: null,
        canEdit: false,
        canReopen: true
    },
    REOPENED: {
        next: 'ASSIGNED',
        canEdit: false,
        description: 'Will be auto-assigned again'
    }
};

// Image Upload Stages
export const IMAGE_STAGES = {
    BEFORE_WORK: {
        label: 'Before Work',
        icon: '📸',
        color: 'secondary',
        description: 'Initial state of the complaint area'
    },
    IN_PROGRESS: {
        label: 'Work in Progress',
        icon: '🔧',
        color: 'warning',
        description: 'Photos during the work'
    },
    AFTER_RESOLUTION: {
        label: 'After Resolution',
        icon: '✅',
        color: 'success',
        description: 'Final state after work completion'
    }
};

// Notification Types
export const NOTIFICATION_TYPES = {
    COMPLAINT_CREATED: {
        label: 'Complaint Created',
        icon: '📝',
        color: 'primary'
    },
    ASSIGNMENT: {
        label: 'Assignment',
        icon: '📌',
        color: 'info'
    },
    STATUS_UPDATE: {
        label: 'Status Update',
        icon: '🔄',
        color: 'primary'
    },
    SLA_WARNING: {
        label: 'SLA Warning',
        icon: '⚠️',
        color: 'warning'
    },
    SLA_BREACHED: {
        label: 'SLA Breached',
        icon: '🚨',
        color: 'danger'
    },
    REOPENED: {
        label: 'Reopened',
        icon: '🔁',
        color: 'warning'
    },
    FEEDBACK_REQUEST: {
        label: 'Feedback Request',
        icon: '⭐',
        color: 'info'
    },
    SYSTEM: {
        label: 'System',
        icon: '🔔',
        color: 'secondary'
    }
};

// Departments (These should ideally be fetched from backend, but kept here as fallback)
export const DEPARTMENTS = [
    { department_id: 1, name: 'Water Supply', icon: '💧', color: 'primary', sla_hours: 24, priority: 'HIGH', description: 'No water, leakage, low pressure' },
    { department_id: 2, name: 'Sanitation', icon: '🚽', color: 'info', sla_hours: 36, priority: 'MEDIUM', description: 'Public toilets, cleanliness' },
    { department_id: 3, name: 'Roads', icon: '🛣️', color: 'warning', sla_hours: 72, priority: 'LOW', description: 'Potholes, damaged roads' },
    { department_id: 4, name: 'Electricity', icon: '💡', color: 'warning', sla_hours: 24, priority: 'HIGH', description: 'Street lights, power issues' },
    { department_id: 5, name: 'Waste Management', icon: '🗑️', color: 'success', sla_hours: 12, priority: 'CRITICAL', description: 'Garbage collection' },
    { department_id: 6, name: 'Public Safety', icon: '⚠️', color: 'danger', sla_hours: 6, priority: 'CRITICAL', description: 'Open manholes, hazards' },
    { department_id: 7, name: 'Health', icon: '🏥', color: 'danger', sla_hours: 48, priority: 'MEDIUM', description: 'Mosquitoes, hygiene' },
    { department_id: 8, name: 'Education', icon: '🎓', color: 'secondary', sla_hours: 96, priority: 'LOW', description: 'School infrastructure' }
];

// Wards (Pune Municipal Corporation - should be fetched from backend)
export const WARDS = [
    { wardId: 1, number: 1, area_name: 'Shivaji Nagar', zone: 'Central' },
    { wardId: 2, number: 2, area_name: 'Kothrud', zone: 'West' },
    { wardId: 3, number: 3, area_name: 'Hadapsar', zone: 'East' },
    { wardId: 4, number: 4, area_name: 'Baner', zone: 'North' },
    { wardId: 5, number: 5, area_name: 'Kasba Peth', zone: 'Central' }
];

// Image Types (legacy - use IMAGE_STAGES instead)
export const IMAGE_TYPES = {
    BEFORE_WORK: { label: 'Before Work', icon: '📸', color: 'secondary' },
    IN_PROGRESS: { label: 'In Progress', icon: '🔧', color: 'warning' },
    AFTER_RESOLUTION: { label: 'After Resolution', icon: '✅', color: 'success' }
};

// SLA Status
export const SLA_STATUS = {
    ACTIVE: { label: 'Active', color: 'success', icon: '✅' },
    WARNING: { label: 'Warning', color: 'warning', icon: '⚠️' },
    BREACHED: { label: 'Breached', color: 'danger', icon: '🚨' },
    COMPLETED: { label: 'Completed', color: 'info', icon: '✓' }
};

// Feedback Ratings
export const FEEDBACK_RATINGS = [
    { value: 5, label: 'Excellent', icon: '⭐⭐⭐⭐⭐', color: 'success' },
    { value: 4, label: 'Good', icon: '⭐⭐⭐⭐', color: 'primary' },
    { value: 3, label: 'Average', icon: '⭐⭐⭐', color: 'warning' },
    { value: 2, label: 'Poor', icon: '⭐⭐', color: 'danger' },
    { value: 1, label: 'Very Poor', icon: '⭐', color: 'danger' }
];

// API Endpoints (for reference)
export const API_ENDPOINTS = {
    // Citizen
    REGISTER_COMPLAINT: '/api/citizens/complaints',
    MY_COMPLAINTS: '/api/citizens/complaints',
    REOPEN_COMPLAINT: (id) => `/api/citizens/complaints/${id}/reopen`,
    SUBMIT_FEEDBACK: (id) => `/api/citizens/complaints/${id}/feedback`,

    // Department Officer
    ASSIGNED_COMPLAINTS: '/api/department/dashboard/assigned',
    START_WORK: (id) => `/api/department/complaints/${id}/start`,
    RESOLVE_COMPLAINT: (id) => `/api/department/complaints/${id}/resolve`,

    // Common
    COMPLAINT_DETAILS: (id) => `/api/complaints/${id}`,
    UPLOAD_IMAGE: (id) => `/api/complaints/${id}/images`,
    NOTIFICATIONS: '/api/notifications'
};

export default {
    USER_ROLES,
    ROLE_ROUTES,
    COMPLAINT_STATUS,
    COMPLAINT_FLOW,
    IMAGE_STAGES,
    NOTIFICATION_TYPES,
    DEPARTMENTS,
    WARDS,
    SLA_STATUS,
    FEEDBACK_RATINGS,
    API_ENDPOINTS
};
