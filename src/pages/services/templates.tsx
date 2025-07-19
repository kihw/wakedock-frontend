import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';
import { Package, Download, Star, Heart } from 'lucide-react';

export default function ServiceTemplatesPage() {
    return (
        <>
            <Head>
                <title>Service Templates - WakeDock</title>
                <meta name="description" content="Browse and use Docker service templates with WakeDock" />
                <meta property="og:title" content="Service Templates - WakeDock" />
                <meta property="og:description" content="Pre-configured Docker service templates" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Package className="h-8 w-8" />
                            Service Templates
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Browse and deploy pre-configured Docker service templates
                        </p>
                    </div>

                    <Suspense fallback={<ComponentLoader text="Loading templates..." />}>
                        <div className="grid gap-6">
                            {/* Template Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                                    <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Web Apps</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">12 templates</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                                    <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Databases</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">8 templates</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Monitoring</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">6 templates</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                                    <Download className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">DevOps</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">15 templates</p>
                                </div>
                            </div>

                            {/* Template Grid */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                    Available Templates
                                </h2>
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Service templates will be displayed here
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        This page is currently under development
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