import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';

export default function HomePage() {
    return (
        <>
            <Head>
                <title>Dashboard - WakeDock</title>
                <meta name="description" content="Monitor and manage your Docker services from the WakeDock dashboard" />
                <meta property="og:title" content="WakeDock Dashboard" />
                <meta property="og:description" content="Real-time Docker container management and monitoring" />
            </Head>

            <DashboardLayout>
                <Suspense fallback={<ComponentLoader text="Loading dashboard..." />}>
                    <DashboardPage />
                </Suspense>
            </DashboardLayout>
        </>
    );
}
