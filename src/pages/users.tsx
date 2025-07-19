import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';
import { Users, Plus, Settings, Shield } from 'lucide-react';

export default function UsersPage() {
    return (
        <>
            <Head>
                <title>Users - WakeDock</title>
                <meta name="description" content="Manage users and access control for WakeDock" />
                <meta property="og:title" content="WakeDock Users" />
                <meta property="og:description" content="User management and access control interface" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Users className="h-8 w-8" />
                            Users
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage users and access permissions
                        </p>
                    </div>

                    <Suspense fallback={<ComponentLoader text="Loading users..." />}>
                        <div className="grid gap-6">
                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                    Quick Actions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <Plus className="h-5 w-5 text-blue-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Add User</span>
                                    </button>
                                    <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <Settings className="h-5 w-5 text-green-500" />
                                        <span className="text-gray-700 dark:text-gray-300">User Settings</span>
                                    </button>
                                    <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <Shield className="h-5 w-5 text-purple-500" />
                                        <span className="text-gray-700 dark:text-gray-300">Permissions</span>
                                    </button>
                                </div>
                            </div>

                            {/* User Management Interface */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                    User Management
                                </h2>
                                <div className="text-center py-12">
                                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        User management interface will be implemented here
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        This page is currently under development
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Suspense>
                </div>
            </DashboardLayout>
        </>
    );
}