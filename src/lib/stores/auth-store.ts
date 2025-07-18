// Minimal auth store for v0.6.4
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: { username: string; password: string }) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    // Mock login for v0.6.4
                    const mockUser: User = {
                        id: '1',
                        username: credentials.username,
                        email: `${credentials.username}@wakedock.com`,
                        role: 'admin',
                        status: 'active'
                    };

                    set({
                        user: mockUser,
                        token: 'mock-jwt-token',
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Login failed'
                    });
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                });
            },

            refreshToken: async () => {
                try {
                    // Mock refresh for v0.6.4
                    return true;
                } catch (error) {
                    get().logout();
                    return false;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
