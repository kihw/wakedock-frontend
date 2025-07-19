// Modern Navigation Component - Organism (MVC Architecture)
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Home,
    Server,
    Activity,
    Database,
    Settings,
    BarChart3,
    Shield,
    Users,
    Layers,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    User,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface NavigationProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    onThemeToggle?: () => void;
    theme?: 'light' | 'dark';
    notifications?: number;
}

const navigationItems = [
    {
        label: 'Dashboard',
        href: '/',
        icon: Home,
        group: 'main'
    },
    {
        label: 'Services',
        href: '/services',
        icon: Server,
        group: 'main'
    },
    {
        label: 'Stacks',
        href: '/stacks',
        icon: Layers,
        group: 'main'
    },
    {
        label: 'Monitoring',
        href: '/monitoring',
        icon: Activity,
        group: 'main'
    },
    {
        label: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        group: 'main'
    },
    {
        label: 'Logs',
        href: '/logs',
        icon: Database,
        group: 'tools'
    },
    {
        label: 'Alerts',
        href: '/alerts',
        icon: Shield,
        group: 'tools'
    },
    {
        label: 'Users',
        href: '/users',
        icon: Users,
        group: 'admin'
    },
    {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
        group: 'admin'
    }
];

const groupLabels = {
    main: 'Main',
    tools: 'Tools',
    admin: 'Admin'
};

export const Navigation: React.FC<NavigationProps> = ({
    user,
    onThemeToggle,
    theme = 'light',
    notifications = 0
}) => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(true);
            } else {
                setCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const groupedItems = navigationItems.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {} as Record<string, typeof navigationItems>);

    const NavigationItem = ({ item, isActive }: { item: typeof navigationItems[0], isActive: boolean }) => {
        const Icon = item.icon;

        return (
            <Link href={item.href} className="block">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        isActive && 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
                        collapsed && 'justify-center'
                    )}
                >
                    <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-indigo-600 dark:text-indigo-400')} />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="font-medium truncate"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Server className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                WakeDock
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="lg:flex hidden"
                    icon={collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                {Object.entries(groupedItems).map(([group, items]) => (
                    <div key={group} className="space-y-2">
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.h3
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                    {groupLabels[group as keyof typeof groupLabels]}
                                </motion.h3>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1">
                            {items.map((item) => (
                                <NavigationItem
                                    key={item.href}
                                    item={item}
                                    isActive={pathname === item.href}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Section */}
            {user && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className={cn(
                                'flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200',
                                'hover:bg-gray-100 dark:hover:bg-gray-800',
                                collapsed && 'justify-center'
                            )}
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-1 text-left truncate"
                                    >
                                        <div className="font-medium truncate">{user.name}</div>
                                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        {/* User Menu */}
                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute bottom-full left-0 w-full mb-2"
                                >
                                    <Card variant="default" depth={3} className="p-2">
                                        <div className="space-y-1">
                                            <button
                                                onClick={onThemeToggle}
                                                className="flex items-center gap-2 w-full p-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                {theme === 'light' ? (
                                                    <Moon className="w-4 h-4" />
                                                ) : (
                                                    <Sun className="w-4 h-4" />
                                                )}
                                                <span className="text-sm">
                                                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                                </span>
                                            </button>
                                            <button className="flex items-center gap-2 w-full p-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm">Sign Out</span>
                                            </button>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 280 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40"
            >
                <SidebarContent />
            </motion.aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileOpen(true)}
                        icon={<Menu className="w-5 h-5" />}
                    />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Server className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            WakeDock
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Search className="w-5 h-5" />}
                    />
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<Bell className="w-5 h-5" />}
                        />
                        {notifications > 0 && (
                            <Badge
                                variant="error"
                                size="sm"
                                className="absolute -top-1 -right-1 px-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
                            >
                                {notifications}
                            </Badge>
                        )}
                    </div>
                    {user && (
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden fixed inset-0 bg-black/50 z-40"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Server className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        WakeDock
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMobileOpen(false)}
                                    icon={<X className="w-5 h-5" />}
                                />
                            </div>
                            <div className="h-[calc(100%-64px)]">
                                <SidebarContent />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
