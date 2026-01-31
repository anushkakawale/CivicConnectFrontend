/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', ''); // Remove /api to get base URL

/**
 * Converts a relative image URL to an absolute URL pointing to the backend
 * @param {string} imageUrl - The image URL from the API (e.g., "/uploads/image.jpg")
 * @returns {string} - Absolute URL (e.g., "http://localhost:8083/uploads/image.jpg")
 */
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return null;
    }

    // If already an absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // If it's a data URL, return as is
    if (imageUrl.startsWith('data:')) {
        return imageUrl;
    }

    // Convert relative URL to absolute
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${BACKEND_BASE_URL}${cleanUrl}`;
};

/**
 * Get a placeholder image URL for when image fails to load
 * @param {string} text - Text to display in placeholder
 * @returns {string} - Data URL for SVG placeholder
 */
export const getPlaceholderImage = (text = 'Image Not Available') => {
    return `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
            <rect fill="#f0f0f0" width="400" height="300"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial" font-size="16">
                ${text}
            </text>
        </svg>
    `)}`;
};

/**
 * Extract image URL from various possible property names
 * @param {Object} image - Image object from API
 * @returns {string|null} - Extracted image URL
 */
export const extractImageUrl = (image) => {
    if (!image) return null;

    const url = image.imageUrl || image.url || image.image_url || image.path || image.imagePath;
    return getImageUrl(url);
};

export default {
    getImageUrl,
    getPlaceholderImage,
    extractImageUrl
};
