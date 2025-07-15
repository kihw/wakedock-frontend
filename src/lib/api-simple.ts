/**
 * Simplified API Client for Next.js Migration
 * This is a temporary minimal implementation to get the app running
 */

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  roles?: string[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Service {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  health_status?: 'healthy' | 'unhealthy' | 'unknown';
  created_at: string;
  updated_at: string;
  cpu?: number;
  memory?: number;
  uptime?: string;
}

export interface SystemOverview {
  total_services: number;
  running_services: number;
  stopped_services: number;
  total_cpu_usage: number;
  total_memory_usage: number;
  timestamp: string;
}

class SimpleApiClient {
  private baseUrl = '/api/v1';
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('wakedock_access_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wakedock_access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wakedock_access_token');
      localStorage.removeItem('wakedock_refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing errors, use status text
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }

  // Auth methods
  auth = {
    login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
      // OAuth2PasswordRequestForm requires form-urlencoded data
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await this.request<LoginResponse>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      this.setToken(response.access_token);
      return response;
    },

    getCurrentUser: async (): Promise<User> => {
      return this.request<User>('/auth/me');
    },

    refreshToken: async (): Promise<LoginResponse> => {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('wakedock_refresh_token') 
        : null;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      return this.request<LoginResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    },

    logout: async (): Promise<void> => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } catch (error) {
        // Ignore logout errors
      } finally {
        this.clearToken();
      }
    },
  };

  // Services methods
  services = {
    getAll: async (): Promise<Service[]> => {
      return this.request<Service[]>('/services');
    },

    getById: async (id: string): Promise<Service> => {
      return this.request<Service>(`/services/${id}`);
    },

    start: async (id: string): Promise<void> => {
      await this.request(`/services/${id}/start`, { method: 'POST' });
    },

    stop: async (id: string): Promise<void> => {
      await this.request(`/services/${id}/stop`, { method: 'POST' });
    },

    restart: async (id: string): Promise<void> => {
      await this.request(`/services/${id}/restart`, { method: 'POST' });
    },

    delete: async (id: string): Promise<void> => {
      await this.request(`/services/${id}`, { method: 'DELETE' });
    },

    create: async (service: Partial<Service>): Promise<Service> => {
      return this.request<Service>('/services', {
        method: 'POST',
        body: JSON.stringify(service),
      });
    },
  };

  // System methods
  system = {
    getOverview: async (): Promise<SystemOverview> => {
      return this.request<SystemOverview>('/system/overview');
    },

    getHealth: async (): Promise<{ status: string }> => {
      return this.request<{ status: string }>('/health');
    },
  };

  // Legacy compatibility methods
  async getServices() {
    return this.services.getAll();
  }

  async getSystemOverview() {
    return this.system.getOverview();
  }

  async startService(id: string) {
    return this.services.start(id);
  }

  async stopService(id: string) {
    return this.services.stop(id);
  }

  async restartService(id: string) {
    return this.services.restart(id);
  }
}

// Create and export singleton instance
export const api = new SimpleApiClient();
export default api;