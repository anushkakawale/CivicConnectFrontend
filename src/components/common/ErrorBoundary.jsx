import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // You can also log the error to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div className="error-boundary-container">
                    <div className="error-boundary-content">
                        <AlertTriangle size={64} className="error-icon" />
                        <h1 className="error-title">Oops! Something went wrong</h1>
                        <p className="error-message">
                            We're sorry for the inconvenience. An unexpected error has occurred.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="error-details">
                                <summary>Error Details (Development Only)</summary>
                                <div className="error-stack">
                                    <p><strong>Error:</strong> {this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <pre>{this.state.errorInfo.componentStack}</pre>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="error-actions">
                            <button
                                className="error-btn error-btn-primary"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                            <button
                                className="error-btn error-btn-secondary"
                                onClick={this.handleReload}
                            >
                                Reload Page
                            </button>
                            <button
                                className="error-btn error-btn-secondary"
                                onClick={() => window.history.back()}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
