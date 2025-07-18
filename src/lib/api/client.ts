/**
 * Client API pour compatibilité avec les composants existants
 * Alias vers l'API client simplifié
 */
import { api as baseApi } from '../api-simple';
export { toast } from '../toast';

// Ensure API is available in browser environment
export const api = typeof window !== 'undefined' ? baseApi : {
  get: async () => ({ data: null }),
  post: async () => ({ data: null }),
  put: async () => ({ data: null }),
  delete: async () => ({ data: null }),
  patch: async () => ({ data: null }),
};

// Re-export des types pour compatibilité
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  QueryParams,
  RequestConfig,
} from '../api-simple';

// Création d'un alias pour l'usage direct
export const apiClient = {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch,
};