import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CentralizedLogsViewer } from '@/components/logs/CentralizedLogsViewer';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';

export default function LogsPage() {
    return (
        <>
            <Head>
                <title>Logs - WakeDock</title>
                <meta name="description" content="View and search centralized logs from all Docker services" />
                <meta property="og:title" content="WakeDock Logs" />
                <meta property="og:description" content="Centralized logging and log analysis interface" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Logs
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Centralized log viewing and analysis
                        </p>
                    </div>

                    <Suspense fallback={<ComponentLoader text="Loading logs..." />}>
                        <CentralizedLogsViewer />
                    </Suspense>
                </div>
            </DashboardLayout>
        </>
    );
}