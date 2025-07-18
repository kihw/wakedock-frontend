import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { Stack } from '@/components/stacks/StackCard';

export interface StackOverview {
  total_stacks: number;
  running_stacks: number;
  stopped_stacks: number;
  error_stacks: number;
  total_services: number;
  total_containers: number;
}

export interface StackStatsResponse {
  overview: StackOverview;
  stacks: any[];
}

export interface UseStacksReturn {
  stacks: Stack[];
  overview: StackOverview | null;
  loading: boolean;
  error: string | null;
  refreshStacks: () => Promise<void>;
  executeStackAction: (stackName: string, action: string) => Promise<void>;
  getStackLogs: (stackName: string, tail?: number) => Promise<any>;
}

export const useStacks = (): UseStacksReturn => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [overview, setOverview] = useState<StackOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStacks = useCallback(async () => {
    if (typeof window === 'undefined') return; // Skip on SSR
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<StackStatsResponse>('/api/v1/stacks/stats/overview');
      
      if (response.data) {
        setOverview(response.data.overview);
        
        // Convert API response to Stack format
        const stacksData: Stack[] = response.data.stacks.map((stack: any) => ({
          name: stack.name,
          status: stack.status,
          services: stack.services || [],
          containers: stack.containers || [],
          stats: stack.stats || {
            total_containers: 0,
            running_containers: 0,
            stopped_containers: 0,
            services_count: 0,
            networks_count: 0,
            volumes_count: 0,
            cpu_usage: 0,
            memory_usage: 0
          },
          deployment_info: stack.deployment_info
        }));
        
        setStacks(stacksData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stacks');
      console.error('Error fetching stacks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const executeStackAction = useCallback(async (stackName: string, action: string) => {
    if (typeof window === 'undefined') return; // Skip on SSR
    
    try {
      const response = await api.post(`/api/v1/stacks/${stackName}/action`, {
        action
      });
      
      if (response.data.success) {
        // Refresh stacks after action
        await refreshStacks();
        return response.data;
      } else {
        throw new Error(response.data.message || 'Action failed');
      }
    } catch (err: any) {
      console.error(`Error executing ${action} on ${stackName}:`, err);
      throw err;
    }
  }, [refreshStacks]);

  const getStackLogs = useCallback(async (stackName: string, tail: number = 100) => {
    if (typeof window === 'undefined') return; // Skip on SSR
    
    try {
      const response = await api.get(`/api/v1/stacks/${stackName}/logs?tail=${tail}`);
      return response.data;
    } catch (err: any) {
      console.error(`Error getting logs for ${stackName}:`, err);
      throw err;
    }
  }, []);

  // Load stacks on mount
  useEffect(() => {
    refreshStacks();
  }, [refreshStacks]);

  return {
    stacks,
    overview,
    loading,
    error,
    refreshStacks,
    executeStackAction,
    getStackLogs
  };
};

export default useStacks;