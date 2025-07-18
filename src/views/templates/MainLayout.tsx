// Main Layout Component - Template (MVC Architecture)
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/views/organisms/Navigation';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: Array<{
        label: string;
        href?: string;
        current?: boolean;
    }>;
    actions?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    title,
    breadcrumbs = [],
    actions
}) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-collapse sidebar on smaller screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            } else {
                setSidebarCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Navigation */}
            <Navigation
                user={user}
                onThemeToggle={toggleTheme}
                theme={theme}
                notifications={3}
            />

            {/* Main Content */}
            <main className={cn(
                'transition-all duration-300',
                'lg:ml-72', // Default sidebar width
                sidebarCollapsed && 'lg:ml-18', // Collapsed sidebar width
                'lg:pt-0 pt-16' // Mobile header height
            )}>
                {/* Page Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 lg:py-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            {/* Breadcrumbs */}
                            {breadcrumbs.length > 0 && (
                                <nav className="flex mb-2" aria-label="Breadcrumb">
                                    <ol className="flex items-center space-x-2">
                                        {breadcrumbs.map((breadcrumb, index) => (
                                            <li key={index} className="flex items-center">
                                                {index > 0 && (
                                                    <svg
                                                        className="w-4 h-4 mx-2 text-gray-400"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                                {breadcrumb.href ? (
                                                    <a
                                                        href={breadcrumb.href}
                                                        className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                                    >
                                                        {breadcrumb.label}
                                                    </a>
                                                ) : (
                                                    <span
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            breadcrumb.current
                                                                ? 'text-gray-900 dark:text-gray-100'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        )}
                                                    >
                                                        {breadcrumb.label}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </nav>
                            )}

                            {/* Page Title */}
                            {title && (
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                    {title}
                                </h1>
                            )}
                        </div>

                        {/* Page Actions */}
                        {actions && (
                            <div className="flex items-center gap-3">
                                {actions}
                            </div>
                        )}
                    </div>
                </motion.header>

                {/* Page Content */}
                <div className="px-4 lg:px-6 py-4 lg:py-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={title || 'page-content'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <footer className="mt-auto px-4 lg:px-6 py-4 lg:py-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                            <span>© 2025 WakeDock. All rights reserved.</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="/docs"
                                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                Documentation
                            </a>
                            <a
                                href="/support"
                                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                Support
                            </a>
                            <a
                                href="/api"
                                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                API
                            </a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};
