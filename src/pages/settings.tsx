import React, { Suspense, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ComponentLoader } from '@/components/ui/loading-spinner';
import Head from 'next/head';
import { 
    Settings as SettingsIcon, 
    User,
    Bell,
    Shield,
    Database,
    Globe,
    Moon,
    Sun,
    Monitor,
    Save,
    RefreshCw,
    Key,
    Mail,
    Smartphone,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [theme, setTheme] = useState('system');
    const [showApiKey, setShowApiKey] = useState(false);

    const tabs = [
        { id: 'general', label: 'General', icon: <SettingsIcon className="h-4 w-4" /> },
        { id: 'account', label: 'Account', icon: <User className="h-4 w-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
        { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
        { id: 'integrations', label: 'Integrations', icon: <Database className="h-4 w-4" /> },
    ];

    return (
        <>
            <Head>
                <title>Settings - WakeDock</title>
                <meta name="description" content="Configure your WakeDock preferences and account settings" />
                <meta property="og:title" content="WakeDock Settings" />
                <meta property="og:description" content="Application settings and configuration" />
            </Head>

            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <SettingsIcon className="h-8 w-8" />
                            Settings
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Configure your WakeDock preferences and account settings
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-64">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1">
                            <Suspense fallback={<ComponentLoader text="Loading settings..." />}>
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {/* General Settings */}
                                    {activeTab === 'general' && (
                                        <div className="p-6 space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    General Settings
                                                </h3>
                                                
                                                {/* Theme Selection */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Theme
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <button
                                                                onClick={() => setTheme('light')}
                                                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                                                                    theme === 'light'
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                                }`}
                                                            >
                                                                <Sun className="h-6 w-6 text-yellow-500" />
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setTheme('dark')}
                                                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                                                                    theme === 'dark'
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                                }`}
                                                            >
                                                                <Moon className="h-6 w-6 text-blue-500" />
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setTheme('system')}
                                                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                                                                    theme === 'system'
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                                }`}
                                                            >
                                                                <Monitor className="h-6 w-6 text-gray-500" />
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Language */}
                                                    <div>
                                                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Language
                                                        </label>
                                                        <select
                                                            id="language"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="en">English</option>
                                                            <option value="fr">Français</option>
                                                            <option value="es">Español</option>
                                                            <option value="de">Deutsch</option>
                                                        </select>
                                                    </div>

                                                    {/* Timezone */}
                                                    <div>
                                                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Timezone
                                                        </label>
                                                        <select
                                                            id="timezone"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="UTC">UTC</option>
                                                            <option value="Europe/Paris">Europe/Paris</option>
                                                            <option value="America/New_York">America/New York</option>
                                                            <option value="Asia/Tokyo">Asia/Tokyo</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                    <Save className="h-4 w-4" />
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Account Settings */}
                                    {activeTab === 'account' && (
                                        <div className="p-6 space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Account Settings
                                                </h3>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Username
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="username"
                                                            defaultValue="admin"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            defaultValue="admin@wakedock.local"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            API Key
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type={showApiKey ? "text" : "password"}
                                                                id="api-key"
                                                                defaultValue="wdk_1234567890abcdef"
                                                                readOnly
                                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                                                            />
                                                            <button
                                                                onClick={() => setShowApiKey(!showApiKey)}
                                                                className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                            <button className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                                <RefreshCw className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                    <Save className="h-4 w-4" />
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Other tabs - placeholder content */}
                                    {(activeTab === 'notifications' || activeTab === 'security' || activeTab === 'integrations') && (
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                                                {activeTab} Settings
                                            </h3>
                                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                                <p className="text-lg font-medium mb-2">{activeTab} settings coming soon</p>
                                                <p className="text-sm">
                                                    Configure your {activeTab} preferences here
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}