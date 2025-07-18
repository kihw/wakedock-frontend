import { Suspense } from 'react';
import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import ServiceManagementDashboard from '@/components/services/ServiceManagementDashboard';
import { ComponentLoader } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: 'Services - WakeDock',
  description: 'Manage and monitor your Docker services with WakeDock',
  openGraph: {
    title: 'WakeDock Services',
    description: 'Advanced Docker service management and orchestration',
  },
};

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<ComponentLoader text="Loading services..." />}>
        <ServiceManagementDashboard />
      </Suspense>
    </DashboardLayout>
  );
}
