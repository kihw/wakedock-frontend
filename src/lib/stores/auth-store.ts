import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api-simple';
import type { User, LoginResponse } from '@/lib/api-simple';

interface LoginRequest {
  username: string;
  password: string;
}
import { tokenService } from '@/lib/services/token';
import { logger } from '@/lib/utils/logger';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean; // Alias for compatibility
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
  lastActivity: Date | null;
  sessionExpiry: Date | null;

  // Actions
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
  refreshToken: () => Promise<boolean>;
  updateActivity: () => void;
  isSessionExpired: () => boolean;
  needsTokenRefresh: () => boolean;
  verifyToken: () => Promise<boolean>;
}

// Session timeout timer
let sessionTimer: NodeJS.Timeout | null = null;

// Helper to schedule session timeout
function scheduleSessionTimeout(expiryDate: Date, logout: () => Promise<void>) {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
  }

  const timeUntilExpiry = expiryDate.getTime() - Date.now();

  if (timeUntilExpiry > 0) {
    sessionTimer = setTimeout(async () => {
      await logout();
    }, timeUntilExpiry);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false, // Alias for compatibility
      isLoading: false,
      error: null,
      isRefreshing: false,
      lastActivity: null,
      sessionExpiry: null,

      // Initialize auth state from localStorage/tokens
      init: async () => {
        set({ loading: true, isLoading: true, error: null });

        try {
          const token = tokenService.getAccessToken();
          if (token && !tokenService.isTokenExpired(token)) {
            const user = await api.auth.getCurrentUser();
            const tokenInfo = tokenService.getTokenInfo(token);
            
            set({
              user,
              token,
              refreshToken: tokenService.getRefreshToken(),
              isAuthenticated: true,
              loading: false,
              isLoading: false,
              error: null,
              isRefreshing: false,
              lastActivity: new Date(),
              sessionExpiry: tokenInfo?.expiresAt || null,
            });

            // Schedule automatic token refresh
            tokenService.scheduleTokenRefresh(token, async () => {
              try {
                await get().refreshToken();
              } catch (error) {
                logger.error('Automatic token refresh failed', error as Error);
                await get().logout();
              }
            });

            // Schedule session timeout
            if (tokenInfo?.expiresAt) {
              scheduleSessionTimeout(tokenInfo.expiresAt, get().logout);
            }
          } else {
            // Clear invalid or expired token
            tokenService.clearTokens();
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              loading: false,
              isLoading: false,
              error: null,
              isRefreshing: false,
              lastActivity: null,
              sessionExpiry: null,
            });
          }
        } catch (error) {
          logger.error('Auth initialization failed', error as Error);
          tokenService.clearTokens();
          await api.auth.logout();
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            loading: false,
            isLoading: false,
            error: 'Authentication initialization failed',
            isRefreshing: false,
            lastActivity: null,
            sessionExpiry: null,
          });
        }
      },

      // Login method
      login: async (emailOrUsername: string, password: string) => {
        set({ loading: true, isLoading: true, error: null });

        try {
          const loginRequest: LoginRequest = {
            username: emailOrUsername,
            password,
          };

          logger.debug('Attempting login', { username: emailOrUsername, hasPassword: !!password });

          const response: LoginResponse = await api.auth.login(loginRequest);

          // Store tokens using token service
          tokenService.setTokens(response.access_token, response.refresh_token);

          // Get current user
          let user;
          try {
            user = await api.auth.getCurrentUser();
          } catch (userError) {
            logger.warn('getCurrentUser failed, using data from token', userError);
            const userData = tokenService.getUserFromToken(response.access_token);
            user = response.user || userData || null;
          }

          // Get token info
          const tokenInfo = tokenService.getTokenInfo(response.access_token);

          // Set auth state
          set({
            user,
            token: response.access_token,
            refreshToken: tokenService.getRefreshToken(),
            isAuthenticated: true,
            loading: false,
            isLoading: false,
            error: null,
            isRefreshing: false,
            lastActivity: new Date(),
            sessionExpiry: tokenInfo?.expiresAt || null,
          });

          // Schedule automatic token refresh
          tokenService.scheduleTokenRefresh(response.access_token, async () => {
            try {
              await get().refreshToken();
            } catch (error) {
              logger.error('Automatic token refresh failed', error as Error);
              await get().logout();
            }
          });

          // Schedule session timeout if applicable
          if (tokenInfo?.expiresAt) {
            scheduleSessionTimeout(tokenInfo.expiresAt, get().logout);
          }

          return response;
        } catch (error) {
          logger.error('Auth store login error', error as Error);
          const errorMessage = (error as any)?.message || 'Login failed';
          set({
            loading: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Logout method
      logout: async () => {
        // Clear timers
        tokenService.clearRefreshTimer();
        if (sessionTimer) {
          clearTimeout(sessionTimer);
          sessionTimer = null;
        }

        // Clear tokens
        tokenService.clearTokens();

        // Clear additional localStorage items
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_remember');
          localStorage.removeItem('auth_expiry');
        }

        try {
          await api.auth.logout();
        } catch (error) {
          logger.warn('Logout API call failed', error as Error);
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isRefreshing: false,
          lastActivity: null,
          sessionExpiry: null,
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Update user info
      updateUser: (user: User) => {
        set({ user, lastActivity: new Date() });
      },

      // Refresh token
      refreshToken: async () => {
        const currentState = get();

        if (currentState.isRefreshing) {
          return false;
        }

        set({ isRefreshing: true });

        try {
          const refreshToken = tokenService.getRefreshToken();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call API to refresh token
          const response = await api.auth.refreshToken();

          // Store new tokens
          tokenService.setTokens(response.access_token, response.refresh_token);

          // Get updated user info
          const user = await api.auth.getCurrentUser();

          // Get token info
          const tokenInfo = tokenService.getTokenInfo(response.access_token);

          // Update auth state
          set({
            user,
            token: response.access_token,
            refreshToken: tokenService.getRefreshToken(),
            isRefreshing: false,
            lastActivity: new Date(),
            sessionExpiry: tokenInfo?.expiresAt || null,
            error: null,
          });

          // Schedule next refresh
          tokenService.scheduleTokenRefresh(response.access_token, async () => {
            try {
              await get().refreshToken();
            } catch (error) {
              logger.error('Automatic token refresh failed', error as Error);
              await get().logout();
            }
          });

          return true;
        } catch (error) {
          logger.error('Token refresh failed', error as Error);

          // If refresh fails, logout user
          set({
            isRefreshing: false,
            error: 'Session expired. Please login again.',
          });

          // Auto logout after failed refresh
          setTimeout(() => get().logout(), 1000);

          return false;
        }
      },

      // Update last activity
      updateActivity: () => {
        set({ lastActivity: new Date() });
      },

      // Check if session is expired
      isSessionExpired: () => {
        const token = tokenService.getAccessToken();
        return !token || tokenService.isTokenExpired(token);
      },

      // Check if token needs refresh
      needsTokenRefresh: () => {
        const token = tokenService.getAccessToken();
        return !token || tokenService.needsTokenRefresh(token);
      },

      // Verify token validity
      verifyToken: async () => {
        try {
          const token = tokenService.getAccessToken();
          if (!token || tokenService.isTokenExpired(token)) {
            return false;
          }

          const user = await api.auth.getCurrentUser();
          if (user) {
            set((currentState) => ({
              ...currentState,
              user,
              isAuthenticated: true,
              lastActivity: new Date(),
            }));
            return true;
          }
          return false;
        } catch (error) {
          logger.error('Token verification failed', error as Error);
          await get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        lastActivity: state.lastActivity,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
);