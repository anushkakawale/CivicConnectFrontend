/**
 * Debug Utility Component
 * Shows authentication status and helps debug API issues
 * Press Ctrl+Shift+D to toggle
 */

import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

const DebugPanel = () => {
    const [show, setShow] = useState(false);
    const [authInfo, setAuthInfo] = useState(null);

    useEffect(() => {
        // Toggle debug panel with Ctrl+Shift+D
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                setShow(prev => !prev);
                loadAuthInfo();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const loadAuthInfo = () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        const user = localStorage.getItem('user');

        // Decode JWT token (basic decode, not verification)
        let decodedToken = null;
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                decodedToken = JSON.parse(jsonPayload);
            } catch (e) {
                decodedToken = { error: 'Failed to decode token' };
            }
        }

        setAuthInfo({
            token: token ? `${token.substring(0, 20)}...` : 'NOT SET',
            fullToken: token,
            role,
            userId,
            user: user ? JSON.parse(user) : null,
            decodedToken,
            isAuthenticated: authService.isAuthenticated(),
            currentRole: authService.getCurrentRole()
        });
    };

    const copyToken = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigator.clipboard.writeText(token);
            alert('Token copied to clipboard!');
        }
    };

    const clearAuth = () => {
        if (window.confirm('Clear all authentication data?')) {
            authService.logout();
            window.location.href = '/';
        }
    };

    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                width: '400px',
                maxHeight: '80vh',
                overflow: 'auto',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                padding: '15px',
                borderRadius: '0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 9999,
                fontSize: '12px',
                fontFamily: 'monospace'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px' }}>🔍 Auth Debug Panel</h4>
                <button
                    onClick={() => setShow(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    ✕
                </button>
            </div>

            {authInfo && (
                <div>
                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '0' }}>
                        <strong>Authentication Status:</strong>
                        <div style={{ color: authInfo.isAuthenticated ? '#4ade80' : '#f87171' }}>
                            {authInfo.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                        </div>
                    </div>

                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '0' }}>
                        <strong>Role:</strong>
                        <div style={{ color: '#60a5fa' }}>{authInfo.role || 'NOT SET'}</div>
                    </div>

                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '0' }}>
                        <strong>User ID:</strong>
                        <div style={{ color: '#60a5fa' }}>{authInfo.userId || 'NOT SET'}</div>
                    </div>

                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '0' }}>
                        <strong>Token:</strong>
                        <div style={{ wordBreak: 'break-all', color: '#a78bfa' }}>{authInfo.token}</div>
                        <button
                            onClick={copyToken}
                            style={{
                                marginTop: '5px',
                                padding: '5px 10px',
                                backgroundColor: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Copy Full Token
                        </button>
                    </div>

                    {authInfo.decodedToken && (
                        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '0' }}>
                            <strong>Decoded Token:</strong>
                            <pre style={{ margin: '5px 0 0 0', fontSize: '10px', overflow: 'auto' }}>
                                {JSON.stringify(authInfo.decodedToken, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '0' }}>
                        <strong>User Object:</strong>
                        <pre style={{ margin: '5px 0 0 0', fontSize: '10px', overflow: 'auto' }}>
                            {JSON.stringify(authInfo.user, null, 2)}
                        </pre>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={loadAuthInfo}
                            style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🔄 Refresh
                        </button>
                        <button
                            onClick={clearAuth}
                            style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🗑️ Clear Auth
                        </button>
                    </div>

                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '0', fontSize: '10px' }}>
                        <strong>💡 Tips:</strong>
                        <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                            <li>Check if role is "CITIZEN"</li>
                            <li>Verify token is not expired (check 'exp' in decoded token)</li>
                            <li>Copy token and test in Postman</li>
                            <li>Press Ctrl+Shift+D to toggle this panel</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
