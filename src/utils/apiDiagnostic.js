/**
 * API Diagnostic Tool
 * Tests all API endpoints and displays results
 */

import apiService from '../api/apiService';

export const testAllAPIs = async () => {
    const results = {
        public: {},
        authenticated: {},
        errors: []
    };

    console.log('🔍 Starting API Diagnostic Tests...\n');

    // Test 1: Public Endpoints (No Auth Required)
    console.log('📡 Testing Public Endpoints...');

    try {
        const wards = await apiService.common.getWards();
        results.public.wards = {
            status: 'SUCCESS',
            count: wards?.length || 0,
            data: wards
        };
        console.log('✅ Wards:', wards?.length || 0, 'items');
    } catch (error) {
        results.public.wards = {
            status: 'FAILED',
            error: error.message
        };
        results.errors.push({ endpoint: '/wards', error: error.message });
        console.error('❌ Wards failed:', error.message);
    }

    try {
        const departments = await apiService.common.getDepartments();
        results.public.departments = {
            status: 'SUCCESS',
            count: departments?.length || 0,
            data: departments
        };
        console.log('✅ Departments:', departments?.length || 0, 'items');
    } catch (error) {
        results.public.departments = {
            status: 'FAILED',
            error: error.message
        };
        results.errors.push({ endpoint: '/departments', error: error.message });
        console.error('❌ Departments failed:', error.message);
    }

    // Test 2: Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        console.log('⚠️ No authentication token found. Skipping authenticated endpoint tests.');
        console.log('💡 Please login first to test authenticated endpoints.');
        return results;
    }

    console.log('\n🔐 Testing Authenticated Endpoints...');
    console.log('👤 User Role:', user.role);

    // Test 3: Profile Endpoint
    try {
        const profile = await apiService.common.getProfile();
        results.authenticated.profile = {
            status: 'SUCCESS',
            data: profile
        };
        console.log('✅ Profile loaded:', profile.name);
    } catch (error) {
        results.authenticated.profile = {
            status: 'FAILED',
            error: error.message
        };
        results.errors.push({ endpoint: '/profile/me', error: error.message });
        console.error('❌ Profile failed:', error.message);
    }

    // Test 4: Role-specific Dashboard
    try {
        let dashboard;
        switch (user.role) {
            case 'CITIZEN':
                dashboard = await apiService.citizen.getDashboard();
                break;
            case 'WARD_OFFICER':
                dashboard = await apiService.wardOfficer.getDashboard();
                break;
            case 'DEPARTMENT_OFFICER':
                dashboard = await apiService.departmentOfficer.getDashboard();
                break;
            case 'ADMIN':
                dashboard = await apiService.admin.getDashboard();
                break;
            default:
                throw new Error('Unknown role');
        }
        results.authenticated.dashboard = {
            status: 'SUCCESS',
            data: dashboard
        };
        console.log('✅ Dashboard loaded:', Object.keys(dashboard).length, 'properties');
    } catch (error) {
        results.authenticated.dashboard = {
            status: 'FAILED',
            error: error.message
        };
        results.errors.push({ endpoint: `/${user.role?.toLowerCase()}/dashboard`, error: error.message });
        console.error('❌ Dashboard failed:', error.message);
    }

    // Test 5: Notifications
    try {
        const notifications = await apiService.common.getNotifications();
        results.authenticated.notifications = {
            status: 'SUCCESS',
            count: notifications?.length || 0,
            data: notifications
        };
        console.log('✅ Notifications:', notifications?.length || 0, 'items');
    } catch (error) {
        results.authenticated.notifications = {
            status: 'FAILED',
            error: error.message
        };
        results.errors.push({ endpoint: '/notifications', error: error.message });
        console.error('❌ Notifications failed:', error.message);
    }

    // Print Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log('Public Endpoints:', Object.keys(results.public).filter(k => results.public[k].status === 'SUCCESS').length, '/', Object.keys(results.public).length, 'passed');
    console.log('Authenticated Endpoints:', Object.keys(results.authenticated).filter(k => results.authenticated[k].status === 'SUCCESS').length, '/', Object.keys(results.authenticated).length, 'passed');
    console.log('Total Errors:', results.errors.length);

    if (results.errors.length > 0) {
        console.log('\n❌ Failed Endpoints:');
        results.errors.forEach(err => {
            console.log(`  - ${err.endpoint}: ${err.error}`);
        });
    }

    return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testAllAPIs = testAllAPIs;
}

export default testAllAPIs;
