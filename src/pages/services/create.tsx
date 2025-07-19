import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ServiceCreationWizard } from '@/components/services/ServiceCreationWizard';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';

export default function CreateServicePage() {
    return (
        <>
            <Head>
                <title>Create Service - WakeDock</title>
                <meta name="description" content="Create a new Docker service with WakeDock" />
                <meta property="og:title" content="Create Service - WakeDock" />
                <meta property="og:description" content="Service creation wizard for Docker containers" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Create Service
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Create a new Docker service using our guided wizard
                        </p>
                    </div>

                    <Suspense fallback={<ComponentLoader text="Loading service creation wizard..." />}>
                        <ServiceCreationWizard />
                    </Suspense>
                </div>
            </DashboardLayout>
        </>
    );
}