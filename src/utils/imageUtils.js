/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', ''); // Remove /api to get base URL

/**
 * Converts a relative image URL to an absolute URL pointing to the backend
 * @param {string} imageUrl - The image URL from the API
 * @param {number|string} complaintId - Optional complaint ID
 * @returns {string} - Absolute URL
 */
export const getImageUrl = (imageUrl, complaintId = null) => {
    if (!imageUrl) return null;

    // 1. Return as is if already absolute or data-url
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
        return imageUrl;
    }

    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api').replace(/\/+$/, '');
    const origin = baseUrl.replace(/\/api$/, '');

    // 1.5 Special check: If it already starts with /api/images or /images and has path segments, return absolute baseUrl
    if (imageUrl.startsWith('/api/images/') || imageUrl.startsWith('/images/')) {
        const pathPart = imageUrl.startsWith('/api') ? imageUrl : `/api${imageUrl}`;
        return `${origin}${pathPart}`;
    }

    const filename = imageUrl.split(/[\\/]/).pop();

    // Strategy B: Resource Controller based on Complaint ID - PRIORITIZED
    if (complaintId && filename && !imageUrl.startsWith('http')) {
        return `${baseUrl}/complaints/${complaintId}/images/${filename}`;
    }

    // Strategy A: Direct API Image Proxy (Most common for secured apps)
    // ONLY if it's just a filename, otherwise we prefer the existing path
    if (filename && filename.length > 5 && !imageUrl.includes('/')) {
        return `${baseUrl}/images/${filename}`;
    }

    // Strategy C: Static Uploads path (Unsecured/Public assets)
    if (imageUrl.startsWith('/uploads')) {
        return `${origin}${imageUrl}`;
    }

    // Strategy D: Relative to API base
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    if (imageUrl.includes('complaint')) {
        return `${baseUrl}${cleanPath}`;
    }

    // Default Fallback
    return `${origin}/uploads/${filename}`;
};

/**
 * Get a placeholder image URL for when image fails to load
 * @param {string} text - Text to display in placeholder
 * @returns {string} - Data URL for SVG placeholder
 */
export const getPlaceholderImage = (text = 'INITIAL') => {
    return `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:%23f1f5f9;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:%23e2e8f0;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect fill="url(%23g)" width="400" height="400" rx="20"/>
            <text x="50%" y="45%" text-anchor="middle" fill="%2394a3b8" font-family="Inter, sans-serif" font-size="12" font-weight="800" letter-spacing="0.2em">
                DOCUMENTATION
            </text>
            <text x="50%" y="55%" text-anchor="middle" fill="%2364748b" font-family="Inter, sans-serif" font-size="24" font-weight="900" letter-spacing="0.1em">
                ${text.toUpperCase()}
            </text>
            <circle cx="50%" cy="50%" r="180" fill="none" stroke="%23cbd5e1" stroke-width="1" stroke-dasharray="8 8" opacity="0.5"/>
        </svg>
    `)}`;
};

/**
 * Extract image URL from various possible property names
 * @param {Object} image - Image object from API
 * @param {number|string} complaintId - Optional complaint ID
 * @returns {string|null} - Extracted image URL
 */
export const extractImageUrl = (image, complaintId = null) => {
    if (!image) return null;

    // If image is already a string (direct URL/path)
    if (typeof image === 'string') {
        return getImageUrl(image, complaintId);
    }

    const url = image.imageUrl || image.url || image.image_url || image.path || image.imagePath || image.image_path || image.fileName || image.name;
    const cid = complaintId || image.complaintId || image.complaint_id || image.complaintId;

    return getImageUrl(url, cid);
};

export default {
    getImageUrl,
    getPlaceholderImage,
    extractImageUrl
};
