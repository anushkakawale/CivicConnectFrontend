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
    const role = localStorage.getItem('role');
    if (!role || role === 'undefined' || role === 'null') return null;
    return role;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token && token !== 'undefined' && token !== 'null';
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

    // Universal Role Extractor: Handles Single String, Array, or Complex Authority Objects
    let rawRole = data.role || data.roles || data.authorities || (data.user && (data.user.role || data.user.roles));

    // 1. Array of Authorities/Roles
    if (Array.isArray(rawRole) && rawRole.length > 0) {
        const first = rawRole[0];
        rawRole = typeof first === 'string' ? first : (first.authority || first.name || first.role || first.roleName);
    }

    // 2. Object Role
    if (rawRole && typeof rawRole === 'object') {
        rawRole = rawRole.authority || rawRole.name || rawRole.role || rawRole.roleName;
    }

    // 3. String Normalization & Fallback
    let normalizedRole = typeof rawRole === 'string' ? rawRole.replace('ROLE_', '') : rawRole;

    // Safety Fallback: Default to CITIZEN if we have a token but can't determine role,
    // though for Admins we usually want to be explicit.
    if (!normalizedRole && data.token) {
        console.warn('⚠️ Authentication succeeded but role was not identified. Defaulting to GUEST access.');
        normalizedRole = 'CITIZEN';
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', normalizedRole);
    localStorage.setItem('user', JSON.stringify(data));

    if (data.name) localStorage.setItem('name', data.name);

    console.log('🛡️ Security Context Initialized:', {
        role: normalizedRole,
        hasToken: !!data.token,
        userName: data.name
    });
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
        'DEPT_OFFICER': '/department/dashboard',
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
