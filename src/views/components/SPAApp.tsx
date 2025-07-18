/**
 * Composant principal SPA App
 * Intègre tous les composants SPA pour un comportement fluide
 */

import React, { useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import { SPALayout } from '@/views/layouts/SPALayout'
import { SPANavigation } from '@/views/components/SPANavigation'
import { GlobalSearch, useGlobalSearch } from '@/views/components/GlobalSearch'
import { useSPAStore, useUserPreferences } from '@/store/spaStore'
import { useSPA } from '@/controllers/hooks/useSPA'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/router'

interface SPAAppProps extends AppProps {
    Component: React.ComponentType<any>
    pageProps: any
    router: any
}

// Configuration des animations de page
const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
        scale: 0.95
    },
    in: {
        opacity: 1,
        x: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        x: 20,
        scale: 0.95
    }
}

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
}

// Composant de chargement global
const GlobalLoader: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
    if (!isVisible) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                    Chargement...
                </p>
            </div>
        </motion.div>
    )
}

// Composant principal SPA
export const SPAApp: React.FC<SPAAppProps> = ({ Component, pageProps }) => {
    const router = useRouter()
    const { preferences } = useUserPreferences()
    const { navigation, setNavigationState } = useSPAStore()
    const { isNavigating } = useSPA()
    const { isOpen: isSearchOpen, openSearch, closeSearch } = useGlobalSearch()

    // Initialisation du thème
    useEffect(() => {
        const applyTheme = () => {
            if (typeof window === 'undefined') return

            const root = document.documentElement
            const theme = preferences.theme

            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                root.classList.toggle('dark', systemTheme === 'dark')
            } else {
                root.classList.toggle('dark', theme === 'dark')
            }
        }

        applyTheme()

        // Écouter les changements de thème système
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
            if (preferences.theme === 'system') {
                applyTheme()
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [preferences.theme])

    // Gestion des événements de navigation
    useEffect(() => {
        const handleRouteChangeStart = (url: string) => {
            setNavigationState({ isNavigating: true })
        }

        const handleRouteChangeComplete = (url: string) => {
            setNavigationState({
                isNavigating: false,
                currentPath: url,
                previousPath: navigation.currentPath
            })
        }

        const handleRouteChangeError = () => {
            setNavigationState({ isNavigating: false })
        }

        router.events.on('routeChangeStart', handleRouteChangeStart)
        router.events.on('routeChangeComplete', handleRouteChangeComplete)
        router.events.on('routeChangeError', handleRouteChangeError)

        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart)
            router.events.off('routeChangeComplete', handleRouteChangeComplete)
            router.events.off('routeChangeError', handleRouteChangeError)
        }
    }, [router, setNavigationState, navigation.currentPath])

    // Gestion des raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + K pour la recherche
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault()
                openSearch()
            }

            // Ctrl/Cmd + B pour toggle sidebar
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault()
                // Toggle sidebar
                console.log('Toggle sidebar')
            }

            // Échap pour fermer les modales
            if (event.key === 'Escape') {
                closeSearch()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [openSearch, closeSearch])

    // Préchargement des ressources critiques
    useEffect(() => {
        const preloadCriticalResources = async () => {
            // Précharger les routes importantes
            const criticalRoutes = ['/dashboard', '/services', '/monitoring']

            for (const route of criticalRoutes) {
                try {
                    await router.prefetch(route)
                } catch (error) {
                    console.warn(`Erreur lors du préchargement de ${route}:`, error)
                }
            }
        }

        // Délai pour éviter de surcharger au démarrage
        setTimeout(preloadCriticalResources, 1000)
    }, [router])

    return (
        <div className="spa-app min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navigation */}
            <SPANavigation />

            {/* Contenu principal */}
            <main className="md:ml-64 transition-all duration-300">
                <SPALayout>
                    {/* Animations de page si activées */}
                    {preferences.enableAnimations ? (
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={router.asPath}
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                                className="min-h-screen"
                            >
                                <Component {...pageProps} />
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <Component {...pageProps} />
                    )}
                </SPALayout>
            </main>

            {/* Loader global */}
            <AnimatePresence>
                <GlobalLoader isVisible={isNavigating} />
            </AnimatePresence>

            {/* Recherche globale */}
            <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />

            {/* Indicateur de connexion */}
            {typeof window !== 'undefined' && !navigator.onLine && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
                >
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Hors ligne</span>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

// Hook pour la gestion des erreurs SPA
export const useSPAErrorHandler = () => {
    const router = useRouter()

    const handleError = (error: Error, errorInfo?: any) => {
        console.error('Erreur SPA:', error, errorInfo)

        // Rediriger vers une page d'erreur si nécessaire
        if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
            // Erreur de chargement de chunk - recharger la page
            window.location.reload()
        }
    }

    const handleNavigationError = (url: string) => {
        console.error('Erreur de navigation vers:', url)
        // Rediriger vers le dashboard en cas d'erreur
        router.push('/dashboard')
    }

    return {
        handleError,
        handleNavigationError
    }
}

// Hook pour les performances SPA
export const useSPAPerformance = () => {
    const [metrics, setMetrics] = React.useState({
        navigationTime: 0,
        renderTime: 0,
        bundleSize: 0
    })

    useEffect(() => {
        // Mesurer les performances de navigation
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    const navEntry = entry as PerformanceNavigationTiming
                    setMetrics(prev => ({
                        ...prev,
                        navigationTime: navEntry.loadEventEnd - navEntry.startTime
                    }))
                }
            })
        })

        observer.observe({ entryTypes: ['navigation'] })

        return () => observer.disconnect()
    }, [])

    return metrics
}

export default SPAApp
