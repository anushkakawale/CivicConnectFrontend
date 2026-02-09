import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import apiService from '../api/apiService';

const APITestPage = () => {
    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState(false);
    const [currentTest, setCurrentTest] = useState('');

    const tests = [
        {
            name: 'Get Wards',
            category: 'Public',
            test: async () => {
                const data = await apiService.common.getWards();
                return { success: true, data, count: data?.length || 0 };
            }
        },
        {
            name: 'Get Departments',
            category: 'Public',
            test: async () => {
                const data = await apiService.common.getDepartments();
                return { success: true, data, count: data?.length || 0 };
            }
        },
        {
            name: 'Get Profile',
            category: 'Authenticated',
            test: async () => {
                const data = await apiService.common.getProfile();
                return { success: true, data };
            }
        },
        {
            name: 'Get Citizen Dashboard',
            category: 'Citizen',
            test: async () => {
                const data = await apiService.citizen.getDashboard();
                return { success: true, data };
            }
        },
        {
            name: 'Get My Complaints',
            category: 'Citizen',
            test: async () => {
                const data = await apiService.citizen.getMyComplaints(0, 10);
                return { success: true, data, count: data?.content?.length || 0 };
            }
        },
        {
            name: 'Get Notifications',
            category: 'Authenticated',
            test: async () => {
                const data = await apiService.common.getNotifications();
                return { success: true, data, count: data?.length || 0 };
            }
        }
    ];

    const runAllTests = async () => {
        setTesting(true);
        const results = {};

        for (const test of tests) {
            setCurrentTest(test.name);
            try {
                const result = await test.test();
                results[test.name] = {
                    status: 'success',
                    ...result
                };
            } catch (error) {
                results[test.name] = {
                    status: 'error',
                    error: error.message,
                    details: error.response?.data || error.message
                };
            }
        }

        setTestResults(results);
        setTesting(false);
        setCurrentTest('');
    };

    const runSingleTest = async (test) => {
        setTesting(true);
        setCurrentTest(test.name);

        try {
            const result = await test.test();
            setTestResults(prev => ({
                ...prev,
                [test.name]: {
                    status: 'success',
                    ...result
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [test.name]: {
                    status: 'error',
                    error: error.message,
                    details: error.response?.data || error.message
                }
            }));
        }

        setTesting(false);
        setCurrentTest('');
    };

    const getStatusIcon = (status) => {
        if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (status === 'error') return <XCircle className="w-5 h-5 text-red-600" />;
        return null;
    };

    const groupedTests = tests.reduce((acc, test) => {
        if (!acc[test.category]) acc[test.category] = [];
        acc[test.category].push(test);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">API Test Dashboard</h1>
                    <p className="text-gray-600 mb-4">Test all API endpoints to verify connectivity and data flow</p>

                    <div className="flex gap-4">
                        <button
                            onClick={runAllTests}
                            disabled={testing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {testing ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    Run All Tests
                                </>
                            )}
                        </button>

                        {Object.keys(testResults).length > 0 && (
                            <div className="flex items-center gap-4 ml-auto">
                                <div className="text-sm">
                                    <span className="font-semibold text-green-600">
                                        {Object.values(testResults).filter(r => r.status === 'success').length}
                                    </span>
                                    <span className="text-gray-600"> passed</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold text-red-600">
                                        {Object.values(testResults).filter(r => r.status === 'error').length}
                                    </span>
                                    <span className="text-gray-600"> failed</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {Object.entries(groupedTests).map(([category, categoryTests]) => (
                    <div key={category} className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{category} Endpoints</h2>

                        <div className="space-y-3">
                            {categoryTests.map((test) => {
                                const result = testResults[test.name];
                                const isCurrentTest = currentTest === test.name;

                                return (
                                    <div
                                        key={test.name}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {result && getStatusIcon(result.status)}
                                                {isCurrentTest && <Loader className="w-5 h-5 animate-spin text-blue-600" />}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{test.name}</h3>
                                                    {result && result.status === 'success' && result.count !== undefined && (
                                                        <p className="text-sm text-gray-600">
                                                            {result.count} items returned
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => runSingleTest(test)}
                                                disabled={testing}
                                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-0 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            >
                                                Test
                                            </button>
                                        </div>

                                        {result && result.status === 'error' && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-0">
                                                <p className="text-sm font-semibold text-red-800">Error:</p>
                                                <p className="text-sm text-red-700">{result.error}</p>
                                                {result.details && (
                                                    <details className="mt-2">
                                                        <summary className="text-sm text-red-600 cursor-pointer">
                                                            Show details
                                                        </summary>
                                                        <pre className="mt-2 text-xs text-red-600 overflow-auto">
                                                            {JSON.stringify(result.details, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        )}

                                        {result && result.status === 'success' && result.data && (
                                            <details className="mt-3">
                                                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                                                    Show response data
                                                </summary>
                                                <pre className="mt-2 p-3 bg-gray-50 rounded-0 text-xs overflow-auto max-h-64">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">How to use this page:</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Click "Run All Tests" to test all endpoints at once</li>
                        <li>Click "Test" on individual endpoints to test them separately</li>
                        <li>Green checkmarks indicate successful API calls</li>
                        <li>Red X marks indicate failed API calls - expand to see error details</li>
                        <li>Make sure you're logged in to test authenticated endpoints</li>
                        <li>Check browser console (F12) for detailed logs</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default APITestPage;
