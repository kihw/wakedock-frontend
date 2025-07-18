/**
 * Composant de navigation SPA avec sidebar intelligente
 * Gère la navigation fluide, les animations et les états actifs
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { SPALink } from '@/views/layouts/SPALayout'
import { useSPAStore, useUserPreferences } from '@/store/spaStore'
import { useSPA } from '@/controllers/hooks/useSPA'

// Icônes pour la navigation (utilisation d'icônes simples en attendant)
const ChartBarIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
)

const ServerIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
)

const EyeIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
)

const Cog6ToothIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

const UsersIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
)

const DocumentTextIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
)

const ChartLineIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
)

const HomeIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
)

const Bars3Icon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
)

const XMarkIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

const ChevronLeftIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
)

const ChevronRightIcon = ({ className = '' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
)

interface NavigationItem {
    id: string
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
    subItems?: NavigationItem[]
    requiresAuth?: boolean
}

interface SPANavigationProps {
    className?: string
}

// Configuration des éléments de navigation
const navigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon
    },
    {
        id: 'services',
        label: 'Services',
        href: '/services',
        icon: ServerIcon,
        subItems: [
            {
                id: 'services-list',
                label: 'Liste des services',
                href: '/services',
                icon: ServerIcon
            },
            {
                id: 'services-create',
                label: 'Créer un service',
                href: '/services/create',
                icon: ServerIcon
            }
        ]
    },
    {
        id: 'monitoring',
        label: 'Monitoring',
        href: '/monitoring',
        icon: ChartBarIcon,
        subItems: [
            {
                id: 'realtime-monitoring',
                label: 'Temps réel',
                href: '/realtime-monitoring',
                icon: EyeIcon
            },
            {
                id: 'analytics',
                label: 'Analytics',
                href: '/analytics',
                icon: ChartLineIcon
            }
        ]
    },
    {
        id: 'users',
        label: 'Utilisateurs',
        href: '/users',
        icon: UsersIcon,
        requiresAuth: true
    },
    {
        id: 'logs',
        label: 'Logs',
        href: '/logs',
        icon: DocumentTextIcon
    },
    {
        id: 'settings',
        label: 'Paramètres',
        href: '/settings',
        icon: Cog6ToothIcon
    }
]

// Composant pour un élément de navigation
const NavigationItemComponent: React.FC<{
    item: NavigationItem
    isActive: boolean
    isCollapsed: boolean
    onItemClick: (item: NavigationItem) => void
}> = ({ item, isActive, isCollapsed, onItemClick }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const hasSubItems = item.subItems && item.subItems.length > 0

    const handleClick = () => {
        if (hasSubItems) {
            setIsExpanded(!isExpanded)
        } else {
            onItemClick(item)
        }
    }

    return (
        <li className="navigation-item">
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
          flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
          ${isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
        `}
                onClick={handleClick}
            >
                <item.icon className="w-5 h-5 flex-shrink-0" />

                {!isCollapsed && (
                    <>
                        <span className="ml-3 font-medium">{item.label}</span>

                        {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {item.badge}
                            </span>
                        )}

                        {hasSubItems && (
                            <ChevronRightIcon
                                className={`w-4 h-4 ml-auto transition-transform duration-200 ${isExpanded ? 'transform rotate-90' : ''
                                    }`}
                            />
                        )}
                    </>
                )}
            </motion.div>

            {/* Sous-éléments */}
            {!isCollapsed && hasSubItems && (
                <AnimatePresence>
                    {isExpanded && (
                        <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-6 mt-2 space-y-1"
                        >
                            {item.subItems?.map((subItem) => (
                                <NavigationItemComponent
                                    key={subItem.id}
                                    item={subItem}
                                    isActive={false}
                                    isCollapsed={false}
                                    onItemClick={onItemClick}
                                />
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            )}
        </li>
    )
}

// Composant principal de navigation SPA
export const SPANavigation: React.FC<SPANavigationProps> = ({ className = '' }) => {
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { preferences } = useUserPreferences()
    const { navigateToPage } = useSPA()

    // Déterminer l'élément actif
    const getActiveItem = (path: string): string => {
        const item = navigationItems.find(item => {
            if (item.href === path) return true
            if (item.subItems) {
                return item.subItems.some(subItem => subItem.href === path)
            }
            return false
        })
        return item?.id || ''
    }

    const activeItemId = getActiveItem(router.pathname)

    // Gestion du clic sur un élément
    const handleItemClick = (item: NavigationItem) => {
        navigateToPage(item.href)
        setIsMobileOpen(false)
    }

    // Gestion du responsive
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true)
            } else {
                setIsCollapsed(false)
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Variantes d'animation pour la sidebar
    const sidebarVariants = {
        expanded: {
            width: '240px',
            transition: { duration: 0.3, ease: 'easeInOut' }
        },
        collapsed: {
            width: '64px',
            transition: { duration: 0.3, ease: 'easeInOut' }
        }
    }

    const mobileOverlayVariants = {
        open: {
            opacity: 1,
            transition: { duration: 0.2 }
        },
        closed: {
            opacity: 0,
            transition: { duration: 0.2 }
        }
    }

    return (
        <>
            {/* Bouton mobile */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileOpen(true)}
                    className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg"
                >
                    <Bars3Icon className="w-6 h-6" />
                </motion.button>
            </div>

            {/* Overlay mobile */}
            {isMobileOpen && (
                <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={mobileOverlayVariants}
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar principale */}
            <motion.nav
                initial="expanded"
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={sidebarVariants}
                className={`
          fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          shadow-lg z-30 flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-transform duration-300 ease-in-out
          ${className}
        `}
            >
                {/* Header de la sidebar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">W</span>
                            </div>
                            <span className="font-bold text-lg">WakeDock</span>
                        </motion.div>
                    )}

                    {/* Bouton de fermeture mobile */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {/* Bouton de collapse desktop */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:block p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ChevronLeftIcon
                            className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'transform rotate-180' : ''
                                }`}
                        />
                    </button>
                </div>

                {/* Navigation principale */}
                <div className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-2">
                        {navigationItems.map((item) => (
                            <NavigationItemComponent
                                key={item.id}
                                item={item}
                                isActive={activeItemId === item.id}
                                isCollapsed={isCollapsed}
                                onItemClick={handleItemClick}
                            />
                        ))}
                    </ul>
                </div>

                {/* Footer de la sidebar */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {!isCollapsed && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Version 1.0.7
                        </div>
                    )}
                </div>
            </motion.nav>
        </>
    )
}

// Hook pour la gestion de la navigation
export const useNavigationState = () => {
    const router = useRouter()
    const [navigationState, setNavigationState] = useState({
        isCollapsed: false,
        isMobileOpen: false,
        activeItem: '',
        breadcrumbs: []
    })

    const toggleCollapse = () => {
        setNavigationState(prev => ({
            ...prev,
            isCollapsed: !prev.isCollapsed
        }))
    }

    const toggleMobile = () => {
        setNavigationState(prev => ({
            ...prev,
            isMobileOpen: !prev.isMobileOpen
        }))
    }

    const closeMobile = () => {
        setNavigationState(prev => ({
            ...prev,
            isMobileOpen: false
        }))
    }

    // Génération des breadcrumbs
    const generateBreadcrumbs = (path: string) => {
        const segments = path.split('/').filter(Boolean)
        const breadcrumbs = segments.map((segment, index) => ({
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: '/' + segments.slice(0, index + 1).join('/'),
            current: index === segments.length - 1
        }))

        return [{ label: 'Accueil', href: '/', current: false }, ...breadcrumbs]
    }

    useEffect(() => {
        const breadcrumbs = generateBreadcrumbs(router.pathname)
        setNavigationState(prev => ({
            ...prev,
            breadcrumbs
        }))
    }, [router.pathname])

    return {
        ...navigationState,
        toggleCollapse,
        toggleMobile,
        closeMobile
    }
}

export default SPANavigation
