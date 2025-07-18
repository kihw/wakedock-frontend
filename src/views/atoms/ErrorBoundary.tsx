'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import { Button } from '@/views/atoms/Button'
import { Card } from '@/views/atoms/Card'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
    errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
    private retryCount = 0
    private maxRetries = 3

    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }

        // Set error info in state
        this.setState({
            errorInfo
        })

        // Call onError prop if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // Report error to monitoring service
        this.reportError(error, errorInfo)
    }

    private reportError = async (error: Error, errorInfo: ErrorInfo) => {
        try {
            // In production, send to error monitoring service (e.g., Sentry)
            const errorReport = {
                id: this.state.errorId,
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                retryCount: this.retryCount,
                props: this.props
            }

            // Send to monitoring endpoint
            if (process.env.NODE_ENV === 'production') {
                await fetch('/api/error-report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(errorReport)
                }).catch(() => {
                    // Silently fail if error reporting fails
                })
            }

            // Log to console for development
            console.error('Error Report:', errorReport)
        } catch (reportingError) {
            console.error('Failed to report error:', reportingError)
        }
    }

    private handleRetry = () => {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: null
            })
        } else {
            // Max retries reached, redirect to home
            window.location.href = '/'
        }
    }

    private handleReload = () => {
        window.location.reload()
    }

    private handleGoHome = () => {
        window.location.href = '/'
    }

    private handleReportIssue = () => {
        const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`)
        const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
URL: ${window.location.href}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
    `)

        window.open(`mailto:support@wakedock.com?subject=${subject}&body=${body}`)
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <Card className="max-w-md w-full p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="w-16 h-16 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-gray-600 mb-4">
                            We're sorry, but something unexpected happened. Our team has been notified.
                        </p>

                        {/* Error ID for support */}
                        <div className="bg-gray-100 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700">
                                Error ID: <code className="font-mono text-xs">{this.state.errorId}</code>
                            </p>
                        </div>

                        {/* Error details in development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                                <p className="text-sm text-red-700 font-mono mb-2">
                                    {this.state.error.message}
                                </p>
                                {this.state.error.stack && (
                                    <pre className="text-xs text-red-600 overflow-auto max-h-32">
                                        {this.state.error.stack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="space-y-3">
                            {this.retryCount < this.maxRetries && (
                                <Button
                                    onClick={this.handleRetry}
                                    className="w-full"
                                    variant="primary"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                                </Button>
                            )}

                            <Button
                                onClick={this.handleReload}
                                className="w-full"
                                variant="outline"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload Page
                            </Button>

                            <Button
                                onClick={this.handleGoHome}
                                className="w-full"
                                variant="outline"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go to Home
                            </Button>

                            <Button
                                onClick={this.handleReportIssue}
                                className="w-full"
                                variant="ghost"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Report Issue
                            </Button>
                        </div>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
    onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
    return function WrappedComponent(props: P) {
        return (
            <ErrorBoundary fallback={fallback} onError={onError}>
                <Component {...props} />
            </ErrorBoundary>
        )
    }
}

// Simple error boundary for specific components
export function SimpleErrorBoundary({ children, message }: {
    children: ReactNode
    message?: string
}) {
    return (
        <ErrorBoundary
            fallback={
                <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-700">{message || 'Something went wrong'}</p>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    )
}

// Error boundary for async components
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    )
}
