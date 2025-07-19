import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';
import { 
    BarChart3, 
    TrendingUp, 
    Activity,
    Cpu,
    HardDrive,
    Network,
    Clock,
    Calendar,
    Filter,
    Download
} from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <>
            <Head>
                <title>Analytics - WakeDock</title>
                <meta name="description" content="Advanced analytics and insights for your Docker infrastructure" />
                <meta property="og:title" content="WakeDock Analytics" />
                <meta property="og:description" content="Performance metrics and analytics dashboard" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <BarChart3 className="h-8 w-8" />
                                Analytics
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Performance metrics and insights for your infrastructure
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Calendar className="h-4 w-4" />
                                Date Range
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                                <Cpu className="h-5 w-5 text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">45.2%</p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +5.2% from last hour
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
                                <HardDrive className="h-5 w-5 text-purple-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">8.4 GB</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                of 16 GB total
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Network I/O</p>
                                <Network className="h-5 w-5 text-green-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">125 MB/s</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                ↓ 85 MB/s ↑ 40 MB/s
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                                <Clock className="h-5 w-5 text-indigo-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">99.98%</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Last 30 days
                            </p>
                        </div>
                    </div>

                    <Suspense fallback={<ComponentLoader text="Loading analytics..." />}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* CPU Usage Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CPU Usage</h3>
                                    <Activity className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <p>CPU usage chart will be displayed here</p>
                                </div>
                            </div>

                            {/* Memory Usage Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Memory Usage</h3>
                                    <HardDrive className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <p>Memory usage chart will be displayed here</p>
                                </div>
                            </div>

                            {/* Network Traffic */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Traffic</h3>
                                    <Network className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <p>Network traffic chart will be displayed here</p>
                                </div>
                            </div>

                            {/* Container Statistics */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Container Statistics</h3>
                                    <BarChart3 className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <p>Container statistics will be displayed here</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Metrics Table */}
                        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Metrics</h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p className="text-lg font-medium mb-2">Analytics Dashboard Coming Soon</p>
                                    <p className="text-sm">
                                        Advanced metrics and insights will be available here
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Suspense>
                </div>
            </DashboardLayout>
        </>
    );
}