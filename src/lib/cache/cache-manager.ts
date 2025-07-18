export type CacheStrategyType = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'cache-only' | 'network-only';

export interface CacheStrategy {
  strategy: CacheStrategyType;
  maxAge: number;
  maxEntries: number;
  compression?: boolean;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  etag?: string;
  hits: number;
}

export interface CacheUsageStats {
  totalSize: number;
  totalEntries: number;
  hitRate: number;
  cachesByType: Record<string, {
    size: number;
    entries: number;
    hits: number;
    misses: number;
  }>;
}

export class CacheManager {
  private cacheNames: Record<string, string>;
  private strategies: Record<string, CacheStrategy>;
  private stats: Record<string, { hits: number; misses: number }> = {};

  constructor(cacheNames: Record<string, string>, strategies: Record<string, CacheStrategy>) {
    this.cacheNames = cacheNames;
    this.strategies = strategies;
    
    // Initialiser les stats
    Object.keys(cacheNames).forEach(key => {
      this.stats[key] = { hits: 0, misses: 0 };
    });
  }

  async handleRequest(request: Request, cacheType: string): Promise<Response> {
    const strategy = this.strategies[cacheType];
    if (!strategy) {
      return fetch(request);
    }

    switch (strategy.strategy) {
      case 'cache-first':
        return this.cacheFirst(request, cacheType);
      case 'network-first':
        return this.networkFirst(request, cacheType);
      case 'stale-while-revalidate':
        return this.staleWhileRevalidate(request, cacheType);
      case 'cache-only':
        return this.cacheOnly(request, cacheType);
      case 'network-only':
        return this.networkOnly(request);
      default:
        return fetch(request);
    }
  }

  private async cacheFirst(request: Request, cacheType: string): Promise<Response> {
    const cache = await caches.open(this.cacheNames[cacheType]);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !this.isExpired(cachedResponse, cacheType)) {
      this.stats[cacheType].hits++;
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await this.addResponseToCache(cache, request, networkResponse.clone(), cacheType);
      }
      this.stats[cacheType].misses++;
      return networkResponse;
    } catch (error) {
      // Fallback au cache même expiré si réseau indisponible
      if (cachedResponse) {
        this.stats[cacheType].hits++;
        return cachedResponse;
      }
      throw error;
    }
  }

  private async networkFirst(request: Request, cacheType: string): Promise<Response> {
    const cache = await caches.open(this.cacheNames[cacheType]);

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await this.addResponseToCache(cache, request, networkResponse.clone(), cacheType);
        this.stats[cacheType].misses++;
        return networkResponse;
      }
    } catch (error) {
      // Fallback au cache en cas d'erreur réseau
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        this.stats[cacheType].hits++;
        return cachedResponse;
      }
      throw error;
    }

    // Si on arrive ici, le réseau a répondu avec une erreur
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      this.stats[cacheType].hits++;
      return cachedResponse;
    }

    // Aucune réponse disponible
    return new Response('Service Unavailable', { status: 503 });
  }

  private async staleWhileRevalidate(request: Request, cacheType: string): Promise<Response> {
    const cache = await caches.open(this.cacheNames[cacheType]);
    const cachedResponse = await cache.match(request);

    // Déclencher une mise à jour en arrière-plan
    const networkPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        await this.addResponseToCache(cache, request, networkResponse.clone(), cacheType);
      }
      return networkResponse;
    });

    // Retourner immédiatement la réponse cachée si disponible
    if (cachedResponse) {
      this.stats[cacheType].hits++;
      // Ne pas attendre la mise à jour réseau
      networkPromise.catch(() => {});
      return cachedResponse;
    }

    // Pas de cache, attendre le réseau
    this.stats[cacheType].misses++;
    return networkPromise;
  }

  private async cacheOnly(request: Request, cacheType: string): Promise<Response> {
    const cache = await caches.open(this.cacheNames[cacheType]);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      this.stats[cacheType].hits++;
      return cachedResponse;
    }

    this.stats[cacheType].misses++;
    return new Response('Not Found', { status: 404 });
  }

  private async networkOnly(request: Request): Promise<Response> {
    return fetch(request);
  }

  private async addResponseToCache(
    cache: Cache,
    request: Request,
    response: Response,
    cacheType: string
  ): Promise<void> {
    const strategy = this.strategies[cacheType];
    
    // Vérifier la limite d'entrées
    const keys = await cache.keys();
    if (keys.length >= strategy.maxEntries) {
      // Supprimer les plus anciennes entrées
      const oldestKeys = keys.slice(0, keys.length - strategy.maxEntries + 1);
      await Promise.all(oldestKeys.map(key => cache.delete(key)));
    }

    // Ajouter des headers pour le cache
    const responseToCache = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers({
        ...response.headers,
        'sw-cache-timestamp': Date.now().toString(),
        'sw-cache-type': cacheType,
      }),
    });

    await cache.put(request, responseToCache);
  }

  private isExpired(response: Response, cacheType: string): boolean {
    const strategy = this.strategies[cacheType];
    const timestamp = response.headers.get('sw-cache-timestamp');
    
    if (!timestamp) return true;
    
    const age = Date.now() - parseInt(timestamp);
    return age > strategy.maxAge;
  }

  async addToCache(cacheType: string, urls: string[]): Promise<void> {
    const cache = await caches.open(this.cacheNames[cacheType]);
    await cache.addAll(urls);
  }

  async removeFromCache(cacheType: string, url: string): Promise<boolean> {
    const cache = await caches.open(this.cacheNames[cacheType]);
    return cache.delete(url);
  }

  async cleanup(): Promise<void> {
    // Supprimer les anciens caches
    const cacheNames = await caches.keys();
    const currentCacheNames = Object.values(this.cacheNames);
    
    const deletePromises = cacheNames
      .filter(name => !currentCacheNames.includes(name))
      .map(name => caches.delete(name));

    await Promise.all(deletePromises);

    // Nettoyer les entrées expirées dans les caches actuels
    for (const [type, cacheName] of Object.entries(this.cacheNames)) {
      await this.cleanupExpiredEntries(cacheName, type);
    }
  }

  private async cleanupExpiredEntries(cacheName: string, cacheType: string): Promise<void> {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    const deletePromises = keys.map(async (key) => {
      const response = await cache.match(key);
      if (response && this.isExpired(response, cacheType)) {
        return cache.delete(key);
      }
    });

    await Promise.all(deletePromises);
  }

  async getUsageStats(): Promise<CacheUsageStats> {
    const cachesByType: Record<string, any> = {};
    let totalSize = 0;
    let totalEntries = 0;

    for (const [type, cacheName] of Object.entries(this.cacheNames)) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      let cacheSize = 0;
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          cacheSize += blob.size;
        }
      }

      cachesByType[type] = {
        size: cacheSize,
        entries: keys.length,
        hits: this.stats[type]?.hits || 0,
        misses: this.stats[type]?.misses || 0,
      };

      totalSize += cacheSize;
      totalEntries += keys.length;
    }

    // Calculer le taux de réussite global
    const totalHits = Object.values(this.stats).reduce((sum, stat) => sum + stat.hits, 0);
    const totalMisses = Object.values(this.stats).reduce((sum, stat) => sum + stat.misses, 0);
    const hitRate = totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;

    return {
      totalSize,
      totalEntries,
      hitRate,
      cachesByType,
    };
  }

  async clearCache(cacheType?: string): Promise<void> {
    if (cacheType) {
      const cacheName = this.cacheNames[cacheType];
      if (cacheName) {
        await caches.delete(cacheName);
        this.stats[cacheType] = { hits: 0, misses: 0 };
      }
    } else {
      // Effacer tous les caches
      for (const cacheName of Object.values(this.cacheNames)) {
        await caches.delete(cacheName);
      }
      Object.keys(this.stats).forEach(key => {
        this.stats[key] = { hits: 0, misses: 0 };
      });
    }
  }
}