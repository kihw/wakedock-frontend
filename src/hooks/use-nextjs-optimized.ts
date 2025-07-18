/**
 * Hooks optimisés pour Next.js 14+ et v0.6.4
 * Intégration avec les nouvelles APIs SSR/RSC
 */
'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '../../lib/utils';

// Types pour les données SSR optimisées
interface SSRDataResponse {
    data: any;
    cache_headers: Record<string, string>;
    preload_data?: Record<string, any>;
    client_hints?: Record<string, any>;
}

interface RSCComponentProps {
    component_id: string;
    props: Record<string, any>;
    cache_key: string;
    streaming: boolean;
}

// Configuration des requêtes optimisées
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const FAST_REFETCH_INTERVAL = 30 * 1000; // 30 secondes
const SLOW_REFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook optimisé pour les données du dashboard avec SSR
 */
export function useDashboardSSR(options: {
    includeMetrics?: boolean;
    includeContainers?: boolean;
    includeAlerts?: boolean;
    refreshInterval?: number;
    enabled?: boolean;
} = {}) {
    const {
        includeMetrics = true,
        includeContainers = true,
        includeAlerts = false,
        refreshInterval = FAST_REFETCH_INTERVAL,
        enabled = true,
    } = options;

    const queryKey = useMemo(() => [
        'dashboard-ssr',
        { includeMetrics, includeContainers, includeAlerts }
    ], [includeMetrics, includeContainers, includeAlerts]);

    const query = useQuery<SSRDataResponse>({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams({
                include_metrics: includeMetrics.toString(),
                include_containers: includeContainers.toString(),
                include_alerts: includeAlerts.toString(),
            });

            const response = await fetch(`/api/nextjs/dashboard/ssr?${params}`, {
                headers: {
                    'X-Requested-With': 'NextJS-Hook',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            return response.json();
        },
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_CACHE_TIME,
        refetchInterval: refreshInterval,
        enabled,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Extraction des données utiles
    const data = query.data?.data;
    const preloadData = query.data?.preload_data;
    const clientHints = query.data?.client_hints;
    const cacheHeaders = query.data?.cache_headers;

    return {
        ...query,
        data,
        preloadData,
        clientHints,
        cacheHeaders,
        isFromCache: cacheHeaders?.['X-Cache'] === 'HIT',
    };
}

/**
 * Hook pour React Server Components avec optimisations
 */
export function useRSCComponent(
    componentId: string,
    options: {
        refresh?: boolean;
        enabled?: boolean;
        onSuccess?: (data: RSCComponentProps) => void;
    } = {}
) {
    const { refresh = false, enabled = true, onSuccess } = options;

    const query = useQuery<RSCComponentProps>({
        queryKey: ['rsc-component', componentId, refresh],
        queryFn: async () => {
            const params = new URLSearchParams({
                refresh: refresh.toString(),
            });

            const response = await fetch(`/api/nextjs/components/${componentId}/rsc?${params}`);

            if (!response.ok) {
                throw new Error(`Composant RSC '${componentId}' non trouvé`);
            }

            const data = await response.json();
            onSuccess?.(data);
            return data;
        },
        staleTime: refresh ? 0 : DEFAULT_STALE_TIME,
        gcTime: DEFAULT_CACHE_TIME,
        enabled,
    });

    return {
        ...query,
        props: query.data?.props,
        cacheKey: query.data?.cache_key,
        isStreaming: query.data?.streaming,
    };
}

/**
 * Hook pour le streaming de données en temps réel
 */
export function useDataStream(
    dataType: 'metrics' | 'containers' | 'logs',
    options: {
        interval?: number;
        enabled?: boolean;
        onData?: (data: any) => void;
        onError?: (error: Error) => void;
    } = {}
) {
    const {
        interval = 5,
        enabled = true,
        onData,
        onError,
    } = options;

    const [data, setData] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    const connect = useCallback(() => {
        if (!enabled || eventSource) return;

        const url = `/api/nextjs/stream/${dataType}?interval=${interval}`;
        const es = new EventSource(url);

        es.onopen = () => {
            setIsConnected(true);
            setError(null);
        };

        es.onmessage = (event) => {
            try {
                const streamData = JSON.parse(event.data);
                setData(streamData.data);
                onData?.(streamData.data);
            } catch (err) {
                const error = new Error('Erreur de parsing des données de streaming');
                setError(error);
                onError?.(error);
            }
        };

        es.onerror = () => {
            const error = new Error('Erreur de connexion au stream');
            setError(error);
            setIsConnected(false);
            onError?.(error);
        };

        setEventSource(es);
    }, [dataType, interval, enabled, onData, onError, eventSource]);

    const disconnect = useCallback(() => {
        if (eventSource) {
            eventSource.close();
            setEventSource(null);
            setIsConnected(false);
        }
    }, [eventSource]);

    useEffect(() => {
        if (enabled) {
            connect();
        } else {
            disconnect();
        }

        return () => disconnect();
    }, [enabled, connect, disconnect]);

    return {
        data,
        isConnected,
        error,
        connect,
        disconnect,
        isEnabled: enabled,
    };
}

/**
 * Hook pour l'invalidation du cache SSR
 */
export function useCacheInvalidation() {
    const queryClient = useQueryClient();

    const invalidateCache = useMutation({
        mutationFn: async (params: {
            pattern?: string;
            componentId?: string;
        }) => {
            const response = await fetch('/api/nextjs/cache/invalidate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'invalidation du cache');
            }

            return response.json();
        },
        onSuccess: (data, variables) => {
            // Invalider les queries locales correspondantes
            if (variables.pattern) {
                queryClient.invalidateQueries({
                    predicate: (query) => {
                        return query.queryKey.some(key =>
                            typeof key === 'string' && key.includes(variables.pattern!)
                        );
                    },
                });
            }

            if (variables.componentId) {
                queryClient.invalidateQueries({
                    queryKey: ['rsc-component', variables.componentId],
                });
            }

            // Invalidation globale si aucun paramètre spécifique
            if (!variables.pattern && !variables.componentId) {
                queryClient.invalidateQueries();
            }
        },
    });

    // Helpers pour l'invalidation
    const invalidateByPattern = useCallback((pattern: string) => {
        return invalidateCache.mutate({ pattern });
    }, [invalidateCache]);

    const invalidateComponent = useCallback((componentId: string) => {
        return invalidateCache.mutate({ componentId });
    }, [invalidateCache]);

    const invalidateAll = useCallback(() => {
        return invalidateCache.mutate({});
    }, [invalidateCache]);

    return {
        invalidateCache: invalidateCache.mutate,
        invalidateByPattern,
        invalidateComponent,
        invalidateAll,
        isInvalidating: invalidateCache.isPending,
        error: invalidateCache.error,
    };
}

/**
 * Hook pour les métriques de performance Next.js
 */
export function usePerformanceMetrics(refreshInterval = SLOW_REFETCH_INTERVAL) {
    return useQuery({
        queryKey: ['nextjs-performance-metrics'],
        queryFn: async () => {
            const response = await fetch('/api/nextjs/performance/metrics');

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des métriques');
            }

            return response.json();
        },
        staleTime: DEFAULT_STALE_TIME,
        refetchInterval: refreshInterval,
    });
}

/**
 * Hook combiné pour optimiser les requêtes multiples
 */
export function useOptimizedQueries() {
    const dashboard = useDashboardSSR({ refreshInterval: FAST_REFETCH_INTERVAL });
    const performance = usePerformanceMetrics();
    const { invalidateAll } = useCacheInvalidation();

    // Refresh optimisé avec debounce
    const debouncedRefresh = useMemo(
        () => debounce(() => {
            dashboard.refetch();
            performance.refetch();
        }, 1000),
        [dashboard.refetch, performance.refetch]
    );

    // État combiné
    const isLoading = dashboard.isLoading || performance.isLoading;
    const hasError = dashboard.error || performance.error;

    return {
        dashboard,
        performance,
        isLoading,
        hasError,
        refresh: debouncedRefresh,
        invalidateAll,
    };
}
