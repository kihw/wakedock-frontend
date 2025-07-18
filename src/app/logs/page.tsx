import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import CentralizedLogsViewer from '@/components/logs/CentralizedLogsViewer';

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

        <CentralizedLogsViewer />
      </div>
    </DashboardLayout>
  );
}