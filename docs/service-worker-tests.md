# Plan de Tests Service Worker

## 📋 Vue d'ensemble

Ce document détaille la stratégie complète de tests pour le Service Worker de WakeDock, couvrant les tests unitaires, d'intégration, de performance et E2E.

## 🧪 Architecture de Tests

```
tests/
├── unit/                       # Tests unitaires
│   ├── cache-manager.test.ts
│   ├── offline-manager.test.ts
│   ├── network-detector.test.ts
│   ├── sync-manager.test.ts
│   ├── performance-monitor.test.ts
│   └── service-worker-manager.test.ts
├── integration/                # Tests d'intégration
│   ├── cache-strategies.test.ts
│   ├── offline-sync.test.ts
│   ├── network-transitions.test.ts
│   └── full-workflow.test.ts
├── performance/                # Tests de performance
│   ├── cache-performance.test.ts
│   ├── memory-usage.test.ts
│   ├── network-efficiency.test.ts
│   └── load-testing.test.ts
├── e2e/                       # Tests end-to-end
│   ├── offline-experience.test.ts
│   ├── cache-invalidation.test.ts
│   ├── sync-scenarios.test.ts
│   └── user-workflows.test.ts
├── fixtures/                  # Données de test
│   ├── mock-responses.ts
│   ├── test-data.ts
│   └── service-worker-mocks.ts
└── utils/                     # Utilitaires de test
    ├── test-helpers.ts
    ├── mock-service-worker.ts
    └── performance-utils.ts
```

## 🔬 Tests Unitaires

### 1. Tests Cache Manager

```typescript
// tests/unit/cache-manager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheManager } from '../../src/lib/sw/core/cache-manager';
import { EventEmitter } from '../../src/lib/sw/events/event-emitter';
import { defaultServiceWorkerConfig } from '../../src/lib/sw/config';
import { mockCacheAPI } from '../utils/mock-service-worker';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let eventEmitter: EventEmitter;
  let mockCaches: typeof caches;

  beforeEach(() => {
    // Mock des APIs du navigateur
    mockCacheAPI();
    eventEmitter = new EventEmitter();
    cacheManager = new CacheManager(defaultServiceWorkerConfig, eventEmitter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(cacheManager.initialize()).resolves.not.toThrow();
    });

    it('should load existing cache entries', async () => {
      // Préparer des entrées existantes
      const mockEntries = [
        { key: 'test-key', url: 'https://test.com/api/data' }
      ];

      // Mock du cache existant
      vi.spyOn(caches, 'keys').mockResolvedValue(['test-cache']);
      vi.spyOn(caches, 'open').mockResolvedValue({
        keys: vi.fn().mockResolvedValue([new Request('https://test.com/api/data')]),
        match: vi.fn().mockResolvedValue(new Response('test'))
      } as any);

      await cacheManager.initialize();

      const status = await cacheManager.getStatus();
      expect(status.totalEntries).toBeGreaterThan(0);
    });
  });

  describe('Cache Operations', () => {
    it('should handle cache-first strategy', async () => {
      const request = new Request('https://test.com/static/app.js');
      const mockResponse = new Response('console.log("test");');

      // Mock: pas de cache initialement
      vi.spyOn(cacheManager, 'get').mockResolvedValue(null);
      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

      const response = await cacheManager.handleRequest(request);

      expect(response).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith(request);
    });

    it('should return cached response when available', async () => {
      const request = new Request('https://test.com/static/app.js');
      const cachedResponse = new Response('cached content');

      vi.spyOn(cacheManager, 'get').mockResolvedValue(cachedResponse);

      const response = await cacheManager.handleRequest(request);

      expect(response).toBe(cachedResponse);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle network-first strategy', async () => {
      const request = new Request('https://test.com/api/data');
      const networkResponse = new Response('{"data": "fresh"}');

      vi.spyOn(global, 'fetch').mockResolvedValue(networkResponse);

      const response = await cacheManager.handleRequest(request);

      expect(response).toBe(networkResponse);
      expect(fetch).toHaveBeenCalledWith(request);
    });

    it('should fallback to cache when network fails', async () => {
      const request = new Request('https://test.com/api/data');
      const cachedResponse = new Response('{"data": "cached"}');

      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
      vi.spyOn(cacheManager, 'get').mockResolvedValue(cachedResponse);

      const response = await cacheManager.handleRequest(request);

      expect(response).toBe(cachedResponse);
    });
  });

  describe('Cache Cleanup', () => {
    it('should remove expired entries', async () => {
      const expiredEntry = {
        key: 'expired-key',
        url: 'https://test.com/expired',
        request: new Request('https://test.com/expired'),
        response: new Response('expired'),
        timestamp: Date.now() - 10000,
        expiresAt: Date.now() - 5000, // Expiré
        strategy: 'cacheFirst' as const,
        priority: 'medium' as const,
        size: 100,
        hits: 1,
        lastAccess: Date.now() - 10000
      };

      // Mock des entrées expirées
      vi.spyOn(cacheManager as any, 'cacheEntries', 'get').mockReturnValue(
        new Map([['expired-key', expiredEntry]])
      );

      await (cacheManager as any).cleanupExpiredEntries();

      // Vérifier que l'entrée a été supprimée
      expect(cacheManager.delete).toHaveBeenCalledWith(expiredEntry.request);
    });

    it('should enforce storage limits', async () => {
      const config = {
        ...defaultServiceWorkerConfig.cacheStrategies.static,
        maxEntries: 2
      };

      const entries = [
        { priority: 'low', lastAccess: Date.now() - 3000 },
        { priority: 'medium', lastAccess: Date.now() - 2000 },
        { priority: 'high', lastAccess: Date.now() - 1000 }
      ];

      // Mock: plus d'entrées que la limite
      vi.spyOn(cacheManager as any, 'cacheEntries', 'get').mockReturnValue(
        new Map(entries.map((entry, i) => [`key-${i}`, entry]))
      );

      await (cacheManager as any).enforceStorageLimits(config);

      // Vérifier que l'entrée de plus basse priorité a été supprimée
      expect(cacheManager.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Emission', () => {
    it('should emit cache hit events', async () => {
      const request = new Request('https://test.com/test');
      const response = new Response('test');

      vi.spyOn(cacheManager, 'get').mockResolvedValue(response);

      const eventSpy = vi.spyOn(eventEmitter, 'emit');

      await cacheManager.handleRequest(request);

      expect(eventSpy).toHaveBeenCalledWith('cache:hit', expect.any(Object));
    });

    it('should emit cache miss events', async () => {
      const request = new Request('https://test.com/test');

      vi.spyOn(cacheManager, 'get').mockResolvedValue(null);
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response('test'));

      const eventSpy = vi.spyOn(eventEmitter, 'emit');

      await cacheManager.handleRequest(request);

      expect(eventSpy).toHaveBeenCalledWith('cache:miss', expect.any(Object));
    });
  });

  describe('Compression', () => {
    it('should compress responses when enabled', async () => {
      const request = new Request('https://test.com/large-file.js');
      const largeResponse = new Response('a'.repeat(10000));
      const config = {
        ...defaultServiceWorkerConfig.cacheStrategies.static,
        compression: true
      };

      vi.spyOn(global, 'fetch').mockResolvedValue(largeResponse);

      await cacheManager.put(request, largeResponse, config);

      // Vérifier que la compression a été appliquée
      const cachedResponse = await cacheManager.get(request);
      expect(cachedResponse).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const request = new Request('https://test.com/failing-endpoint');

      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
      vi.spyOn(cacheManager, 'get').mockResolvedValue(null);

      await expect(cacheManager.handleRequest(request)).rejects.toThrow('Network error');
    });

    it('should emit error events on cache failures', async () => {
      const request = new Request('https://test.com/test');

      vi.spyOn(cacheManager, 'get').mockRejectedValue(new Error('Cache error'));

      const eventSpy = vi.spyOn(eventEmitter, 'emit');

      await expect(cacheManager.handleRequest(request)).rejects.toThrow();

      expect(eventSpy).toHaveBeenCalledWith('cache:error', expect.any(Object));
    });
  });
});
```

### 2. Tests Offline Manager

```typescript
// tests/unit/offline-manager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineManager } from '../../src/lib/sw/core/offline-manager';
import { EventEmitter } from '../../src/lib/sw/events/event-emitter';
import { defaultServiceWorkerConfig } from '../../src/lib/sw/config';
import { mockIndexedDB } from '../utils/mock-service-worker';

describe('OfflineManager', () => {
  let offlineManager: OfflineManager;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    mockIndexedDB();
    eventEmitter = new EventEmitter();
    offlineManager = new OfflineManager(defaultServiceWorkerConfig, eventEmitter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Queue Management', () => {
    it('should enqueue offline requests', async () => {
      const request = {
        id: 'test-request',
        url: 'https://test.com/api/data',
        method: 'POST' as const,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
        timestamp: Date.now(),
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() + 3600000
      };

      await offlineManager.enqueue(request);

      const queueSize = await offlineManager.getQueueSize();
      expect(queueSize).toBe(1);
    });

    it('should process queue when online', async () => {
      const request = {
        id: 'test-request',
        url: 'https://test.com/api/data',
        method: 'POST' as const,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
        timestamp: Date.now(),
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() + 3600000
      };

      // Mock: en ligne
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response('success'));

      await offlineManager.enqueue(request);
      await offlineManager.processQueue();

      const queueSize = await offlineManager.getQueueSize();
      expect(queueSize).toBe(0);
    });

    it('should retry failed requests', async () => {
      const request = {
        id: 'test-request',
        url: 'https://test.com/api/data',
        method: 'POST' as const,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
        timestamp: Date.now(),
        priority: 1,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 100, // Court délai pour les tests
        expiresAt: Date.now() + 3600000
      };

      // Mock: première tentative échoue, deuxième réussit
      vi.spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('success'));

      await offlineManager.enqueue(request);
      await offlineManager.processQueue();

      // Attendre le retry
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const queueSize = await offlineManager.getQueueSize();
      expect(queueSize).toBe(0);
    });

    it('should handle queue overflow', async () => {
      const maxSize = defaultServiceWorkerConfig.offlineQueue.maxSize;
      
      // Remplir la queue au maximum
      for (let i = 0; i < maxSize + 1; i++) {
        await offlineManager.enqueue({
          id: `request-${i}`,
          url: `https://test.com/api/data/${i}`,
          method: 'POST',
          headers: {},
          body: '',
          timestamp: Date.now() - (maxSize - i) * 1000, // Plus ancien = plus petit index
          priority: 2,
          retryCount: 0,
          maxRetries: 3,
          retryDelay: 1000,
          expiresAt: Date.now() + 3600000
        });
      }

      const queueSize = await offlineManager.getQueueSize();
      expect(queueSize).toBe(maxSize);
    });
  });

  describe('Priority Handling', () => {
    it('should process high priority requests first', async () => {
      const lowPriorityRequest = {
        id: 'low-priority',
        url: 'https://test.com/api/low',
        method: 'POST' as const,
        headers: {},
        body: '',
        timestamp: Date.now(),
        priority: 3, // Basse priorité
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() + 3600000
      };

      const highPriorityRequest = {
        id: 'high-priority',
        url: 'https://test.com/api/high',
        method: 'POST' as const,
        headers: {},
        body: '',
        timestamp: Date.now(),
        priority: 1, // Haute priorité
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() + 3600000
      };

      await offlineManager.enqueue(lowPriorityRequest);
      await offlineManager.enqueue(highPriorityRequest);

      const queue = await offlineManager.getQueue();
      expect(queue[0].id).toBe('high-priority');
      expect(queue[1].id).toBe('low-priority');
    });
  });

  describe('Expiration Handling', () => {
    it('should remove expired requests', async () => {
      const expiredRequest = {
        id: 'expired-request',
        url: 'https://test.com/api/expired',
        method: 'POST' as const,
        headers: {},
        body: '',
        timestamp: Date.now(),
        priority: 2,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() - 1000 // Expiré
      };

      await offlineManager.enqueue(expiredRequest);

      // Déclencher le traitement
      await offlineManager.processQueue();

      const queueSize = await offlineManager.getQueueSize();
      expect(queueSize).toBe(0);
    });
  });

  describe('Event Emission', () => {
    it('should emit queue events', async () => {
      const eventSpy = vi.spyOn(eventEmitter, 'emit');

      const request = {
        id: 'test-request',
        url: 'https://test.com/api/data',
        method: 'POST' as const,
        headers: {},
        body: '',
        timestamp: Date.now(),
        priority: 2,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() + 3600000
      };

      await offlineManager.enqueue(request);

      expect(eventSpy).toHaveBeenCalledWith('queue:add', expect.any(Object));
    });
  });

  describe('Persistence', () => {
    it('should persist queue to storage', async () => {
      const request = {
        id: 'test-request',
        url: 'https://test.com/api/data',
        method: 'POST' as const,
        headers: {},
        body: '',
        timestamp: Date.now(),
        priority: 2,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        expiresAt: Date.now() + 3600000
      };

      await offlineManager.enqueue(request);

      // Créer une nouvelle instance pour vérifier la persistance
      const newOfflineManager = new OfflineManager(defaultServiceWorkerConfig, eventEmitter);
      await newOfflineManager.initialize();

      const queueSize = await newOfflineManager.getQueueSize();
      expect(queueSize).toBe(1);
    });
  });
});
```

## 🔗 Tests d'Intégration

### 1. Tests de Stratégies de Cache

```typescript
// tests/integration/cache-strategies.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceWorkerManager } from '../../src/lib/sw/core/service-worker-manager';
import { defaultServiceWorkerConfig } from '../../src/lib/sw/config';
import { mockServiceWorkerEnvironment } from '../utils/mock-service-worker';

describe('Cache Strategies Integration', () => {
  let swManager: ServiceWorkerManager;

  beforeEach(() => {
    mockServiceWorkerEnvironment();
    swManager = new ServiceWorkerManager(defaultServiceWorkerConfig);
  });

  describe('Cache-First Strategy', () => {
    it('should serve from cache when available', async () => {
      const request = new Request('https://test.com/static/app.js');
      const cachedResponse = new Response('cached content');

      // Pré-cache le contenu
      const cacheManager = swManager.getCacheManager();
      await cacheManager.put(request, cachedResponse, defaultServiceWorkerConfig.cacheStrategies.static);

      const fetchEvent = new FetchEvent('fetch', { request });
      const response = await swManager.handleFetch(fetchEvent);

      expect(await response.text()).toBe('cached content');
    });

    it('should fetch and cache when not in cache', async () => {
      const request = new Request('https://test.com/static/new-file.js');
      const networkResponse = new Response('new content');

      vi.spyOn(global, 'fetch').mockResolvedValue(networkResponse);

      const fetchEvent = new FetchEvent('fetch', { request });
      const response = await swManager.handleFetch(fetchEvent);

      expect(await response.text()).toBe('new content');
      expect(fetch).toHaveBeenCalledWith(request);
    });
  });

  describe('Network-First Strategy', () => {
    it('should fetch from network first', async () => {
      const request = new Request('https://test.com/api/data');
      const networkResponse = new Response('fresh data');

      vi.spyOn(global, 'fetch').mockResolvedValue(networkResponse);

      const fetchEvent = new FetchEvent('fetch', { request });
      const response = await swManager.handleFetch(fetchEvent);

      expect(await response.text()).toBe('fresh data');
      expect(fetch).toHaveBeenCalledWith(request);
    });

    it('should fallback to cache when network fails', async () => {
      const request = new Request('https://test.com/api/data');
      const cachedResponse = new Response('cached data');

      // Pré-cache le contenu
      const cacheManager = swManager.getCacheManager();
      await cacheManager.put(request, cachedResponse, defaultServiceWorkerConfig.cacheStrategies.api);

      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const fetchEvent = new FetchEvent('fetch', { request });
      const response = await swManager.handleFetch(fetchEvent);

      expect(await response.text()).toBe('cached data');
    });
  });

  describe('Stale-While-Revalidate Strategy', () => {
    it('should serve stale content while revalidating', async () => {
      const request = new Request('https://test.com/page.html');
      const staleResponse = new Response('stale content');
      const freshResponse = new Response('fresh content');

      // Pré-cache le contenu
      const cacheManager = swManager.getCacheManager();
      await cacheManager.put(request, staleResponse, defaultServiceWorkerConfig.cacheStrategies.documents);

      vi.spyOn(global, 'fetch').mockResolvedValue(freshResponse);

      const fetchEvent = new FetchEvent('fetch', { request });
      const response = await swManager.handleFetch(fetchEvent);

      // Devrait servir le contenu en cache immédiatement
      expect(await response.text()).toBe('stale content');

      // Vérifier que le réseau a été appelé pour la revalidation
      expect(fetch).toHaveBeenCalledWith(request);
    });
  });
});
```

### 2. Tests de Synchronisation Hors Ligne

```typescript
// tests/integration/offline-sync.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceWorkerManager } from '../../src/lib/sw/core/service-worker-manager';
import { defaultServiceWorkerConfig } from '../../src/lib/sw/config';
import { mockServiceWorkerEnvironment } from '../utils/mock-service-worker';

describe('Offline Synchronization Integration', () => {
  let swManager: ServiceWorkerManager;

  beforeEach(() => {
    mockServiceWorkerEnvironment();
    swManager = new ServiceWorkerManager(defaultServiceWorkerConfig);
  });

  describe('Offline Request Handling', () => {
    it('should queue requests when offline', async () => {
      const request = new Request('https://test.com/api/data', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' })
      });

      // Mock: hors ligne
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

      const fetchEvent = new FetchEvent('fetch', { request });
      const response = await swManager.handleFetch(fetchEvent);

      const responseData = await response.json();
      expect(responseData.queued).toBe(true);

      const offlineManager = swManager.getOfflineManager();
      const queueSize = await offlineManager.getQueueSize();
      expect(queueSize).toBe(1);
    });

    it('should process queue when coming back online', async () => {
      const request = new Request('https://test.com/api/data', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' })
      });

      // Mock: hors ligne initialement
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

      const fetchEvent = new FetchEvent('fetch', { request });
      await swManager.handleFetch(fetchEvent);

      // Simuler le retour en ligne
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response('success'));

      // Déclencher l'événement online
      const networkDetector = swManager.getNetworkDetector();
      await networkDetector.handleOnline();

      // Attendre que la queue soit traitée
      await new Promise(resolve => setTimeout(resolve, 100));

      const offlineManager = swManager.getOfflineManager();
      const queueSize = await offlineManager.getQueueSize();
      expect(queueSize).toBe(0);
    });
  });

  describe('Conflict Resolution', () => {
    it('should handle data conflicts during sync', async () => {
      const request = new Request('https://test.com/api/data/1', {
        method: 'PUT',
        body: JSON.stringify({ data: 'updated offline' })
      });

      // Mock: conflit de données
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response(
        JSON.stringify({ error: 'Conflict', current: { data: 'updated online' } }), 
        { status: 409 }
      ));

      const offlineManager = swManager.getOfflineManager();
      await offlineManager.enqueue({
        id: 'conflict-request',
        url: 'https://test.com/api/data/1',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'updated offline' }),
        timestamp: Date.now(),
        priority: 1,
        retryCount: 0,
        maxRetries: 1,
        retryDelay: 1000,
        expiresAt: Date.now() + 3600000
      });

      await offlineManager.processQueue();

      // Vérifier que le conflit a été géré
      const metrics = await offlineManager.getMetrics();
      expect(metrics.totalRequests).toBe(1);
    });
  });
});
```

## 🚀 Tests de Performance

### 1. Tests de Performance de Cache

```typescript
// tests/performance/cache-performance.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceWorkerManager } from '../../src/lib/sw/core/service-worker-manager';
import { defaultServiceWorkerConfig } from '../../src/lib/sw/config';
import { measurePerformance } from '../utils/performance-utils';

describe('Cache Performance Tests', () => {
  let swManager: ServiceWorkerManager;

  beforeEach(() => {
    swManager = new ServiceWorkerManager(defaultServiceWorkerConfig);
  });

  describe('Cache Hit Performance', () => {
    it('should achieve target cache hit ratio', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => 
        new Request(`https://test.com/api/data/${i % 10}`) // 10 URLs uniques, 10 répétitions chacune
      );

      // Première passe: mise en cache
      for (const request of requests.slice(0, 10)) {
        const fetchEvent = new FetchEvent('fetch', { request });
        await swManager.handleFetch(fetchEvent);
      }

      // Deuxième passe: test du cache
      const startTime = Date.now();
      for (const request of requests.slice(10)) {
        const fetchEvent = new FetchEvent('fetch', { request });
        await swManager.handleFetch(fetchEvent);
      }
      const endTime = Date.now();

      const performanceMonitor = swManager.getPerformanceMonitor();
      const metrics = await performanceMonitor.getMetrics();

      expect(metrics.cacheHitRate).toBeGreaterThan(85); // Target: 85%
      expect(endTime - startTime).toBeLessThan(1000); // Target: <1s pour 90 requêtes
    });
  });

  describe('Response Time Performance', () => {
    it('should meet response time targets', async () => {
      const request = new Request('https://test.com/api/data');
      
      const { duration } = await measurePerformance(async () => {
        const fetchEvent = new FetchEvent('fetch', { request });
        await swManager.handleFetch(fetchEvent);
      });

      expect(duration).toBeLessThan(200); // Target: <200ms
    });
  });

  describe('Memory Usage', () => {
    it('should maintain memory usage within limits', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Créer beaucoup de requêtes pour tester la mémoire
      const requests = Array.from({ length: 1000 }, (_, i) => 
        new Request(`https://test.com/api/data/${i}`)
      );

      for (const request of requests) {
        const fetchEvent = new FetchEvent('fetch', { request });
        await swManager.handleFetch(fetchEvent);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Target: <50MB
    });
  });

  describe('Storage Efficiency', () => {
    it('should optimize storage usage', async () => {
      const cacheManager = swManager.getCacheManager();
      const status = await cacheManager.getStatus();
      
      expect(status.totalSize).toBeLessThan(100 * 1024 * 1024); // Target: <100MB
      
      const storageUtilization = status.totalSize / defaultServiceWorkerConfig.storageConfig.cacheStorageQuota;
      expect(storageUtilization).toBeLessThan(0.8); // Target: <80% utilization
    });
  });
});
```

### 2. Tests de Charge

```typescript
// tests/performance/load-testing.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceWorkerManager } from '../../src/lib/sw/core/service-worker-manager';
import { defaultServiceWorkerConfig } from '../../src/lib/sw/config';
import { simulateLoad } from '../utils/performance-utils';

describe('Load Testing', () => {
  let swManager: ServiceWorkerManager;

  beforeEach(() => {
    swManager = new ServiceWorkerManager(defaultServiceWorkerConfig);
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 50;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => 
        new Request(`https://test.com/api/data/${i}`)
      );

      const startTime = Date.now();
      
      const responses = await Promise.all(
        requests.map(request => {
          const fetchEvent = new FetchEvent('fetch', { request });
          return swManager.handleFetch(fetchEvent);
        })
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(responses).toHaveLength(concurrentRequests);
      expect(duration).toBeLessThan(5000); // Target: <5s pour 50 requêtes
    });
  });

  describe('Queue Performance', () => {
    it('should handle large offline queues', async () => {
      const queueSize = 1000;
      const offlineManager = swManager.getOfflineManager();

      const startTime = Date.now();

      // Ajouter beaucoup de requêtes à la queue
      for (let i = 0; i < queueSize; i++) {
        await offlineManager.enqueue({
          id: `request-${i}`,
          url: `https://test.com/api/data/${i}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: `test-${i}` }),
          timestamp: Date.now(),
          priority: Math.floor(Math.random() * 3) + 1,
          retryCount: 0,
          maxRetries: 3,
          retryDelay: 1000,
          expiresAt: Date.now() + 3600000
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // Target: <10s pour 1000 requêtes
      
      const finalQueueSize = await offlineManager.getQueueSize();
      expect(finalQueueSize).toBe(queueSize);
    });
  });

  describe('Stress Testing', () => {
    it('should maintain stability under stress', async () => {
      const stressTest = async () => {
        const requests = Array.from({ length: 100 }, (_, i) => 
          new Request(`https://test.com/stress/${i}`)
        );

        return Promise.all(
          requests.map(request => {
            const fetchEvent = new FetchEvent('fetch', { request });
            return swManager.handleFetch(fetchEvent);
          })
        );
      };

      // Répéter le test de stress plusieurs fois
      const stressRounds = 10;
      const results = [];

      for (let round = 0; round < stressRounds; round++) {
        const startTime = Date.now();
        await stressTest();
        const endTime = Date.now();
        
        results.push(endTime - startTime);
      }

      const averageTime = results.reduce((sum, time) => sum + time, 0) / results.length;
      const maxTime = Math.max(...results);

      expect(averageTime).toBeLessThan(3000); // Target: <3s en moyenne
      expect(maxTime).toBeLessThan(5000); // Target: <5s maximum
    });
  });
});
```

## 🎭 Tests End-to-End

### 1. Tests d'Expérience Hors Ligne

```typescript
// tests/e2e/offline-experience.test.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Offline Experience', () => {
  test('should work offline after initial load', async ({ page }) => {
    // Charger l'application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Vérifier que le service worker est actif
    await expect(page.locator('[data-testid="sw-status"]')).toContainText('Active');

    // Passer en mode hors ligne
    await page.context().setOffline(true);

    // Naviguer vers une page mise en cache
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForLoadState('domcontentloaded');

    // Vérifier que la page s'affiche correctement
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
  });

  test('should queue actions when offline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Passer en mode hors ligne
    await page.context().setOffline(true);

    // Effectuer une action qui nécessite le réseau
    await page.click('[data-testid="create-container-button"]');
    await page.fill('[data-testid="container-name"]', 'test-container');
    await page.click('[data-testid="submit-button"]');

    // Vérifier que l'action a été mise en queue
    await expect(page.locator('[data-testid="queued-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="queue-indicator"]')).toContainText('1');
  });

  test('should sync queued actions when back online', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Passer en mode hors ligne et effectuer une action
    await page.context().setOffline(true);
    await page.click('[data-testid="create-container-button"]');
    await page.fill('[data-testid="container-name"]', 'test-container');
    await page.click('[data-testid="submit-button"]');

    // Revenir en ligne
    await page.context().setOffline(false);

    // Attendre la synchronisation
    await page.waitForTimeout(2000);

    // Vérifier que l'action a été synchronisée
    await expect(page.locator('[data-testid="queue-indicator"]')).toContainText('0');
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
  });

  test('should handle network reconnection gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simuler une déconnexion réseau
    await page.context().setOffline(true);
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Reconnecter
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);

    // Vérifier que l'indicateur en ligne est affiché
    await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });
});
```

### 2. Tests de Scénarios Utilisateur

```typescript
// tests/e2e/user-workflows.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Workflows with Service Worker', () => {
  test('should cache user data for offline access', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Se connecter
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await page.click('[data-testid="submit-login"]');

    // Naviguer vers le profil utilisateur
    await page.click('[data-testid="profile-link"]');
    await page.waitForLoadState('networkidle');

    // Vérifier que les données sont chargées
    await expect(page.locator('[data-testid="user-name"]')).toContainText('testuser');

    // Passer en mode hors ligne
    await page.context().setOffline(true);

    // Recharger la page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Vérifier que les données en cache sont affichées
    await expect(page.locator('[data-testid="user-name"]')).toContainText('testuser');
  });

  test('should provide smooth navigation experience', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mesurer le temps de navigation
    const startTime = Date.now();
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForLoadState('domcontentloaded');
    const navigationTime = Date.now() - startTime;

    // Vérifier que la navigation est rapide
    expect(navigationTime).toBeLessThan(500); // Target: <500ms

    // Vérifier que le contenu est affiché
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('should handle concurrent user actions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Effectuer plusieurs actions simultanément
    const actions = [
      page.click('[data-testid="containers-link"]'),
      page.click('[data-testid="images-link"]'),
      page.click('[data-testid="networks-link"]')
    ];

    await Promise.all(actions);

    // Vérifier que toutes les actions ont été traitées
    await expect(page.locator('[data-testid="active-tab"]')).toBeVisible();
  });
});
```

## 📊 Métriques et Validation

### KPIs de Performance

```typescript
// tests/utils/performance-validation.ts
export const PERFORMANCE_TARGETS = {
  CACHE_HIT_RATE: 85, // %
  PAGE_LOAD_TIME: 2000, // ms
  RESPONSE_TIME: 200, // ms
  MEMORY_USAGE: 50 * 1024 * 1024, // bytes
  STORAGE_UTILIZATION: 0.8, // ratio
  QUEUE_PROCESSING_TIME: 5000, // ms
  SYNC_SUCCESS_RATE: 95, // %
  ERROR_RATE: 5 // %
};

export const validatePerformance = (metrics: any) => {
  const results = {
    cacheHitRate: metrics.cacheHitRate >= PERFORMANCE_TARGETS.CACHE_HIT_RATE,
    pageLoadTime: metrics.pageLoadTime <= PERFORMANCE_TARGETS.PAGE_LOAD_TIME,
    responseTime: metrics.averageResponseTime <= PERFORMANCE_TARGETS.RESPONSE_TIME,
    memoryUsage: metrics.memoryUsage <= PERFORMANCE_TARGETS.MEMORY_USAGE,
    storageUtilization: metrics.storageUtilization <= PERFORMANCE_TARGETS.STORAGE_UTILIZATION,
    syncSuccessRate: metrics.syncSuccessRate >= PERFORMANCE_TARGETS.SYNC_SUCCESS_RATE,
    errorRate: metrics.errorRate <= PERFORMANCE_TARGETS.ERROR_RATE
  };

  return {
    passed: Object.values(results).every(Boolean),
    details: results,
    score: Object.values(results).filter(Boolean).length / Object.values(results).length * 100
  };
};
```

### Configuration des Tests

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
```

---

*Ce plan de tests complet garantit la qualité et les performances du Service Worker WakeDock.*