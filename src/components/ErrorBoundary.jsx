import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Log to error reporting service if available
        if (window.errorReporter) {
            window.errorReporter.logError(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.content}>
                        <AlertTriangle size={64} color="#ef4444" style={styles.icon} />
                        <h1 style={styles.title}>Oops! Something went wrong</h1>
                        <p style={styles.message}>
                            We're sorry for the inconvenience. The application encountered an unexpected error.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details style={styles.details}>
                                <summary style={styles.summary}>Error Details (Development Only)</summary>
                                <pre style={styles.errorText}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={styles.actions}>
                            <button
                                onClick={this.handleReset}
                                style={styles.buttonPrimary}
                                className="btn btn-primary"
                            >
                                <RefreshCw size={18} style={{ marginRight: '8px' }} />
                                Try Again
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                style={styles.buttonSecondary}
                                className="btn btn-secondary"
                            >
                                <Home size={18} style={{ marginRight: '8px' }} />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px'
    },
    content: {
        textAlign: 'center',
        maxWidth: '600px',
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    icon: {
        marginBottom: '24px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '12px'
    },
    message: {
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '32px',
        lineHeight: '1.6'
    },
    details: {
        textAlign: 'left',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
    },
    summary: {
        cursor: 'pointer',
        fontWeight: '600',
        color: '#991b1b',
        marginBottom: '12px'
    },
    errorText: {
        fontSize: '12px',
        color: '#7f1d1d',
        overflow: 'auto',
        maxHeight: '200px'
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    buttonPrimary: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        fontSize: '16px'
    },
    buttonSecondary: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        fontSize: '16px'
    }
};

export default ErrorBoundary;
