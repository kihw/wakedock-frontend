/**
 * Cache strategies configuration for different types of resources
 */

export const CACHE_STRATEGIES = {
  // Assets statiques (CSS, JS, images, fonts)
  static: {
    strategy: 'cache-first' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    maxEntries: 100,
    compression: true,
  },
  
  // API publique et données de base
  api: {
    strategy: 'stale-while-revalidate' as const,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
    compression: false,
  },
  
  // Données utilisateur sensibles
  user: {
    strategy: 'network-first' as const,
    maxAge: 2 * 60 * 1000, // 2 minutes
    maxEntries: 30,
    compression: false,
  },
  
  // Images et médias
  images: {
    strategy: 'cache-first' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    maxEntries: 200,
    compression: true,
  },
  
  // Documents et fichiers
  documents: {
    strategy: 'cache-first' as const,
    maxAge: 60 * 60 * 1000, // 1 heure
    maxEntries: 50,
    compression: true,
  },
  
  // Données temps réel (metrics, logs)
  realtime: {
    strategy: 'network-first' as const,
    maxAge: 30 * 1000, // 30 secondes
    maxEntries: 20,
    compression: false,
  },
};

export const CACHE_PRIORITIES = {
  critical: ['/', '/manifest.json', '/offline.html'],
  high: ['/api/v1/health', '/api/v1/system/info'],
  medium: ['/api/v1/containers', '/api/v1/services'],
  low: ['/api/v1/logs', '/api/v1/metrics'],
};

export const CACHE_RULES = {
  // Patterns pour déterminer le type de cache
  patterns: {
    api: /^\/api\/v1\/(containers|services|networks|volumes|system)/,
    user: /^\/api\/v1\/(auth|user|profile|settings)/,
    realtime: /^\/api\/v1\/(logs|metrics|stats|events)/,
    images: /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)$/i,
    static: /\.(css|js|woff|woff2|ttf|eot|otf)$/i,
    documents: /\.(pdf|doc|docx|txt|md|json|yaml|yml)$/i,
  },
  
  // URLs à ne jamais mettre en cache
  exclude: [
    /^\/api\/v1\/auth\/login$/,
    /^\/api\/v1\/auth\/logout$/,
    /^\/api\/v1\/websocket/,
    /^\/api\/v1\/upload/,
    /^\/api\/v1\/download/,
  ],
  
  // Headers à préserver lors de la mise en cache
  preserveHeaders: [
    'content-type',
    'content-length',
    'etag',
    'last-modified',
    'cache-control',
    'expires',
  ],
};

export function getCacheType(url: string): string {
  const { patterns, exclude } = CACHE_RULES;
  
  // Vérifier les exclusions
  if (exclude.some(pattern => pattern.test(url))) {
    return 'network-only';
  }
  
  // Déterminer le type de cache
  if (patterns.user.test(url)) return 'user';
  if (patterns.realtime.test(url)) return 'realtime';
  if (patterns.api.test(url)) return 'api';
  if (patterns.images.test(url)) return 'images';
  if (patterns.static.test(url)) return 'static';
  if (patterns.documents.test(url)) return 'documents';
  
  // Par défaut, utiliser la stratégie API
  return 'api';
}

export function shouldCache(request: Request): boolean {
  // Ne pas mettre en cache les requêtes non-GET
  if (request.method !== 'GET') return false;
  
  // Ne pas mettre en cache les requêtes avec des paramètres de cache spéciaux
  const url = new URL(request.url);
  if (url.searchParams.has('no-cache')) return false;
  
  // Vérifier les headers
  const cacheControl = request.headers.get('cache-control');
  if (cacheControl && cacheControl.includes('no-cache')) return false;
  
  return true;
}

export function getCompressionType(contentType: string): 'gzip' | 'brotli' | null {
  // Déterminer le type de compression basé sur le content-type
  if (contentType.includes('text/') || 
      contentType.includes('application/json') ||
      contentType.includes('application/javascript') ||
      contentType.includes('application/xml')) {
    return 'gzip';
  }
  
  if (contentType.includes('image/svg+xml')) {
    return 'gzip';
  }
  
  return null;
}