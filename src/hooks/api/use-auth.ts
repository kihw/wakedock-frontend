// Auth Hook - Authentication management
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user';
    permissions: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refresh: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'wakedock-auth-token';
const USER_STORAGE_KEY = 'wakedock-user';

export const useAuth = (): AuthContextType => {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Initialize auth state from storage
    useEffect(() => {
        const token = localStorage.getItem(AUTH_STORAGE_KEY);
        const userStr = localStorage.getItem(USER_STORAGE_KEY);

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setState(prev => ({
                    ...prev,
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                }));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem(AUTH_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                }));
            }
        } else {
            setState(prev => ({
                ...prev,
                isLoading: false,
            }));
        }
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<void> => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
        }));

        try {
            // Mock authentication for development
            // In production, replace with actual API call
            const mockUser: User = {
                id: '1',
                name: 'John Doe',
                email: email,
                avatar: '',
                role: 'admin',
                permissions: ['read', 'write', 'admin'],
            };

            const mockToken = 'mock-jwt-token-' + Date.now();

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store in localStorage
            localStorage.setItem(AUTH_STORAGE_KEY, mockToken);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

            setState(prev => ({
                ...prev,
                user: mockUser,
                token: mockToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }));

            router.push('/');
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
            throw error;
        }
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });

        router.push('/login');
    }, [router]);

    const refresh = useCallback(async (): Promise<void> => {
        const token = localStorage.getItem(AUTH_STORAGE_KEY);

        if (!token) {
            logout();
            return;
        }

        try {
            // Mock token refresh
            // In production, replace with actual API call
            const userStr = localStorage.getItem(USER_STORAGE_KEY);
            if (userStr) {
                const user = JSON.parse(userStr);
                setState(prev => ({
                    ...prev,
                    user,
                    token,
                    isAuthenticated: true,
                    error: null,
                }));
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
        }
    }, [logout]);

    const checkAuth = useCallback(async (): Promise<void> => {
        const token = localStorage.getItem(AUTH_STORAGE_KEY);

        if (!token) {
            setState(prev => ({
                ...prev,
                isAuthenticated: false,
                isLoading: false,
            }));
            return;
        }

        try {
            await refresh();
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        }
    }, [refresh, logout]);

    return {
        ...state,
        login,
        logout,
        refresh,
        checkAuth,
    };
};
