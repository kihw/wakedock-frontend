/**
 * Client API simple pour les interactions avec le backend WakeDock
 */

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Utility pour les appels fetch
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('auth_token');

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    }

    return response;
};

// Client API simple
export const api = {
    get: async (url: string, params?: Record<string, any>) => {
        const searchParams = params ? `?${new URLSearchParams(params).toString()}` : '';
        const response = await fetchWithAuth(`${url}${searchParams}`);
        return { data: await response.json() };
    },

    post: async (url: string, data?: any) => {
        const response = await fetchWithAuth(url, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
        return { data: await response.json() };
    },

    put: async (url: string, data?: any) => {
        const response = await fetchWithAuth(url, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
        return { data: await response.json() };
    },

    delete: async (url: string) => {
        const response = await fetchWithAuth(url, {
            method: 'DELETE',
        });
        return { data: await response.json() };
    },
};

// Types utilitaires pour les réponses API
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

export interface ApiError {
    message: string;
    status: number;
    code?: string;
}

// Export de l'API par défaut
export default api;
