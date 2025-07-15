import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'Backup - WakeDock',
  description: 'Manage Docker container backups and snapshots',
};

export default function BackupPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Backup
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage Docker container backups and snapshots
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💾</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Backup Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature is coming soon. You'll be able to create, manage, and restore container backups from this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Planned features:
              <ul className="mt-2 space-y-1">
                <li>• Automated backup scheduling</li>
                <li>• Container snapshots</li>
                <li>• Volume backups</li>
                <li>• Backup restoration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}