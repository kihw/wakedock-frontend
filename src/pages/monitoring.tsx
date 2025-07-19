import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';

export default function MonitoringPage() {
    return (
        <>
            <Head>
                <title>Monitoring - WakeDock</title>
                <meta name="description" content="Monitor system performance and Docker container metrics with WakeDock" />
                <meta property="og:title" content="WakeDock Monitoring" />
                <meta property="og:description" content="Real-time monitoring and alerts for Docker infrastructure" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Monitoring
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            System monitoring and performance metrics
                        </p>
                    </div>

                    <Suspense fallback={<ComponentLoader text="Loading monitoring data..." />}>
                        <MonitoringDashboard />
                    </Suspense>
                </div>
            </DashboardLayout>
        </>
    );
}