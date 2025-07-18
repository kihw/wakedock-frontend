'use client';

import AlertsManagementDashboard from '@/components/alerts/AlertsManagementDashboard';

export default function AlertsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Alertes et Notifications
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Surveillez et gérez les alertes automatiques de vos conteneurs Docker
                    </p>
                </div>

                <AlertsManagementDashboard />
            </div>
        </div>
    );
}
