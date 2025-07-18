/**
 * Store global pour le comportement de l'application
 * Gère l'état de navigation, le cache et les préférences
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
    currentPath: string
    previousPath: string | null
    navigationHistory: string[]
    isNavigating: boolean
    pageLoadTime: number
    prefetchedRoutes: Set<string>
}

interface AppPreferences {
    enableAnimations: boolean
    enablePrefetch: boolean
    theme: 'light' | 'dark' | 'system'
    compactMode: boolean
    language: string
}

interface CacheEntry {
    data: any
    timestamp: number
    ttl: number
}

interface AppStore {
    // Navigation state
    navigation: NavigationState

    // User preferences
    preferences: AppPreferences

    // Cache management
    cache: Map<string, CacheEntry>

    // Actions
    setNavigationState: (state: Partial<NavigationState>) => void
    updatePreferences: (preferences: Partial<AppPreferences>) => void
    addToHistory: (path: string) => void
    clearHistory: () => void

    // Cache actions
    setCache: (key: string, data: any, ttl?: number) => void
    getCache: (key: string) => any | null
    clearCache: (key?: string) => void

    // Prefetch actions
    addPrefetchedRoute: (route: string) => void
    isPrefetched: (route: string) => boolean

    // Utility actions
    reset: () => void
}

const initialState = {
    navigation: {
        currentPath: '/',
        previousPath: null,
        navigationHistory: ['/'],
        isNavigating: false,
        pageLoadTime: 0,
        prefetchedRoutes: new Set<string>()
    },
    preferences: {
        enableAnimations: true,
        enablePrefetch: true,
        theme: 'system' as const,
        compactMode: false,
        language: 'fr'
    },
    cache: new Map<string, CacheEntry>()
}

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setNavigationState: (state) => {
                set((current) => ({
                    navigation: { ...current.navigation, ...state }
                }))
            },

            updatePreferences: (preferences) => {
                set((current) => ({
                    preferences: { ...current.preferences, ...preferences }
                }))
            },

            addToHistory: (path) => {
                set((current) => {
                    const newHistory = [...current.navigation.navigationHistory, path]
                    // Limiter l'historique à 100 entrées
                    if (newHistory.length > 100) {
                        newHistory.shift()
                    }

                    return {
                        navigation: {
                            ...current.navigation,
                            navigationHistory: newHistory,
                            currentPath: path,
                            previousPath: current.navigation.currentPath
                        }
                    }
                })
            },

            clearHistory: () => {
                set((current) => ({
                    navigation: {
                        ...current.navigation,
                        navigationHistory: [current.navigation.currentPath],
                        previousPath: null
                    }
                }))
            },

            setCache: (key, data, ttl = 5 * 60 * 1000) => {
                set((current) => {
                    const newCache = new Map(current.cache)
                    newCache.set(key, {
                        data,
                        timestamp: Date.now(),
                        ttl
                    })
                    return { cache: newCache }
                })
            },

            getCache: (key) => {
                const cache = get().cache
                const entry = cache.get(key)

                if (!entry) return null

                // Vérifier si le cache est expiré
                if (Date.now() - entry.timestamp > entry.ttl) {
                    // Supprimer l'entrée expirée
                    set((current) => {
                        const newCache = new Map(current.cache)
                        newCache.delete(key)
                        return { cache: newCache }
                    })
                    return null
                }

                return entry.data
            },

            clearCache: (key) => {
                set((current) => {
                    const newCache = new Map(current.cache)
                    if (key) {
                        newCache.delete(key)
                    } else {
                        newCache.clear()
                    }
                    return { cache: newCache }
                })
            },

            addPrefetchedRoute: (route) => {
                set((current) => ({
                    navigation: {
                        ...current.navigation,
                        prefetchedRoutes: new Set([...current.navigation.prefetchedRoutes, route])
                    }
                }))
            },

            isPrefetched: (route) => {
                return get().navigation.prefetchedRoutes.has(route)
            },

            reset: () => {
                set(initialState)
            }
        }),
        {
            name: 'wakedock-app-store',
            partialize: (state) => ({
                preferences: state.preferences,
                navigation: {
                    ...state.navigation,
                    isNavigating: false,
                    pageLoadTime: 0,
                    prefetchedRoutes: new Set() // Ne pas persister les routes préchargées
                }
            })
        }
    )
)

// Hook pour les préférences utilisateur
export const useUserPreferences = () => {
    const { preferences, updatePreferences } = useAppStore()

    const toggleAnimations = () => {
        updatePreferences({ enableAnimations: !preferences.enableAnimations })
    }

    const togglePrefetch = () => {
        updatePreferences({ enablePrefetch: !preferences.enablePrefetch })
    }

    const setTheme = (theme: 'light' | 'dark' | 'system') => {
        updatePreferences({ theme })

        // Appliquer le thème immédiatement
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement

            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                root.classList.toggle('dark', systemTheme === 'dark')
            } else {
                root.classList.toggle('dark', theme === 'dark')
            }
        }
    }

    const toggleCompactMode = () => {
        updatePreferences({ compactMode: !preferences.compactMode })
    }

    const setLanguage = (language: string) => {
        updatePreferences({ language })
    }

    return {
        preferences,
        toggleAnimations,
        togglePrefetch,
        setTheme,
        toggleCompactMode,
        setLanguage
    }
}

// Hook pour la navigation
export const useNavigation = () => {
    const { navigation, setNavigationState, addToHistory } = useAppStore()

    const startNavigation = (path: string) => {
        setNavigationState({ isNavigating: true })
        addToHistory(path)
    }

    const completeNavigation = (loadTime: number) => {
        setNavigationState({
            isNavigating: false,
            pageLoadTime: loadTime
        })
    }

    const canGoBack = navigation.navigationHistory.length > 1
    const canGoForward = typeof window !== 'undefined' && window.history.length > 1

    return {
        ...navigation,
        startNavigation,
        completeNavigation,
        canGoBack,
        canGoForward
    }
}

// Hook pour le cache
export const useAppCache = () => {
    const { cache, setCache, getCache, clearCache } = useAppStore()

    const cacheSize = cache.size
    const cacheKeys = Array.from(cache.keys())

    // Nettoyer le cache expiré
    const cleanExpiredCache = () => {
        const now = Date.now()
        const keysToDelete: string[] = []

        cache.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key)
            }
        })

        keysToDelete.forEach(key => clearCache(key))
    }

    return {
        cacheSize,
        cacheKeys,
        setCache,
        getCache,
        clearCache,
        cleanExpiredCache
    }
}

// Hook pour les routes préchargées
export const usePrefetch = () => {
    const { navigation, addPrefetchedRoute, isPrefetched } = useAppStore()
    const { enablePrefetch } = useUserPreferences().preferences

    const prefetchRoute = async (route: string) => {
        if (!enablePrefetch || isPrefetched(route)) return

        try {
            // Utiliser le router Next.js pour le prefetch
            const { default: Router } = await import('next/router')
            await Router.prefetch(route)
            addPrefetchedRoute(route)
        } catch (error) {
            console.error('Prefetch error:', error)
        }
    }

    const prefetchRoutes = (routes: string[]) => {
        routes.forEach(route => prefetchRoute(route))
    }

    return {
        prefetchRoute,
        prefetchRoutes,
        isPrefetched,
        prefetchedRoutes: navigation.prefetchedRoutes
    }
}
