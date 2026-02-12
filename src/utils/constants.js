/**
 * Application Constants
 * Centralized constants for the entire application
 */

// ==================== API CONFIGURATION ====================
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api',
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    USE_MOCK: import.meta.env.VITE_USE_MOCK_API === 'true'
};

// ==================== USER ROLES ====================
export const USER_ROLES = {
    CITIZEN: 'CITIZEN',
    WARD_OFFICER: 'WARD_OFFICER',
    DEPARTMENT_OFFICER: 'DEPARTMENT_OFFICER',
    ADMIN: 'ADMIN'
};

// ==================== COMPLAINT STATUS ====================
export const COMPLAINT_STATUS = {
    SUBMITTED: 'SUBMITTED',     // Citizen
    ASSIGNED: 'ASSIGNED',       // System
    IN_PROGRESS: 'IN_PROGRESS', // Department Officer
    RESOLVED: 'RESOLVED',       // Department Officer
    APPROVED: 'APPROVED',       // Ward Officer
    CLOSED: 'CLOSED',           // Admin
    REOPENED: 'REOPENED',       // Citizen
    REJECTED: 'REJECTED',       // Admin
    ON_HOLD: 'ON_HOLD',
    ESCALATED: 'ESCALATED'
};

// Status labels for display
export const STATUS_LABELS = {
    [COMPLAINT_STATUS.SUBMITTED]: 'Submitted',
    [COMPLAINT_STATUS.ASSIGNED]: 'Assigned',
    [COMPLAINT_STATUS.IN_PROGRESS]: 'In Progress',
    [COMPLAINT_STATUS.RESOLVED]: 'Resolved',
    [COMPLAINT_STATUS.APPROVED]: 'Approved',
    [COMPLAINT_STATUS.CLOSED]: 'Closed',
    [COMPLAINT_STATUS.REOPENED]: 'Reopened',
    [COMPLAINT_STATUS.REJECTED]: 'Rejected',
    [COMPLAINT_STATUS.ON_HOLD]: 'On Hold',
    [COMPLAINT_STATUS.ESCALATED]: 'Escalated'
};

// Status colors (Modern Palette)
export const STATUS_COLORS = {
    [COMPLAINT_STATUS.SUBMITTED]: '#64748b',   // Slate
    [COMPLAINT_STATUS.ASSIGNED]: '#3b82f6',    // Blue
    [COMPLAINT_STATUS.IN_PROGRESS]: '#f59e0b', // Amber
    [COMPLAINT_STATUS.RESOLVED]: '#10b981',    // Emerald
    [COMPLAINT_STATUS.APPROVED]: '#059669',    // Green-600
    [COMPLAINT_STATUS.CLOSED]: '#1e293b',      // Slate-800
    [COMPLAINT_STATUS.REOPENED]: '#6366f1',    // Indigo
    [COMPLAINT_STATUS.REJECTED]: '#ef4444',    // Red
    [COMPLAINT_STATUS.ON_HOLD]: '#8b5cf6',     // Violet
    [COMPLAINT_STATUS.ESCALATED]: '#dc2626'    // Red-600
};

// ==================== APPROVAL STATUS ====================
export const APPROVAL_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

// ==================== IMAGE STAGE ====================
export const IMAGE_STAGE = {
    BEFORE_WORK: 'BEFORE_WORK',
    IN_PROGRESS: 'IN_PROGRESS',
    AFTER_RESOLUTION: 'AFTER_RESOLUTION'
};

// ==================== UPLOADED BY ====================
export const UPLOADED_BY = {
    CITIZEN: 'CITIZEN',
    DEPARTMENT_OFFICER: 'DEPARTMENT_OFFICER',
    WARD_OFFICER: 'WARD_OFFICER'
};

// ==================== SLA STATUS ====================
export const SLA_STATUS = {
    ON_TRACK: 'ON_TRACK',
    WARNING: 'WARNING',
    BREACHED: 'BREACHED',
    MET: 'MET',
    ACTIVE: 'ACTIVE'
};

// SLA status colors
export const SLA_COLORS = {
    [SLA_STATUS.ON_TRACK]: '#10b981',   // Emerald
    [SLA_STATUS.WARNING]: '#f59e0b',    // Amber
    [SLA_STATUS.BREACHED]: '#ef4444',   // Red
    [SLA_STATUS.MET]: '#059669',        // Green-600
    [SLA_STATUS.ACTIVE]: '#3b82f6'      // Blue
};

// ==================== FILE UPLOAD ====================
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
    MAX_FILES: 3,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png']
};

// ==================== PAGINATION ====================
export const PAGINATION = {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
    SIZE_OPTIONS: [10, 20, 50, 100]
};

// ==================== DATE FORMATS ====================
export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    API: "yyyy-MM-dd'T'HH:mm:ss",
    DATE_ONLY: 'yyyy-MM-dd'
};

// ==================== ROUTES ====================
export const ROUTES = {
    // Public
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN_LOGIN: '/admin/login',

    // Citizen
    CITIZEN_DASHBOARD: '/citizen/dashboard',
    CITIZEN_COMPLAINTS: '/citizen/complaints',
    CITIZEN_CREATE_COMPLAINT: '/citizen/complaints/new',
    CITIZEN_COMPLAINT_DETAILS: '/citizen/complaints/:id',
    CITIZEN_AREA_COMPLAINTS: '/citizen/area-complaints',
    CITIZEN_MAP: '/citizen/map',
    CITIZEN_WARD_ANALYTICS: '/citizen/ward-analytics',
    CITIZEN_PROFILE: '/citizen/profile',
    CITIZEN_NOTIFICATIONS: '/citizen/notifications',

    // Ward Officer
    WARD_OFFICER_DASHBOARD: '/ward-officer/dashboard',
    WARD_OFFICER_COMPLAINTS: '/ward-officer/complaints',
    WARD_OFFICER_APPROVALS: '/ward-officer/approvals',
    WARD_OFFICER_WARD_CHANGES: '/ward-officer/ward-changes',
    WARD_OFFICER_OFFICERS: '/ward-officer/officers',
    WARD_OFFICER_ANALYTICS: '/ward-officer/analytics',
    WARD_OFFICER_PROFILE: '/ward-officer/profile',

    // Department Officer
    DEPARTMENT_DASHBOARD: '/department/dashboard',
    DEPARTMENT_COMPLAINTS: '/department/complaints',
    DEPARTMENT_ANALYTICS: '/department/analytics',
    DEPARTMENT_PROFILE: '/department/profile',

    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_COMPLAINTS: '/admin/complaints',
    ADMIN_USERS: '/admin/users',
    ADMIN_OFFICERS: '/admin/officers',
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_AUDIT: '/admin/audit',
    ADMIN_PROFILE: '/admin/profile'
};

// ==================== LOCAL STORAGE KEYS ====================
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    ROLE: 'role',
    THEME: 'theme'
};

// ==================== THEME ====================
export const THEME = {
    LIGHT: 'light',
    DARK: 'dark'
};

// ==================== VALIDATION ====================
export const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MOBILE_REGEX: /^[6-9]\d{9}$/,
    PASSWORD_MIN_LENGTH: 8,
    TITLE_MIN_LENGTH: 10,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 20,
    DESCRIPTION_MAX_LENGTH: 500
};

// ==================== MAP CONFIGURATION ====================
export const MAP_CONFIG = {
    DEFAULT_CENTER: [12.9716, 77.5946], // Bangalore coordinates
    DEFAULT_ZOOM: 13,
    MAX_ZOOM: 18,
    MIN_ZOOM: 10
};

// ==================== CHART COLORS ====================
export const CHART_COLORS = [
    '#1976d2', // Blue
    '#dc004e', // Pink
    '#2e7d32', // Green
    '#ed6c02', // Orange
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ff9800', // Amber
    '#4caf50', // Light Green
    '#f44336', // Red
    '#3f51b5'  // Indigo
];

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SESSION_EXPIRED: 'Session expired. Please login again.',
    ACCESS_DENIED: 'Access denied. You do not have permission.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred.'
};

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
    COMPLAINT_CREATED: 'Complaint registered successfully!',
    COMPLAINT_UPDATED: 'Complaint updated successfully!',
    COMPLAINT_APPROVED: 'Complaint approved successfully!',
    COMPLAINT_REJECTED: 'Complaint rejected successfully!',
    COMPLAINT_RESOLVED: 'Complaint marked as resolved!',
    FEEDBACK_SUBMITTED: 'Feedback submitted successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PASSWORD_CHANGED: 'Password changed successfully!',
    MOBILE_UPDATED: 'Mobile number updated successfully!',
    WARD_CHANGE_REQUESTED: 'Ward change request submitted!',
    OFFICER_CREATED: 'Officer created successfully!'
};

export default {
    API_CONFIG,
    USER_ROLES,
    COMPLAINT_STATUS,
    STATUS_LABELS,
    STATUS_COLORS,
    COMPLAINT_CATEGORY,
    CATEGORY_LABELS,
    CATEGORY_ICONS,
    PRIORITY,
    PRIORITY_LABELS,
    PRIORITY_COLORS,
    NOTIFICATION_TYPE,
    SLA_STATUS,
    SLA_COLORS,
    FILE_UPLOAD,
    PAGINATION,
    DATE_FORMATS,
    ROUTES,
    STORAGE_KEYS,
    THEME,
    VALIDATION,
    MAP_CONFIG,
    CHART_COLORS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
};
