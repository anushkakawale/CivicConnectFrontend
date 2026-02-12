import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Copy, RefreshCw } from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const BackendDiagnostic = () => {
    const [diagnosticResults, setDiagnosticResults] = useState(null);
    const [testing, setTesting] = useState(false);

    const runDiagnostics = () => {
        setTesting(true);

        // Collect diagnostic information
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const user = localStorage.getItem('user');

        let parsedToken = null;
        if (token) {
            try {
                // Decode JWT token (basic decode, not verification)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                parsedToken = JSON.parse(jsonPayload);
            } catch (e) {
                parsedToken = { error: 'Failed to decode token' };
            }
        }

        const results = {
            timestamp: new Date().toISOString(),
            localStorage: {
                token: token ? {
                    present: true,
                    length: token.length,
                    preview: token.substring(0, 50) + '...',
                    decoded: parsedToken
                } : { present: false },
                role: role || 'Not set',
                user: user ? JSON.parse(user) : 'Not set'
            },
            expectedBackendConfig: {
                endpoint: '/api/citizens/complaints',
                method: 'POST',
                requiredRole: 'CITIZEN',
                requiredAuthority: 'ROLE_CITIZEN',
                contentType: 'multipart/form-data'
            },
            recommendations: []
        };

        // Add recommendations based on findings
        if (!token) {
            results.recommendations.push({
                severity: 'error',
                message: 'No authentication token found. Please log in again.'
            });
        }

        if (role !== 'CITIZEN') {
            results.recommendations.push({
                severity: 'error',
                message: `Current role is "${role}" but should be "CITIZEN" to submit complaints.`
            });
        }

        if (parsedToken && parsedToken.authorities) {
            const hasRoleCitizen = parsedToken.authorities.includes('ROLE_CITIZEN');
            if (!hasRoleCitizen) {
                results.recommendations.push({
                    severity: 'error',
                    message: 'Token does not contain ROLE_CITIZEN authority. Backend issue - user role not properly set.'
                });
            } else {
                results.recommendations.push({
                    severity: 'success',
                    message: 'Token contains ROLE_CITIZEN authority ✓'
                });
            }
        }

        if (parsedToken && parsedToken.exp) {
            const expiryDate = new Date(parsedToken.exp * 1000);
            const now = new Date();
            if (expiryDate < now) {
                results.recommendations.push({
                    severity: 'error',
                    message: `Token expired on ${expiryDate.toLocaleString()}. Please log in again.`
                });
            } else {
                results.recommendations.push({
                    severity: 'success',
                    message: `Token valid until ${expiryDate.toLocaleString()} ✓`
                });
            }
        }

        // Backend configuration check
        results.recommendations.push({
            severity: 'warning',
            message: 'Backend Spring Security must have: @PreAuthorize("hasRole(\'CITIZEN\')") on the createComplaint endpoint'
        });

        setDiagnosticResults(results);
        setTesting(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'success': return <CheckCircle size={20} style={{ color: '#10B981' }} />;
            case 'error': return <XCircle size={20} style={{ color: '#EF4444' }} />;
            case 'warning': return <AlertTriangle size={20} style={{ color: '#F59E0B' }} />;
            default: return <AlertTriangle size={20} style={{ color: '#64748B' }} />;
        }
    };

    const getSeverityBg = (severity) => {
        switch (severity) {
            case 'success': return '#ECFDF5';
            case 'error': return '#FEF2F2';
            case 'warning': return '#FEF3C7';
            default: return '#F8FAFC';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'warning': return '#92400E';
            default: return '#64748B';
        }
    };

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
            <div className="container">
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-lg"
                        style={{ width: '80px', height: '80px', backgroundColor: PRIMARY_COLOR }}>
                        <Shield className="text-white" size={36} />
                    </div>
                    <h2 className="fw-black mb-2" style={{ color: PRIMARY_COLOR }}>Backend Diagnostic Tool</h2>
                    <p className="text-muted">Diagnose 403 Forbidden errors for complaint submission</p>
                </div>

                {/* Run Diagnostic Button */}
                <div className="text-center mb-5">
                    <button
                        onClick={runDiagnostics}
                        disabled={testing}
                        className="btn px-5 py-3 text-white rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        {testing ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                Running Diagnostics...
                            </>
                        ) : (
                            <>
                                <Shield size={20} />
                                Run Diagnostics
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                {diagnosticResults && (
                    <div className="animate-fadeIn">
                        {/* Recommendations */}
                        <div className="card border-0 shadow-sm rounded-4 p-5 mb-4">
                            <h5 className="fw-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                                <AlertTriangle size={24} className="me-2" />
                                Diagnostic Results
                            </h5>

                            {diagnosticResults.recommendations.map((rec, idx) => (
                                <div
                                    key={idx}
                                    className="alert border-0 shadow-sm d-flex align-items-start rounded-3 mb-3"
                                    style={{ backgroundColor: getSeverityBg(rec.severity) }}
                                >
                                    <div className="me-3 mt-1 flex-shrink-0">
                                        {getSeverityIcon(rec.severity)}
                                    </div>
                                    <div className="small fw-medium" style={{ color: getSeverityColor(rec.severity) }}>
                                        {rec.message}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Token Information */}
                        <div className="card border-0 shadow-sm rounded-4 p-5 mb-4">
                            <h5 className="fw-bold mb-4 text-dark">
                                <Shield size={24} className="me-2" style={{ color: PRIMARY_COLOR }} />
                                Authentication Details
                            </h5>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="small text-muted mb-1">Role</div>
                                    <div className="fw-bold text-dark">{diagnosticResults.localStorage.role}</div>
                                </div>
                                <div className="col-md-6">
                                    <div className="small text-muted mb-1">Token Present</div>
                                    <div className="fw-bold text-dark">
                                        {diagnosticResults.localStorage.token.present ? '✅ Yes' : '❌ No'}
                                    </div>
                                </div>
                                {diagnosticResults.localStorage.token.present && (
                                    <>
                                        <div className="col-12">
                                            <div className="small text-muted mb-1">Token Preview</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <code className="flex-grow-1 p-2 bg-light rounded text-dark small">
                                                    {diagnosticResults.localStorage.token.preview}
                                                </code>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary rounded-pill"
                                                    onClick={() => copyToClipboard(localStorage.getItem('token'))}
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="small text-muted mb-1">Decoded Token</div>
                                            <pre className="p-3 bg-light rounded text-dark small overflow-auto" style={{ maxHeight: '300px' }}>
                                                {JSON.stringify(diagnosticResults.localStorage.token.decoded, null, 2)}
                                            </pre>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Backend Configuration */}
                        <div className="card border-0 shadow-sm rounded-4 p-5">
                            <h5 className="fw-bold mb-4 text-dark">
                                <Shield size={24} className="me-2" style={{ color: PRIMARY_COLOR }} />
                                Required Backend Configuration
                            </h5>

                            <div className="alert border-0 shadow-sm rounded-3 mb-4" style={{ backgroundColor: '#FEF3C7' }}>
                                <div className="d-flex align-items-start gap-2">
                                    <AlertTriangle size={18} className="mt-1 flex-shrink-0" style={{ color: '#F59E0B' }} />
                                    <div className="small" style={{ color: '#92400E' }}>
                                        <strong>Backend Issue:</strong> The 403 error indicates that the backend Spring Security configuration is blocking the request. The frontend is sending the correct authentication token.
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-3">Spring Security Configuration Needed:</h6>
                                <pre className="p-4 bg-dark text-white rounded-3 overflow-auto">
                                    {`// In SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/citizens/complaints").hasRole("CITIZEN")
            .requestMatchers("/api/citizens/**").hasRole("CITIZEN")
            // ... other configurations
        );
    return http.build();
}`}
                                </pre>
                            </div>

                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-3">Controller Annotation Needed:</h6>
                                <pre className="p-4 bg-dark text-white rounded-3 overflow-auto">
                                    {`// In CitizenComplaintController.java
@PostMapping("/complaints")
@PreAuthorize("hasRole('CITIZEN')")
public ResponseEntity<?> createComplaint(
    @RequestParam("title") String title,
    @RequestParam("description") String description,
    @RequestParam("departmentId") Long departmentId,
    @RequestParam("wardId") Long wardId,
    @RequestParam("address") String address,
    @RequestParam(value = "latitude", required = false) Double latitude,
    @RequestParam(value = "longitude", required = false) Double longitude,
    @RequestParam(value = "images", required = false) MultipartFile[] images,
    Authentication authentication
) {
    // Implementation
}`}
                                </pre>
                            </div>

                            <div>
                                <h6 className="fw-bold text-dark mb-3">JWT Token Must Include:</h6>
                                <pre className="p-4 bg-dark text-white rounded-3 overflow-auto">
                                    {`{
  "sub": "citizen@example.com",
  "authorities": ["ROLE_CITIZEN"],  // Must have ROLE_CITIZEN
  "exp": 1707523568,
  "iat": 1707519968
}`}
                                </pre>
                            </div>
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

export default BackendDiagnostic;
