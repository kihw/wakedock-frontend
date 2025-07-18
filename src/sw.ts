/// <reference lib="webworker" />

// Service Worker pour WakeDock avec cache intelligent
import { CacheStrategy, CacheManager } from '@/lib/cache/cache-manager';

const CACHE_VERSION = 'wakedock-v1.0.1';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  api: `${CACHE_VERSION}-api`,
  user: `${CACHE_VERSION}-user`,
  images: `${CACHE_VERSION}-images`,
};

const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // Assets statiques - Cache First avec long TTL
  static: {
    strategy: 'cache-first',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    maxEntries: 100,
  },
  // API publique - Stale While Revalidate
  api: {
    strategy: 'stale-while-revalidate',
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
  },
  // Données utilisateur - Network First
  user: {
    strategy: 'network-first',
    maxAge: 2 * 60 * 1000, // 2 minutes
    maxEntries: 30,
  },
  // Images - Cache First avec compression
  images: {
    strategy: 'cache-first',
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    maxEntries: 200,
    compression: true,
  },
};

class ServiceWorkerCache {
  private cacheManager: CacheManager;

  constructor() {
    this.cacheManager = new CacheManager(CACHE_NAMES, CACHE_STRATEGIES);
  }

  async handleInstall(event: ExtendableEvent) {
    console.log('🔧 Service Worker installing...');
    
    // Pré-cache des ressources critiques
    const staticAssets = [
      '/',
      '/static/css/main.css',
      '/static/js/main.js',
      '/manifest.json',
      '/offline.html',
    ];

    await this.cacheManager.addToCache('static', staticAssets);
    console.log('✅ Service Worker installed');
  }

  async handleActivate(event: ExtendableEvent) {
    console.log('🚀 Service Worker activating...');
    
    // Nettoyer les anciens caches
    await this.cacheManager.cleanup();
    
    // Réclamer tous les clients
    await (self as any).clients.claim();
    
    console.log('✅ Service Worker activated');
  }

  async handleFetch(event: FetchEvent): Promise<Response> {
    const request = event.request;
    const url = new URL(request.url);

    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
      return fetch(request);
    }

    // Déterminer la stratégie de cache
    const cacheType = this.determineCacheType(url);
    const strategy = CACHE_STRATEGIES[cacheType];

    if (!strategy) {
      return fetch(request);
    }

    // Appliquer la stratégie de cache
    return this.cacheManager.handleRequest(request, cacheType);
  }

  private determineCacheType(url: URL): string {
    // API endpoints
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname.includes('/auth/') || url.pathname.includes('/user/')) {
        return 'user';
      }
      return 'api';
    }

    // Images et médias
    if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
      return 'images';
    }

    // Assets statiques
    if (url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)) {
      return 'static';
    }

    // Pages HTML
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
      return 'static';
    }

    // Default
    return 'api';
  }

  async handleSync(event: any) {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'cache-optimization') {
      await this.optimizeCache();
    }
  }

  private async optimizeCache() {
    // Analyser l'utilisation du cache
    const usage = await this.cacheManager.getUsageStats();
    console.log('📊 Cache usage:', usage);

    // Nettoyer les entrées anciennes
    await this.cacheManager.cleanup();

    // Précharger les ressources populaires
    await this.preloadPopularResources();
  }

  private async preloadPopularResources() {
    const popularEndpoints = [
      '/api/v1/containers',
      '/api/v1/services',
      '/api/v1/system/health',
    ];

    for (const endpoint of popularEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await this.cacheManager.addToCache('api', [endpoint]);
        }
      } catch (error) {
        console.warn('Failed to preload:', endpoint, error);
      }
    }
  }
}

// Instance globale du service worker
const swCache = new ServiceWorkerCache();

// Event listeners
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(swCache.handleInstall(event));
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(swCache.handleActivate(event));
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(swCache.handleFetch(event));
});

self.addEventListener('sync', (event: any) => {
  event.waitUntil(swCache.handleSync(event));
});

// Message handler pour la communication avec le client
self.addEventListener('message', (event: MessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

export {};