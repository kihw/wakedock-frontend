'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useServiceController } from '@/controllers/hooks/useServiceController'
import { useRealTimeUpdates } from '@/controllers/hooks/useRealTimeUpdates'
import { usePerformanceMonitor } from '@/controllers/hooks/usePerformanceMonitor'
import { useToast } from '@/controllers/hooks/useToast'
import { Chart, ChartDataPoint } from '@/views/molecules/Chart'
import { LazyChart } from '@/views/atoms/LazyLoad'
import { Button } from '@/views/atoms/Button'
import { Badge } from '@/views/atoms/Badge'
import { Card } from '@/views/atoms/Card'
import { cn } from '@/lib/utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface MetricData {
    timestamp: string
    cpu: number
    memory: number
    disk: number
    network: number
}

const RealTimeMonitoring: React.FC = () => {
    const { services, isLoading, error, refreshServices } = useServiceController()
    const {
        services: realtimeServices,
        stats: realtimeStats,
        websocket,
        refresh: refreshRealtime
    } = useRealTimeUpdates()
    const {
        measureAsync,
        stats: perfStats
    } = usePerformanceMonitor('RealTimeMonitoring')
    const { addToast } = useToast()
    const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [metrics, setMetrics] = useState<MetricData[]>([])

    // Use realtime services if available, fallback to regular services
    const displayServices = realtimeServices.length > 0 ? realtimeServices : services
    const displayStats = realtimeServices.length > 0 ? realtimeStats : {
        totalServices: services.length,
        runningServices: services.filter(s => s.status === 'running').length,
        stoppedServices: services.filter(s => s.status === 'stopped').length,
        totalContainers: services.reduce((sum, s) => sum + (s.containers?.length || 0), 0)
    }
    useEffect(() => {
        const generateMetrics = () => {
            const now = new Date()
            const data: MetricData[] = []

            for (let i = 0; i < 24; i++) {
                const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000).toISOString()
                data.unshift({
                    timestamp,
                    cpu: Math.random() * 100,
                    memory: Math.random() * 100,
                    disk: Math.random() * 100,
                    network: Math.random() * 100
                })
            }

            setMetrics(data)
        }

        generateMetrics()
    }, [])

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(() => {
            refreshServices()
            // Update metrics with new data point
            setMetrics(prev => {
                const newMetric: MetricData = {
                    timestamp: new Date().toISOString(),
                    cpu: Math.random() * 100,
                    memory: Math.random() * 100,
                    disk: Math.random() * 100,
                    network: Math.random() * 100
                }
                return [...prev.slice(1), newMetric]
            })
        }, 5000)

        return () => clearInterval(interval)
    }, [autoRefresh, refreshServices])

    // Chart data
    const cpuData: ChartDataPoint[] = useMemo(() => {
        if (!metrics || metrics.length === 0) return []
        return metrics.slice(-12).map((metric, index) => ({
            label: new Date(metric.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            value: metric.cpu || 0,
            color: '#6366f1'
        }))
    }, [metrics])

    const memoryData: ChartDataPoint[] = useMemo(() => {
        if (!metrics || metrics.length === 0) return []
        return metrics.slice(-12).map((metric, index) => ({
            label: new Date(metric.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            value: metric.memory || 0,
            color: '#8b5cf6'
        }))
    }, [metrics])

    const diskData: ChartDataPoint[] = useMemo(() => {
        if (!metrics || metrics.length === 0) return []
        return metrics.slice(-12).map((metric, index) => ({
            label: new Date(metric.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            value: metric.disk || 0,
            color: '#06b6d4'
        }))
    }, [metrics])

    const serviceStatusData: ChartDataPoint[] = useMemo(() => {
        if (!services || services.length === 0) return []

        const statusCounts = services.reduce((acc, service) => {
            acc[service.status] = (acc[service.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(statusCounts).map(([status, count]) => ({
            label: status,
            value: count,
            color: status === 'running' ? '#10b981' :
                status === 'stopped' ? '#6b7280' :
                    status === 'error' ? '#ef4444' : '#f59e0b'
        }))
    }, [services])

    // Current metrics
    const currentMetrics = useMemo(() => {
        if (!metrics || metrics.length === 0) return { cpu: 0, memory: 0, disk: 0, network: 0 }
        const latest = metrics[metrics.length - 1]
        if (!latest) return { cpu: 0, memory: 0, disk: 0, network: 0 }
        return {
            cpu: latest.cpu || 0,
            memory: latest.memory || 0,
            disk: latest.disk || 0,
            network: latest.network || 0
        }
    }, [metrics])

    const getMetricColor = (value: number) => {
        if (value > 80) return 'text-red-500'
        if (value > 60) return 'text-yellow-500'
        return 'text-green-500'
    }

    const getMetricBadge = (value: number) => {
        if (value > 80) return 'error'
        if (value > 60) return 'warning'
        return 'success'
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                        Erreur de chargement
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Impossible de charger les métriques de monitoring.
                    </p>
                    <Button onClick={refreshServices} variant="secondary" size="sm">
                        Réessayer
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Monitoring Temps Réel
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Surveillez les performances de vos services en temps réel
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={autoRefresh ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                            {autoRefresh ? (
                                <>
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                                    Auto-refresh
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Paused
                                </>
                            )}
                        </Button>
                    </div>
                    <Button
                        onClick={refreshServices}
                        variant="outline"
                        size="sm"
                        loading={isLoading}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Current Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">CPU</p>
                                <p className={cn('text-2xl font-bold', getMetricColor(currentMetrics.cpu))}>
                                    {currentMetrics.cpu.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Badge variant={getMetricBadge(currentMetrics.cpu)}>
                                {currentMetrics.cpu > 80 ? 'Critique' :
                                    currentMetrics.cpu > 60 ? 'Élevé' : 'Normal'}
                            </Badge>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Mémoire</p>
                                <p className={cn('text-2xl font-bold', getMetricColor(currentMetrics.memory))}>
                                    {currentMetrics.memory.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Badge variant={getMetricBadge(currentMetrics.memory)}>
                                {currentMetrics.memory > 80 ? 'Critique' :
                                    currentMetrics.memory > 60 ? 'Élevé' : 'Normal'}
                            </Badge>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Disque</p>
                                <p className={cn('text-2xl font-bold', getMetricColor(currentMetrics.disk))}>
                                    {currentMetrics.disk.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Badge variant={getMetricBadge(currentMetrics.disk)}>
                                {currentMetrics.disk > 80 ? 'Critique' :
                                    currentMetrics.disk > 60 ? 'Élevé' : 'Normal'}
                            </Badge>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Réseau</p>
                                <p className={cn('text-2xl font-bold', getMetricColor(currentMetrics.network))}>
                                    {currentMetrics.network.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Badge variant={getMetricBadge(currentMetrics.network)}>
                                {currentMetrics.network > 80 ? 'Critique' :
                                    currentMetrics.network > 60 ? 'Élevé' : 'Normal'}
                            </Badge>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Chart
                        title="Utilisation CPU"
                        data={cpuData}
                        type="area"
                        height={300}
                        className="shadow-lg"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Chart
                        title="Utilisation Mémoire"
                        data={memoryData}
                        type="line"
                        height={300}
                        className="shadow-lg"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Chart
                        title="Utilisation Disque"
                        data={diskData}
                        type="bar"
                        height={300}
                        className="shadow-lg"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Chart
                        title="Statut des Services"
                        data={serviceStatusData}
                        type="pie"
                        height={300}
                        className="shadow-lg"
                    />
                </motion.div>
            </div>

            {/* Service Status List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        État des Services
                    </h2>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                            ))}
                        </div>
                    ) : services && services.length > 0 ? (
                        <div className="space-y-3">
                            {services.map((service) => (
                                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'w-3 h-3 rounded-full',
                                            service.status === 'running' ? 'bg-green-500' :
                                                service.status === 'stopped' ? 'bg-gray-500' :
                                                    service.status === 'error' ? 'bg-red-500' :
                                                        'bg-yellow-500'
                                        )} />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {service.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {service.subdomain}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            service.status === 'running' ? 'success' :
                                                service.status === 'stopped' ? 'secondary' :
                                                    service.status === 'error' ? 'error' :
                                                        'warning'
                                        }>
                                            {service.status}
                                        </Badge>
                                        {service.resources && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                CPU: {service.resources.cpu}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                Aucun service à surveiller
                            </p>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    )
}

export default RealTimeMonitoring
