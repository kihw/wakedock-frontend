# Interfaces TypeScript - Authentification

## 📋 Vue d'ensemble

Ce document définit toutes les interfaces TypeScript pour le système d'authentification de WakeDock.

## 🔐 Interfaces d'Authentification

### TokenManager - Gestionnaire de Tokens

```typescript
interface TokenManager {
  // Gestion des tokens
  getToken(): string | null;
  setToken(token: string): Promise<void>;
  getRefreshToken(): string | null;
  setRefreshToken(token: string): Promise<void>;
  
  // Refresh et validation
  refreshToken(): Promise<string>;
  validateToken(): Promise<boolean>;
  revokeToken(): Promise<void>;
  
  // Métadonnées
  getTokenExpiry(): Date | null;
  getTokenPayload(): JWTPayload | null;
  isTokenExpired(): boolean;
  
  // Stockage sécurisé
  clearTokens(): Promise<void>;
  getStorageType(): 'localStorage' | 'sessionStorage' | 'memory';
  
  // Événements
  onTokenRefresh?: (token: string) => void;
  onTokenExpired?: () => void;
  onTokenError?: (error: Error) => void;
}
```

### AuthState - État d'Authentification

```typescript
interface AuthState {
  // État utilisateur
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Permissions et rôles
  permissions: string[];
  roles: string[];
  
  // Session
  sessionId: string | null;
  sessionExpiry: Date | null;
  lastActivity: Date | null;
  
  // Configuration
  rememberMe: boolean;
  multiFactorEnabled: boolean;
  
  // Métadonnées
  loginTime: Date | null;
  deviceId: string | null;
  ipAddress: string | null;
  
  // Erreurs
  error: AuthError | null;
  
  // État de synchronisation
  isSyncing: boolean;
  lastSync: Date | null;
}
```

### User - Utilisateur

```typescript
interface User {
  // Identification
  id: string;
  username: string;
  email: string;
  
  // Informations personnelles
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  
  // État du compte
  isActive: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  
  // Sécurité
  lastLogin: Date | null;
  passwordChangedAt: Date | null;
  failedLoginAttempts: number;
  
  // Préférences
  preferences: UserPreferences;
  settings: UserSettings;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  
  // Rôles et permissions
  roles: Role[];
  permissions: Permission[];
}
```

### AuthError - Erreur d'Authentification

```typescript
interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
  
  // Types d'erreurs
  type: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 
        'NETWORK_ERROR' | 'SERVER_ERROR' | 'RATE_LIMITED' | 
        'ACCOUNT_LOCKED' | 'MFA_REQUIRED' | 'SESSION_EXPIRED';
}
```

### JWTPayload - Payload JWT

```typescript
interface JWTPayload {
  // Standard JWT claims
  sub: string;          // Subject (user ID)
  iss: string;          // Issuer
  aud: string;          // Audience
  exp: number;          // Expiration time
  iat: number;          // Issued at
  nbf: number;          // Not before
  jti: string;          // JWT ID
  
  // Custom claims
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  deviceId: string;
  
  // Metadata
  tokenType: 'access' | 'refresh';
  scope: string[];
}
```

## 🎛️ Interfaces de Configuration

### AuthConfig - Configuration d'Authentification

```typescript
interface AuthConfig {
  // API Configuration
  apiUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  logoutEndpoint: string;
  
  // Token Configuration
  tokenKey: string;
  refreshTokenKey: string;
  tokenExpiry: number;
  refreshTokenExpiry: number;
  
  // Storage Configuration
  storageType: 'localStorage' | 'sessionStorage' | 'memory';
  storagePrefix: string;
  
  // Security Configuration
  enableCSRF: boolean;
  enableRateLimit: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  
  // Session Configuration
  sessionTimeout: number;
  extendOnActivity: boolean;
  multiTabSupport: boolean;
  
  // Features
  enableRememberMe: boolean;
  enableMFA: boolean;
  enableAuditLog: boolean;
  
  // Debugging
  debug: boolean;
  verbose: boolean;
}
```

### SessionConfig - Configuration de Session

```typescript
interface SessionConfig {
  // Timeout
  timeout: number;
  warningTime: number;
  
  // Activity tracking
  trackActivity: boolean;
  activityEvents: string[];
  
  // Multi-tab
  multiTab: boolean;
  syncAcrossTabs: boolean;
  
  // Persistence
  persistent: boolean;
  storageKey: string;
  
  // Callbacks
  onSessionStart?: (session: Session) => void;
  onSessionEnd?: (session: Session) => void;
  onSessionWarning?: (remainingTime: number) => void;
  onSessionExpired?: () => void;
}
```

## 🔒 Interfaces de Sécurité

### SecurityManager - Gestionnaire de Sécurité

```typescript
interface SecurityManager {
  // CSRF Protection
  generateCSRFToken(): string;
  validateCSRFToken(token: string): boolean;
  
  // Rate Limiting
  checkRateLimit(identifier: string): boolean;
  recordAttempt(identifier: string): void;
  
  // Audit Logging
  logSecurityEvent(event: SecurityEvent): void;
  getSecurityLogs(): SecurityEvent[];
  
  // Device Management
  registerDevice(device: Device): void;
  validateDevice(deviceId: string): boolean;
  
  // Suspicious Activity
  detectSuspiciousActivity(activity: Activity): boolean;
  handleSuspiciousActivity(activity: Activity): void;
}
```

### SecurityEvent - Événement de Sécurité

```typescript
interface SecurityEvent {
  id: string;
  type: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH' | 'FAILED_LOGIN' | 
        'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED' | 'CSRF_ATTACK';
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
```

### Permission - Permission

```typescript
interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}
```

### Role - Rôle

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number;
  isSystem: boolean;
}
```

## 📱 Interfaces de Session

### Session - Session

```typescript
interface Session {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  
  // Timestamps
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  
  // État
  isActive: boolean;
  isExpired: boolean;
  
  // Données
  data: Record<string, any>;
  
  // Métadonnées
  loginMethod: 'password' | 'oauth' | 'mfa';
  rememberMe: boolean;
  
  // Tracking
  activities: Activity[];
  
  // Méthodes
  extend(): void;
  destroy(): void;
  isValid(): boolean;
}
```

### Activity - Activité

```typescript
interface Activity {
  id: string;
  sessionId: string;
  userId: string;
  action: string;
  resource?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  success: boolean;
}
```

## 🔄 Interfaces de Store

### AuthStore - Store d'Authentification

```typescript
interface AuthStore {
  // État
  state: AuthState;
  
  // Actions
  login(credentials: LoginCredentials): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
  
  // Mutations
  setUser(user: User): void;
  setLoading(loading: boolean): void;
  setError(error: AuthError | null): void;
  
  // Getters
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
  getPermissions(): string[];
  hasPermission(permission: string): boolean;
  
  // Subscriptions
  subscribe(callback: (state: AuthState) => void): () => void;
  
  // Persistence
  persist(): void;
  restore(): void;
  clear(): void;
}
```

### LoginCredentials - Identifiants de Connexion

```typescript
interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
  deviceId?: string;
}
```

### UserPreferences - Préférences Utilisateur

```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}
```

### UserSettings - Paramètres Utilisateur

```typescript
interface UserSettings {
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
    analytics: boolean;
  };
  account: {
    autoLogout: boolean;
    rememberDevices: boolean;
    emailVerification: boolean;
  };
}
```

## 🔧 Interfaces Utilitaires

### AuthValidator - Validateur d'Authentification

```typescript
interface AuthValidator {
  validateCredentials(credentials: LoginCredentials): ValidationResult;
  validateToken(token: string): ValidationResult;
  validatePermission(permission: string, context?: any): ValidationResult;
  validateSession(session: Session): ValidationResult;
}
```

### ValidationResult - Résultat de Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  details?: Record<string, any>;
}
```

### Device - Appareil

```typescript
interface Device {
  id: string;
  userId: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  ipAddress: string;
  lastSeen: Date;
  isVerified: boolean;
  isTrusted: boolean;
}
```

## 🧪 Interfaces de Test

### AuthMock - Mock d'Authentification

```typescript
interface AuthMock {
  mockUser: User;
  mockToken: string;
  mockRefreshToken: string;
  mockError: AuthError;
  
  // Méthodes de mock
  mockLogin(): Promise<void>;
  mockLogout(): Promise<void>;
  mockRefresh(): Promise<string>;
  mockValidation(): Promise<boolean>;
  
  // Simulation d'erreurs
  simulateError(error: AuthError): void;
  simulateNetworkError(): void;
  simulateTokenExpiry(): void;
}
```

### TestScenario - Scénario de Test

```typescript
interface TestScenario {
  name: string;
  description: string;
  steps: TestStep[];
  expectedResult: any;
  setup?: () => void;
  teardown?: () => void;
}
```

### TestStep - Étape de Test

```typescript
interface TestStep {
  action: string;
  params?: Record<string, any>;
  expected?: any;
  timeout?: number;
}
```

---

*Ces interfaces TypeScript garantissent la cohérence et la sécurité du système d'authentification WakeDock.*