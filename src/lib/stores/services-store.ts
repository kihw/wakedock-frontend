import { create } from 'zustand';
import { api } from '@/lib/api-simple';
import type { Service, SystemOverview } from '@/lib/api-simple';
import { logger } from '@/lib/utils/logger';

interface ServicesState {
  // State
  services: Service[];
  systemOverview: SystemOverview | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedService: Service | null;

  // Actions
  loadServices: () => Promise<void>;
  fetchServices: () => Promise<void>; // Alias for loadServices
  loadSystemOverview: () => Promise<void>;
  refreshAll: () => Promise<void>;
  updateService: (service: Service) => void;
  updateServiceStatus: (id: string, status: string) => void;
  startService: (id: string) => Promise<void>;
  stopService: (id: string) => Promise<void>;
  restartService: (id: string) => Promise<void>;
  pauseService: (id: string) => Promise<void>;
  unpauseService: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  createService: (service: Partial<Service>) => Promise<Service>;
  updateServiceFromWebSocket: (updates: any[]) => void;
  updateSystemFromWebSocket: (update: any) => void;
  setSelectedService: (service: Service | null) => void;
  clearError: () => void;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  // Initial state
  services: [],
  systemOverview: null,
  loading: false,
  error: null,
  lastUpdated: null,
  selectedService: null,

  // Load all services
  loadServices: async () => {
    set({ loading: true, error: null });

    try {
      if (typeof window !== 'undefined' && api.isAuthenticated()) {
        const services = await api.services.getAll();
        set({ 
          services, 
          loading: false, 
          lastUpdated: new Date() 
        });
      } else {
        set({ 
          services: [], 
          loading: false 
        });
      }
    } catch (error) {
      logger.error('Failed to load services', error as Error);
      set({ 
        error: 'Failed to load services',
        loading: false 
      });
    }
  },

  // Load system overview
  loadSystemOverview: async () => {
    try {
      if (typeof window !== 'undefined' && api.isAuthenticated()) {
        const systemOverview = await api.system.getOverview();
        set({ systemOverview });
      }
    } catch (error) {
      logger.warn('Failed to load system overview', error as Error);
    }
  },

  // Refresh all data
  refreshAll: async () => {
    await Promise.all([
      get().loadServices(),
      get().loadSystemOverview()
    ]);
  },

  // Update a specific service
  updateService: (updatedService: Service) => {
    set((state) => ({
      services: state.services.map((service) =>
        service.id === updatedService.id ? updatedService : service
      ),
      lastUpdated: new Date()
    }));
  },

  // Update service status
  updateServiceStatus: (id: string, status: string) => {
    set((state) => ({
      services: state.services.map((service) =>
        service.id === id ? { ...service, status } : service
      ),
      lastUpdated: new Date()
    }));
  },

  // Start a service
  startService: async (id: string) => {
    try {
      // Optimistically update status
      get().updateServiceStatus(id, 'starting');

      if (api.isAuthenticated()) {
        await api.services.start(id);
        // The WebSocket will update the actual status when it changes
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.error('Failed to start service', error as Error);
      // Revert optimistic update
      await get().loadServices();
      throw error;
    }
  },

  // Stop a service
  stopService: async (id: string) => {
    try {
      // Optimistically update status
      get().updateServiceStatus(id, 'stopping');

      if (api.isAuthenticated()) {
        await api.services.stop(id);
        // The WebSocket will update the actual status when it changes
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.error('Failed to stop service', error as Error);
      // Revert optimistic update
      await get().loadServices();
      throw error;
    }
  },

  // Restart a service
  restartService: async (id: string) => {
    try {
      // Optimistically update status
      get().updateServiceStatus(id, 'restarting');

      if (api.isAuthenticated()) {
        await api.services.restart(id);
        // The WebSocket will update the actual status when it changes
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.error('Failed to restart service', error as Error);
      // Revert optimistic update
      await get().loadServices();
      throw error;
    }
  },

  // Delete a service
  deleteService: async (id: string) => {
    try {
      if (api.isAuthenticated()) {
        await api.services.delete(id);
        
        // Remove from local state
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
          lastUpdated: new Date()
        }));
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.error('Failed to delete service', error as Error);
      throw error;
    }
  },

  // Create a new service
  createService: async (serviceData: Partial<Service>) => {
    try {
      if (api.isAuthenticated()) {
        const newService = await api.services.create(serviceData);
        
        // Add to local state
        set((state) => ({
          services: [...state.services, newService],
          lastUpdated: new Date()
        }));

        return newService;
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.error('Failed to create service', error as Error);
      throw error;
    }
  },

  // Update services from WebSocket
  updateServiceFromWebSocket: (updates: any[]) => {
    if (updates.length > 0) {
      set((state) => {
        const updatedServices = state.services.map((service) => {
          const update = updates.find((u) => u.id === service.id);
          if (update) {
            return {
              ...service,
              status: update.status,
              health_status: update.health_status,
              resource_usage: update.stats
                ? {
                    cpu_usage: update.stats.cpu_usage,
                    memory_usage: update.stats.memory_usage,
                    network_io: update.stats.network_io,
                  }
                : service.resource_usage,
            };
          }
          return service;
        });

        return {
          services: updatedServices,
          lastUpdated: new Date()
        };
      });
    }
  },

  // Update system overview from WebSocket
  updateSystemFromWebSocket: (update: any) => {
    if (update) {
      set({
        systemOverview: {
          total_services: update.total_services || 0,
          running_services: update.running_services || 0,
          stopped_services: update.stopped_services || 0,
          total_cpu_usage: update.total_cpu_usage || 0,
          total_memory_usage: update.total_memory_usage || 0,
          timestamp: update.timestamp || new Date().toISOString(),
        },
      });
    }
  },

  // Alias for loadServices (compatibility)
  fetchServices: async () => {
    await get().loadServices();
  },

  // Pause a service
  pauseService: async (id: string) => {
    try {
      // Optimistically update status
      get().updateServiceStatus(id, 'paused');

      if (api.isAuthenticated()) {
        await api.services.pause(id);
        // The WebSocket will update the actual status when it changes
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.error('Failed to pause service', error as Error);
      // Revert optimistic update
      await get().loadServices();
      throw error;
    }
  },

  // Unpause a service
  unpauseService: async (id: string) => {
    try {
      // Optimistically update status
      get().updateServiceStatus(id, 'running');

      if (api.isAuthenticated()) {
        await api.services.unpause(id);
        // The WebSocket will update the actual status when it changes
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.error('Failed to unpause service', error as Error);
      // Revert optimistic update
      await get().loadServices();
      throw error;
    }
  },

  // Set selected service
  setSelectedService: (service: Service | null) => {
    set({ selectedService: service });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));