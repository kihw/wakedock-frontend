import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const RealtimeMonitoring = () => {
    const router = useRouter()
    const [systemMetrics, setSystemMetrics] = useState({
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0,
        timestamp: Date.now()
    })

    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemMetrics({
                cpu: Math.floor(Math.random() * 100),
                memory: Math.floor(Math.random() * 100),
                disk: Math.floor(Math.random() * 100),
                network: Math.floor(Math.random() * 1000),
                timestamp: Date.now()
            })
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (value: number) => {
        if (value < 30) return 'text-green-600'
        if (value < 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getProgressColor = (value: number) => {
        if (value < 30) return 'bg-green-600'
        if (value < 70) return 'bg-yellow-600'
        return 'bg-red-600'
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monitoring Temps Réel</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Surveillance en temps réel des métriques système
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* CPU Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CPU</h3>
                        <span className={`text-2xl font-bold ${getStatusColor(systemMetrics.cpu)}`}>
                            {systemMetrics.cpu}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(systemMetrics.cpu)}`}
                            style={{ width: `${systemMetrics.cpu}%` }}
                        ></div>
                    </div>
                </div>

                {/* Memory Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Memory</h3>
                        <span className={`text-2xl font-bold ${getStatusColor(systemMetrics.memory)}`}>
                            {systemMetrics.memory}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(systemMetrics.memory)}`}
                            style={{ width: `${systemMetrics.memory}%` }}
                        ></div>
                    </div>
                </div>

                {/* Disk Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Disk</h3>
                        <span className={`text-2xl font-bold ${getStatusColor(systemMetrics.disk)}`}>
                            {systemMetrics.disk}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(systemMetrics.disk)}`}
                            style={{ width: `${systemMetrics.disk}%` }}
                        ></div>
                    </div>
                </div>

                {/* Network Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network</h3>
                        <span className="text-2xl font-bold text-blue-600">
                            {systemMetrics.network} KB/s
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                            style={{ width: `${Math.min(systemMetrics.network / 10, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Services Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Services en Temps Réel
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-gray-900 dark:text-white">Web Server</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Running</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-gray-900 dark:text-white">Database</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Running</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-gray-900 dark:text-white">Redis Cache</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Warning</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-gray-900 dark:text-white">Backup Service</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Stopped</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Retour au Dashboard
                </button>
                <button
                    onClick={() => router.push('/services')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Gérer les Services
                </button>
            </div>
        </div>
    )
}

export default RealtimeMonitoring
