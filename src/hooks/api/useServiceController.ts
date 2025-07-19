// Service Controller Hook - MVC Architecture
'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Service } from '@/lib/api-simple';

interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  [key: string]: any;
}

interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  error?: string;
}

export interface ServiceControllerState {
    services: Service[];
    loading: LoadingState;
    isLoading: boolean;
    error: string | null;
    filters: FilterState<Service>;
    selectedServices: string[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface ServiceControllerActions {
    loadServices: () => Promise<void>;
    refreshServices: () => Promise<void>;
    startService: (serviceId: string) => Promise<void>;
    stopService: (serviceId: string) => Promise<void>;
    restartService: (serviceId: string) => Promise<void>;
    setFilters: (filters: Partial<FilterState>) => void;
    setSelectedServices: (serviceIds: string[]) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
}

export const useServiceController = (): ServiceControllerState & ServiceControllerActions => {
    const queryClient = useQueryClient();

    // Local state
    const [filters, setFiltersState] = useState<FilterState>({
        search: '',
        sortBy: 'name',
        sortOrder: 'asc',
    });

    const [selectedServices, setSelectedServicesState] = useState<string[]>([]);
    const [page, setPageState] = useState(1);
    const [pageSize, setPageSizeState] = useState(10);

    // Query for services list
    const {
        data: servicesData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['services', filters, page, pageSize],
        queryFn: async () => {
            try {
                const response = await api.get('/services', {
                    page,
                    page_size: pageSize,
                    search: filters.search,
                    sort_by: filters.sortBy,
                    sort_order: filters.sortOrder,
                });
                return response.data;
            } catch (error) {
                console.error('Failed to fetch services:', error);
                return [];
            }
        },
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // 1 minute
    });

    // Mutations for service actions
    const startServiceMutation = useMutation({
        mutationFn: async (serviceId: string) => {
            const response = await api.post(`/services/${serviceId}/start`);
            return response.data;
        },
        onSuccess: (data, serviceId) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            console.log(`Service ${serviceId} started successfully`);
        },
        onError: (error, serviceId) => {
            console.error(`Failed to start service ${serviceId}:`, error);
        },
    });

    const stopServiceMutation = useMutation({
        mutationFn: async (serviceId: string) => {
            const response = await api.post(`/services/${serviceId}/stop`);
            return response.data;
        },
        onSuccess: (data, serviceId) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            console.log(`Service ${serviceId} stopped successfully`);
        },
        onError: (error, serviceId) => {
            console.error(`Failed to stop service ${serviceId}:`, error);
        },
    });

    const restartServiceMutation = useMutation({
        mutationFn: async (serviceId: string) => {
            const response = await api.post(`/services/${serviceId}/restart`);
            return response.data;
        },
        onSuccess: (data, serviceId) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            console.log(`Service ${serviceId} restarted successfully`);
        },
        onError: (error, serviceId) => {
            console.error(`Failed to restart service ${serviceId}:`, error);
        },
    });

    // Controller actions
    const loadServices = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const refreshServices = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const startService = useCallback(async (serviceId: string) => {
        await startServiceMutation.mutateAsync(serviceId);
    }, [startServiceMutation]);

    const stopService = useCallback(async (serviceId: string) => {
        await stopServiceMutation.mutateAsync(serviceId);
    }, [stopServiceMutation]);

    const restartService = useCallback(async (serviceId: string) => {
        await restartServiceMutation.mutateAsync(serviceId);
    }, [restartServiceMutation]);

    const setFilters = useCallback((newFilters: Partial<FilterState>) => {
        setFiltersState(prev => ({
            ...prev,
            ...newFilters,
        }));
        setPageState(1); // Reset to first page when filters change
    }, []);

    const setSelectedServices = useCallback((serviceIds: string[]) => {
        setSelectedServicesState(serviceIds);
    }, []);

    const setPage = useCallback((newPage: number) => {
        setPageState(newPage);
    }, []);

    const setPageSize = useCallback((newPageSize: number) => {
        setPageSizeState(newPageSize);
        setPageState(1); // Reset to first page when page size changes
    }, []);

    // Derived state
    const loading: LoadingState = {
        isLoading,
        loadingText: isLoading ? 'Loading services...' : undefined,
        error: error?.message,
    };

    const services = Array.isArray(servicesData) ? servicesData : [];
    const totalCount = services.length;

    return {
        // State
        services,
        loading,
        isLoading,
        error: error?.message || null,
        filters,
        selectedServices,
        totalCount,
        page,
        pageSize,

        // Actions
        loadServices,
        refreshServices,
        startService,
        stopService,
        restartService,
        setFilters,
        setSelectedServices,
        setPage,
        setPageSize,
    };
};
