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
}

export interface SystemOverview {
  services: {
    total: number;
    running: number;
    stopped: number;
    error: number;
  };
  system: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    uptime: number;
  };
  docker: {
    version: string;
    api_version: string;
    status: 'healthy' | 'unhealthy';
  };
  caddy: {
    version: string;
    status: 'healthy' | 'unhealthy';
    active_routes: number;
  };
}

class SimpleApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  auth = {
    login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
      const response = await this.request<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      this.setToken(response.access_token);
      return response;
    },

    getCurrentUser: async (): Promise<User> => {
      return this.request<User>('/api/v1/auth/me');
    },

    refreshToken: async (): Promise<LoginResponse> => {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('wakedock_refresh_token') 
        : null;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      return this.request<LoginResponse>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    },

    logout: async (): Promise<void> => {
      try {
        await this.request('/api/v1/auth/logout', { method: 'POST' });
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
      return this.request<Service[]>('/api/v1/services');
    },

    getById: async (id: string): Promise<Service> => {
      return this.request<Service>(`/api/v1/services/${id}`);
    },

    start: async (id: string): Promise<void> => {
      await this.request(`/api/v1/services/${id}/start`, { method: 'POST' });
    },

    stop: async (id: string): Promise<void> => {
      await this.request(`/api/v1/services/${id}/stop`, { method: 'POST' });
    },

    restart: async (id: string): Promise<void> => {
      await this.request(`/api/v1/services/${id}/restart`, { method: 'POST' });
    },

    delete: async (id: string): Promise<void> => {
      await this.request(`/api/v1/services/${id}`, { method: 'DELETE' });
    },

    create: async (service: Partial<Service>): Promise<Service> => {
      return this.request<Service>('/api/v1/services', {
        method: 'POST',
        body: JSON.stringify(service),
      });
    },
  };

  // System methods
  system = {
    getOverview: async (): Promise<SystemOverview> => {
      return this.request<SystemOverview>('/api/v1/system/overview');
    },

    getHealth: async (): Promise<{ status: string }> => {
      return this.request<{ status: string }>('/api/v1/health');
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