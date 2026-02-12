import React, { useState } from 'react';
import { Shield, Server, Key, CheckCircle, XCircle, AlertTriangle, RefreshCw, Copy, Terminal } from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const BackendSecurityDiagnostic = () => {
    const [diagnostics, setDiagnostics] = useState(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostics = () => {
        setLoading(true);

        // Get token and role from localStorage
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const user = localStorage.getItem('user');

        const results = {
            timestamp: new Date().toLocaleString(),
            localStorage: {
                hasToken: !!token,
                tokenLength: token ? token.length : 0,
                role: role || 'Not set',
                user: user || 'Not set'
            },
            tokenAnalysis: null,
            securityChecks: [],
            recommendations: []
        };

        // Analyze JWT token
        if (token) {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    const header = JSON.parse(atob(parts[0]));

                    const now = Date.now();
                    const exp = payload.exp ? payload.exp * 1000 : null;
                    const iat = payload.iat ? payload.iat * 1000 : null;

                    results.tokenAnalysis = {
                        header: header,
                        payload: {
                            sub: payload.sub,
                            role: payload.role,
                            authorities: payload.authorities,
                            exp: exp ? new Date(exp).toLocaleString() : 'N/A',
                            iat: iat ? new Date(iat).toLocaleString() : 'N/A',
                            isExpired: exp ? exp < now : false,
                            timeUntilExpiry: exp ? Math.floor((exp - now) / 1000 / 60) : null
                        },
                        raw: payload
                    };

                    // Security checks
                    if (exp && exp < now) {
                        results.securityChecks.push({
                            status: 'error',
                            message: 'Token has EXPIRED',
                            detail: `Expired ${Math.floor((now - exp) / 1000 / 60)} minutes ago`
                        });
                        results.recommendations.push('Log out and log back in to get a fresh token');
                    } else if (exp) {
                        results.securityChecks.push({
                            status: 'success',
                            message: 'Token is valid',
                            detail: `Expires in ${Math.floor((exp - now) / 1000 / 60)} minutes`
                        });
                    }

                    // Check CITIZEN role
                    const hasCitizenRole =
                        payload.role === 'CITIZEN' ||
                        payload.role === 'ROLE_CITIZEN' ||
                        (payload.authorities && (
                            payload.authorities.includes('ROLE_CITIZEN') ||
                            payload.authorities.includes('CITIZEN')
                        ));

                    if (hasCitizenRole) {
                        results.securityChecks.push({
                            status: 'success',
                            message: 'Has CITIZEN role',
                            detail: `Role: ${payload.role || payload.authorities}`
                        });
                    } else {
                        results.securityChecks.push({
                            status: 'error',
                            message: 'Missing CITIZEN role',
                            detail: `Current role: ${payload.role || payload.authorities}`
                        });
                        results.recommendations.push('Token does not have CITIZEN role - this will cause 403 errors');
                    }

                    // Check role consistency
                    if (role !== payload.role && role !== 'ROLE_' + payload.role) {
                        results.securityChecks.push({
                            status: 'warning',
                            message: 'Role mismatch',
                            detail: `localStorage: ${role}, Token: ${payload.role}`
                        });
                        results.recommendations.push('Clear localStorage and log in again');
                    }
                }
            } catch (e) {
                results.tokenAnalysis = {
                    error: 'Failed to decode token: ' + e.message
                };
                results.securityChecks.push({
                    status: 'error',
                    message: 'Invalid token format',
                    detail: e.message
                });
                results.recommendations.push('Token is corrupted - log out and log back in');
            }
        } else {
            results.securityChecks.push({
                status: 'error',
                message: 'No token found',
                detail: 'User is not authenticated'
            });
            results.recommendations.push('Log in to get a valid token');
        }

        setDiagnostics(results);
        setLoading(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const clearAndReload = () => {
        if (window.confirm('This will log you out and clear all session data. Continue?')) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'success':
                return <CheckCircle size={20} style={{ color: '#10B981' }} />;
            case 'error':
                return <XCircle size={20} style={{ color: '#EF4444' }} />;
            case 'warning':
                return <AlertTriangle size={20} style={{ color: '#F59E0B' }} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
            <div className="container">
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-lg"
                        style={{ width: '80px', height: '80px', backgroundColor: PRIMARY_COLOR }}>
                        <Shield className="text-white" size={36} strokeWidth={2.5} />
                    </div>
                    <h2 className="fw-black mb-2" style={{ color: PRIMARY_COLOR }}>Backend Security Diagnostic</h2>
                    <p className="text-muted">Diagnose 403 Forbidden errors and JWT token issues</p>
                </div>

                {/* Action Buttons */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <button
                            className="btn rounded-pill px-4 py-2 fw-bold text-white d-flex align-items-center gap-2"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                            onClick={runDiagnostics}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Terminal size={18} />
                                    Run Diagnostics
                                </>
                            )}
                        </button>
                        <button
                            className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
                            onClick={clearAndReload}
                        >
                            <RefreshCw size={18} />
                            Clear Session & Reload
                        </button>
                    </div>
                </div>

                {/* Results */}
                {diagnostics && (
                    <div className="animate-fadeIn">
                        {/* Security Checks */}
                        <div className="card border-0 shadow-lg rounded-4 mb-4">
                            <div className="card-header border-0 p-4" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
                                <h5 className="fw-bold mb-0" style={{ color: PRIMARY_COLOR }}>
                                    <Shield size={24} className="me-2" />
                                    Security Checks
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                {diagnostics.securityChecks.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {diagnostics.securityChecks.map((check, index) => (
                                            <div key={index} className="d-flex align-items-start gap-3 p-3 rounded-3"
                                                style={{ backgroundColor: '#F8FAFC' }}>
                                                <StatusIcon status={check.status} />
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-dark">{check.message}</div>
                                                    <div className="small text-muted">{check.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted mb-0">No checks performed</p>
                                )}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {diagnostics.recommendations.length > 0 && (
                            <div className="card border-0 shadow-lg rounded-4 mb-4">
                                <div className="card-header border-0 p-4" style={{ backgroundColor: '#FEF3C7' }}>
                                    <h5 className="fw-bold mb-0" style={{ color: '#92400E' }}>
                                        <AlertTriangle size={24} className="me-2" />
                                        Recommendations
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <ul className="mb-0">
                                        {diagnostics.recommendations.map((rec, index) => (
                                            <li key={index} className="mb-2 text-dark">{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Token Analysis */}
                        {diagnostics.tokenAnalysis && (
                            <div className="card border-0 shadow-lg rounded-4 mb-4">
                                <div className="card-header border-0 p-4" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0" style={{ color: PRIMARY_COLOR }}>
                                            <Key size={24} className="me-2" />
                                            JWT Token Analysis
                                        </h5>
                                        <button
                                            className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
                                            onClick={() => copyToClipboard(JSON.stringify(diagnostics.tokenAnalysis, null, 2))}
                                        >
                                            <Copy size={16} />
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    {diagnostics.tokenAnalysis.error ? (
                                        <div className="alert alert-danger mb-0">
                                            {diagnostics.tokenAnalysis.error}
                                        </div>
                                    ) : (
                                        <div className="bg-dark text-white p-3 rounded-3" style={{ fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto' }}>
                                            <pre className="mb-0 text-white">{JSON.stringify(diagnostics.tokenAnalysis, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LocalStorage Info */}
                        <div className="card border-0 shadow-lg rounded-4">
                            <div className="card-header border-0 p-4" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
                                <h5 className="fw-bold mb-0" style={{ color: PRIMARY_COLOR }}>
                                    <Server size={24} className="me-2" />
                                    LocalStorage Data
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="small text-muted mb-1">Has Token</div>
                                        <div className="fw-bold text-dark">
                                            {diagnostics.localStorage.hasToken ? '✅ Yes' : '❌ No'}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="small text-muted mb-1">Token Length</div>
                                        <div className="fw-bold text-dark">{diagnostics.localStorage.tokenLength} characters</div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="small text-muted mb-1">Role</div>
                                        <div className="fw-bold text-dark">{diagnostics.localStorage.role}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="small text-muted mb-1">User</div>
                                        <div className="fw-bold text-dark">{diagnostics.localStorage.user}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-center mt-4">
                            <small className="text-muted">
                                Diagnostic run at: {diagnostics.timestamp}
                            </small>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!diagnostics && (
                    <div className="card border-0 shadow-lg rounded-4">
                        <div className="card-body p-5 text-center">
                            <Server size={48} className="mb-3 text-muted" />
                            <h5 className="fw-bold mb-3">Click "Run Diagnostics" to check your authentication status</h5>
                            <p className="text-muted mb-0">
                                This tool will analyze your JWT token, check for expiration, verify roles, and provide recommendations for fixing 403 errors.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}} />
        </div>
    );
};

export default BackendSecurityDiagnostic;
