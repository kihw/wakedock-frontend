'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
    enableRetry?: boolean;
    resetOnPropsChange?: boolean;
    resetKeys?: Array<string | number>;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
    private resetTimeoutId: number | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
            eventId: Math.random().toString(36).substr(2, 9),
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Report to error monitoring service (Sentry, LogRocket, etc.)
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
        // }
    }

    componentDidUpdate(prevProps: Props) {
        const { resetOnPropsChange, resetKeys } = this.props;
        const { hasError } = this.state;

        if (hasError && prevProps.resetKeys !== resetKeys) {
            if (resetOnPropsChange) {
                this.resetErrorBoundary();
            }
        }
    }

    resetErrorBoundary = () => {
        if (this.resetTimeoutId) {
            window.clearTimeout(this.resetTimeoutId);
        }

        this.resetTimeoutId = window.setTimeout(() => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                eventId: null,
            });
        }, 100);
    };

    handleRetry = () => {
        this.resetErrorBoundary();
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        const { hasError, error, errorInfo, eventId } = this.state;
        const { children, fallback, showDetails = false, enableRetry = true } = this.props;

        if (hasError) {
            // Custom fallback UI
            if (fallback) {
                return fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>

                        <div className="text-center">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Oops! Something went wrong
                            </h1>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                We're sorry, but something unexpected happened. Please try again.
                            </p>

                            {eventId && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Error ID: {eventId}
                                </p>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                {enableRetry && (
                                    <button
                                        onClick={this.handleRetry}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Try Again
                                    </button>
                                )}

                                <button
                                    onClick={this.handleReload}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reload Page
                                </button>

                                <button
                                    onClick={this.handleGoHome}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </button>
                            </div>

                            {showDetails && error && (
                                <details className="mt-6 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex items-center">
                                        <Bug className="w-4 h-4 mr-1" />
                                        Technical Details
                                    </summary>

                                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Error:</span>
                                            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap mt-1">
                                                {error.message}
                                            </pre>
                                        </div>

                                        {error.stack && (
                                            <div className="mb-2">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Stack Trace:</span>
                                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-1 max-h-32 overflow-y-auto">
                                                    {error.stack}
                                                </pre>
                                            </div>
                                        )}

                                        {errorInfo && errorInfo.componentStack && (
                                            <div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Component Stack:</span>
                                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-1 max-h-32 overflow-y-auto">
                                                    {errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;

// Hook version for functional components
export const useErrorHandler = () => {
    return (error: Error, errorInfo?: ErrorInfo) => {
        console.error('Error caught by useErrorHandler:', error, errorInfo);

        // Report to error monitoring service
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(error);
        // }
    };
};
