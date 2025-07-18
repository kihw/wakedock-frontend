/**
 * Store Zustand optimisé pour Next.js 14+ - v0.6.4
 * État global avec persistence et optimisations SSR
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types pour l'état de l'application
interface Container {
    id: string;
    name: string;
    status: string;
    image: string;
    created: string;
    ports: string[];
}

interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
    network: {
        in: number;
        out: number;
    };
    timestamp: string;
}

interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    refreshInterval: number;
    autoRefresh: boolean;
    notifications: boolean;
    compactView: boolean;
}

interface AppState {
    // Données
    containers: Container[];
    metrics: SystemMetrics | null;
    alerts: any[];

    // État UI
    isLoading: boolean;
    error: string | null;
    selectedContainerId: string | null;

    // Préférences utilisateur
    preferences: UserPreferences;

    // Métadonnées
    lastUpdated: string | null;
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting';

    // Actions
    setContainers: (containers: Container[]) => void;
    setMetrics: (metrics: SystemMetrics) => void;
    setAlerts: (alerts: any[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    selectContainer: (id: string | null) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
    setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;

    // Actions composées
    refreshData: () => Promise<void>;
    reset: () => void;
}

// État initial
const initialState = {
    containers: [],
    metrics: null,
    alerts: [],
    isLoading: false,
    error: null,
    selectedContainerId: null,
    preferences: {
        theme: 'system' as const,
        refreshInterval: 30000,
        autoRefresh: true,
        notifications: true,
        compactView: false,
    },
    lastUpdated: null,
    connectionStatus: 'disconnected' as const,
};

// Store principal avec middleware optimisés
export const useAppStore = create<AppState>()(
    subscribeWithSelector(
        persist(
            immer((set, get) => ({
                ...initialState,

                // Actions de base
                setContainers: (containers) =>
                    set((state) => {
                        state.containers = containers;
                        state.lastUpdated = new Date().toISOString();
                        state.error = null;
                    }),

                setMetrics: (metrics) =>
                    set((state) => {
                        state.metrics = metrics;
                        state.lastUpdated = new Date().toISOString();
                    }),

                setAlerts: (alerts) =>
                    set((state) => {
                        state.alerts = alerts;
                        state.lastUpdated = new Date().toISOString();
                    }),

                setLoading: (loading) =>
                    set((state) => {
                        state.isLoading = loading;
                        if (loading) {
                            state.error = null;
                        }
                    }),

                setError: (error) =>
                    set((state) => {
                        state.error = error;
                        state.isLoading = false;
                    }),

                selectContainer: (id) =>
                    set((state) => {
                        state.selectedContainerId = id;
                    }),

                updatePreferences: (newPreferences) =>
                    set((state) => {
                        state.preferences = { ...state.preferences, ...newPreferences };
                    }),

                setConnectionStatus: (status) =>
                    set((state) => {
                        state.connectionStatus = status;
                    }),

                // Actions composées optimisées
                refreshData: async () => {
                    const { setLoading, setError, setConnectionStatus } = get();

                    try {
                        setLoading(true);
                        setConnectionStatus('reconnecting');

                        // Requête optimisée vers l'API SSR
                        const response = await fetch('/api/nextjs/dashboard/ssr?include_metrics=true&include_containers=true', {
                            headers: {
                                'X-Requested-With': 'Zustand-Store',
                            },
                        });

                        if (!response.ok) {
                            throw new Error(`Erreur ${response.status}`);
                        }

                        const data = await response.json();

                        // Mise à jour atomique de l'état
                        set((state) => {
                            if (data.data.containers) {
                                state.containers = data.data.containers;
                            }
                            if (data.data.metrics) {
                                state.metrics = data.data.metrics;
                            }
                            if (data.data.alerts) {
                                state.alerts = data.data.alerts;
                            }
                            state.lastUpdated = new Date().toISOString();
                            state.isLoading = false;
                            state.error = null;
                            state.connectionStatus = 'connected';
                        });

                    } catch (error) {
                        console.error('Erreur lors du refresh:', error);
                        setError(error instanceof Error ? error.message : 'Erreur inconnue');
                        setConnectionStatus('disconnected');
                    }
                },

                reset: () => set(initialState),
            })),
            {
                name: 'wakedock-app-storage',
                storage: createJSONStorage(() => {
                    // Utilise sessionStorage pour éviter les problèmes SSR
                    return typeof window !== 'undefined' ? window.sessionStorage : {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    };
                }),
                // Ne persiste que les préférences utilisateur
                partialize: (state) => ({
                    preferences: state.preferences,
                    selectedContainerId: state.selectedContainerId,
                }),
            }
        )
    )
);

// Sélecteurs optimisés avec memoization
export const useContainers = () => useAppStore((state) => state.containers);
export const useMetrics = () => useAppStore((state) => state.metrics);
export const useAlerts = () => useAppStore((state) => state.alerts);
export const useLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useSelectedContainer = () => {
    const selectedId = useAppStore((state) => state.selectedContainerId);
    const containers = useAppStore((state) => state.containers);
    return containers.find(c => c.id === selectedId) || null;
};
export const usePreferences = () => useAppStore((state) => state.preferences);
export const useConnectionStatus = () => useAppStore((state) => state.connectionStatus);

// Sélecteurs composés
export const useRunningContainers = () =>
    useAppStore((state) => state.containers.filter(c => c.status === 'running'));

export const useContainerStats = () =>
    useAppStore((state) => ({
        total: state.containers.length,
        running: state.containers.filter(c => c.status === 'running').length,
        stopped: state.containers.filter(c => c.status === 'exited').length,
    }));

export const useIsDataStale = () =>
    useAppStore((state) => {
        if (!state.lastUpdated) return true;
        const lastUpdate = new Date(state.lastUpdated);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
        return diffMinutes > 5; // Considéré comme stale après 5 minutes
    });

// Actions optimisées
export const useAppActions = () => {
    const store = useAppStore();
    return {
        setContainers: store.setContainers,
        setMetrics: store.setMetrics,
        setAlerts: store.setAlerts,
        setLoading: store.setLoading,
        setError: store.setError,
        selectContainer: store.selectContainer,
        updatePreferences: store.updatePreferences,
        setConnectionStatus: store.setConnectionStatus,
        refreshData: store.refreshData,
        reset: store.reset,
    };
};

// Hook pour l'auto-refresh optimisé
export const useAutoRefresh = () => {
    const { autoRefresh, refreshInterval } = usePreferences();
    const refreshData = useAppStore((state) => state.refreshData);
    const isLoading = useLoading();

    React.useEffect(() => {
        if (!autoRefresh || isLoading) return;

        const interval = setInterval(() => {
            refreshData();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, refreshData, isLoading]);
};

// Store pour les notifications (séparé pour éviter les re-renders)
interface NotificationState {
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        timestamp: string;
        read: boolean;
    }>;
    addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],

            addNotification: (notification) => {
                const newNotification = {
                    ...notification,
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toISOString(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 50), // Limite à 50
                }));
            },

            markAsRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map(n =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                })),

            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter(n => n.id !== id),
                })),

            clearAll: () => set({ notifications: [] }),
        }),
        {
            name: 'wakedock-notifications',
            storage: createJSONStorage(() => {
                return typeof window !== 'undefined' ? window.localStorage : {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
        }
    )
);

// Sélecteurs pour les notifications
export const useUnreadNotifications = () =>
    useNotificationStore((state) => state.notifications.filter(n => !n.read));

export const useNotificationActions = () => {
    const store = useNotificationStore();
    return {
        addNotification: store.addNotification,
        markAsRead: store.markAsRead,
        removeNotification: store.removeNotification,
        clearAll: store.clearAll,
    };
};

// Import React pour useEffect
import React from 'react';
