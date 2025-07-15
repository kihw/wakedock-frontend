import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'Profile - WakeDock',
  description: 'Manage your user profile and account settings',
};

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your user profile and account settings
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              User Profile
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature is coming soon. You'll be able to manage your profile and account settings from this page.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Profile features:
              <ul className="mt-2 space-y-1">
                <li>• Update personal information</li>
                <li>• Change password</li>
                <li>• Manage notifications</li>
                <li>• API key management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}