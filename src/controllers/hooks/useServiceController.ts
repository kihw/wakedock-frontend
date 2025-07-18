// Service Controller Hook - MVC Architecture
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Service, ServiceStatus } from '@/models/domain/service';
import { ServiceListRequest, ServiceActionRequest } from '@/models/api/requests';
import { FilterState, LoadingState } from '@/models/ui/interface';
import { serviceApi } from '@/controllers/services/service-api';
import { toast } from '@/hooks/use-toast';

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
    loadServices: (params?: ServiceListRequest) => Promise<void>;
    refreshServices: () => Promise<void>;
    startService: (serviceId: string) => Promise<void>;
    stopService: (serviceId: string) => Promise<void>;
    restartService: (serviceId: string) => Promise<void>;
    rebuildService: (serviceId: string) => Promise<void>;
    bulkAction: (serviceIds: string[], action: string) => Promise<void>;
    setFilters: (filters: Partial<FilterState<Service>>) => void;
    setSelectedServices: (serviceIds: string[]) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
}

export const useServiceController = (): ServiceControllerState & ServiceControllerActions => {
    const queryClient = useQueryClient();

    // Local state
    const [filters, setFiltersState] = useState<FilterState<Service>>({
        search: '',
        filters: {},
        sortBy: 'name',
        sortOrder: 'asc',
        activeFilters: [],
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
        queryFn: () => serviceApi.getServices({
            page,
            page_size: pageSize,
            search: filters.search,
            sort_by: filters.sortBy,
            sort_order: filters.sortOrder,
            ...filters.filters,
        }),
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // 1 minute
    });

    // Mutations for service actions
    const startServiceMutation = useMutation({
        mutationFn: (serviceId: string) => serviceApi.executeAction({
            action: 'start',
            service_id: serviceId,
        }),
        onSuccess: (data, serviceId) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: 'Success',
                description: `Service ${serviceId} started successfully`,
                variant: 'success',
            });
        },
        onError: (error, serviceId) => {
            toast({
                title: 'Error',
                description: `Failed to start service ${serviceId}: ${error.message}`,
                variant: 'error',
            });
        },
    });

    const stopServiceMutation = useMutation({
        mutationFn: (serviceId: string) => serviceApi.executeAction({
            action: 'stop',
            service_id: serviceId,
        }),
        onSuccess: (data, serviceId) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: 'Success',
                description: `Service ${serviceId} stopped successfully`,
                variant: 'success',
            });
        },
        onError: (error, serviceId) => {
            toast({
                title: 'Error',
                description: `Failed to stop service ${serviceId}: ${error.message}`,
                variant: 'error',
            });
        },
    });

    const restartServiceMutation = useMutation({
        mutationFn: (serviceId: string) => serviceApi.executeAction({
            action: 'restart',
            service_id: serviceId,
        }),
        onSuccess: (data, serviceId) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: 'Success',
                description: `Service ${serviceId} restarted successfully`,
                variant: 'success',
            });
        },
        onError: (error, serviceId) => {
            toast({
                title: 'Error',
                description: `Failed to restart service ${serviceId}: ${error.message}`,
                variant: 'error',
            });
        },
    });

    const rebuildServiceMutation = useMutation({
        mutationFn: (serviceId: string) => serviceApi.executeAction({
            action: 'rebuild',
            service_id: serviceId,
        }),
        onSuccess: (data, serviceId) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast({
                title: 'Success',
                description: `Service ${serviceId} rebuilt successfully`,
                variant: 'success',
            });
        },
        onError: (error, serviceId) => {
            toast({
                title: 'Error',
                description: `Failed to rebuild service ${serviceId}: ${error.message}`,
                variant: 'error',
            });
        },
    });

    // Controller actions
    const loadServices = useCallback(async (params?: ServiceListRequest) => {
        if (params) {
            setFiltersState(prev => ({
                ...prev,
                ...params,
            }));
        }
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

    const rebuildService = useCallback(async (serviceId: string) => {
        await rebuildServiceMutation.mutateAsync(serviceId);
    }, [rebuildServiceMutation]);

    const bulkAction = useCallback(async (serviceIds: string[], action: string) => {
        const promises = serviceIds.map(serviceId => {
            switch (action) {
                case 'start':
                    return startService(serviceId);
                case 'stop':
                    return stopService(serviceId);
                case 'restart':
                    return restartService(serviceId);
                case 'rebuild':
                    return rebuildService(serviceId);
                default:
                    return Promise.reject(new Error(`Unknown action: ${action}`));
            }
        });

        try {
            await Promise.all(promises);
            toast({
                title: 'Success',
                description: `Bulk ${action} completed successfully`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: `Bulk ${action} failed: ${error.message}`,
                variant: 'error',
            });
        }
    }, [startService, stopService, restartService, rebuildService]);

    const setFilters = useCallback((newFilters: Partial<FilterState<Service>>) => {
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

    const services = servicesData?.items || [];
    const totalCount = servicesData?.total || 0;

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
        rebuildService,
        bulkAction,
        setFilters,
        setSelectedServices,
        setPage,
        setPageSize,
    };
};
