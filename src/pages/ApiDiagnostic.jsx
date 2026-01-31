import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Server, Database, Lock, Image as ImageIcon } from 'lucide-react';
import axios from '../api/axios';
import { apiConfig } from '../api/axios';
import citizenService from '../services/citizenService';

const ApiDiagnostic = () => {
    const [results, setResults] = useState({});
    const [testing, setTesting] = useState(false);
    const [currentTest, setCurrentTest] = useState('');

    const runTest = async (name, testFn) => {
        setCurrentTest(name);
        try {
            const result = await testFn();
            setResults(prev => ({ ...prev, [name]: { status: 'success', ...result } }));
            return true;
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [name]: {
                    status: 'error',
                    error: error.message,
                    details: error.response?.data || error.toString()
                }
            }));
            return false;
        }
    };

    const runAllTests = async () => {
        setTesting(true);
        setResults({});

        // Test 1: API Configuration
        await runTest('config', async () => {
            return {
                message: 'API Configuration loaded',
                data: apiConfig
            };
        });

        // Test 2: Backend Connectivity
        await runTest('connectivity', async () => {
            const response = await axios.get('/health', { timeout: 5000 }).catch(() => {
                // If /health doesn't exist, try /wards as a test
                return axios.get('/api/wards', { timeout: 5000 });
            });
            return {
                message: 'Backend is reachable',
                status: response.status
            };
        });

        // Test 3: Authentication
        await runTest('auth', async () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (!token) {
                throw new Error('No authentication token found. Please login.');
            }
            return {
                message: 'Authentication token present',
                user: user ? JSON.parse(user) : null,
                tokenLength: token.length
            };
        });

        // Test 4: Profile API
        await runTest('profile', async () => {
            const profile = await citizenService.getProfile();
            return {
                message: 'Profile loaded successfully',
                data: profile
            };
        });

        // Test 5: Complaints API
        await runTest('complaints', async () => {
            const complaints = await citizenService.getMyComplaints(0, 5);
            return {
                message: 'Complaints loaded successfully',
                count: complaints.content?.length || complaints.length || 0
            };
        });

        // Test 6: Departments
        await runTest('departments', async () => {
            const response = await axios.get('/api/departments');
            return {
                message: 'Departments loaded',
                count: response.data?.length || 0
            };
        });

        // Test 7: Wards
        await runTest('wards', async () => {
            const response = await axios.get('/api/wards');
            return {
                message: 'Wards loaded',
                count: response.data?.length || 0
            };
        });

        setTesting(false);
        setCurrentTest('');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="text-success" size={24} />;
            case 'error':
                return <XCircle className="text-danger" size={24} />;
            default:
                return <AlertCircle className="text-warning" size={24} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'error':
                return 'danger';
            default:
                return 'warning';
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <Server size={24} className="me-2" />
                                API Diagnostic Tool
                            </h4>
                            <small>Check API connectivity and data loading</small>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-info">
                                <strong>ℹ️ Purpose:</strong> This tool tests all API endpoints to identify connection issues.
                                <br />
                                <strong>📍 Backend URL:</strong> <code>{apiConfig.baseURL}</code>
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={runAllTests}
                                disabled={testing}
                            >
                                {testing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Testing... {currentTest}
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={20} className="me-2" />
                                        Run All Tests
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Results */}
            {Object.keys(results).length > 0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Test Results</h5>
                            </div>
                            <div className="card-body">
                                <div className="list-group">
                                    {/* Configuration */}
                                    {results.config && (
                                        <div className={`list-group-item list-group-item-${getStatusColor(results.config.status)}`}>
                                            <div className="d-flex align-items-center mb-2">
                                                {getStatusIcon(results.config.status)}
                                                <h6 className="mb-0 ms-2">1. API Configuration</h6>
                                            </div>
                                            {results.config.status === 'success' && (
                                                <div className="ms-4">
                                                    <small className="d-block">Base URL: <code>{results.config.data.baseURL}</code></small>
                                                    <small className="d-block">Timeout: {results.config.data.timeout}ms</small>
                                                    <small className="d-block">Logging: {results.config.data.loggingEnabled ? 'Enabled' : 'Disabled'}</small>
                                                </div>
                                            )}
                                            {results.config.error && (
                                                <div className="alert alert-danger mt-2 mb-0">
                                                    <small>{results.config.error}</small>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Connectivity */}
                                    {results.connectivity && (
                                        <div className={`list-group-item list-group-item-${getStatusColor(results.connectivity.status)}`}>
                                            <div className="d-flex align-items-center mb-2">
                                                {getStatusIcon(results.connectivity.status)}
                                                <h6 className="mb-0 ms-2">2. Backend Connectivity</h6>
                                            </div>
                                            {results.connectivity.status === 'success' ? (
                                                <div className="ms-4">
                                                    <small className="text-success">✅ {results.connectivity.message}</small>
                                                </div>
                                            ) : (
                                                <div className="alert alert-danger mt-2 mb-0">
                                                    <strong>❌ Backend is not reachable!</strong>
                                                    <br />
                                                    <small>Error: {results.connectivity.error}</small>
                                                    <br />
                                                    <small className="text-muted">
                                                        Make sure your backend is running on <code>{apiConfig.baseURL}</code>
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Authentication */}
                                    {results.auth && (
                                        <div className={`list-group-item list-group-item-${getStatusColor(results.auth.status)}`}>
                                            <div className="d-flex align-items-center mb-2">
                                                {getStatusIcon(results.auth.status)}
                                                <h6 className="mb-0 ms-2">3. Authentication</h6>
                                            </div>
                                            {results.auth.status === 'success' ? (
                                                <div className="ms-4">
                                                    <small className="d-block">✅ Token present (length: {results.auth.tokenLength})</small>
                                                    {results.auth.user && (
                                                        <small className="d-block">User: {results.auth.user.name || results.auth.user.email}</small>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="alert alert-warning mt-2 mb-0">
                                                    <strong>⚠️ {results.auth.error}</strong>
                                                    <br />
                                                    <small>Please <a href="/">login</a> to continue.</small>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Profile */}
                                    {results.profile && (
                                        <div className={`list-group-item list-group-item-${getStatusColor(results.profile.status)}`}>
                                            <div className="d-flex align-items-center mb-2">
                                                {getStatusIcon(results.profile.status)}
                                                <h6 className="mb-0 ms-2">4. Profile API</h6>
                                            </div>
                                            {results.profile.status === 'success' ? (
                                                <div className="ms-4">
                                                    <small className="text-success">✅ {results.profile.message}</small>
                                                    {results.profile.data && (
                                                        <div className="mt-2">
                                                            <small className="d-block">Name: {results.profile.data.name}</small>
                                                            <small className="d-block">Email: {results.profile.data.email}</small>
                                                            <small className="d-block">Ward: {results.profile.data.wardNumber || results.profile.data.wardId}</small>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="alert alert-danger mt-2 mb-0">
                                                    <strong>❌ Failed to load profile</strong>
                                                    <br />
                                                    <small>{results.profile.error}</small>
                                                    <br />
                                                    <small className="text-muted">Details: {JSON.stringify(results.profile.details)}</small>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Complaints */}
                                    {results.complaints && (
                                        <div className={`list-group-item list-group-item-${getStatusColor(results.complaints.status)}`}>
                                            <div className="d-flex align-items-center mb-2">
                                                {getStatusIcon(results.complaints.status)}
                                                <h6 className="mb-0 ms-2">5. Complaints API</h6>
                                            </div>
                                            {results.complaints.status === 'success' ? (
                                                <div className="ms-4">
                                                    <small className="text-success">✅ {results.complaints.message}</small>
                                                    <br />
                                                    <small>Found {results.complaints.count} complaints</small>
                                                </div>
                                            ) : (
                                                <div className="alert alert-danger mt-2 mb-0">
                                                    <strong>❌ Failed to load complaints</strong>
                                                    <br />
                                                    <small>{results.complaints.error}</small>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Departments */}
                                    {results.departments && (
                                        <div className={`list-group-item list-group-item-${getStatusColor(results.departments.status)}`}>
                                            <div className="d-flex align-items-center mb-2">
                                                {getStatusIcon(results.departments.status)}
                                                <h6 className="mb-0 ms-2">6. Departments API</h6>
                                            </div>
                                            {results.departments.status === 'success' ? (
                                                <div className="ms-4">
                                                    <small className="text-success">✅ {results.departments.message}</small>
                                                    <br />
                                                    <small>Found {results.departments.count} departments</small>
                                                </div>
                                            ) : (
                                                <div className="alert alert-danger mt-2 mb-0">
                                                    <strong>❌ Failed to load departments</strong>
                                                    <br />
                                                    <small>{results.departments.error}</small>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Wards */}
                                    {results.wards && (
                                        <div className={`list-group-item list-group-item-${getStatusColor(results.wards.status)}`}>
                                            <div className="d-flex align-items-center mb-2">
                                                {getStatusIcon(results.wards.status)}
                                                <h6 className="mb-0 ms-2">7. Wards API</h6>
                                            </div>
                                            {results.wards.status === 'success' ? (
                                                <div className="ms-4">
                                                    <small className="text-success">✅ {results.wards.message}</small>
                                                    <br />
                                                    <small>Found {results.wards.count} wards</small>
                                                </div>
                                            ) : (
                                                <div className="alert alert-danger mt-2 mb-0">
                                                    <strong>❌ Failed to load wards</strong>
                                                    <br />
                                                    <small>{results.wards.error}</small>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="mt-4">
                                    <h6>Summary:</h6>
                                    <div className="d-flex gap-3">
                                        <span className="badge bg-success">
                                            ✅ Passed: {Object.values(results).filter(r => r.status === 'success').length}
                                        </span>
                                        <span className="badge bg-danger">
                                            ❌ Failed: {Object.values(results).filter(r => r.status === 'error').length}
                                        </span>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                {Object.values(results).some(r => r.status === 'error') && (
                                    <div className="alert alert-warning mt-4">
                                        <h6>🔧 Troubleshooting Steps:</h6>
                                        <ol className="mb-0">
                                            <li>Verify backend is running on <code>{apiConfig.baseURL}</code></li>
                                            <li>Check if you're logged in (token present)</li>
                                            <li>Open browser console (F12) for detailed error logs</li>
                                            <li>Check Network tab for failed requests</li>
                                            <li>Verify CORS is enabled on backend</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiDiagnostic;
