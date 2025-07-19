// Minimal dashboard layout for v0.6.4
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { Header } from './Header-simple';
import {
    Home,
    Server,
    Activity,
    Database,
    Settings,
    BarChart3,
    Shield,
    Users,
    Layers
} from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Navigation items for the application
    const navigation = [
        {
            label: 'Dashboard',
            href: '/',
            icon: <Home className="w-4 h-4" />,
            active: pathname === '/'
        },
        {
            label: 'Services',
            href: '/services',
            icon: <Server className="w-4 h-4" />,
            active: pathname === '/services'
        },
        {
            label: 'Stacks',
            href: '/stacks',
            icon: <Layers className="w-4 h-4" />,
            active: pathname === '/stacks'
        },
        {
            label: 'Monitoring',
            href: '/monitoring',
            icon: <Activity className="w-4 h-4" />,
            active: pathname === '/monitoring'
        },
        {
            label: 'Analytics',
            href: '/analytics',
            icon: <BarChart3 className="w-4 h-4" />,
            active: pathname === '/analytics'
        },
        {
            label: 'Logs',
            href: '/logs',
            icon: <Database className="w-4 h-4" />,
            active: pathname === '/logs'
        },
        {
            label: 'Alerts',
            href: '/alerts',
            icon: <Shield className="w-4 h-4" />,
            active: pathname === '/alerts'
        },
        {
            label: 'Users',
            href: '/users',
            icon: <Users className="w-4 h-4" />,
            active: pathname === '/users'
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: <Settings className="w-4 h-4" />,
            active: pathname === '/settings'
        }
    ];

    const handleNavigationClick = (href: string) => {
        // Use Next.js SPA navigation
        router.push(href);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header
                navigation={navigation}
                onNavigationClick={handleNavigationClick}
                showUserMenu={true}
                showNotifications={true}
            />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {title && (
                    <div className="px-4 py-6 sm:px-0">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    </div>
                )}
                <div className="px-4 py-6 sm:px-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
