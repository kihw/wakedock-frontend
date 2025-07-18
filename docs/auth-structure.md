# Structure /src/lib/auth/ - Frontend

## 📋 Vue d'ensemble

Ce document détaille la structure complète du dossier `/src/lib/auth/` pour le frontend WakeDock, incluant l'organisation des fichiers, les responsabilités et les interfaces.

## 🏗️ Structure des Dossiers

```
src/lib/auth/
├── index.ts                    # Export principal du module auth
├── types.ts                    # Types et interfaces TypeScript
├── config.ts                   # Configuration d'authentification
├── constants.ts                # Constantes et énumérations
├── errors.ts                   # Gestion des erreurs d'authentification
├── utils.ts                    # Utilitaires d'authentification
├── validators.ts               # Validateurs de données
├── core/                       # Composants principaux
│   ├── index.ts
│   ├── auth-manager.ts         # Gestionnaire central d'authentification
│   ├── token-manager.ts        # Gestion des tokens JWT
│   ├── session-manager.ts      # Gestion des sessions
│   ├── security-manager.ts     # Gestion de la sécurité
│   └── device-manager.ts       # Gestion des appareils
├── store/                      # Gestion d'état
│   ├── index.ts
│   ├── auth-store.ts           # Store principal d'authentification
│   ├── session-store.ts        # Store de session
│   ├── user-store.ts           # Store utilisateur
│   └── permissions-store.ts    # Store de permissions
├── services/                   # Services d'API
│   ├── index.ts
│   ├── auth-service.ts         # Service d'authentification
│   ├── user-service.ts         # Service utilisateur
│   ├── session-service.ts      # Service de session
│   └── permissions-service.ts  # Service de permissions
├── middleware/                 # Middleware frontend
│   ├── index.ts
│   ├── auth-middleware.ts      # Middleware d'authentification
│   ├── route-guard.ts          # Garde de routes
│   └── permission-guard.ts     # Garde de permissions
├── hooks/                      # Hooks React/Svelte
│   ├── index.ts
│   ├── use-auth.ts             # Hook principal d'authentification
│   ├── use-session.ts          # Hook de session
│   ├── use-permissions.ts      # Hook de permissions
│   └── use-user.ts             # Hook utilisateur
├── components/                 # Composants d'authentification
│   ├── index.ts
│   ├── LoginForm.tsx           # Formulaire de connexion
│   ├── LogoutButton.tsx        # Bouton de déconnexion
│   ├── AuthProvider.tsx        # Provider d'authentification
│   ├── ProtectedRoute.tsx      # Route protégée
│   └── SessionTimeout.tsx      # Gestion du timeout de session
├── guards/                     # Gardes d'authentification
│   ├── index.ts
│   ├── auth-guard.ts           # Garde d'authentification
│   ├── role-guard.ts           # Garde de rôles
│   └── permission-guard.ts     # Garde de permissions
├── adapters/                   # Adaptateurs pour différents providers
│   ├── index.ts
│   ├── jwt-adapter.ts          # Adaptateur JWT
│   ├── oauth-adapter.ts        # Adaptateur OAuth
│   └── local-adapter.ts        # Adaptateur local
└── __tests__/                  # Tests
    ├── core/
    ├── store/
    ├── services/
    ├── hooks/
    └── components/
```

## 📁 Fichiers Principaux

### index.ts - Export Principal
```typescript
// src/lib/auth/index.ts
export * from './types';
export * from './config';
export * from './constants';
export * from './errors';
export * from './utils';
export * from './validators';

// Core exports
export { AuthManager } from './core/auth-manager';
export { TokenManager } from './core/token-manager';
export { SessionManager } from './core/session-manager';
export { SecurityManager } from './core/security-manager';
export { DeviceManager } from './core/device-manager';

// Store exports
export { useAuthStore } from './store/auth-store';
export { useSessionStore } from './store/session-store';
export { useUserStore } from './store/user-store';
export { usePermissionsStore } from './store/permissions-store';

// Service exports
export { AuthService } from './services/auth-service';
export { UserService } from './services/user-service';
export { SessionService } from './services/session-service';
export { PermissionsService } from './services/permissions-service';

// Hook exports
export { useAuth } from './hooks/use-auth';
export { useSession } from './hooks/use-session';
export { usePermissions } from './hooks/use-permissions';
export { useUser } from './hooks/use-user';

// Component exports
export { LoginForm } from './components/LoginForm';
export { LogoutButton } from './components/LogoutButton';
export { AuthProvider } from './components/AuthProvider';
export { ProtectedRoute } from './components/ProtectedRoute';
export { SessionTimeout } from './components/SessionTimeout';

// Guard exports
export { AuthGuard } from './guards/auth-guard';
export { RoleGuard } from './guards/role-guard';
export { PermissionGuard } from './guards/permission-guard';
```

### types.ts - Types et Interfaces
```typescript
// src/lib/auth/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  roles: string[];
  sessionId: string | null;
  sessionExpiry: Date | null;
  lastActivity: Date | null;
  error: AuthError | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface AuthConfig {
  apiUrl: string;
  tokenKey: string;
  refreshTokenKey: string;
  storageType: 'localStorage' | 'sessionStorage' | 'memory';
  sessionTimeout: number;
  enableMFA: boolean;
  enableRememberMe: boolean;
  debug: boolean;
}
```

### config.ts - Configuration
```typescript
// src/lib/auth/config.ts
import { AuthConfig } from './types';

export const defaultAuthConfig: AuthConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  tokenKey: 'wakedock_access_token',
  refreshTokenKey: 'wakedock_refresh_token',
  storageType: 'localStorage',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  enableMFA: false,
  enableRememberMe: true,
  debug: process.env.NODE_ENV === 'development'
};

export const createAuthConfig = (overrides: Partial<AuthConfig>): AuthConfig => {
  return { ...defaultAuthConfig, ...overrides };
};
```

### constants.ts - Constantes
```typescript
// src/lib/auth/constants.ts
export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILURE: 'auth:login:failure',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESH: 'auth:token:refresh',
  TOKEN_EXPIRED: 'auth:token:expired',
  SESSION_EXPIRED: 'auth:session:expired',
  SESSION_WARNING: 'auth:session:warning',
  PERMISSION_DENIED: 'auth:permission:denied'
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'wakedock_access_token',
  REFRESH_TOKEN: 'wakedock_refresh_token',
  USER_DATA: 'wakedock_user_data',
  SESSION_DATA: 'wakedock_session_data',
  DEVICE_ID: 'wakedock_device_id'
} as const;

export const PERMISSIONS = {
  READ_CONTAINERS: 'read:containers',
  WRITE_CONTAINERS: 'write:containers',
  DELETE_CONTAINERS: 'delete:containers',
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  DELETE_USERS: 'delete:users',
  READ_SYSTEM: 'read:system',
  WRITE_SYSTEM: 'write:system'
} as const;

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer'
} as const;
```

### errors.ts - Gestion des Erreurs
```typescript
// src/lib/auth/errors.ts
import { AUTH_ERRORS } from './constants';

export class AuthError extends Error {
  public code: string;
  public details?: Record<string, any>;
  public timestamp: Date;

  constructor(
    code: string,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }

  static invalidCredentials(details?: Record<string, any>): AuthError {
    return new AuthError(
      AUTH_ERRORS.INVALID_CREDENTIALS,
      'Invalid username or password',
      details
    );
  }

  static tokenExpired(details?: Record<string, any>): AuthError {
    return new AuthError(
      AUTH_ERRORS.TOKEN_EXPIRED,
      'Authentication token has expired',
      details
    );
  }

  static tokenInvalid(details?: Record<string, any>): AuthError {
    return new AuthError(
      AUTH_ERRORS.TOKEN_INVALID,
      'Invalid authentication token',
      details
    );
  }

  static sessionExpired(details?: Record<string, any>): AuthError {
    return new AuthError(
      AUTH_ERRORS.SESSION_EXPIRED,
      'Session has expired',
      details
    );
  }

  static permissionDenied(details?: Record<string, any>): AuthError {
    return new AuthError(
      AUTH_ERRORS.PERMISSION_DENIED,
      'Permission denied',
      details
    );
  }

  static networkError(details?: Record<string, any>): AuthError {
    return new AuthError(
      AUTH_ERRORS.NETWORK_ERROR,
      'Network error occurred',
      details
    );
  }

  static serverError(details?: Record<string, any>): AuthError {
    return new AuthError(
      AUTH_ERRORS.SERVER_ERROR,
      'Server error occurred',
      details
    );
  }
}
```

### utils.ts - Utilitaires
```typescript
// src/lib/auth/utils.ts
import { User, Permission, Role } from './types';

export const generateDeviceId = (): string => {
  return 'device_' + Math.random().toString(36).substr(2, 9);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const hasPermission = (
  user: User | null,
  permission: string
): boolean => {
  if (!user) return false;
  
  return user.permissions.some(p => p.name === permission);
};

export const hasRole = (user: User | null, role: string): boolean => {
  if (!user) return false;
  
  return user.roles.some(r => r.name === role);
};

export const hasAnyPermission = (
  user: User | null,
  permissions: string[]
): boolean => {
  if (!user) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (
  user: User | null,
  permissions: string[]
): boolean => {
  if (!user) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
};

export const getUserDisplayName = (user: User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username;
};

export const formatLastLogin = (lastLogin: Date | null): string => {
  if (!lastLogin) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - lastLogin.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Recently';
  }
};

export const sanitizeUser = (user: any): User => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatar: user.avatar,
    roles: user.roles || [],
    permissions: user.permissions || [],
    isActive: user.isActive ?? true,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  };
};
```

### validators.ts - Validateurs
```typescript
// src/lib/auth/validators.ts
import { LoginCredentials } from './types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateLoginCredentials = (credentials: LoginCredentials): {
  valid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  if (!credentials.username) {
    errors.username = 'Username is required';
  } else if (!validateEmail(credentials.username)) {
    errors.username = 'Please enter a valid email address';
  }
  
  if (!credentials.password) {
    errors.password = 'Password is required';
  } else if (credentials.password.length < 3) {
    errors.password = 'Password is too short';
  }
  
  if (credentials.mfaCode && !/^\d{6}$/.test(credentials.mfaCode)) {
    errors.mfaCode = 'MFA code must be 6 digits';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePermissionName = (permission: string): boolean => {
  const permissionRegex = /^[a-z]+:[a-z_]+$/;
  return permissionRegex.test(permission);
};

export const validateRoleName = (role: string): boolean => {
  const roleRegex = /^[a-z_]+$/;
  return roleRegex.test(role);
};
```

## 🔧 Composants Core

### core/auth-manager.ts - Gestionnaire Central
```typescript
// src/lib/auth/core/auth-manager.ts
import { AuthState, LoginCredentials, User, AuthConfig } from '../types';
import { TokenManager } from './token-manager';
import { SessionManager } from './session-manager';
import { SecurityManager } from './security-manager';
import { AuthService } from '../services/auth-service';
import { AUTH_EVENTS } from '../constants';
import { AuthError } from '../errors';

export class AuthManager {
  private static instance: AuthManager;
  private tokenManager: TokenManager;
  private sessionManager: SessionManager;
  private securityManager: SecurityManager;
  private authService: AuthService;
  private config: AuthConfig;
  private state: AuthState;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor(config: AuthConfig) {
    this.config = config;
    this.tokenManager = new TokenManager(config);
    this.sessionManager = new SessionManager(config);
    this.securityManager = new SecurityManager(config);
    this.authService = new AuthService(config);
    
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: [],
      roles: [],
      sessionId: null,
      sessionExpiry: null,
      lastActivity: null,
      error: null
    };
    
    this.initializeAuth();
  }

  static getInstance(config: AuthConfig): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager(config);
    }
    return AuthManager.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      this.setState({ isLoading: true });
      
      // Vérifier s'il y a un token valide
      const token = this.tokenManager.getToken();
      if (token && !this.tokenManager.isTokenExpired(token)) {
        const user = await this.authService.getCurrentUser();
        this.setAuthenticatedState(user);
      }
    } catch (error) {
      this.handleAuthError(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async login(credentials: LoginCredentials): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      
      const response = await this.authService.login(credentials);
      
      // Stocker les tokens
      await this.tokenManager.setTokens(
        response.access_token,
        response.refresh_token
      );
      
      // Démarrer la session
      await this.sessionManager.startSession(response.session);
      
      // Mettre à jour l'état
      this.setAuthenticatedState(response.user);
      
      this.emit(AUTH_EVENTS.LOGIN_SUCCESS, response.user);
      
    } catch (error) {
      this.handleAuthError(error);
      this.emit(AUTH_EVENTS.LOGIN_FAILURE, error);
      throw error;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async logout(): Promise<void> {
    try {
      this.setState({ isLoading: true });
      
      const refreshToken = this.tokenManager.getRefreshToken();
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      
      // Nettoyer les données locales
      await this.tokenManager.clearTokens();
      await this.sessionManager.endSession();
      
      this.setUnauthenticatedState();
      this.emit(AUTH_EVENTS.LOGOUT);
      
    } catch (error) {
      this.handleAuthError(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  private setAuthenticatedState(user: User): void {
    this.setState({
      user,
      isAuthenticated: true,
      permissions: user.permissions.map(p => p.name),
      roles: user.roles.map(r => r.name),
      error: null
    });
  }

  private setUnauthenticatedState(): void {
    this.setState({
      user: null,
      isAuthenticated: false,
      permissions: [],
      roles: [],
      sessionId: null,
      sessionExpiry: null,
      lastActivity: null,
      error: null
    });
  }

  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('state-change', this.state);
  }

  private handleAuthError(error: any): void {
    const authError = error instanceof AuthError ? error : AuthError.serverError();
    this.setState({ error: authError });
  }

  // Event system
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters
  getState(): AuthState {
    return { ...this.state };
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  hasPermission(permission: string): boolean {
    return this.state.permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    return this.state.roles.includes(role);
  }
}
```

## 🔗 Integration Pattern

### Utilisation dans une Page
```typescript
// src/pages/dashboard.tsx
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/lib/auth';

export default function Dashboard() {
  const { user, isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <ProtectedRoute requiredPermissions={['read:containers']}>
      <div>
        <h1>Welcome, {user?.firstName}!</h1>
        {hasPermission('write:containers') && (
          <button>Create Container</button>
        )}
      </div>
    </ProtectedRoute>
  );
}
```

### Configuration dans l'Application
```typescript
// src/app.tsx
import { AuthProvider, createAuthConfig } from '@/lib/auth';

const authConfig = createAuthConfig({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  debug: process.env.NODE_ENV === 'development'
});

export default function App() {
  return (
    <AuthProvider config={authConfig}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

---

*Cette structure modulaire garantit une gestion d'authentification maintien-able et extensible pour WakeDock.*