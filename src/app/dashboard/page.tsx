'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useServiceController } from '@/controllers/hooks/useServiceController'
import { useToast } from '@/controllers/hooks/useToast'
import { ServiceCard } from '@/views/molecules/ServiceCard'
import { Card } from '@/views/atoms/Card'
import { Badge } from '@/views/atoms/Badge'
import { Button } from '@/views/atoms/Button'

interface DashboardStats {
    totalServices: number
    runningServices: number
    stoppedServices: number
    errorServices: number
    totalContainers: number
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
}

const Dashboard: React.FC = () => {
    const { services, isLoading, error, refreshServices } = useServiceController()
    const { addToast } = useToast()

    // Calculate dashboard stats
    const stats: DashboardStats = React.useMemo(() => {
        if (!services) {
            return {
                totalServices: 0,
                runningServices: 0,
                stoppedServices: 0,
                errorServices: 0,
                totalContainers: 0,
                cpuUsage: 0,
                memoryUsage: 0,
                diskUsage: 0
            }
        }

        const runningServices = services.filter(s => s.status === 'running').length
        const stoppedServices = services.filter(s => s.status === 'stopped').length
        const errorServices = services.filter(s => s.status === 'error').length
        const totalContainers = services.reduce((sum, s) => sum + s.containers.length, 0)

        // Calculate average resource usage
        const avgCpu = services.reduce((sum, s) => sum + (s.resources?.cpu || 0), 0) / services.length
        const avgMemory = services.reduce((sum, s) => sum + (s.resources?.memory || 0), 0) / services.length
        const avgDisk = services.reduce((sum, s) => sum + (s.resources?.disk || 0), 0) / services.length

        return {
            totalServices: services.length,
            runningServices,
            stoppedServices,
            errorServices,
            totalContainers,
            cpuUsage: Math.round(avgCpu),
            memoryUsage: Math.round(avgMemory),
            diskUsage: Math.round(avgDisk)
        }
    }, [services])

    const handleRefresh = () => {
        refreshServices()
        addToast('Dashboard rafraîchi', 'success')
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                        Erreur de chargement
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Impossible de charger les données du tableau de bord.
                    </p>
                    <Button onClick={handleRefresh} variant="secondary" size="sm">
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
                        Tableau de bord
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Vue d'ensemble de vos services et conteneurs
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    loading={isLoading}
                    className="w-fit"
                >
                    Actualiser
                </Button>
            </div>

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Services
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalServices}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Services Actifs
                                </p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.runningServices}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Conteneurs
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalContainers}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    CPU Moyen
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.cpuUsage}%
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Services Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Services */}
                <motion.div
                    className="lg:col-span-2"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Services Récents
                            </h2>
                            <Badge variant="secondary">
                                {stats.totalServices} services
                            </Badge>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : services && services.length > 0 ? (
                            <div className="space-y-4">
                                {services.slice(0, 5).map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <ServiceCard service={service} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aucun service disponible
                                </p>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Actions Rapides
                        </h2>
                        <div className="space-y-4">
                            <Button variant="primary" className="w-full justify-start">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Nouveau Service
                            </Button>

                            <Button variant="secondary" className="w-full justify-start">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Gérer les Stacks
                            </Button>

                            <Button variant="outline" className="w-full justify-start">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Monitoring
                            </Button>
                        </div>
                    </Card>

                    {/* System Status */}
                    <Card className="p-6 mt-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            État Système
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Mémoire
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                            style={{ width: `${stats.memoryUsage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {stats.memoryUsage}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Disque
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                                            style={{ width: `${stats.diskUsage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {stats.diskUsage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}

export default Dashboard
