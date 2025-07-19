import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ServiceManagementDashboard } from '@/components/services/ServiceManagementDashboard';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';

export default function ServicesPage() {
    return (
        <>
            <Head>
                <title>Services - WakeDock</title>
                <meta name="description" content="Manage and monitor your Docker services with WakeDock" />
                <meta property="og:title" content="WakeDock Services" />
                <meta property="og:description" content="Docker service management and monitoring interface" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Services
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage and monitor your Docker services
                        </p>
                    </div>

                    <Suspense fallback={<ComponentLoader text="Loading services..." />}>
                        <ServiceManagementDashboard />
                    </Suspense>
                </div>
            </DashboardLayout>
        </>
    );
}