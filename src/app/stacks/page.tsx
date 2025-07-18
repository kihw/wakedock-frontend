import { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StackManagement } from '@/components/dashboard/StackManagement';
import { ComponentLoader } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
    title: 'Stack Management - WakeDock',
    description: 'Manage and monitor your Docker stacks and container orchestration',
    openGraph: {
        title: 'WakeDock Stack Management',
        description: 'Advanced Docker stack detection and management',
    },
};

export default function StacksPage() {
    return (
        <DashboardLayout title="Stack Management">
            <Suspense fallback={<ComponentLoader text="Loading stack management..." />}>
                <StackManagement />
            </Suspense>
        </DashboardLayout>
    );
}
