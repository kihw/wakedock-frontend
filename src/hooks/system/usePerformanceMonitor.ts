'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

export interface PerformanceMetrics {
    id: string
    name: string
    startTime: number
    endTime: number
    duration: number
    type: 'render' | 'api' | 'navigation' | 'user-interaction'
    metadata?: Record<string, any>
}

export interface PerformanceStats {
    averageRenderTime: number
    slowestRender: PerformanceMetrics | null
    fastestRender: PerformanceMetrics | null
    apiCallCount: number
    errorCount: number
    totalMetrics: number
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = []
    private observers: Observer[] = []
    private isEnabled = true

    constructor() {
        if (typeof window !== 'undefined') {
            this.setupWebVitals()
        }
    }

    private setupWebVitals() {
        // Monitor Core Web Vitals
        if ('performance' in window) {
            // First Contentful Paint
            this.observePerformanceEntry('paint', (entry) => {
                if (entry.name === 'first-contentful-paint') {
                    this.addMetric({
                        id: 'fcp',
                        name: 'First Contentful Paint',
                        startTime: 0,
                        endTime: entry.startTime,
                        duration: entry.startTime,
                        type: 'render',
                        metadata: { vital: 'FCP' }
                    })
                }
            })

            // Largest Contentful Paint
            this.observePerformanceEntry('largest-contentful-paint', (entry) => {
                this.addMetric({
                    id: 'lcp',
                    name: 'Largest Contentful Paint',
                    startTime: 0,
                    endTime: entry.startTime,
                    duration: entry.startTime,
                    type: 'render',
                    metadata: { vital: 'LCP' }
                })
            })

            // Navigation timing
            this.observePerformanceEntry('navigation', (entry) => {
                const navigationEntry = entry as PerformanceNavigationTiming
                this.addMetric({
                    id: 'navigation',
                    name: 'Navigation',
                    startTime: navigationEntry.fetchStart,
                    endTime: navigationEntry.loadEventEnd,
                    duration: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
                    type: 'navigation',
                    metadata: {
                        domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart,
                        domComplete: navigationEntry.domComplete - navigationEntry.fetchStart,
                        type: navigationEntry.type
                    }
                })
            })
        }
    }

    private observePerformanceEntry(type: string, callback: (entry: PerformanceEntry) => void) {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(callback)
            })

            try {
                observer.observe({ entryTypes: [type] })
                this.observers.push(observer as Observer)
            } catch (error) {
                console.warn(`Performance observer for ${type} not supported`)
            }
        }
    }

    addMetric(metric: Omit<PerformanceMetrics, 'id'> & { id?: string }) {
        if (!this.isEnabled) return

        const fullMetric: PerformanceMetrics = {
            id: metric.id || this.generateId(),
            ...metric
        }

        this.metrics.push(fullMetric)

        // Keep only last 100 metrics to prevent memory leaks
        if (this.metrics.length > 100) {
            this.metrics = this.metrics.slice(-100)
        }

        // Log slow operations
        if (fullMetric.duration > 100) {
            console.warn(`Slow ${fullMetric.type}: ${fullMetric.name} took ${fullMetric.duration.toFixed(2)}ms`)
        }
    }

    startMeasure(name: string, type: PerformanceMetrics['type'] = 'render') {
        const startTime = performance.now()

        return {
            end: (metadata?: Record<string, any>) => {
                const endTime = performance.now()
                this.addMetric({
                    name,
                    startTime,
                    endTime,
                    duration: endTime - startTime,
                    type,
                    metadata
                })
            }
        }
    }

    getStats(): PerformanceStats {
        if (this.metrics.length === 0) {
            return {
                averageRenderTime: 0,
                slowestRender: null,
                fastestRender: null,
                apiCallCount: 0,
                errorCount: 0,
                totalMetrics: 0
            }
        }

        const renderMetrics = this.metrics.filter(m => m.type === 'render')
        const apiMetrics = this.metrics.filter(m => m.type === 'api')
        const errorMetrics = this.metrics.filter(m => m.metadata?.error)

        const averageRenderTime = renderMetrics.length > 0
            ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length
            : 0

        const slowestRender = renderMetrics.length > 0
            ? renderMetrics.reduce((slowest, current) =>
                current.duration > slowest.duration ? current : slowest
            )
            : null

        const fastestRender = renderMetrics.length > 0
            ? renderMetrics.reduce((fastest, current) =>
                current.duration < fastest.duration ? current : fastest
            )
            : null

        return {
            averageRenderTime,
            slowestRender,
            fastestRender,
            apiCallCount: apiMetrics.length,
            errorCount: errorMetrics.length,
            totalMetrics: this.metrics.length
        }
    }

    getMetrics(type?: PerformanceMetrics['type']) {
        if (type) {
            return this.metrics.filter(m => m.type === type)
        }
        return [...this.metrics]
    }

    clear() {
        this.metrics = []
    }

    enable() {
        this.isEnabled = true
    }

    disable() {
        this.isEnabled = false
    }

    destroy() {
        this.observers.forEach(observer => observer.disconnect())
        this.observers = []
        this.metrics = []
    }

    private generateId(): string {
        return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
    const measureRef = useRef<{ end: (metadata?: Record<string, any>) => void } | null>(null)
    const [stats, setStats] = useState<PerformanceStats>(() => performanceMonitor.getStats())

    const startMeasure = useCallback((operation: string = 'render') => {
        measureRef.current = performanceMonitor.startMeasure(
            `${componentName}-${operation}`,
            'render'
        )
    }, [componentName])

    const endMeasure = useCallback((metadata?: Record<string, any>) => {
        if (measureRef.current) {
            measureRef.current.end(metadata)
            measureRef.current = null
            setStats(performanceMonitor.getStats())
        }
    }, [])

    const measureAsync = useCallback(async <T>(
        operation: string,
        asyncFn: () => Promise<T>
    ): Promise<T> => {
        const measure = performanceMonitor.startMeasure(
            `${componentName}-${operation}`,
            'api'
        )

        try {
            const result = await asyncFn()
            measure.end({ success: true })
            return result
        } catch (error) {
            measure.end({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
            throw error
        }
    }, [componentName])

    const refreshStats = useCallback(() => {
        setStats(performanceMonitor.getStats())
    }, [])

    // Monitor component mount/unmount
    useEffect(() => {
        const mountMeasure = performanceMonitor.startMeasure(
            `${componentName}-mount`,
            'render'
        )

        return () => {
            mountMeasure.end()
        }
    }, [componentName])

    return {
        startMeasure,
        endMeasure,
        measureAsync,
        stats,
        refreshStats
    }
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
) {
    const name = componentName || Component.displayName || Component.name || 'Unknown'

    return function WrappedComponent(props: P) {
        const { startMeasure, endMeasure } = usePerformanceMonitor(name)

        useEffect(() => {
            startMeasure('render')
            return () => {
                endMeasure()
            }
        }, [startMeasure, endMeasure])

        return React.createElement(Component, props as any)
    }
}

// Performance reporting hook
export const usePerformanceReporting = () => {
    const [isReporting, setIsReporting] = useState(false)

    const reportPerformance = useCallback(async (endpoint?: string) => {
        if (isReporting) return

        setIsReporting(true)
        try {
            const stats = performanceMonitor.getStats()
            const metrics = performanceMonitor.getMetrics()

            const report = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                stats,
                metrics: metrics.slice(-20), // Last 20 metrics
                performance: {
                    memory: (performance as any).memory ? {
                        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
                    } : null,
                    timing: performance.timing ? {
                        navigationStart: performance.timing.navigationStart,
                        loadEventEnd: performance.timing.loadEventEnd,
                        domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd
                    } : null
                }
            }

            if (endpoint) {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(report)
                })
            } else {
                console.log('Performance Report:', report)
            }
        } catch (error) {
            console.error('Failed to report performance:', error)
        } finally {
            setIsReporting(false)
        }
    }, [isReporting])

    return { reportPerformance, isReporting }
}

// Types for external use
// Already exported above

// For backward compatibility
interface Observer {
    disconnect: () => void
}
