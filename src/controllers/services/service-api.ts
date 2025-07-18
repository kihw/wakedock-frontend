// Service API Client - MVC Architecture
import axios from 'axios';
import { ApiResponse, PaginatedResponse, ServiceListRequest, ServiceActionRequest } from '@/models/api/requests';
import { Service } from '@/models/domain/service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const serviceApi = {
  // Get services list
  async getServices(params?: ServiceListRequest): Promise<PaginatedResponse<Service>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Service>>>('/services', {
      params,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch services');
    }
    
    return response.data.data!;
  },

  // Get single service
  async getService(serviceId: string): Promise<Service> {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${serviceId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch service');
    }
    
    return response.data.data!;
  },

  // Execute service action
  async executeAction(request: ServiceActionRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      `/services/${request.service_id}/actions`,
      {
        action: request.action,
        options: request.options,
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to execute action');
    }
  },

  // Create service
  async createService(service: Partial<Service>): Promise<Service> {
    const response = await apiClient.post<ApiResponse<Service>>('/services', service);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create service');
    }
    
    return response.data.data!;
  },

  // Update service
  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    const response = await apiClient.put<ApiResponse<Service>>(`/services/${serviceId}`, updates);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update service');
    }
    
    return response.data.data!;
  },

  // Delete service
  async deleteService(serviceId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/services/${serviceId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete service');
    }
  },

  // Get service logs
  async getServiceLogs(serviceId: string, options?: {
    since?: string;
    tail?: number;
    follow?: boolean;
  }): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(`/services/${serviceId}/logs`, {
      params: options,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch logs');
    }
    
    return response.data.data!;
  },

  // Get service metrics
  async getServiceMetrics(serviceId: string, options?: {
    from?: string;
    to?: string;
    interval?: string;
  }): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/services/${serviceId}/metrics`, {
      params: options,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch metrics');
    }
    
    return response.data.data!;
  },
};
