# Architecture /src/lib/sw/ - Service Worker Frontend

## 📋 Vue d'ensemble

Ce document détaille l'architecture complète du dossier `/src/lib/sw/` pour le Service Worker frontend de WakeDock, incluant la gestion du cache, le mode hors ligne et les performances.

## 🏗️ Structure des Dossiers

```
src/lib/sw/
├── index.ts                    # Export principal du module SW
├── types.ts                    # Types et interfaces TypeScript
├── config.ts                   # Configuration du Service Worker
├── constants.ts                # Constantes et énumérations
├── utils.ts                    # Utilitaires généraux
├── core/                       # Composants principaux
│   ├── index.ts
│   ├── service-worker-manager.ts  # Gestionnaire principal du SW
│   ├── cache-manager.ts           # Gestionnaire de cache
│   ├── offline-manager.ts         # Gestionnaire hors ligne
│   ├── network-detector.ts        # Détection réseau
│   ├── sync-manager.ts            # Gestionnaire de synchronisation
│   └── performance-monitor.ts     # Monitoring des performances
├── strategies/                 # Stratégies de cache
│   ├── index.ts
│   ├── cache-first.ts             # Stratégie Cache First
│   ├── network-first.ts           # Stratégie Network First
│   ├── stale-while-revalidate.ts  # Stratégie Stale While Revalidate
│   └── network-only.ts            # Stratégie Network Only
├── storage/                    # Gestion du stockage
│   ├── index.ts
│   ├── cache-storage.ts           # Stockage cache
│   ├── indexed-db.ts              # IndexedDB wrapper
│   ├── local-storage.ts           # LocalStorage wrapper
│   └── memory-storage.ts          # Stockage en mémoire
├── queue/                      # Gestion des queues
│   ├── index.ts
│   ├── offline-queue.ts           # Queue hors ligne
│   ├── sync-queue.ts              # Queue de synchronisation
│   └── priority-queue.ts          # Queue avec priorité
├── events/                     # Gestion d'événements
│   ├── index.ts
│   ├── event-emitter.ts           # Émetteur d'événements
│   ├── sw-events.ts               # Événements du Service Worker
│   └── message-handler.ts         # Gestionnaire de messages
├── workers/                    # Web Workers
│   ├── index.ts
│   ├── cache-worker.ts            # Worker pour le cache
│   ├── sync-worker.ts             # Worker pour la synchronisation
│   └── metrics-worker.ts          # Worker pour les métriques
├── middleware/                 # Middleware du Service Worker
│   ├── index.ts
│   ├── request-interceptor.ts     # Intercepteur de requêtes
│   ├── response-transformer.ts    # Transformateur de réponses
│   └── error-handler.ts           # Gestionnaire d'erreurs
├── plugins/                    # Plugins extensibles
│   ├── index.ts
│   ├── base-plugin.ts             # Plugin de base
│   ├── metrics-plugin.ts          # Plugin de métriques
│   └── debug-plugin.ts            # Plugin de debug
├── hooks/                      # Hooks React/Svelte
│   ├── index.ts
│   ├── use-service-worker.ts      # Hook principal SW
│   ├── use-network-status.ts      # Hook statut réseau
│   ├── use-cache-status.ts        # Hook statut cache
│   └── use-offline-queue.ts       # Hook queue hors ligne
├── components/                 # Composants UI
│   ├── index.ts
│   ├── ServiceWorkerProvider.tsx  # Provider du Service Worker
│   ├── NetworkStatus.tsx          # Indicateur réseau
│   ├── CacheStatus.tsx            # Indicateur cache
│   └── OfflineNotification.tsx    # Notification hors ligne
└── __tests__/                  # Tests
    ├── core/
    ├── strategies/
    ├── storage/
    ├── queue/
    ├── events/
    └── hooks/
```

## 📁 Fichiers Principaux

### index.ts - Export Principal
```typescript
// src/lib/sw/index.ts
export * from './types';
export * from './config';
export * from './constants';
export * from './utils';

// Core exports
export { ServiceWorkerManager } from './core/service-worker-manager';
export { CacheManager } from './core/cache-manager';
export { OfflineManager } from './core/offline-manager';
export { NetworkDetector } from './core/network-detector';
export { SyncManager } from './core/sync-manager';
export { PerformanceMonitor } from './core/performance-monitor';

// Strategy exports
export { CacheFirstStrategy } from './strategies/cache-first';
export { NetworkFirstStrategy } from './strategies/network-first';
export { StaleWhileRevalidateStrategy } from './strategies/stale-while-revalidate';
export { NetworkOnlyStrategy } from './strategies/network-only';

// Storage exports
export { CacheStorage } from './storage/cache-storage';
export { IndexedDBStorage } from './storage/indexed-db';
export { LocalStorageWrapper } from './storage/local-storage';
export { MemoryStorage } from './storage/memory-storage';

// Queue exports
export { OfflineQueue } from './queue/offline-queue';
export { SyncQueue } from './queue/sync-queue';
export { PriorityQueue } from './queue/priority-queue';

// Hook exports
export { useServiceWorker } from './hooks/use-service-worker';
export { useNetworkStatus } from './hooks/use-network-status';
export { useCacheStatus } from './hooks/use-cache-status';
export { useOfflineQueue } from './hooks/use-offline-queue';

// Component exports
export { ServiceWorkerProvider } from './components/ServiceWorkerProvider';
export { NetworkStatus } from './components/NetworkStatus';
export { CacheStatus } from './components/CacheStatus';
export { OfflineNotification } from './components/OfflineNotification';
```

### types.ts - Types et Interfaces
```typescript
// src/lib/sw/types.ts
export interface ServiceWorkerConfig {
  version: string;
  debug: boolean;
  enableMetrics: boolean;
  cacheStrategies: CacheStrategies;
  offlineQueue: OfflineQueueConfig;
  syncConfig: SyncConfig;
  storageConfig: StorageConfig;
  networkConfig: NetworkConfig;
}

export interface CacheStrategies {
  static: CacheStrategyConfig;
  api: CacheStrategyConfig;
  documents: CacheStrategyConfig;
  userData: CacheStrategyConfig;
  media: CacheStrategyConfig;
}

export interface CacheStrategyConfig {
  strategy: CacheStrategy;
  maxAge: number;
  maxEntries: number;
  compression: boolean;
  priority: CachePriority;
  includePatterns?: RegExp[];
  excludePatterns?: RegExp[];
  networkTimeoutMs?: number;
  retryAttempts?: number;
  validateResponse?: (response: Response) => boolean;
}

export type CacheStrategy = 
  | 'cacheFirst' 
  | 'networkFirst' 
  | 'staleWhileRevalidate' 
  | 'networkOnly';

export type CachePriority = 'high' | 'medium' | 'low';

export interface OfflineQueueConfig {
  maxSize: number;
  persistentStorage: boolean;
  syncInterval: number;
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  retryBackoff: number;
}

export interface SyncConfig {
  backgroundSync: boolean;
  syncInterval: number;
  maxSyncAttempts: number;
  syncBatchSize: number;
  conflictResolution: ConflictResolution;
}

export type ConflictResolution = 'overwrite' | 'merge' | 'skip' | 'ask';

export interface StorageConfig {
  cacheStorageQuota: number;
  indexedDBQuota: number;
  localStorageQuota: number;
  cleanupInterval: number;
}

export interface NetworkConfig {
  timeoutMs: number;
  retryAttempts: number;
  retryDelay: number;
  slowNetworkThreshold: number;
}

export interface OfflineRequest {
  id: string;
  url: string;
  method: HTTPMethod;
  headers: Record<string, string>;
  body: string | FormData | ArrayBuffer | null;
  timestamp: number;
  priority: number;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
  expiresAt: number;
  metadata?: RequestMetadata;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestMetadata {
  operation: string;
  resourceId?: string;
  resourceType?: string;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface CacheEntry {
  key: string;
  url: string;
  request: Request;
  response: Response;
  timestamp: number;
  expiresAt: number;
  strategy: CacheStrategy;
  priority: CachePriority;
  size: number;
  hits: number;
  lastAccess: number;
  metadata?: CacheMetadata;
}

export interface CacheMetadata {
  version: string;
  compressed: boolean;
  mimeType: string;
  etag?: string;
  lastModified?: string;
}

export interface NetworkStatus {
  online: boolean;
  connectionType: ConnectionType;
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export type ConnectionType = 
  | 'bluetooth' 
  | 'cellular' 
  | 'ethernet' 
  | 'none' 
  | 'wifi' 
  | 'wimax' 
  | 'other' 
  | 'unknown';

export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

export interface PerformanceMetrics {
  cacheHitRate: number;
  cacheMissRate: number;
  averageResponseTime: number;
  networkSavings: number;
  offlineRequestsQueued: number;
  offlineRequestsCompleted: number;
  offlineRequestsFailed: number;
  syncSuccessRate: number;
  storageUsage: StorageUsage;
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  errorRate: number;
  availability: number;
  lastUpdated: number;
}

export interface StorageUsage {
  total: number;
  available: number;
  quota: number;
  byType: Record<string, number>;
  utilization: number;
}

export interface SWEvent {
  type: string;
  timestamp: number;
  data?: any;
  source?: string;
}

export interface SWEventHandler {
  (event: SWEvent): void | Promise<void>;
}

export interface Plugin {
  name: string;
  version: string;
  install(manager: ServiceWorkerManager): void;
  uninstall(): void;
}

export interface PluginConfig {
  enabled: boolean;
  options: Record<string, any>;
}
```

### config.ts - Configuration
```typescript
// src/lib/sw/config.ts
import { ServiceWorkerConfig } from './types';

export const defaultServiceWorkerConfig: ServiceWorkerConfig = {
  version: '1.0.0',
  debug: process.env.NODE_ENV === 'development',
  enableMetrics: true,
  
  cacheStrategies: {
    static: {
      strategy: 'cacheFirst',
      maxAge: 31536000, // 1 an
      maxEntries: 1000,
      compression: true,
      priority: 'high',
      includePatterns: [/\.(js|css|png|jpg|jpeg|gif|svg|woff2?)$/],
      networkTimeoutMs: 5000,
      retryAttempts: 3
    },
    
    api: {
      strategy: 'networkFirst',
      maxAge: 300, // 5 minutes
      maxEntries: 500,
      compression: true,
      priority: 'medium',
      includePatterns: [/\/api\//],
      networkTimeoutMs: 3000,
      retryAttempts: 2
    },
    
    documents: {
      strategy: 'staleWhileRevalidate',
      maxAge: 3600, // 1 heure
      maxEntries: 100,
      compression: true,
      priority: 'high',
      includePatterns: [/\.html$/],
      networkTimeoutMs: 4000,
      retryAttempts: 1
    },
    
    userData: {
      strategy: 'networkFirst',
      maxAge: 60, // 1 minute
      maxEntries: 200,
      compression: false,
      priority: 'high',
      includePatterns: [/\/user\//],
      networkTimeoutMs: 1000,
      retryAttempts: 3
    },
    
    media: {
      strategy: 'cacheFirst',
      maxAge: 2592000, // 30 jours
      maxEntries: 200,
      compression: false,
      priority: 'low',
      includePatterns: [/\.(mp4|webm|mp3|wav|pdf)$/],
      networkTimeoutMs: 10000,
      retryAttempts: 1
    }
  },
  
  offlineQueue: {
    maxSize: 1000,
    persistentStorage: true,
    syncInterval: 30000, // 30 secondes
    batchSize: 10,
    maxRetries: 3,
    retryDelay: 1000,
    retryBackoff: 2
  },
  
  syncConfig: {
    backgroundSync: true,
    syncInterval: 60000, // 1 minute
    maxSyncAttempts: 5,
    syncBatchSize: 20,
    conflictResolution: 'merge'
  },
  
  storageConfig: {
    cacheStorageQuota: 100 * 1024 * 1024, // 100MB
    indexedDBQuota: 50 * 1024 * 1024,     // 50MB
    localStorageQuota: 10 * 1024 * 1024,   // 10MB
    cleanupInterval: 24 * 60 * 60 * 1000   // 24 heures
  },
  
  networkConfig: {
    timeoutMs: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
    slowNetworkThreshold: 4000
  }
};

export const createServiceWorkerConfig = (
  overrides: Partial<ServiceWorkerConfig>
): ServiceWorkerConfig => {
  return {
    ...defaultServiceWorkerConfig,
    ...overrides,
    cacheStrategies: {
      ...defaultServiceWorkerConfig.cacheStrategies,
      ...overrides.cacheStrategies
    },
    offlineQueue: {
      ...defaultServiceWorkerConfig.offlineQueue,
      ...overrides.offlineQueue
    },
    syncConfig: {
      ...defaultServiceWorkerConfig.syncConfig,
      ...overrides.syncConfig
    },
    storageConfig: {
      ...defaultServiceWorkerConfig.storageConfig,
      ...overrides.storageConfig
    },
    networkConfig: {
      ...defaultServiceWorkerConfig.networkConfig,
      ...overrides.networkConfig
    }
  };
};
```

### constants.ts - Constantes
```typescript
// src/lib/sw/constants.ts
export const SW_EVENTS = {
  // Événements du Service Worker
  INSTALL: 'sw:install',
  ACTIVATE: 'sw:activate',
  FETCH: 'sw:fetch',
  SYNC: 'sw:sync',
  MESSAGE: 'sw:message',
  
  // Événements de cache
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  CACHE_ERROR: 'cache:error',
  CACHE_CLEANUP: 'cache:cleanup',
  
  // Événements réseau
  NETWORK_ONLINE: 'network:online',
  NETWORK_OFFLINE: 'network:offline',
  NETWORK_SLOW: 'network:slow',
  
  // Événements de synchronisation
  SYNC_START: 'sync:start',
  SYNC_SUCCESS: 'sync:success',
  SYNC_FAILURE: 'sync:failure',
  SYNC_COMPLETE: 'sync:complete',
  
  // Événements de queue
  QUEUE_ADD: 'queue:add',
  QUEUE_PROCESS: 'queue:process',
  QUEUE_EMPTY: 'queue:empty',
  QUEUE_FULL: 'queue:full',
  
  // Événements de performance
  PERFORMANCE_METRIC: 'performance:metric',
  PERFORMANCE_ALERT: 'performance:alert'
} as const;

export const CACHE_NAMES = {
  STATIC: 'wakedock-static-v1',
  API: 'wakedock-api-v1',
  DOCUMENTS: 'wakedock-documents-v1',
  USER_DATA: 'wakedock-userdata-v1',
  MEDIA: 'wakedock-media-v1',
  OFFLINE_QUEUE: 'wakedock-offline-queue-v1'
} as const;

export const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'wakedock_offline_queue',
  SYNC_QUEUE: 'wakedock_sync_queue',
  METRICS: 'wakedock_sw_metrics',
  CONFIG: 'wakedock_sw_config',
  NETWORK_STATUS: 'wakedock_network_status'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

export const MIME_TYPES = {
  HTML: 'text/html',
  CSS: 'text/css',
  JS: 'application/javascript',
  JSON: 'application/json',
  PNG: 'image/png',
  JPG: 'image/jpeg',
  SVG: 'image/svg+xml',
  WOFF2: 'font/woff2'
} as const;

export const NETWORK_TYPES = {
  WIFI: 'wifi',
  CELLULAR: 'cellular',
  ETHERNET: 'ethernet',
  BLUETOOTH: 'bluetooth',
  NONE: 'none',
  UNKNOWN: 'unknown'
} as const;

export const PERFORMANCE_THRESHOLDS = {
  CACHE_HIT_RATE_MIN: 0.85,
  PAGE_LOAD_TIME_MAX: 2000,
  NETWORK_TIMEOUT_MAX: 5000,
  STORAGE_USAGE_MAX: 0.8,
  ERROR_RATE_MAX: 0.05
} as const;

export const RETRY_STRATEGIES = {
  EXPONENTIAL: 'exponential',
  LINEAR: 'linear',
  FIXED: 'fixed'
} as const;

export const COMPRESSION_TYPES = {
  GZIP: 'gzip',
  DEFLATE: 'deflate',
  BROTLI: 'br'
} as const;
```

### utils.ts - Utilitaires
```typescript
// src/lib/sw/utils.ts
import { CacheEntry, NetworkStatus, PerformanceMetrics } from './types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateCacheKey = (request: Request): string => {
  const url = new URL(request.url);
  const method = request.method;
  
  // Normaliser l'URL
  url.search = '';
  url.hash = '';
  
  return `${method}:${url.toString()}`;
};

export const isValidResponse = (response: Response): boolean => {
  return response.status >= 200 && response.status < 300;
};

export const isNetworkError = (error: Error): boolean => {
  return error.name === 'NetworkError' || 
         error.name === 'TypeError' || 
         error.message.includes('fetch');
};

export const shouldCache = (request: Request, response: Response): boolean => {
  // Ne pas cacher les requêtes POST/PUT/DELETE
  if (request.method !== 'GET') {
    return false;
  }
  
  // Ne pas cacher les réponses d'erreur
  if (!isValidResponse(response)) {
    return false;
  }
  
  // Ne pas cacher les réponses avec Cache-Control: no-cache
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl && cacheControl.includes('no-cache')) {
    return false;
  }
  
  return true;
};

export const getCacheExpiry = (response: Response): number => {
  const cacheControl = response.headers.get('cache-control');
  
  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      return parseInt(maxAgeMatch[1]) * 1000; // Convertir en millisecondes
    }
  }
  
  const expires = response.headers.get('expires');
  if (expires) {
    const expiryDate = new Date(expires);
    return expiryDate.getTime() - Date.now();
  }
  
  // Valeur par défaut : 1 heure
  return 3600000;
};

export const compressData = async (data: string): Promise<Uint8Array> => {
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  writer.write(new TextEncoder().encode(data));
  writer.close();
  
  const chunks: Uint8Array[] = [];
  let result = await reader.read();
  
  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read();
  }
  
  return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
};

export const decompressData = async (data: Uint8Array): Promise<string> => {
  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  writer.write(data);
  writer.close();
  
  const chunks: Uint8Array[] = [];
  let result = await reader.read();
  
  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read();
  }
  
  const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
  return new TextDecoder().decode(decompressed);
};

export const calculateStorageUsage = (entries: CacheEntry[]): number => {
  return entries.reduce((total, entry) => total + entry.size, 0);
};

export const sortEntriesByPriority = (entries: CacheEntry[]): CacheEntry[] => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return entries.sort((a, b) => {
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Si même priorité, trier par dernier accès
    return b.lastAccess - a.lastAccess;
  });
};

export const isExpired = (entry: CacheEntry): boolean => {
  return Date.now() > entry.expiresAt;
};

export const getNetworkType = (): string => {
  const connection = (navigator as any).connection;
  return connection ? connection.type : 'unknown';
};

export const getEffectiveConnectionType = (): string => {
  const connection = (navigator as any).connection;
  return connection ? connection.effectiveType : '4g';
};

export const isSlowNetwork = (): boolean => {
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.downlink < 1.5;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

export const createPromiseWithTimeout = <T>(
  promise: Promise<T>,
  timeout: number,
  timeoutError?: Error
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(timeoutError || new Error('Promise timed out'));
    }, timeout);
    
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, attempts - 1, delay * backoff, backoff);
  }
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const waitForNetwork = (): Promise<void> => {
  return new Promise(resolve => {
    if (isOnline()) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
};

export const parseURLPattern = (pattern: string): RegExp => {
  // Convertir les patterns d'URL en expressions régulières
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '\\?')
    .replace(/\./g, '\\.');
  
  return new RegExp(regexPattern);
};

export const matchesPattern = (url: string, patterns: RegExp[]): boolean => {
  return patterns.some(pattern => pattern.test(url));
};

export const cleanupExpiredEntries = (entries: CacheEntry[]): CacheEntry[] => {
  return entries.filter(entry => !isExpired(entry));
};

export const groupEntriesByStrategy = (entries: CacheEntry[]): Record<string, CacheEntry[]> => {
  return entries.reduce((groups, entry) => {
    const strategy = entry.strategy;
    if (!groups[strategy]) {
      groups[strategy] = [];
    }
    groups[strategy].push(entry);
    return groups;
  }, {} as Record<string, CacheEntry[]>);
};
```

## 🔧 Composants Core

### core/service-worker-manager.ts - Gestionnaire Principal
```typescript
// src/lib/sw/core/service-worker-manager.ts
import { ServiceWorkerConfig, Plugin, SWEvent } from '../types';
import { CacheManager } from './cache-manager';
import { OfflineManager } from './offline-manager';
import { NetworkDetector } from './network-detector';
import { SyncManager } from './sync-manager';
import { PerformanceMonitor } from './performance-monitor';
import { EventEmitter } from '../events/event-emitter';
import { SW_EVENTS } from '../constants';

export class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private cacheManager: CacheManager;
  private offlineManager: OfflineManager;
  private networkDetector: NetworkDetector;
  private syncManager: SyncManager;
  private performanceMonitor: PerformanceMonitor;
  private eventEmitter: EventEmitter;
  private plugins: Map<string, Plugin> = new Map();
  private isInitialized: boolean = false;

  constructor(config: ServiceWorkerConfig) {
    this.config = config;
    this.eventEmitter = new EventEmitter();
    
    // Initialiser les composants
    this.cacheManager = new CacheManager(config, this.eventEmitter);
    this.offlineManager = new OfflineManager(config, this.eventEmitter);
    this.networkDetector = new NetworkDetector(config, this.eventEmitter);
    this.syncManager = new SyncManager(config, this.eventEmitter);
    this.performanceMonitor = new PerformanceMonitor(config, this.eventEmitter);
    
    this.setupEventListeners();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialiser tous les composants
      await Promise.all([
        this.cacheManager.initialize(),
        this.offlineManager.initialize(),
        this.networkDetector.initialize(),
        this.syncManager.initialize(),
        this.performanceMonitor.initialize()
      ]);

      // Installer les plugins
      this.plugins.forEach(plugin => {
        plugin.install(this);
      });

      this.isInitialized = true;
      this.emit(SW_EVENTS.INSTALL, { timestamp: Date.now() });

      if (this.config.debug) {
        console.log('ServiceWorkerManager initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize ServiceWorkerManager:', error);
      throw error;
    }
  }

  async handleFetch(event: FetchEvent): Promise<Response> {
    const request = event.request;
    const startTime = Date.now();

    try {
      // Émettre l'événement fetch
      this.emit(SW_EVENTS.FETCH, {
        url: request.url,
        method: request.method,
        timestamp: startTime
      });

      // Laisser le cache manager gérer la requête
      const response = await this.cacheManager.handleRequest(request);

      // Enregistrer les métriques
      const duration = Date.now() - startTime;
      this.performanceMonitor.recordRequestTime(duration);

      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      
      // Essayer de servir depuis le cache hors ligne
      const cachedResponse = await this.cacheManager.getCachedResponse(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Retourner une réponse d'erreur
      return new Response('Service unavailable', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
  }

  async handleSync(event: SyncEvent): Promise<void> {
    this.emit(SW_EVENTS.SYNC, {
      tag: event.tag,
      timestamp: Date.now()
    });

    if (event.tag === 'background-sync') {
      await this.syncManager.performSync();
    }
  }

  async handleMessage(event: MessageEvent): Promise<void> {
    const { type, data } = event.data;

    this.emit(SW_EVENTS.MESSAGE, {
      type,
      data,
      timestamp: Date.now()
    });

    switch (type) {
      case 'SKIP_WAITING':
        await this.skipWaiting();
        break;
      case 'CLAIM_CLIENTS':
        await this.claimClients();
        break;
      case 'GET_CACHE_STATUS':
        const cacheStatus = await this.cacheManager.getStatus();
        event.ports[0].postMessage({ type: 'CACHE_STATUS', data: cacheStatus });
        break;
      case 'CLEAR_CACHE':
        await this.cacheManager.clearAll();
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
        break;
      case 'GET_METRICS':
        const metrics = await this.performanceMonitor.getMetrics();
        event.ports[0].postMessage({ type: 'METRICS', data: metrics });
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  private setupEventListeners(): void {
    // Écouter les événements réseau
    this.networkDetector.on('online', () => {
      this.emit(SW_EVENTS.NETWORK_ONLINE);
      this.syncManager.startSync();
    });

    this.networkDetector.on('offline', () => {
      this.emit(SW_EVENTS.NETWORK_OFFLINE);
      this.syncManager.pauseSync();
    });

    // Écouter les événements de cache
    this.cacheManager.on('hit', (data) => {
      this.emit(SW_EVENTS.CACHE_HIT, data);
      this.performanceMonitor.recordCacheHit();
    });

    this.cacheManager.on('miss', (data) => {
      this.emit(SW_EVENTS.CACHE_MISS, data);
      this.performanceMonitor.recordCacheMiss();
    });

    // Écouter les événements de synchronisation
    this.syncManager.on('sync-success', (data) => {
      this.emit(SW_EVENTS.SYNC_SUCCESS, data);
    });

    this.syncManager.on('sync-failure', (data) => {
      this.emit(SW_EVENTS.SYNC_FAILURE, data);
    });
  }

  // Gestion des plugins
  installPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
    
    if (this.isInitialized) {
      plugin.install(this);
    }
  }

  uninstallPlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.uninstall();
      this.plugins.delete(pluginName);
    }
  }

  // Méthodes utilitaires
  private async skipWaiting(): Promise<void> {
    await self.skipWaiting();
  }

  private async claimClients(): Promise<void> {
    await (self as any).clients.claim();
  }

  // Gestion des événements
  on(event: string, handler: (data?: any) => void): void {
    this.eventEmitter.on(event, handler);
  }

  off(event: string, handler: (data?: any) => void): void {
    this.eventEmitter.off(event, handler);
  }

  emit(event: string, data?: any): void {
    this.eventEmitter.emit(event, data);
  }

  // Getters
  getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  getOfflineManager(): OfflineManager {
    return this.offlineManager;
  }

  getNetworkDetector(): NetworkDetector {
    return this.networkDetector;
  }

  getSyncManager(): SyncManager {
    return this.syncManager;
  }

  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  getConfig(): ServiceWorkerConfig {
    return this.config;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
```

## 🎯 Intégration dans l'Application

### Utilisation dans le Service Worker Principal
```typescript
// src/service-worker.ts
import { ServiceWorkerManager } from './lib/sw/core/service-worker-manager';
import { createServiceWorkerConfig } from './lib/sw/config';

const config = createServiceWorkerConfig({
  version: '1.0.0',
  debug: false,
  enableMetrics: true
});

const swManager = new ServiceWorkerManager(config);

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(swManager.initialize());
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(swManager.claimClients());
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(swManager.handleFetch(event));
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  event.waitUntil(swManager.handleSync(event));
});

// Messages
self.addEventListener('message', (event) => {
  event.waitUntil(swManager.handleMessage(event));
});
```

### Utilisation dans l'Application React/Next.js
```typescript
// src/app/layout.tsx
import { ServiceWorkerProvider } from '@/lib/sw/components/ServiceWorkerProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
```

### Hook d'Utilisation
```typescript
// src/components/MyComponent.tsx
import { useServiceWorker, useNetworkStatus } from '@/lib/sw/hooks';

export function MyComponent() {
  const { isReady, cacheStatus, metrics } = useServiceWorker();
  const { isOnline, connectionType } = useNetworkStatus();

  return (
    <div>
      <p>Service Worker: {isReady ? 'Ready' : 'Loading...'}</p>
      <p>Network: {isOnline ? 'Online' : 'Offline'} ({connectionType})</p>
      <p>Cache Hit Rate: {metrics?.cacheHitRate}%</p>
    </div>
  );
}
```

---

*Cette architecture modulaire garantit un Service Worker performant et maintien-able pour WakeDock.*