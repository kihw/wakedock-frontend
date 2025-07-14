import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/components/pages/dashboard-page';

export const metadata: Metadata = {
  title: 'Dashboard - WakeDock',
  description: 'Monitor and manage your Docker services from the WakeDock dashboard',
};

export default function HomePage() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}