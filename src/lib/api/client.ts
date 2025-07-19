/**
 * Client API pour compatibilité avec les composants existants
 * Alias vers l'API client simplifié
 */
import { api as baseApi } from '../api-simple';
export { toast } from '../toast';

// Create a stable API reference that works both client and server side
const createApiProxy = () => {
  if (typeof window === 'undefined') {
    // Server-side mock
    return {
      get: async () => ({ data: null }),
      post: async () => ({ data: null }),
      put: async () => ({ data: null }),
      delete: async () => ({ data: null }),
      patch: async () => ({ data: null }),
      services: { getAll: async () => [] },
      system: { getOverview: async () => ({}) },
    };
  }
  return baseApi;
};

export const api = createApiProxy();

// Re-export des types pour compatibilité  
export type {
  ApiError,
  Service,
  SystemOverview,
} from '../api-simple';

// Création d'un alias pour l'usage direct
export const apiClient = api;