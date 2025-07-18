import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics - WakeDock',
  description: 'Docker container analytics and performance insights',
};

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Docker container analytics and performance insights
            </p>
          </div>
        </div>

        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}