/**
 * API Tester Utility
 * Use this to test API connectivity and data fetching
 */

import apiService from '../api/apiService';

export const testAPIConnection = async () => {
    const results = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {
            total: 0,
            passed: 0,
            failed: 0
        }
    };

    const addTest = (name, success, data, error) => {
        results.tests.push({
            name,
            success,
            data: success ? data : null,
            error: error ? error.message : null,
            timestamp: new Date().toISOString()
        });
        results.summary.total++;
        if (success) {
            results.summary.passed++;
        } else {
            results.summary.failed++;
        }
    };

    console.log('🧪 Starting API Connection Tests...\n');

    // Test 1: Fetch Wards
    try {
        console.log('📍 Test 1: Fetching Wards...');
        const wards = await apiService.common.getWards();
        console.log('✅ Wards fetched:', wards);
        addTest('Get Wards', true, wards);
    } catch (error) {
        console.error('❌ Failed to fetch wards:', error);
        addTest('Get Wards', false, null, error);
    }

    // Test 2: Fetch Departments
    try {
        console.log('\n📍 Test 2: Fetching Departments...');
        const departments = await apiService.common.getDepartments();
        console.log('✅ Departments fetched:', departments);
        addTest('Get Departments', true, departments);
    } catch (error) {
        console.error('❌ Failed to fetch departments:', error);
        addTest('Get Departments', false, null, error);
    }

    // Test 3: Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log('\n📍 Test 3: Checking Authentication...');
    if (token && user) {
        console.log('✅ User is logged in:', JSON.parse(user));
        addTest('Authentication Check', true, { token: '***', user: JSON.parse(user) });

        // Test 4: Fetch Profile (requires auth)
        try {
            console.log('\n📍 Test 4: Fetching User Profile...');
            const profile = await apiService.common.getProfile();
            console.log('✅ Profile fetched:', profile);
            addTest('Get Profile', true, profile);
        } catch (error) {
            console.error('❌ Failed to fetch profile:', error);
            addTest('Get Profile', false, null, error);
        }

        // Test 5: Fetch Notifications (requires auth)
        try {
            console.log('\n📍 Test 5: Fetching Notifications...');
            const notifications = await apiService.common.getNotifications();
            console.log('✅ Notifications fetched:', notifications);
            addTest('Get Notifications', true, notifications);
        } catch (error) {
            console.error('❌ Failed to fetch notifications:', error);
            addTest('Get Notifications', false, null, error);
        }

        // Test 6: Fetch Dashboard Data (role-specific)
        const userRole = JSON.parse(user).role;
        try {
            console.log(`\n📍 Test 6: Fetching ${userRole} Dashboard...`);
            let dashboard;

            switch (userRole) {
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

            console.log('✅ Dashboard data fetched:', dashboard);
            addTest(`Get ${userRole} Dashboard`, true, dashboard);
        } catch (error) {
            console.error('❌ Failed to fetch dashboard:', error);
            addTest(`Get ${userRole} Dashboard`, false, null, error);
        }
    } else {
        console.log('⚠️ User is not logged in');
        addTest('Authentication Check', false, null, new Error('Not logged in'));
    }

    // Print Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(50) + '\n');

    return results;
};

// Quick test for specific endpoint
export const testEndpoint = async (servicePath, methodName, ...args) => {
    try {
        console.log(`🧪 Testing: ${servicePath}.${methodName}(${args.join(', ')})`);

        // Navigate to the method
        const parts = servicePath.split('.');
        let service = apiService;
        for (const part of parts) {
            service = service[part];
        }

        const result = await service[methodName](...args);
        console.log('✅ Success:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Failed:', error);
        return { success: false, error: error.message };
    }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testAPI = testAPIConnection;
    window.testEndpoint = testEndpoint;
    console.log('💡 API Tester loaded! Use window.testAPI() to run all tests');
}

export default {
    testAPIConnection,
    testEndpoint
};
