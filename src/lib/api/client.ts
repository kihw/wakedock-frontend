/**
 * Client API pour compatibilité avec les composants existants
 * Alias vers l'API client simplifié
 */
export { api } from '../api-simple';
export { toast } from '../toast';

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