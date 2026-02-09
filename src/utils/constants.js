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
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
    REJECTED: 'REJECTED',
    REOPENED: 'REOPENED',
    ESCALATED: 'ESCALATED'
};

// Status labels for display
export const STATUS_LABELS = {
    [COMPLAINT_STATUS.PENDING]: 'Pending',
    [COMPLAINT_STATUS.APPROVED]: 'Approved',
    [COMPLAINT_STATUS.IN_PROGRESS]: 'In Progress',
    [COMPLAINT_STATUS.RESOLVED]: 'Resolved',
    [COMPLAINT_STATUS.CLOSED]: 'Closed',
    [COMPLAINT_STATUS.REJECTED]: 'Rejected',
    [COMPLAINT_STATUS.REOPENED]: 'Reopened',
    [COMPLAINT_STATUS.ESCALATED]: 'Escalated'
};

// Status colors (Modern Palette)
export const STATUS_COLORS = {
    [COMPLAINT_STATUS.PENDING]: '#f59e0b',      // Amber
    [COMPLAINT_STATUS.APPROVED]: '#10b981',     // Emerald
    [COMPLAINT_STATUS.IN_PROGRESS]: '#3b82f6',  // Blue
    [COMPLAINT_STATUS.RESOLVED]: '#10b981',     // Emerald
    [COMPLAINT_STATUS.CLOSED]: '#1e293b',       // Slate 800
    [COMPLAINT_STATUS.REJECTED]: '#ef4444',     // Red
    [COMPLAINT_STATUS.REOPENED]: '#6366f1',     // Indigo
    [COMPLAINT_STATUS.ESCALATED]: '#dc2626'      // Red-600
};

// ==================== COMPLAINT CATEGORY ====================
export const COMPLAINT_CATEGORY = {
    ROAD_MAINTENANCE: 'ROAD_MAINTENANCE',
    STREET_LIGHTING: 'STREET_LIGHTING',
    GARBAGE_COLLECTION: 'GARBAGE_COLLECTION',
    WATER_SUPPLY: 'WATER_SUPPLY',
    DRAINAGE: 'DRAINAGE',
    SEWAGE: 'SEWAGE',
    PARKS_GARDENS: 'PARKS_GARDENS',
    TRAFFIC: 'TRAFFIC',
    NOISE_POLLUTION: 'NOISE_POLLUTION',
    OTHER: 'OTHER'
};

// Category labels for display
export const CATEGORY_LABELS = {
    [COMPLAINT_CATEGORY.ROAD_MAINTENANCE]: 'Road Maintenance',
    [COMPLAINT_CATEGORY.STREET_LIGHTING]: 'Street Lighting',
    [COMPLAINT_CATEGORY.GARBAGE_COLLECTION]: 'Garbage Collection',
    [COMPLAINT_CATEGORY.WATER_SUPPLY]: 'Water Supply',
    [COMPLAINT_CATEGORY.DRAINAGE]: 'Drainage',
    [COMPLAINT_CATEGORY.SEWAGE]: 'Sewage',
    [COMPLAINT_CATEGORY.PARKS_GARDENS]: 'Parks & Gardens',
    [COMPLAINT_CATEGORY.TRAFFIC]: 'Traffic',
    [COMPLAINT_CATEGORY.NOISE_POLLUTION]: 'Noise Pollution',
    [COMPLAINT_CATEGORY.OTHER]: 'Other'
};

// Category icons (using Lucide React icon names)
export const CATEGORY_ICONS = {
    [COMPLAINT_CATEGORY.ROAD_MAINTENANCE]: 'Construction',
    [COMPLAINT_CATEGORY.STREET_LIGHTING]: 'Lightbulb',
    [COMPLAINT_CATEGORY.GARBAGE_COLLECTION]: 'Trash2',
    [COMPLAINT_CATEGORY.WATER_SUPPLY]: 'Droplet',
    [COMPLAINT_CATEGORY.DRAINAGE]: 'Waves',
    [COMPLAINT_CATEGORY.SEWAGE]: 'Droplets',
    [COMPLAINT_CATEGORY.PARKS_GARDENS]: 'Trees',
    [COMPLAINT_CATEGORY.TRAFFIC]: 'Car',
    [COMPLAINT_CATEGORY.NOISE_POLLUTION]: 'Volume2',
    [COMPLAINT_CATEGORY.OTHER]: 'MoreHorizontal'
};

// ==================== PRIORITY ====================
export const PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

// Priority labels
export const PRIORITY_LABELS = {
    [PRIORITY.LOW]: 'Low',
    [PRIORITY.MEDIUM]: 'Medium',
    [PRIORITY.HIGH]: 'High',
    [PRIORITY.CRITICAL]: 'Critical'
};

// Priority colors
export const PRIORITY_COLORS = {
    [PRIORITY.LOW]: '#4caf50',      // Green
    [PRIORITY.MEDIUM]: '#ff9800',   // Orange
    [PRIORITY.HIGH]: '#ff5722',     // Deep Orange
    [PRIORITY.CRITICAL]: '#f44336'  // Red
};

// ==================== NOTIFICATION TYPES ====================
export const NOTIFICATION_TYPE = {
    COMPLAINT_CREATED: 'COMPLAINT_CREATED',
    APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
    ASSIGNMENT: 'ASSIGNMENT',
    STATUS_UPDATE: 'STATUS_UPDATE',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
    REOPENED: 'REOPENED',
    SLA_WARNING: 'SLA_WARNING',
    SLA_BREACHED: 'SLA_BREACHED',
    SYSTEM: 'SYSTEM'
};

// ==================== SLA STATUS ====================
export const SLA_STATUS = {
    WITHIN_SLA: 'WITHIN_SLA',
    NEARING_DEADLINE: 'NEARING_DEADLINE',
    BREACHED: 'BREACHED'
};

// SLA status colors
export const SLA_COLORS = {
    [SLA_STATUS.WITHIN_SLA]: '#4caf50',         // Green
    [SLA_STATUS.NEARING_DEADLINE]: '#ff9800',   // Orange
    [SLA_STATUS.BREACHED]: '#f44336'            // Red
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
