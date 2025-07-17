'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Report to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to error reporting service
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Something went wrong
                                </h3>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer font-medium">Error details</summary>
                                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors"
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
