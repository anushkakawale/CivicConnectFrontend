import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { DATE_FORMATS, ERROR_MESSAGES } from './constants';

/**
 * Helper Utilities
 * Common utility functions used across the application
 */

// ==================== DATE FORMATTING ====================

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (optional)
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
    if (!date) return '-';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Date formatting error:', error);
        return '-';
    }
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
    return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Get relative time (e.g., "3 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
    if (!date) return '-';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        console.error('Relative time error:', error);
        return '-';
    }
};

// ==================== ERROR HANDLING ====================

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - Error object
 * @returns {string} Error message
 */
export const handleAPIError = (error) => {
    if (error.response) {
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return data.message || ERROR_MESSAGES.VALIDATION_ERROR;
            case 401:
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                window.location.href = '/';
                return ERROR_MESSAGES.SESSION_EXPIRED;
            case 403:
                return ERROR_MESSAGES.ACCESS_DENIED;
            case 404:
                return ERROR_MESSAGES.NOT_FOUND;
            case 500:
                return ERROR_MESSAGES.SERVER_ERROR;
            default:
                return data.message || ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    } else if (error.request) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    } else {
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
};

// ==================== FILE HANDLING ====================

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} True if valid
 */
export const validateFileSize = (file, maxSize) => {
    return file.size <= maxSize;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @returns {boolean} True if valid
 */
export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Create FormData from object
 * @param {Object} data - Data object
 * @returns {FormData} FormData object
 */
export const createFormData = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            if (Array.isArray(data[key])) {
                data[key].forEach(item => formData.append(key, item));
            } else {
                formData.append(key, data[key]);
            }
        }
    });
    return formData;
};

// ==================== STRING UTILITIES ====================

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert snake_case to Title Case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const snakeToTitle = (str) => {
    if (!str) return '';
    return str
        .split('_')
        .map(word => capitalize(word))
        .join(' ');
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// ==================== NUMBER UTILITIES ====================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total, decimals = 2) => {
    if (!total || total === 0) return 0;
    return parseFloat(((value / total) * 100).toFixed(decimals));
};

// ==================== ARRAY UTILITIES ====================

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

// ==================== VALIDATION ====================

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate mobile number (Indian)
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} True if valid
 */
export const isValidMobile = (mobile) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobile);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength and message
 */
export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { valid: false, strength: 'weak', message: 'Password must be at least 8 characters' };
    }

    let strength = 'weak';
    let validCount = 0;

    if (hasUpperCase) validCount++;
    if (hasLowerCase) validCount++;
    if (hasNumbers) validCount++;
    if (hasSpecialChar) validCount++;

    if (validCount >= 4) strength = 'strong';
    else if (validCount >= 3) strength = 'medium';

    return {
        valid: validCount >= 3,
        strength,
        message: validCount >= 3 ? 'Password is strong' : 'Password must contain uppercase, lowercase, number, and special character'
    };
};

// ==================== LOCAL STORAGE ====================

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setStorageItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error writing to localStorage:', error);
    }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
};

// ==================== DEBOUNCE ====================

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ==================== DOWNLOAD ====================

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// ==================== COPY TO CLIPBOARD ====================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

// ==================== QUERY STRING ====================

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
    const query = Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    return query ? `?${query}` : '';
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parameters object
 */
export const parseQueryString = (queryString) => {
    const params = {};
    const searchParams = new URLSearchParams(queryString);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
};

export default {
    formatDate,
    formatDateTime,
    getRelativeTime,
    handleAPIError,
    validateFileSize,
    validateFileType,
    formatFileSize,
    createFormData,
    capitalize,
    snakeToTitle,
    truncate,
    formatNumber,
    calculatePercentage,
    groupBy,
    sortBy,
    isValidEmail,
    isValidMobile,
    validatePassword,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    debounce,
    downloadFile,
    copyToClipboard,
    buildQueryString,
    parseQueryString
};
