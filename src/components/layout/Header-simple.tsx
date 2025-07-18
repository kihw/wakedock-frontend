'use client'

import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import {
    Menu,
    X,
    Search,
    Bell,
    Settings,
    User,
    LogOut,
    Sun,
    Moon,
    Monitor,
    ChevronDown,
    Container,
    Home,
    Server,
    Activity,
    BarChart3,
    Database,
    Shield,
    Users
} from 'lucide-react'

export interface HeaderProps {
    navigation?: Array<{
        label: string
        href: string
        icon?: React.ReactNode
        active?: boolean
        badge?: string | number
    }>
    onNavigationClick?: (href: string) => void
    showUserMenu?: boolean
    showNotifications?: boolean
    className?: string
}

export const Header: React.FC<HeaderProps> = ({
    navigation = [],
    onNavigationClick,
    showUserMenu = true,
    showNotifications = true,
    className,
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const renderLogo = () => {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Container className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        WakeDock
                    </span>
                </div>
            </div>
        )
    }

    const renderNavigation = () => {
        if (navigation.length === 0) return null

        return (
            <nav className="flex items-center space-x-1">
                {navigation.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onNavigationClick?.(item.href)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            item.active
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                    >
                        {item.icon}
                        {item.label}
                        {item.badge && (
                            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        )
    }

    const renderUserMenu = () => {
        if (!showUserMenu) return null

        return (
            <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <User className="h-5 w-5" />
                </button>
            </div>
        )
    }

    const renderNotifications = () => {
        if (!showNotifications) return null

        return (
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
            </button>
        )
    }

    const renderMobileMenu = () => {
        return (
            <div className="md:hidden">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {mobileMenuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>
        )
    }

    return (
        <header className={cn('bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800', className)}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    {renderLogo()}

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {renderNavigation()}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {renderNotifications()}
                        {renderUserMenu()}
                        {renderMobileMenu()}
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
                        <nav className="flex flex-col space-y-2">
                            {navigation.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onNavigationClick?.(item.href)
                                        setMobileMenuOpen(false)
                                    }}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                                        item.active
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                    {item.badge && (
                                        <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
