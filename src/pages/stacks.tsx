import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import { useStacks } from '@/hooks/api/useStacks';
import { StackCard } from '@/components/stacks/StackCard';
import Head from 'next/head';
import { 
    Layers, 
    Plus, 
    RefreshCw, 
    Activity,
    Server,
    Container,
    AlertCircle
} from 'lucide-react';

export default function StacksPage() {
    const { stacks, overview, loading, error, refreshStacks } = useStacks();

    return (
        <>
            <Head>
                <title>Stacks - WakeDock</title>
                <meta name="description" content="Manage Docker Compose stacks and multi-container applications" />
                <meta property="og:title" content="WakeDock Stacks" />
                <meta property="og:description" content="Docker Compose stack management interface" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Layers className="h-8 w-8" />
                                Stacks
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage Docker Compose stacks and multi-container applications
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshStacks}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus className="h-4 w-4" />
                                Deploy Stack
                            </button>
                        </div>
                    </div>

                    {/* Overview Stats */}
                    {overview && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stacks</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.total_stacks}</p>
                                    </div>
                                    <Layers className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                                        <p className="text-2xl font-bold text-green-600">{overview.running_stacks}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Services</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.total_services}</p>
                                    </div>
                                    <Server className="h-8 w-8 text-purple-500" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Containers</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.total_containers}</p>
                                    </div>
                                    <Container className="h-8 w-8 text-indigo-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                                <p className="text-red-800 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Stacks Grid */}
                    <Suspense fallback={<ComponentLoader text="Loading stacks..." />}>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <ComponentLoader text="Loading stacks..." />
                            </div>
                        ) : stacks.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                                <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No stacks deployed
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Deploy your first Docker Compose stack to get started
                                </p>
                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Plus className="h-4 w-4" />
                                    Deploy Stack
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {stacks.map((stack) => (
                                    <StackCard key={stack.name} stack={stack} />
                                ))}
                            </div>
                        )}
                    </Suspense>
                </div>
            </DashboardLayout>
        </>
    );
}