'use client'

import { ErrorBoundary } from '@/views/atoms/ErrorBoundary'
import { AccessibilityChecker } from '@/views/atoms/AccessibilityChecker'
import { withPerformanceMonitoring } from '@/controllers/hooks/usePerformanceMonitor'
import { useEffect } from 'react'

interface AppWrapperProps {
    children: React.ReactNode
}

const AppWrapperComponent = ({ children }: AppWrapperProps) => {
    useEffect(() => {
        // Initialize performance monitoring
        if ('performance' in window) {
            // Track page load performance
            window.addEventListener('load', () => {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
                if (navigation) {
                    console.log('Page Load Performance:', {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        domComplete: navigation.domComplete - navigation.domContentLoadedEventStart,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
                    })
                }
            })
        }

        // Track unhandled errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error)
        })

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason)
        })

        // Cleanup
        return () => {
            window.removeEventListener('error', () => { })
            window.removeEventListener('unhandledrejection', () => { })
        }
    }, [])

    return (
        <ErrorBoundary>
            {children}
            <AccessibilityChecker />
        </ErrorBoundary>
    )
}

// Wrap with performance monitoring
export const AppWrapper = withPerformanceMonitoring(AppWrapperComponent, 'AppWrapper')
