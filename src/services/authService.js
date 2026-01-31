import api from '../api/axios';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * User login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login response with token and user data
 */
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;

        // Save authentication data
        if (data.token) {
            saveAuthData(data);
            console.log('✅ Login successful, user data saved:', {
                role: data.role,
                email: data.email,
                name: data.name
            });
        }

        return data;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Citizen registration
 * @param {Object} userData - Registration data
 * @returns {Promise} Registration response
 */
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        const data = response.data;

        // Auto-login after successful registration
        if (data.token) {
            saveAuthData(data);
            console.log('✅ Registration successful, user auto-logged in');
        }

        return data;
    } catch (error) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Admin login
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise} Login response with token and user data
 */
export const adminLogin = async (username, password) => {
    try {
        const response = await api.post('/admin/login', { username, password });
        const data = response.data;

        if (data.token) {
            saveAuthData(data);
            console.log('✅ Admin login successful');
        }

        return data;
    } catch (error) {
        console.error('❌ Admin login failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Logout (client-side)
 * Clears local storage and redirects to login
 */
export const logout = () => {
    console.log('🚪 Logging out user...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/';
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get current user role
 * @returns {string|null} User role or null
 */
export const getCurrentRole = () => {
    return localStorage.getItem('role');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Save auth data to localStorage
 * @param {Object} data - Auth data (token, user, role)
 */
export const saveAuthData = (data) => {
    if (!data || !data.token) {
        console.error('❌ Invalid auth data, cannot save');
        return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('role', data.role);

    console.log('💾 Auth data saved to localStorage');
};

/**
 * Get dashboard route based on user role
 * @returns {string} Dashboard route path
 */
export const getDashboardRoute = () => {
    const role = getCurrentRole();

    const routes = {
        'CITIZEN': '/citizen/dashboard',
        'WARD_OFFICER': '/ward-officer/dashboard',
        'DEPARTMENT_OFFICER': '/department/dashboard',
        'ADMIN': '/admin/dashboard'
    };

    return routes[role] || '/citizen/dashboard';
};

/**
 * Get user display name
 * @returns {string} User's display name
 */
export const getUserDisplayName = () => {
    const user = getCurrentUser();
    return user?.name || user?.email || 'User';
};

const authService = {
    login,
    register,
    adminLogin,
    logout,
    getCurrentUser,
    getCurrentRole,
    isAuthenticated,
    saveAuthData,
    getDashboardRoute,
    getUserDisplayName
};

export default authService;
