/**
 * Hook pour gérer le comportement de l'application
 * Gère la navigation, les transitions et l'état global
 */

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'

interface AppState {
    isNavigating: boolean
    currentPage: string
    previousPage: string | null
    pageLoadTime: number
    navigationHistory: string[]
    prefetchedRoutes: Set<string>
}

interface AppOptions {
    enablePrefetch?: boolean
    transitionDuration?: number
    maxHistoryLength?: number
    enablePageTransitions?: boolean
}

export const useApp = (options: AppOptions = {}) => {
    const router = useRouter()
    const {
        enablePrefetch = true,
        transitionDuration = 300,
        maxHistoryLength = 50,
        enablePageTransitions = true
    } = options

    const [appState, setAppState] = useState<AppState>({
        isNavigating: false,
        currentPage: router.pathname,
        previousPage: null,
        pageLoadTime: 0,
        navigationHistory: [router.pathname],
        prefetchedRoutes: new Set()
    })

    const navigationStartTime = useRef<number>(0)
    const prefetchQueue = useRef<Set<string>>(new Set())

    // Gestion de la navigation
    const navigateToPage = useCallback(async (
        url: string,
        options: { shallow?: boolean; scroll?: boolean } = {}
    ) => {
        if (appState.isNavigating) return

        navigationStartTime.current = Date.now()

        setAppState(prev => ({
            ...prev,
            isNavigating: true,
            previousPage: prev.currentPage
        }))

        try {
            await router.push(url, undefined, {
                shallow: options.shallow || false,
                scroll: options.scroll !== false
            })
        } catch (error) {
            console.error('Navigation error:', error)
        }
    }, [router, appState.isNavigating])

    // Préchargement des routes
    const prefetchRoute = useCallback(async (url: string) => {
        if (!enablePrefetch || appState.prefetchedRoutes.has(url)) return

        try {
            await router.prefetch(url)
            setAppState(prev => ({
                ...prev,
                prefetchedRoutes: new Set([...prev.prefetchedRoutes, url])
            }))
        } catch (error) {
            console.error('Prefetch error:', error)
        }
    }, [router, enablePrefetch, appState.prefetchedRoutes])

    // Préchargement automatique des liens visibles
    const handleLinkHover = useCallback((url: string) => {
        if (enablePrefetch) {
            prefetchQueue.current.add(url)
            // Délai pour éviter les préchargements inutiles
            setTimeout(() => {
                if (prefetchQueue.current.has(url)) {
                    prefetchRoute(url)
                    prefetchQueue.current.delete(url)
                }
            }, 100)
        }
    }, [prefetchRoute, enablePrefetch])

    // Navigation programmatique avec historique
    const goBack = useCallback(() => {
        if (appState.navigationHistory.length > 1) {
            router.back()
        }
    }, [router, appState.navigationHistory])

    const goForward = useCallback(() => {
        router.forward()
    }, [router])

    // Gestion des événements de navigation
    useEffect(() => {
        const handleRouteChangeStart = (url: string) => {
            navigationStartTime.current = Date.now()
            setAppState(prev => ({
                ...prev,
                isNavigating: true,
                previousPage: prev.currentPage
            }))
        }

        const handleRouteChangeComplete = (url: string) => {
            const loadTime = Date.now() - navigationStartTime.current

            setAppState(prev => ({
                ...prev,
                isNavigating: false,
                currentPage: url,
                pageLoadTime: loadTime,
                navigationHistory: [
                    ...prev.navigationHistory.slice(-(maxHistoryLength - 1)),
                    url
                ]
            }))

            // Mise à jour du titre de la page
            document.title = `WakeDock - ${getPageTitle(url)}`
        }

        const handleRouteChangeError = (err: Error, url: string) => {
            setAppState(prev => ({
                ...prev,
                isNavigating: false
            }))
            console.error('Route change error:', err, url)
        }

        router.events.on('routeChangeStart', handleRouteChangeStart)
        router.events.on('routeChangeComplete', handleRouteChangeComplete)
        router.events.on('routeChangeError', handleRouteChangeError)

        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart)
            router.events.off('routeChangeComplete', handleRouteChangeComplete)
            router.events.off('routeChangeError', handleRouteChangeError)
        }
    }, [router, maxHistoryLength])

    // Préchargement des routes importantes au démarrage
    useEffect(() => {
        if (enablePrefetch) {
            const importantRoutes = [
                '/dashboard',
                '/services',
                '/monitoring',
                '/settings'
            ]

            importantRoutes.forEach(route => {
                setTimeout(() => prefetchRoute(route), Math.random() * 2000)
            })
        }
    }, [enablePrefetch, prefetchRoute])

    return {
        ...appState,
        navigateToPage,
        prefetchRoute,
        handleLinkHover,
        goBack,
        goForward,
        canGoBack: appState.navigationHistory.length > 1,
        canGoForward: typeof window !== 'undefined' && window.history.length > 1
    }
}

// Utilitaire pour générer le titre de la page
const getPageTitle = (url: string): string => {
    const pathMap: Record<string, string> = {
        '/': 'Dashboard',
        '/dashboard': 'Dashboard',
        '/services': 'Services',
        '/monitoring': 'Monitoring',
        '/realtime-monitoring': 'Real-time Monitoring',
        '/settings': 'Settings',
        '/users': 'Users',
        '/logs': 'Logs',
        '/analytics': 'Analytics'
    }

    const path = url.split('?')[0]
    return pathMap[path] || 'Page'
}

// Hook pour les transitions de page
export const usePageTransition = () => {
    const { isNavigating, currentPage, previousPage } = useApp()
    const [transitionState, setTransitionState] = useState<'idle' | 'exiting' | 'entering'>('idle')

    useEffect(() => {
        if (isNavigating) {
            setTransitionState('exiting')
            setTimeout(() => setTransitionState('entering'), 150)
        } else {
            setTimeout(() => setTransitionState('idle'), 150)
        }
    }, [isNavigating])

    return {
        transitionState,
        isNavigating,
        currentPage,
        previousPage
    }
}

// Hook pour la gestion du cache SPA
export const useAppCache = () => {
    const [cache, setCache] = useState<Map<string, any>>(new Map())

    const cacheData = useCallback((key: string, data: any, ttl: number = 5 * 60 * 1000) => {
        setCache(prev => {
            const newCache = new Map(prev)
            newCache.set(key, {
                data,
                timestamp: Date.now(),
                ttl
            })
            return newCache
        })
    }, [])

    const getCachedData = useCallback((key: string) => {
        const cached = cache.get(key)
        if (!cached) return null

        const { data, timestamp, ttl } = cached
        if (Date.now() - timestamp > ttl) {
            setCache(prev => {
                const newCache = new Map(prev)
                newCache.delete(key)
                return newCache
            })
            return null
        }

        return data
    }, [cache])

    const clearCache = useCallback((key?: string) => {
        if (key) {
            setCache(prev => {
                const newCache = new Map(prev)
                newCache.delete(key)
                return newCache
            })
        } else {
            setCache(new Map())
        }
    }, [])

    return {
        cacheData,
        getCachedData,
        clearCache,
        cacheSize: cache.size
    }
}
