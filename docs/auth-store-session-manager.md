# Documentation Auth-Store.ts et Session-Manager.ts

## 📋 Vue d'ensemble

Ce document détaille l'implémentation des stores d'authentification et du gestionnaire de sessions pour WakeDock, incluant la gestion d'état réactive et la persistance des sessions.

## 🗂️ Auth-Store.ts

### Implémentation Complète

```typescript
// src/lib/auth/store/auth-store.ts
import { writable, derived, get } from 'svelte/store';
import type { 
  AuthState, 
  User, 
  AuthError, 
  LoginCredentials,
  AuthConfig 
} from '../types';
import { AuthManager } from '../core/auth-manager';
import { AUTH_EVENTS } from '../constants';
import { sanitizeUser } from '../utils';

// Store principal d'authentification
export const authState = writable<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  permissions: [],
  roles: [],
  sessionId: null,
  sessionExpiry: null,
  lastActivity: null,
  error: null
});

// Stores dérivés
export const currentUser = derived(authState, $state => $state.user);
export const isAuthenticated = derived(authState, $state => $state.isAuthenticated);
export const isLoading = derived(authState, $state => $state.isLoading);
export const authError = derived(authState, $state => $state.error);
export const userPermissions = derived(authState, $state => $state.permissions);
export const userRoles = derived(authState, $state => $state.roles);

class AuthStore {
  private authManager: AuthManager;
  private unsubscribers: (() => void)[] = [];
  private persistenceKey = 'wakedock_auth_state';

  constructor(config: AuthConfig) {
    this.authManager = AuthManager.getInstance(config);
    this.setupEventListeners();
    this.restoreState();
  }

  private setupEventListeners(): void {
    // Écouter les événements d'authentification
    const unsubscribeLogin = this.authManager.on(AUTH_EVENTS.LOGIN_SUCCESS, (user: User) => {
      this.updateState({
        user: sanitizeUser(user),
        isAuthenticated: true,
        isLoading: false,
        permissions: user.permissions.map(p => p.name),
        roles: user.roles.map(r => r.name),
        error: null
      });
    });

    const unsubscribeLogout = this.authManager.on(AUTH_EVENTS.LOGOUT, () => {
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
        roles: [],
        sessionId: null,
        sessionExpiry: null,
        lastActivity: null,
        error: null
      });
    });

    const unsubscribeError = this.authManager.on(AUTH_EVENTS.LOGIN_FAILURE, (error: AuthError) => {
      this.updateState({
        isLoading: false,
        error
      });
    });

    const unsubscribeTokenRefresh = this.authManager.on(AUTH_EVENTS.TOKEN_REFRESH, () => {
      this.updateState({
        lastActivity: new Date()
      });
    });

    const unsubscribeStateChange = this.authManager.on('state-change', (newState: AuthState) => {
      this.updateState(newState);
    });

    this.unsubscribers.push(
      unsubscribeLogin,
      unsubscribeLogout,
      unsubscribeError,
      unsubscribeTokenRefresh,
      unsubscribeStateChange
    );
  }

  private updateState(updates: Partial<AuthState>): void {
    authState.update(state => {
      const newState = { ...state, ...updates };
      this.persistState(newState);
      return newState;
    });
  }

  private persistState(state: AuthState): void {
    try {
      // Ne persister que les données non sensibles
      const persistedState = {
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        roles: state.roles,
        sessionId: state.sessionId,
        sessionExpiry: state.sessionExpiry,
        lastActivity: state.lastActivity
      };

      localStorage.setItem(this.persistenceKey, JSON.stringify(persistedState));
    } catch (error) {
      console.error('Failed to persist auth state:', error);
    }
  }

  private restoreState(): void {
    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const persistedState = JSON.parse(stored);
        
        // Vérifier si la session n'a pas expiré
        if (persistedState.sessionExpiry && new Date(persistedState.sessionExpiry) > new Date()) {
          this.updateState(persistedState);
          
          // Tenter de restaurer les données utilisateur
          this.authManager.initialize();
        } else {
          // Session expirée, nettoyer
          this.clearPersistedState();
        }
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      this.clearPersistedState();
    }
  }

  private clearPersistedState(): void {
    try {
      localStorage.removeItem(this.persistenceKey);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }

  // Actions publiques
  async login(credentials: LoginCredentials): Promise<void> {
    this.updateState({ isLoading: true, error: null });
    
    try {
      await this.authManager.login(credentials);
    } catch (error) {
      this.updateState({ 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Login failed') 
      });
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.updateState({ isLoading: true });
    
    try {
      await this.authManager.logout();
      this.clearPersistedState();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  async refreshToken(): Promise<void> {
    try {
      await this.authManager.refreshToken();
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      await this.logout();
      throw error;
    }
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  // Getters
  getCurrentUser(): User | null {
    return get(currentUser);
  }

  getIsAuthenticated(): boolean {
    return get(isAuthenticated);
  }

  getPermissions(): string[] {
    return get(userPermissions);
  }

  getRoles(): string[] {
    return get(userRoles);
  }

  hasPermission(permission: string): boolean {
    const permissions = get(userPermissions);
    return permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    const roles = get(userRoles);
    return roles.includes(role);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = get(userPermissions);
    return permissions.some(p => userPermissions.includes(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = get(userPermissions);
    return permissions.every(p => userPermissions.includes(p));
  }

  destroy(): void {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}

// Instance singleton
let authStoreInstance: AuthStore | null = null;

export const createAuthStore = (config: AuthConfig): AuthStore => {
  if (!authStoreInstance) {
    authStoreInstance = new AuthStore(config);
  }
  return authStoreInstance;
};

export const useAuthStore = (): AuthStore => {
  if (!authStoreInstance) {
    throw new Error('Auth store not initialized. Call createAuthStore first.');
  }
  return authStoreInstance;
};

// Actions exportées pour utilisation directe
export const authActions = {
  login: async (credentials: LoginCredentials) => {
    const store = useAuthStore();
    return store.login(credentials);
  },

  logout: async () => {
    const store = useAuthStore();
    return store.logout();
  },

  refreshToken: async () => {
    const store = useAuthStore();
    return store.refreshToken();
  },

  clearError: () => {
    const store = useAuthStore();
    store.clearError();
  }
};

// Utilitaires de validation
export const authValidators = {
  isAuthenticated: (): boolean => {
    return get(isAuthenticated);
  },

  requireAuth: (): void => {
    if (!get(isAuthenticated)) {
      throw new Error('Authentication required');
    }
  },

  requirePermission: (permission: string): void => {
    const store = useAuthStore();
    if (!store.hasPermission(permission)) {
      throw new Error(`Permission required: ${permission}`);
    }
  },

  requireRole: (role: string): void => {
    const store = useAuthStore();
    if (!store.hasRole(role)) {
      throw new Error(`Role required: ${role}`);
    }
  },

  requireAnyPermission: (permissions: string[]): void => {
    const store = useAuthStore();
    if (!store.hasAnyPermission(permissions)) {
      throw new Error(`One of these permissions required: ${permissions.join(', ')}`);
    }
  },

  requireAllPermissions: (permissions: string[]): void => {
    const store = useAuthStore();
    if (!store.hasAllPermissions(permissions)) {
      throw new Error(`All permissions required: ${permissions.join(', ')}`);
    }
  }
};
```

## 🕐 Session-Manager.ts

### Implémentation Complète

```typescript
// src/lib/auth/core/session-manager.ts
import type { 
  Session, 
  SessionConfig, 
  AuthConfig, 
  User,
  AuthState 
} from '../types';
import { EventEmitter } from '../events/event-emitter';
import { AUTH_EVENTS } from '../constants';
import { generateDeviceId } from '../utils';

export class SessionManager {
  private config: AuthConfig;
  private eventEmitter: EventEmitter;
  private currentSession: Session | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private lastActivity: Date = new Date();
  private sessionStorageKey = 'wakedock_session';
  private activityEvents: string[] = [
    'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
  ];

  constructor(config: AuthConfig, eventEmitter: EventEmitter) {
    this.config = config;
    this.eventEmitter = eventEmitter;
    this.setupActivityTracking();
  }

  async startSession(user: User, sessionData?: Partial<Session>): Promise<Session> {
    // Arrêter la session existante
    await this.endSession();

    // Créer une nouvelle session
    const session: Session = {
      id: sessionData?.id || this.generateSessionId(),
      userId: user.id,
      deviceId: sessionData?.deviceId || generateDeviceId(),
      ipAddress: sessionData?.ipAddress || await this.getClientIP(),
      userAgent: sessionData?.userAgent || navigator.userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTimeout),
      isActive: true,
      isExpired: false,
      data: sessionData?.data || {},
      loginMethod: sessionData?.loginMethod || 'password',
      rememberMe: sessionData?.rememberMe || false,
      activities: []
    };

    this.currentSession = session;
    this.lastActivity = new Date();

    // Sauvegarder la session
    await this.saveSession(session);

    // Démarrer les timers
    this.startSessionTimer();
    this.startActivityTimer();

    // Émettre l'événement de démarrage
    this.eventEmitter.emit(AUTH_EVENTS.SESSION_START, session);

    return session;
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    // Arrêter les timers
    this.stopTimers();

    // Marquer la session comme terminée
    this.currentSession.isActive = false;
    this.currentSession.endedAt = new Date();

    // Sauvegarder l'état final
    await this.saveSession(this.currentSession);

    // Émettre l'événement de fin
    this.eventEmitter.emit(AUTH_EVENTS.SESSION_END, this.currentSession);

    // Nettoyer le stockage
    await this.clearSessionStorage();

    this.currentSession = null;
  }

  async extendSession(duration?: number): Promise<void> {
    if (!this.currentSession) return;

    const extensionTime = duration || this.config.sessionTimeout;
    this.currentSession.expiresAt = new Date(Date.now() + extensionTime);
    this.currentSession.lastActivity = new Date();

    await this.saveSession(this.currentSession);

    // Redémarrer le timer
    this.startSessionTimer();

    this.eventEmitter.emit(AUTH_EVENTS.SESSION_EXTENDED, {
      sessionId: this.currentSession.id,
      newExpiry: this.currentSession.expiresAt
    });
  }

  async recordActivity(activity: string, details?: any): Promise<void> {
    if (!this.currentSession) return;

    const activityRecord = {
      id: this.generateActivityId(),
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId,
      action: activity,
      resource: details?.resource,
      timestamp: new Date(),
      ipAddress: this.currentSession.ipAddress,
      userAgent: this.currentSession.userAgent,
      details: details || {},
      success: true
    };

    // Ajouter à la session
    this.currentSession.activities.push(activityRecord);
    this.currentSession.lastActivity = new Date();
    this.lastActivity = new Date();

    // Limiter le nombre d'activités stockées
    if (this.currentSession.activities.length > 100) {
      this.currentSession.activities = this.currentSession.activities.slice(-50);
    }

    await this.saveSession(this.currentSession);

    // Étendre la session si configuré
    if (this.config.extendOnActivity) {
      await this.extendSession();
    }
  }

  private setupActivityTracking(): void {
    if (typeof window === 'undefined') return;

    const handleActivity = () => {
      this.lastActivity = new Date();
      this.recordActivity('user_activity');
    };

    this.activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Nettoyer lors de la fermeture
    window.addEventListener('beforeunload', () => {
      this.activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    });
  }

  private startSessionTimer(): void {
    this.stopTimers();

    if (!this.currentSession) return;

    const timeUntilExpiry = this.currentSession.expiresAt.getTime() - Date.now();
    const warningTime = 5 * 60 * 1000; // 5 minutes avant expiration

    // Timer d'avertissement
    if (timeUntilExpiry > warningTime) {
      this.warningTimer = setTimeout(() => {
        this.eventEmitter.emit(AUTH_EVENTS.SESSION_WARNING, {
          sessionId: this.currentSession?.id,
          remainingTime: warningTime
        });
      }, timeUntilExpiry - warningTime);
    }

    // Timer d'expiration
    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpiry();
    }, timeUntilExpiry);
  }

  private startActivityTimer(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }

    // Vérifier l'activité toutes les minutes
    this.activityTimer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity.getTime();
      const inactivityThreshold = 30 * 60 * 1000; // 30 minutes

      if (timeSinceLastActivity > inactivityThreshold) {
        this.handleSessionExpiry();
      }
    }, 60000); // Vérifier chaque minute
  }

  private async handleSessionExpiry(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.isExpired = true;
    this.currentSession.isActive = false;

    this.eventEmitter.emit(AUTH_EVENTS.SESSION_EXPIRED, {
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId
    });

    await this.endSession();
  }

  private stopTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }

    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  private async saveSession(session: Session): Promise<void> {
    try {
      const sessionData = {
        ...session,
        // Sérialiser les dates
        createdAt: session.createdAt.toISOString(),
        lastActivity: session.lastActivity.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        endedAt: session.endedAt?.toISOString(),
        activities: session.activities.map(activity => ({
          ...activity,
          timestamp: activity.timestamp.toISOString()
        }))
      };

      if (this.config.storageType === 'localStorage') {
        localStorage.setItem(this.sessionStorageKey, JSON.stringify(sessionData));
      } else if (this.config.storageType === 'sessionStorage') {
        sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private async loadSession(): Promise<Session | null> {
    try {
      let stored: string | null = null;

      if (this.config.storageType === 'localStorage') {
        stored = localStorage.getItem(this.sessionStorageKey);
      } else if (this.config.storageType === 'sessionStorage') {
        stored = sessionStorage.getItem(this.sessionStorageKey);
      }

      if (!stored) return null;

      const sessionData = JSON.parse(stored);

      // Désérialiser les dates
      const session: Session = {
        ...sessionData,
        createdAt: new Date(sessionData.createdAt),
        lastActivity: new Date(sessionData.lastActivity),
        expiresAt: new Date(sessionData.expiresAt),
        endedAt: sessionData.endedAt ? new Date(sessionData.endedAt) : undefined,
        activities: sessionData.activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
      };

      // Vérifier si la session n'a pas expiré
      if (session.expiresAt < new Date()) {
        await this.clearSessionStorage();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      await this.clearSessionStorage();
      return null;
    }
  }

  private async clearSessionStorage(): Promise<void> {
    try {
      if (this.config.storageType === 'localStorage') {
        localStorage.removeItem(this.sessionStorageKey);
      } else if (this.config.storageType === 'sessionStorage') {
        sessionStorage.removeItem(this.sessionStorageKey);
      }
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateActivityId(): string {
    return 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Méthodes publiques

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  async restoreSession(): Promise<Session | null> {
    const session = await this.loadSession();
    if (session) {
      this.currentSession = session;
      this.lastActivity = session.lastActivity;
      this.startSessionTimer();
      this.startActivityTimer();
    }
    return session;
  }

  isSessionValid(): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.isActive && !this.currentSession.isExpired;
  }

  getSessionTimeRemaining(): number {
    if (!this.currentSession) return 0;
    return Math.max(0, this.currentSession.expiresAt.getTime() - Date.now());
  }

  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity.getTime();
  }

  async getSessionActivities(): Promise<any[]> {
    return this.currentSession?.activities || [];
  }

  async clearSessionActivities(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.activities = [];
      await this.saveSession(this.currentSession);
    }
  }

  // Support multi-onglets
  async syncAcrossTabs(): Promise<void> {
    if (!this.config.multiTabSupport) return;

    // Écouter les changements de storage
    window.addEventListener('storage', (event) => {
      if (event.key === this.sessionStorageKey) {
        this.handleSessionChangeFromOtherTab(event.newValue);
      }
    });
  }

  private async handleSessionChangeFromOtherTab(newValue: string | null): Promise<void> {
    if (!newValue) {
      // Session supprimée dans un autre onglet
      await this.endSession();
      return;
    }

    try {
      const sessionData = JSON.parse(newValue);
      const session: Session = {
        ...sessionData,
        createdAt: new Date(sessionData.createdAt),
        lastActivity: new Date(sessionData.lastActivity),
        expiresAt: new Date(sessionData.expiresAt),
        endedAt: sessionData.endedAt ? new Date(sessionData.endedAt) : undefined,
        activities: sessionData.activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
      };

      this.currentSession = session;
      this.lastActivity = session.lastActivity;
      this.startSessionTimer();
    } catch (error) {
      console.error('Failed to sync session from other tab:', error);
    }
  }

  destroy(): void {
    this.stopTimers();
    this.currentSession = null;
  }
}
```

## 🎯 Utilisation et Intégration

### Utilisation du Store d'Authentification

```typescript
// src/routes/+layout.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    authState, 
    currentUser, 
    isAuthenticated, 
    createAuthStore 
  } from '$lib/auth/store/auth-store';
  import { defaultAuthConfig } from '$lib/auth/config';

  onMount(() => {
    // Initialiser le store d'authentification
    createAuthStore(defaultAuthConfig);
  });
</script>

<!-- Layout markup -->
{#if $isAuthenticated}
  <header>
    <h1>Welcome, {$currentUser?.firstName}!</h1>
    <button on:click={() => authActions.logout()}>Logout</button>
  </header>
{/if}
```

### Hooks d'Authentification

```typescript
// src/lib/auth/hooks/use-auth.ts
import { derived, readable } from 'svelte/store';
import { authState, authActions, useAuthStore } from '../store/auth-store';

export function useAuth() {
  const store = useAuthStore();
  
  return {
    // État réactif
    state: derived(authState, $state => $state),
    user: derived(authState, $state => $state.user),
    isAuthenticated: derived(authState, $state => $state.isAuthenticated),
    isLoading: derived(authState, $state => $state.isLoading),
    error: derived(authState, $state => $state.error),
    
    // Actions
    login: authActions.login,
    logout: authActions.logout,
    refreshToken: authActions.refreshToken,
    clearError: authActions.clearError,
    
    // Utilitaires
    hasPermission: store.hasPermission.bind(store),
    hasRole: store.hasRole.bind(store),
    hasAnyPermission: store.hasAnyPermission.bind(store),
    hasAllPermissions: store.hasAllPermissions.bind(store)
  };
}
```

### Utilisation du Session Manager

```typescript
// src/lib/auth/hooks/use-session.ts
import { onMount, onDestroy } from 'svelte';
import { writable } from 'svelte/store';
import { SessionManager } from '../core/session-manager';

export function useSession() {
  const sessionState = writable({
    current: null,
    timeRemaining: 0,
    isValid: false,
    activities: []
  });

  let sessionManager: SessionManager;
  let updateInterval: number;

  onMount(() => {
    // Initialiser le gestionnaire de session
    sessionManager = new SessionManager(config, eventEmitter);
    
    // Mettre à jour l'état périodiquement
    updateInterval = setInterval(() => {
      sessionState.update(state => ({
        ...state,
        current: sessionManager.getCurrentSession(),
        timeRemaining: sessionManager.getSessionTimeRemaining(),
        isValid: sessionManager.isSessionValid()
      }));
    }, 1000);
  });

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    if (sessionManager) {
      sessionManager.destroy();
    }
  });

  return {
    state: sessionState,
    extendSession: sessionManager.extendSession.bind(sessionManager),
    recordActivity: sessionManager.recordActivity.bind(sessionManager),
    getActivities: sessionManager.getSessionActivities.bind(sessionManager)
  };
}
```

---

*Cette documentation fournit une gestion complète de l'état d'authentification et des sessions pour WakeDock.*