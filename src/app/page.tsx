import { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { ComponentLoader } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: 'Dashboard - WakeDock',
  description: 'Monitor and manage your Docker services from the WakeDock dashboard',
  openGraph: {
    title: 'WakeDock Dashboard',
    description: 'Real-time Docker container management and monitoring',
  },
};

// v0.6.4 optimization: Streaming + Suspense
export default function HomePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<ComponentLoader text="Loading dashboard..." />}>
        <DashboardPage />
      </Suspense>
    </DashboardLayout>
  );
}