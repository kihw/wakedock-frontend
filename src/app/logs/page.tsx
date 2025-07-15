import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'Logs - WakeDock',
  description: 'View and analyze Docker container logs',
};

export default function LogsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and analyze Docker container logs
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Logs Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature is coming soon. You'll be able to view, search, and analyze container logs from this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current features available:
              <ul className="mt-2 space-y-1">
                <li>• Real-time log streaming</li>
                <li>• Log search and filtering</li>
                <li>• Export log data</li>
                <li>• Log aggregation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}