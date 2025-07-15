import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

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

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature is coming soon. You'll be able to view detailed analytics and performance metrics from this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Coming features:
              <ul className="mt-2 space-y-1">
                <li>• Performance metrics</li>
                <li>• Resource usage trends</li>
                <li>• Cost analysis</li>
                <li>• Usage patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}