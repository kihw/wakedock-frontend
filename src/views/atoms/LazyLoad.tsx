'use client'

import { Suspense, lazy, ComponentType, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LazyLoadProps {
    fallback?: React.ReactNode
    delay?: number
    className?: string
}

// Loading spinner component
const LoadingSpinner = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center space-y-4"
        >
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Chargement...</p>
        </motion.div>
    </div>
)

// Skeleton loading component
const SkeletonLoader = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
)

// Generic lazy loading HOC
export const withLazyLoading = <P extends object>(
    Component: ComponentType<P>,
    options: LazyLoadProps = {}
) => {
    const LazyComponent = lazy(() =>
        new Promise<{ default: ComponentType<P> }>((resolve) => {
            setTimeout(() => {
                resolve({ default: Component })
            }, options.delay || 0)
        })
    )

    return (props: P) => (
        <Suspense fallback={options.fallback || <LoadingSpinner className={options.className} />}>
            <LazyComponent {...(props as any)} />
        </Suspense>
    )
}

// Lazy load component with intersection observer
export const LazyLoad = ({
    children,
    fallback,
    threshold = 0.1,
    rootMargin = '50px',
    className = ''
}: {
    children: React.ReactNode
    fallback?: React.ReactNode
    threshold?: number
    rootMargin?: string
    className?: string
}) => {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasLoaded) {
                    setIsIntersecting(true)
                    setHasLoaded(true)
                }
            },
            {
                threshold,
                rootMargin
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [threshold, rootMargin, hasLoaded])

    return (
        <div ref={ref} className={className}>
            {isIntersecting ? children : (fallback || <SkeletonLoader />)}
        </div>
    )
}

// Lazy loaded chart component
export const LazyChart = withLazyLoading(
    lazy(() => import('../molecules/Chart').then(module => ({ default: module.Chart }))),
    {
        fallback: <SkeletonLoader className="h-64" />,
        delay: 100
    }
)

// Lazy loaded filters component
export const LazyFilters = withLazyLoading(
    lazy(() => import('../molecules/Filters').then(module => ({ default: module.Filters }))),
    {
        fallback: <SkeletonLoader className="h-32" />,
        delay: 50
    }
)

// Performance monitoring wrapper
export const PerformanceMonitor = ({
    children,
    componentName
}: {
    children: React.ReactNode
    componentName: string
}) => {
    useEffect(() => {
        const startTime = performance.now()

        return () => {
            const endTime = performance.now()
            const renderTime = endTime - startTime

            if (renderTime > 100) {
                console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`)
            }
        }
    }, [componentName])

    return <>{children}</>
}

// Virtualization for large lists
export const VirtualizedList = ({
    items,
    itemHeight = 60,
    containerHeight = 400,
    renderItem,
    className = ''
}: {
    items: any[]
    itemHeight?: number
    containerHeight?: number
    renderItem: (item: any, index: number) => React.ReactNode
    className?: string
}) => {
    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    )

    const visibleItems = items.slice(visibleStart, visibleEnd)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: items.length * itemHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${visibleStart * itemHeight}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    {visibleItems.map((item, index) => (
                        <div
                            key={visibleStart + index}
                            style={{ height: itemHeight }}
                            className="flex items-center"
                        >
                            {renderItem(item, visibleStart + index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export { LoadingSpinner, SkeletonLoader }
