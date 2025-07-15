# Guide Cache-Manager.ts et Offline-Manager.ts

## 📋 Vue d'ensemble

Ce guide détaille l'implémentation complète des gestionnaires de cache et hors ligne pour le Service Worker de WakeDock.

## 🗂️ Cache-Manager.ts

### Implémentation Complète

```typescript
// src/lib/sw/core/cache-manager.ts
import { 
  CacheStrategyConfig, 
  CacheEntry, 
  CacheStrategy, 
  ServiceWorkerConfig,
  PerformanceMetrics 
} from '../types';
import { EventEmitter } from '../events/event-emitter';
import { CACHE_NAMES, SW_EVENTS } from '../constants';
import { 
  generateCacheKey, 
  shouldCache, 
  getCacheExpiry, 
  isExpired,
  compressData,
  decompressData
} from '../utils';

export class CacheManager {
  private config: ServiceWorkerConfig;
  private eventEmitter: EventEmitter;
  private cacheEntries: Map<string, CacheEntry> = new Map();
  private strategies: Map<CacheStrategy, CacheStrategyHandler> = new Map();
  private cleanupInterval: number;
  private isInitialized: boolean = false;

  constructor(config: ServiceWorkerConfig, eventEmitter: EventEmitter) {
    this.config = config;
    this.eventEmitter = eventEmitter;
    
    // Initialiser les stratégies
    this.initializeStrategies();
    
    // Démarrer le nettoyage automatique
    this.startCleanup();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Charger les entrées de cache existantes
      await this.loadCacheEntries();
      
      // Nettoyer les entrées expirées
      await this.cleanupExpiredEntries();
      
      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('CacheManager initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize CacheManager:', error);
      throw error;
    }
  }

  async handleRequest(request: Request): Promise<Response> {
    const cacheKey = generateCacheKey(request);
    const strategy = this.determineStrategy(request);
    const strategyHandler = this.strategies.get(strategy);
    
    if (!strategyHandler) {
      return fetch(request);
    }

    try {
      const response = await strategyHandler.handle(request, cacheKey);
      
      // Émettre l'événement approprié
      const cached = await this.getCachedEntry(cacheKey);
      if (cached) {
        this.eventEmitter.emit(SW_EVENTS.CACHE_HIT, {
          url: request.url,
          strategy,
          cacheKey,
          timestamp: Date.now()
        });
      } else {
        this.eventEmitter.emit(SW_EVENTS.CACHE_MISS, {
          url: request.url,
          strategy,
          cacheKey,
          timestamp: Date.now()
        });
      }

      return response;
    } catch (error) {
      this.eventEmitter.emit(SW_EVENTS.CACHE_ERROR, {
        url: request.url,
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  private initializeStrategies(): void {
    this.strategies.set('cacheFirst', new CacheFirstHandler(this));
    this.strategies.set('networkFirst', new NetworkFirstHandler(this));
    this.strategies.set('staleWhileRevalidate', new StaleWhileRevalidateHandler(this));
    this.strategies.set('networkOnly', new NetworkOnlyHandler(this));
  }

  private determineStrategy(request: Request): CacheStrategy {
    const url = new URL(request.url);
    
    // Vérifier chaque stratégie configurée
    for (const [type, config] of Object.entries(this.config.cacheStrategies)) {
      if (this.matchesPatterns(url, config.includePatterns)) {
        return config.strategy;
      }
    }
    
    // Stratégie par défaut
    return 'networkFirst';
  }

  private matchesPatterns(url: URL, patterns?: RegExp[]): boolean {
    if (!patterns) return false;
    return patterns.some(pattern => pattern.test(url.pathname));
  }

  async put(request: Request, response: Response, config: CacheStrategyConfig): Promise<void> {
    if (!shouldCache(request, response)) return;

    const cacheKey = generateCacheKey(request);
    const cacheName = this.getCacheName(config.strategy);
    const cache = await caches.open(cacheName);
    
    // Créer l'entrée de cache
    const entry: CacheEntry = {
      key: cacheKey,
      url: request.url,
      request: request.clone(),
      response: response.clone(),
      timestamp: Date.now(),
      expiresAt: Date.now() + (config.maxAge * 1000),
      strategy: config.strategy,
      priority: config.priority,
      size: await this.calculateResponseSize(response.clone()),
      hits: 0,
      lastAccess: Date.now(),
      metadata: {
        version: this.config.version,
        compressed: config.compression,
        mimeType: response.headers.get('content-type') || 'unknown',
        etag: response.headers.get('etag') || undefined,
        lastModified: response.headers.get('last-modified') || undefined
      }
    };

    // Compression si activée
    if (config.compression) {
      entry.response = await this.compressResponse(response.clone());
    }

    // Stocker dans le cache
    await cache.put(request, entry.response);
    
    // Ajouter à la map des entrées
    this.cacheEntries.set(cacheKey, entry);
    
    // Vérifier les limites de cache
    await this.enforceStorageLimits(config);
  }

  async get(request: Request): Promise<Response | null> {
    const cacheKey = generateCacheKey(request);
    const entry = await this.getCachedEntry(cacheKey);
    
    if (!entry) return null;
    
    // Vérifier l'expiration
    if (isExpired(entry)) {
      await this.delete(request);
      return null;
    }
    
    // Mettre à jour les statistiques
    entry.hits++;
    entry.lastAccess = Date.now();
    
    // Décompresser si nécessaire
    if (entry.metadata?.compressed) {
      return await this.decompressResponse(entry.response.clone());
    }
    
    return entry.response.clone();
  }

  async delete(request: Request): Promise<boolean> {
    const cacheKey = generateCacheKey(request);
    const entry = this.cacheEntries.get(cacheKey);
    
    if (!entry) return false;
    
    // Supprimer du cache
    const cacheName = this.getCacheName(entry.strategy);
    const cache = await caches.open(cacheName);
    await cache.delete(request);
    
    // Supprimer de la map
    this.cacheEntries.delete(cacheKey);
    
    return true;
  }

  async clearAll(): Promise<void> {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    
    this.cacheEntries.clear();
    
    this.eventEmitter.emit(SW_EVENTS.CACHE_CLEANUP, {
      type: 'full',
      timestamp: Date.now()
    });
  }

  private async getCachedEntry(cacheKey: string): Promise<CacheEntry | null> {
    const entry = this.cacheEntries.get(cacheKey);
    if (!entry) return null;
    
    // Vérifier dans le cache réel
    const cacheName = this.getCacheName(entry.strategy);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(entry.request);
    
    if (!cachedResponse) {
      this.cacheEntries.delete(cacheKey);
      return null;
    }
    
    return entry;
  }

  private getCacheName(strategy: CacheStrategy): string {
    switch (strategy) {
      case 'cacheFirst':
        return CACHE_NAMES.STATIC;
      case 'networkFirst':
        return CACHE_NAMES.API;
      case 'staleWhileRevalidate':
        return CACHE_NAMES.DOCUMENTS;
      default:
        return CACHE_NAMES.STATIC;
    }
  }

  private async loadCacheEntries(): Promise<void> {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const cacheKey = generateCacheKey(request);
          
          // Reconstruire l'entrée de cache
          const entry: CacheEntry = {
            key: cacheKey,
            url: request.url,
            request,
            response,
            timestamp: Date.now(),
            expiresAt: Date.now() + 3600000, // 1 heure par défaut
            strategy: 'cacheFirst',
            priority: 'medium',
            size: await this.calculateResponseSize(response),
            hits: 0,
            lastAccess: Date.now()
          };
          
          this.cacheEntries.set(cacheKey, entry);
        }
      }
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cacheEntries) {
      if (isExpired(entry)) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      const entry = this.cacheEntries.get(key);
      if (entry) {
        await this.delete(entry.request);
      }
    }
    
    if (expiredKeys.length > 0) {
      this.eventEmitter.emit(SW_EVENTS.CACHE_CLEANUP, {
        type: 'expired',
        count: expiredKeys.length,
        timestamp: Date.now()
      });
    }
  }

  private async enforceStorageLimits(config: CacheStrategyConfig): Promise<void> {
    const entries = Array.from(this.cacheEntries.values());
    const strategyEntries = entries.filter(entry => entry.strategy === config.strategy);
    
    if (strategyEntries.length > config.maxEntries) {
      // Trier par priorité et dernier accès
      const sortedEntries = strategyEntries.sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { low: 0, medium: 1, high: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.lastAccess - b.lastAccess;
      });
      
      // Supprimer les entrées les moins importantes
      const toDelete = sortedEntries.slice(0, sortedEntries.length - config.maxEntries);
      
      for (const entry of toDelete) {
        await this.delete(entry.request);
      }
    }
  }

  private async calculateResponseSize(response: Response): Promise<number> {
    const blob = await response.blob();
    return blob.size;
  }

  private async compressResponse(response: Response): Promise<Response> {
    const text = await response.text();
    const compressed = await compressData(text);
    
    return new Response(compressed, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers({
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'gzip'
      })
    });
  }

  private async decompressResponse(response: Response): Promise<Response> {
    const buffer = await response.arrayBuffer();
    const decompressed = await decompressData(new Uint8Array(buffer));
    
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    
    return new Response(decompressed, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.storageConfig.cleanupInterval);
  }

  async getStatus(): Promise<any> {
    const totalEntries = this.cacheEntries.size;
    const totalSize = Array.from(this.cacheEntries.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    return {
      totalEntries,
      totalSize,
      strategies: Object.keys(this.config.cacheStrategies),
      isInitialized: this.isInitialized
    };
  }

  async getMetrics(): Promise<PerformanceMetrics> {
    const entries = Array.from(this.cacheEntries.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalRequests = totalHits + entries.length;
    
    return {
      cacheHitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      cacheMissRate: totalRequests > 0 ? ((totalRequests - totalHits) / totalRequests) * 100 : 0,
      averageResponseTime: 0, // Calculé par le PerformanceMonitor
      networkSavings: entries.reduce((sum, entry) => sum + entry.size, 0),
      offlineRequestsQueued: 0,
      offlineRequestsCompleted: 0,
      offlineRequestsFailed: 0,
      syncSuccessRate: 0,
      storageUsage: {
        total: entries.reduce((sum, entry) => sum + entry.size, 0),
        available: this.config.storageConfig.cacheStorageQuota,
        quota: this.config.storageConfig.cacheStorageQuota,
        byType: this.getStorageByType(),
        utilization: 0
      },
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      errorRate: 0,
      availability: 0,
      lastUpdated: Date.now()
    };
  }

  private getStorageByType(): Record<string, number> {
    const byType: Record<string, number> = {};
    
    for (const entry of this.cacheEntries.values()) {
      const strategy = entry.strategy;
      byType[strategy] = (byType[strategy] || 0) + entry.size;
    }
    
    return byType;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Gestionnaires de stratégies
abstract class CacheStrategyHandler {
  constructor(protected cacheManager: CacheManager) {}
  abstract handle(request: Request, cacheKey: string): Promise<Response>;
}

class CacheFirstHandler extends CacheStrategyHandler {
  async handle(request: Request, cacheKey: string): Promise<Response> {
    const cachedResponse = await this.cacheManager.get(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    const config = this.cacheManager.getConfig().cacheStrategies.static;
    await this.cacheManager.put(request, response, config);
    
    return response;
  }
}

class NetworkFirstHandler extends CacheStrategyHandler {
  async handle(request: Request, cacheKey: string): Promise<Response> {
    try {
      const response = await fetch(request);
      
      const config = this.cacheManager.getConfig().cacheStrategies.api;
      await this.cacheManager.put(request, response, config);
      
      return response;
    } catch (error) {
      const cachedResponse = await this.cacheManager.get(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw error;
    }
  }
}

class StaleWhileRevalidateHandler extends CacheStrategyHandler {
  async handle(request: Request, cacheKey: string): Promise<Response> {
    const cachedResponse = await this.cacheManager.get(request);
    
    // Lancer la requête réseau en parallèle
    const fetchPromise = fetch(request).then(async response => {
      const config = this.cacheManager.getConfig().cacheStrategies.documents;
      await this.cacheManager.put(request, response, config);
      return response;
    });
    
    // Retourner le cache s'il existe, sinon attendre le réseau
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return fetchPromise;
  }
}

class NetworkOnlyHandler extends CacheStrategyHandler {
  async handle(request: Request, cacheKey: string): Promise<Response> {
    return fetch(request);
  }
}
```

## 🌐 Offline-Manager.ts

### Implémentation Complète

```typescript
// src/lib/sw/core/offline-manager.ts
import { 
  OfflineRequest, 
  OfflineQueueConfig, 
  ServiceWorkerConfig,
  ConflictResolution 
} from '../types';
import { EventEmitter } from '../events/event-emitter';
import { IndexedDBStorage } from '../storage/indexed-db';
import { SW_EVENTS, STORAGE_KEYS } from '../constants';
import { generateId, isOnline, waitForNetwork } from '../utils';

export class OfflineManager {
  private config: ServiceWorkerConfig;
  private eventEmitter: EventEmitter;
  private storage: IndexedDBStorage;
  private queue: OfflineRequest[] = [];
  private isProcessing: boolean = false;
  private syncInterval: number;
  private maxQueueSize: number;
  private isInitialized: boolean = false;

  constructor(config: ServiceWorkerConfig, eventEmitter: EventEmitter) {
    this.config = config;
    this.eventEmitter = eventEmitter;
    this.storage = new IndexedDBStorage('offline-manager');
    this.maxQueueSize = config.offlineQueue.maxSize;
    
    this.setupEventListeners();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.storage.initialize();
      await this.loadQueue();
      this.startSyncInterval();
      
      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('OfflineManager initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize OfflineManager:', error);
      throw error;
    }
  }

  async enqueue(request: OfflineRequest): Promise<void> {
    // Vérifier la taille de la queue
    if (this.queue.length >= this.maxQueueSize) {
      this.eventEmitter.emit(SW_EVENTS.QUEUE_FULL, {
        size: this.queue.length,
        maxSize: this.maxQueueSize,
        timestamp: Date.now()
      });
      
      // Supprimer les anciennes requêtes
      await this.evictOldRequests();
    }

    // Ajouter un ID unique si pas présent
    if (!request.id) {
      request.id = generateId();
    }

    // Définir les valeurs par défaut
    request.timestamp = request.timestamp || Date.now();
    request.retryCount = request.retryCount || 0;
    request.maxRetries = request.maxRetries || this.config.offlineQueue.maxRetries;
    request.retryDelay = request.retryDelay || this.config.offlineQueue.retryDelay;
    request.expiresAt = request.expiresAt || (Date.now() + (24 * 60 * 60 * 1000)); // 24h
    request.priority = request.priority || 2; // Priorité moyenne

    // Ajouter à la queue
    this.queue.push(request);
    
    // Trier par priorité
    this.sortQueueByPriority();
    
    // Sauvegarder
    await this.saveQueue();
    
    this.eventEmitter.emit(SW_EVENTS.QUEUE_ADD, {
      requestId: request.id,
      queueSize: this.queue.length,
      timestamp: Date.now()
    });
    
    // Traiter immédiatement si en ligne
    if (isOnline() && !this.isProcessing) {
      this.processQueue();
    }
  }

  async dequeue(): Promise<OfflineRequest | null> {
    if (this.queue.length === 0) return null;
    
    const request = this.queue.shift()!;
    await this.saveQueue();
    
    return request;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    this.eventEmitter.emit(SW_EVENTS.QUEUE_PROCESS, {
      queueSize: this.queue.length,
      timestamp: Date.now()
    });
    
    const batchSize = this.config.offlineQueue.batchSize;
    const batch = this.queue.splice(0, batchSize);
    
    const results = await Promise.allSettled(
      batch.map(request => this.processRequest(request))
    );
    
    // Traiter les résultats
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const request = batch[i];
      
      if (result.status === 'fulfilled') {
        // Succès
        this.eventEmitter.emit(SW_EVENTS.SYNC_SUCCESS, {
          requestId: request.id,
          url: request.url,
          method: request.method,
          timestamp: Date.now()
        });
      } else {
        // Échec
        await this.handleFailedRequest(request, result.reason);
      }
    }
    
    await this.saveQueue();
    
    this.isProcessing = false;
    
    // Continuer si il y a encore des requêtes
    if (this.queue.length > 0 && isOnline()) {
      setTimeout(() => this.processQueue(), 1000);
    }
    
    // Émettre l'événement de queue vide
    if (this.queue.length === 0) {
      this.eventEmitter.emit(SW_EVENTS.QUEUE_EMPTY, {
        timestamp: Date.now()
      });
    }
  }

  private async processRequest(request: OfflineRequest): Promise<Response> {
    try {
      // Vérifier l'expiration
      if (Date.now() > request.expiresAt) {
        throw new Error('Request expired');
      }
      
      // Construire la requête
      const init: RequestInit = {
        method: request.method,
        headers: request.headers,
        body: request.body
      };
      
      const response = await fetch(request.url, init);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Appeler le callback de succès si présent
      if (request.metadata?.onSuccess) {
        request.metadata.onSuccess(response);
      }
      
      return response;
    } catch (error) {
      // Appeler le callback d'erreur si présent
      if (request.metadata?.onError) {
        request.metadata.onError(error);
      }
      
      throw error;
    }
  }

  private async handleFailedRequest(request: OfflineRequest, error: Error): Promise<void> {
    request.retryCount++;
    
    this.eventEmitter.emit(SW_EVENTS.SYNC_FAILURE, {
      requestId: request.id,
      url: request.url,
      method: request.method,
      error: error.message,
      retryCount: request.retryCount,
      timestamp: Date.now()
    });
    
    // Réessayer si possible
    if (request.retryCount < request.maxRetries) {
      // Calculer le délai avec backoff exponentiel
      const backoffMultiplier = this.config.offlineQueue.retryBackoff || 2;
      const delay = request.retryDelay * Math.pow(backoffMultiplier, request.retryCount - 1);
      
      // Remettre en queue avec délai
      setTimeout(() => {
        this.queue.unshift(request);
        this.saveQueue();
      }, delay);
      
      // Appeler le callback de retry si présent
      if (request.metadata?.onRetry) {
        request.metadata.onRetry(request.retryCount);
      }
    } else {
      // Abandon définitif
      console.error(`Failed to process request ${request.id} after ${request.retryCount} attempts:`, error);
    }
  }

  private async evictOldRequests(): Promise<void> {
    // Trier par timestamp et supprimer les plus anciennes
    this.queue.sort((a, b) => a.timestamp - b.timestamp);
    
    const toRemove = Math.floor(this.maxQueueSize * 0.1); // Supprimer 10%
    const removed = this.queue.splice(0, toRemove);
    
    console.log(`Evicted ${removed.length} old requests from offline queue`);
  }

  private sortQueueByPriority(): void {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // 1 = haute priorité
      }
      return a.timestamp - b.timestamp; // Plus ancien en premier
    });
  }

  private async loadQueue(): Promise<void> {
    try {
      const stored = await this.storage.get(STORAGE_KEYS.OFFLINE_QUEUE);
      if (stored) {
        this.queue = JSON.parse(stored);
        
        // Nettoyer les requêtes expirées
        this.queue = this.queue.filter(request => Date.now() < request.expiresAt);
        
        if (this.config.debug) {
          console.log(`Loaded ${this.queue.length} requests from offline queue`);
        }
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await this.storage.set(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupEventListeners(): void {
    // Écouter les événements réseau
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.queue.length > 0) {
          this.processQueue();
        }
      });
      
      window.addEventListener('offline', () => {
        this.isProcessing = false;
      });
    }
  }

  private startSyncInterval(): void {
    this.syncInterval = setInterval(() => {
      if (isOnline() && this.queue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    }, this.config.offlineQueue.syncInterval);
  }

  // Méthodes publiques
  
  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    
    this.eventEmitter.emit(SW_EVENTS.QUEUE_EMPTY, {
      timestamp: Date.now()
    });
  }

  async getQueueSize(): Promise<number> {
    return this.queue.length;
  }

  async getQueue(): Promise<OfflineRequest[]> {
    return [...this.queue];
  }

  async removeRequest(requestId: string): Promise<boolean> {
    const index = this.queue.findIndex(req => req.id === requestId);
    if (index === -1) return false;
    
    this.queue.splice(index, 1);
    await this.saveQueue();
    
    return true;
  }

  async updateRequest(requestId: string, updates: Partial<OfflineRequest>): Promise<boolean> {
    const request = this.queue.find(req => req.id === requestId);
    if (!request) return false;
    
    Object.assign(request, updates);
    await this.saveQueue();
    
    return true;
  }

  async getRequestById(requestId: string): Promise<OfflineRequest | null> {
    return this.queue.find(req => req.id === requestId) || null;
  }

  async getRequestsByUrl(url: string): Promise<OfflineRequest[]> {
    return this.queue.filter(req => req.url === url);
  }

  async getRequestsByMethod(method: string): Promise<OfflineRequest[]> {
    return this.queue.filter(req => req.method === method);
  }

  async getMetrics(): Promise<any> {
    const now = Date.now();
    const recentRequests = this.queue.filter(req => (now - req.timestamp) < 3600000); // 1 heure
    
    return {
      totalRequests: this.queue.length,
      recentRequests: recentRequests.length,
      requestsByMethod: this.groupByMethod(),
      requestsByPriority: this.groupByPriority(),
      averageAge: this.calculateAverageAge(),
      isProcessing: this.isProcessing,
      lastProcessed: this.getLastProcessedTime()
    };
  }

  private groupByMethod(): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const request of this.queue) {
      grouped[request.method] = (grouped[request.method] || 0) + 1;
    }
    
    return grouped;
  }

  private groupByPriority(): Record<number, number> {
    const grouped: Record<number, number> = {};
    
    for (const request of this.queue) {
      grouped[request.priority] = (grouped[request.priority] || 0) + 1;
    }
    
    return grouped;
  }

  private calculateAverageAge(): number {
    if (this.queue.length === 0) return 0;
    
    const now = Date.now();
    const totalAge = this.queue.reduce((sum, req) => sum + (now - req.timestamp), 0);
    
    return totalAge / this.queue.length;
  }

  private getLastProcessedTime(): number {
    // Retourner le timestamp de la dernière requête traitée
    // (implémentation simplifiée)
    return Date.now();
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.isProcessing = false;
    this.storage.close();
  }
}
```

## 🎯 Utilisation et Intégration

### Utilisation dans le Service Worker Manager

```typescript
// src/lib/sw/core/service-worker-manager.ts
import { CacheManager } from './cache-manager';
import { OfflineManager } from './offline-manager';

export class ServiceWorkerManager {
  private cacheManager: CacheManager;
  private offlineManager: OfflineManager;
  
  constructor(config: ServiceWorkerConfig) {
    this.cacheManager = new CacheManager(config, this.eventEmitter);
    this.offlineManager = new OfflineManager(config, this.eventEmitter);
  }
  
  async handleFetch(event: FetchEvent): Promise<Response> {
    const request = event.request;
    
    // Essayer le cache d'abord
    const cachedResponse = await this.cacheManager.handleRequest(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si hors ligne, ajouter à la queue
    if (!navigator.onLine && request.method !== 'GET') {
      await this.offlineManager.enqueue({
        id: generateId(),
        url: request.url,
        method: request.method as any,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        timestamp: Date.now(),
        priority: 2,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
      
      return new Response(JSON.stringify({ queued: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Essayer le réseau
    return fetch(request);
  }
}
```

### Utilisation dans l'Application

```typescript
// src/hooks/use-offline-manager.ts
import { useServiceWorker } from './use-service-worker';

export function useOfflineManager() {
  const { swManager } = useServiceWorker();
  
  const queueRequest = async (request: OfflineRequest) => {
    const offlineManager = swManager?.getOfflineManager();
    if (offlineManager) {
      await offlineManager.enqueue(request);
    }
  };
  
  const getQueueSize = async () => {
    const offlineManager = swManager?.getOfflineManager();
    return offlineManager ? await offlineManager.getQueueSize() : 0;
  };
  
  const clearQueue = async () => {
    const offlineManager = swManager?.getOfflineManager();
    if (offlineManager) {
      await offlineManager.clear();
    }
  };
  
  return {
    queueRequest,
    getQueueSize,
    clearQueue
  };
}
```

---

*Ces gestionnaires fournissent une gestion complète du cache et du mode hors ligne pour WakeDock.*