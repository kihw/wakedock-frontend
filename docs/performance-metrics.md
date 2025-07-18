# Métriques de Performance WakeDock

## 📋 Vue d'ensemble

Ce document détaille les métriques de performance pour WakeDock, définissant les seuils cibles, les méthodes de collecte et les indicateurs de performance clés (KPIs) pour garantir une expérience utilisateur optimale.

## 🎯 Objectifs de Performance

### 1. Métriques Core Web Vitals

```typescript
interface CoreWebVitals {
  // Largest Contentful Paint - Temps de chargement du contenu principal
  LCP: {
    target: number;     // ≤2.5 secondes
    good: number;       // ≤2.5s
    needsImprovement: number; // 2.5s - 4.0s
    poor: number;       // >4.0s
  };
  
  // First Input Delay - Temps de réponse aux interactions
  FID: {
    target: number;     // ≤100 millisecondes
    good: number;       // ≤100ms
    needsImprovement: number; // 100ms - 300ms
    poor: number;       // >300ms
  };
  
  // Cumulative Layout Shift - Stabilité visuelle
  CLS: {
    target: number;     // ≤0.1
    good: number;       // ≤0.1
    needsImprovement: number; // 0.1 - 0.25
    poor: number;       // >0.25
  };
  
  // First Contentful Paint - Premier contenu visible
  FCP: {
    target: number;     // ≤1.8 secondes
    good: number;       // ≤1.8s
    needsImprovement: number; // 1.8s - 3.0s
    poor: number;       // >3.0s
  };
  
  // Time to Interactive - Temps avant interactivité
  TTI: {
    target: number;     // ≤3.8 secondes
    good: number;       // ≤3.8s
    needsImprovement: number; // 3.8s - 7.3s
    poor: number;       // >7.3s
  };
}
```

### 2. Métriques Service Worker et Cache

```typescript
interface ServiceWorkerMetrics {
  // Taux de succès du cache
  cacheHitRatio: {
    target: number;     // ≥85%
    excellent: number;  // ≥90%
    good: number;       // ≥85%
    acceptable: number; // ≥70%
    poor: number;       // <70%
  };
  
  // Temps de chargement des pages
  pageLoadTime: {
    target: number;     // ≤2.0 secondes
    excellent: number;  // ≤1.5s
    good: number;       // ≤2.0s
    acceptable: number; // ≤3.0s
    poor: number;       // >3.0s
  };
  
  // Économies de bande passante
  bandwidthSavings: {
    target: number;     // ≥60%
    excellent: number;  // ≥80%
    good: number;       // ≥60%
    acceptable: number; // ≥40%
    poor: number;       // <40%
  };
  
  // Taux de synchronisation hors ligne
  offlineSyncSuccess: {
    target: number;     // ≥95%
    excellent: number;  // ≥98%
    good: number;       // ≥95%
    acceptable: number; // ≥90%
    poor: number;       // <90%
  };
  
  // Temps de réponse du cache
  cacheResponseTime: {
    target: number;     // ≤50ms
    excellent: number;  // ≤30ms
    good: number;       // ≤50ms
    acceptable: number; // ≤100ms
    poor: number;       // >100ms
  };
}
```

### 3. Métriques Backend API

```typescript
interface BackendMetrics {
  // Temps de réponse des APIs
  apiResponseTime: {
    target: number;     // ≤200ms
    excellent: number;  // ≤100ms
    good: number;       // ≤200ms
    acceptable: number; // ≤500ms
    poor: number;       // >500ms
  };
  
  // Débit (throughput)
  throughput: {
    target: number;     // ≥1000 req/sec
    excellent: number;  // ≥2000 req/sec
    good: number;       // ≥1000 req/sec
    acceptable: number; // ≥500 req/sec
    poor: number;       // <500 req/sec
  };
  
  // Taux d'erreur
  errorRate: {
    target: number;     // ≤1%
    excellent: number;  // ≤0.1%
    good: number;       // ≤1%
    acceptable: number; // ≤5%
    poor: number;       // >5%
  };
  
  // Disponibilité
  availability: {
    target: number;     // ≥99.9%
    excellent: number;  // ≥99.99%
    good: number;       // ≥99.9%
    acceptable: number; // ≥99.5%
    poor: number;       // <99.5%
  };
  
  // Utilisation CPU
  cpuUsage: {
    target: number;     // ≤70%
    excellent: number;  // ≤50%
    good: number;       // ≤70%
    acceptable: number; // ≤85%
    poor: number;       // >85%
  };
  
  // Utilisation mémoire
  memoryUsage: {
    target: number;     // ≤80%
    excellent: number;  // ≤60%
    good: number;       // ≤80%
    acceptable: number; // ≤90%
    poor: number;       // >90%
  };
}
```

## 📊 Collecte des Métriques

### 1. Métriques Frontend

```typescript
// src/lib/monitoring/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observer: PerformanceObserver;
  
  constructor() {
    this.setupObservers();
    this.startCollection();
  }
  
  private setupObservers(): void {
    // Observer pour Core Web Vitals
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(entry.name, entry.value);
      }
    });
    
    // Observer pour les métriques personnalisées
    this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
  }
  
  // Mesurer le temps de chargement des pages
  measurePageLoad(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: this.getLargestContentfulPaint()
      };
      
      this.sendMetrics('page-load', metrics);
    }
  }
  
  // Mesurer le taux de succès du cache
  measureCacheHitRatio(): void {
    const cacheHits = this.metrics.get('cache-hits') || [];
    const cacheMisses = this.metrics.get('cache-misses') || [];
    
    const totalRequests = cacheHits.length + cacheMisses.length;
    const hitRatio = totalRequests > 0 ? (cacheHits.length / totalRequests) * 100 : 0;
    
    this.recordMetric('cache-hit-ratio', hitRatio);
    
    if (hitRatio < 85) {
      this.alertLowCachePerformance(hitRatio);
    }
  }
  
  // Mesurer les métriques du Service Worker
  measureServiceWorkerMetrics(): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        const swMetrics = event.data;
        this.processServiceWorkerMetrics(swMetrics);
      };
      
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_METRICS'
      }, [channel.port2]);
    }
  }
  
  private processServiceWorkerMetrics(metrics: any): void {
    const processedMetrics = {
      cacheSize: metrics.cacheSize,
      networkSavings: metrics.networkSavings,
      offlineRequestsQueued: metrics.offlineRequestsQueued,
      syncSuccessRate: metrics.syncSuccessRate,
      averageResponseTime: metrics.averageResponseTime
    };
    
    this.sendMetrics('service-worker', processedMetrics);
  }
  
  // Mesurer la performance des ressources
  measureResourcePerformance(): void {
    const resources = performance.getEntriesByType('resource');
    
    const resourceMetrics = {
      totalResources: resources.length,
      totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
      totalTime: resources.reduce((sum, resource) => sum + resource.duration, 0),
      cacheHits: resources.filter(r => r.transferSize === 0).length,
      slowResources: resources.filter(r => r.duration > 1000).length
    };
    
    this.sendMetrics('resources', resourceMetrics);
  }
  
  // Mesurer la réactivité de l'interface
  measureUIResponsiveness(): void {
    let longTaskCount = 0;
    let totalBlockingTime = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          longTaskCount++;
          totalBlockingTime += entry.duration;
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    
    setTimeout(() => {
      const metrics = {
        longTaskCount,
        totalBlockingTime,
        averageBlockingTime: longTaskCount > 0 ? totalBlockingTime / longTaskCount : 0
      };
      
      this.sendMetrics('ui-responsiveness', metrics);
      observer.disconnect();
    }, 30000); // Mesurer pendant 30 secondes
  }
  
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }
  
  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }
  
  private getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }
  
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(value);
    
    // Garder seulement les 1000 dernières valeurs
    if (this.metrics.get(name)!.length > 1000) {
      this.metrics.get(name)!.shift();
    }
  }
  
  private sendMetrics(category: string, metrics: any): void {
    // Envoyer les métriques au backend
    fetch('/api/v1/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        metrics,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(error => {
      console.error('Failed to send metrics:', error);
    });
  }
  
  private alertLowCachePerformance(hitRatio: number): void {
    console.warn(`Cache hit ratio is below target: ${hitRatio}% (target: 85%)`);
    
    // Envoyer une alerte
    this.sendMetrics('alert', {
      type: 'low-cache-performance',
      value: hitRatio,
      threshold: 85,
      severity: 'warning'
    });
  }
  
  // Obtenir un résumé des métriques
  getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    for (const [name, values] of this.metrics) {
      if (values.length > 0) {
        summary[name] = {
          count: values.length,
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          p50: this.calculatePercentile(values, 50),
          p90: this.calculatePercentile(values, 90),
          p95: this.calculatePercentile(values, 95),
          p99: this.calculatePercentile(values, 99)
        };
      }
    }
    
    return summary;
  }
  
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
  
  private startCollection(): void {
    // Collecter les métriques toutes les 30 secondes
    setInterval(() => {
      this.measurePageLoad();
      this.measureCacheHitRatio();
      this.measureServiceWorkerMetrics();
      this.measureResourcePerformance();
      this.measureUIResponsiveness();
    }, 30000);
  }
}
```

### 2. Métriques Backend

```python
# wakedock/monitoring/performance_metrics.py
import time
import psutil
import asyncio
from typing import Dict, Any, List
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from prometheus_client import Counter, Histogram, Gauge, generate_latest

@dataclass
class MetricPoint:
    timestamp: float
    value: float
    labels: Dict[str, str] = None

class PerformanceMetrics:
    def __init__(self):
        # Métriques Prometheus
        self.request_count = Counter(
            'wakedock_requests_total', 
            'Total requests', 
            ['method', 'endpoint', 'status']
        )
        
        self.request_duration = Histogram(
            'wakedock_request_duration_seconds',
            'Request duration in seconds',
            ['method', 'endpoint']
        )
        
        self.cache_hit_ratio = Gauge(
            'wakedock_cache_hit_ratio',
            'Cache hit ratio percentage'
        )
        
        self.system_cpu_usage = Gauge(
            'wakedock_system_cpu_usage_percent',
            'System CPU usage percentage'
        )
        
        self.system_memory_usage = Gauge(
            'wakedock_system_memory_usage_percent',
            'System memory usage percentage'
        )
        
        self.active_connections = Gauge(
            'wakedock_active_connections',
            'Number of active connections'
        )
        
        self.error_rate = Gauge(
            'wakedock_error_rate',
            'Error rate percentage'
        )
        
        # Stockage des métriques
        self.metrics_storage: Dict[str, List[MetricPoint]] = {}
        
        # Démarrer la collecte périodique
        self.start_collection()
    
    def record_request(self, method: str, endpoint: str, status: int, duration: float):
        """Enregistrer une requête HTTP"""
        self.request_count.labels(method=method, endpoint=endpoint, status=status).inc()
        self.request_duration.labels(method=method, endpoint=endpoint).observe(duration)
        
        # Calculer le taux d'erreur
        self.update_error_rate()
    
    def record_cache_hit(self, cache_type: str, hit: bool):
        """Enregistrer un hit/miss de cache"""
        cache_key = f'cache_{cache_type}'
        
        if cache_key not in self.metrics_storage:
            self.metrics_storage[cache_key] = []
        
        self.metrics_storage[cache_key].append(MetricPoint(
            timestamp=time.time(),
            value=1 if hit else 0,
            labels={'type': cache_type}
        ))
        
        # Calculer le taux de hit
        self.update_cache_hit_ratio(cache_type)
    
    def record_api_response_time(self, endpoint: str, duration: float):
        """Enregistrer le temps de réponse d'une API"""
        api_key = f'api_response_time_{endpoint}'
        
        if api_key not in self.metrics_storage:
            self.metrics_storage[api_key] = []
        
        self.metrics_storage[api_key].append(MetricPoint(
            timestamp=time.time(),
            value=duration,
            labels={'endpoint': endpoint}
        ))
        
        # Vérifier si le temps de réponse dépasse le seuil
        if duration > 200:  # 200ms
            self.alert_slow_api_response(endpoint, duration)
    
    def update_cache_hit_ratio(self, cache_type: str):
        """Mettre à jour le taux de hit du cache"""
        cache_key = f'cache_{cache_type}'
        
        if cache_key in self.metrics_storage:
            recent_points = self.get_recent_points(cache_key, minutes=5)
            
            if recent_points:
                hits = sum(1 for point in recent_points if point.value == 1)
                total = len(recent_points)
                hit_ratio = (hits / total) * 100 if total > 0 else 0
                
                self.cache_hit_ratio.set(hit_ratio)
                
                # Alerter si le taux est faible
                if hit_ratio < 85:
                    self.alert_low_cache_performance(cache_type, hit_ratio)
    
    def update_error_rate(self):
        """Mettre à jour le taux d'erreur"""
        # Obtenir les métriques des dernières 5 minutes
        now = time.time()
        five_minutes_ago = now - 300
        
        total_requests = 0
        error_requests = 0
        
        # Parcourir les métriques de requêtes
        for family in self.request_count.collect():
            for sample in family.samples:
                if sample.timestamp and sample.timestamp >= five_minutes_ago:
                    total_requests += sample.value
                    if sample.labels.get('status', '').startswith('5'):
                        error_requests += sample.value
        
        error_rate = (error_requests / total_requests) * 100 if total_requests > 0 else 0
        self.error_rate.set(error_rate)
        
        # Alerter si le taux d'erreur est élevé
        if error_rate > 1:  # 1%
            self.alert_high_error_rate(error_rate)
    
    def collect_system_metrics(self):
        """Collecter les métriques système"""
        # CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        self.system_cpu_usage.set(cpu_percent)
        
        # Mémoire
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        self.system_memory_usage.set(memory_percent)
        
        # Connexions réseau
        connections = len(psutil.net_connections())
        self.active_connections.set(connections)
        
        # Alertes système
        if cpu_percent > 80:
            self.alert_high_cpu_usage(cpu_percent)
        
        if memory_percent > 85:
            self.alert_high_memory_usage(memory_percent)
    
    def get_recent_points(self, metric_key: str, minutes: int = 5) -> List[MetricPoint]:
        """Obtenir les points de métrique récents"""
        if metric_key not in self.metrics_storage:
            return []
        
        cutoff_time = time.time() - (minutes * 60)
        return [
            point for point in self.metrics_storage[metric_key]
            if point.timestamp >= cutoff_time
        ]
    
    def calculate_percentiles(self, values: List[float]) -> Dict[str, float]:
        """Calculer les percentiles"""
        if not values:
            return {}
        
        sorted_values = sorted(values)
        length = len(sorted_values)
        
        return {
            'p50': sorted_values[int(length * 0.5)],
            'p90': sorted_values[int(length * 0.9)],
            'p95': sorted_values[int(length * 0.95)],
            'p99': sorted_values[int(length * 0.99)]
        }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Obtenir un résumé des performances"""
        summary = {
            'timestamp': datetime.now().isoformat(),
            'cache_performance': {},
            'api_performance': {},
            'system_performance': {},
            'error_rates': {}
        }
        
        # Métriques de cache
        for cache_type in ['static', 'api', 'documents']:
            cache_key = f'cache_{cache_type}'
            recent_points = self.get_recent_points(cache_key, minutes=60)
            
            if recent_points:
                hits = sum(1 for point in recent_points if point.value == 1)
                total = len(recent_points)
                hit_ratio = (hits / total) * 100 if total > 0 else 0
                
                summary['cache_performance'][cache_type] = {
                    'hit_ratio': hit_ratio,
                    'total_requests': total,
                    'status': 'good' if hit_ratio >= 85 else 'poor'
                }
        
        # Métriques API
        for endpoint in ['containers', 'images', 'networks', 'volumes']:
            api_key = f'api_response_time_{endpoint}'
            recent_points = self.get_recent_points(api_key, minutes=60)
            
            if recent_points:
                response_times = [point.value for point in recent_points]
                avg_response_time = sum(response_times) / len(response_times)
                percentiles = self.calculate_percentiles(response_times)
                
                summary['api_performance'][endpoint] = {
                    'avg_response_time': avg_response_time,
                    'percentiles': percentiles,
                    'total_requests': len(response_times),
                    'status': 'good' if avg_response_time <= 200 else 'poor'
                }
        
        # Métriques système
        summary['system_performance'] = {
            'cpu_usage': psutil.cpu_percent(),
            'memory_usage': psutil.virtual_memory().percent,
            'active_connections': len(psutil.net_connections()),
            'disk_usage': psutil.disk_usage('/').percent
        }
        
        return summary
    
    def alert_slow_api_response(self, endpoint: str, duration: float):
        """Alerter en cas de réponse API lente"""
        print(f"ALERT: Slow API response for {endpoint}: {duration}ms (target: 200ms)")
        # Ici, vous pouvez ajouter une intégration avec un système d'alerte
    
    def alert_low_cache_performance(self, cache_type: str, hit_ratio: float):
        """Alerter en cas de faible performance de cache"""
        print(f"ALERT: Low cache performance for {cache_type}: {hit_ratio}% (target: 85%)")
    
    def alert_high_error_rate(self, error_rate: float):
        """Alerter en cas de taux d'erreur élevé"""
        print(f"ALERT: High error rate: {error_rate}% (target: <1%)")
    
    def alert_high_cpu_usage(self, cpu_percent: float):
        """Alerter en cas d'utilisation CPU élevée"""
        print(f"ALERT: High CPU usage: {cpu_percent}% (target: <80%)")
    
    def alert_high_memory_usage(self, memory_percent: float):
        """Alerter en cas d'utilisation mémoire élevée"""
        print(f"ALERT: High memory usage: {memory_percent}% (target: <85%)")
    
    def start_collection(self):
        """Démarrer la collecte périodique des métriques"""
        async def collect_periodically():
            while True:
                self.collect_system_metrics()
                await asyncio.sleep(30)  # Collecter toutes les 30 secondes
        
        asyncio.create_task(collect_periodically())
    
    def export_prometheus_metrics(self) -> str:
        """Exporter les métriques au format Prometheus"""
        return generate_latest()
```

## 📈 Monitoring et Alertes

### 1. Configuration des Alertes

```yaml
# alerts/performance-alerts.yml
groups:
  - name: performance
    rules:
      - alert: HighCacheHitRatio
        expr: wakedock_cache_hit_ratio < 85
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit ratio is below target"
          description: "Cache hit ratio is {{ $value }}% (target: 85%)"
      
      - alert: SlowPageLoad
        expr: wakedock_page_load_time > 2000
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Page load time is above target"
          description: "Page load time is {{ $value }}ms (target: 2000ms)"
      
      - alert: HighAPIResponseTime
        expr: wakedock_api_response_time > 200
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "API response time is above target"
          description: "API response time is {{ $value }}ms (target: 200ms)"
      
      - alert: LowAvailability
        expr: wakedock_availability < 99.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Service availability is below target"
          description: "Service availability is {{ $value }}% (target: 99.9%)"
```

### 2. Dashboard Grafana

```json
{
  "dashboard": {
    "title": "WakeDock Performance Dashboard",
    "panels": [
      {
        "title": "Cache Hit Ratio",
        "type": "stat",
        "targets": [
          {
            "expr": "wakedock_cache_hit_ratio",
            "legendFormat": "Cache Hit Ratio"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 70},
                {"color": "green", "value": 85}
              ]
            }
          }
        }
      },
      {
        "title": "Page Load Time",
        "type": "graph",
        "targets": [
          {
            "expr": "wakedock_page_load_time",
            "legendFormat": "Page Load Time"
          }
        ],
        "yAxes": [
          {
            "label": "Time (ms)",
            "max": 3000
          }
        ]
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "wakedock_api_response_time",
            "legendFormat": "API Response Time"
          }
        ],
        "yAxes": [
          {
            "label": "Time (ms)",
            "max": 500
          }
        ]
      }
    ]
  }
}
```

## 🎯 Seuils de Performance

### 1. Seuils Critiques

| Métrique | Cible | Bon | Acceptable | Critique |
|----------|--------|-----|------------|----------|
| Cache Hit Ratio | ≥85% | ≥85% | ≥70% | <70% |
| Page Load Time | ≤2.0s | ≤2.0s | ≤3.0s | >3.0s |
| API Response Time | ≤200ms | ≤200ms | ≤500ms | >500ms |
| Error Rate | ≤1% | ≤1% | ≤5% | >5% |
| Availability | ≥99.9% | ≥99.9% | ≥99.5% | <99.5% |
| CPU Usage | ≤70% | ≤70% | ≤85% | >85% |
| Memory Usage | ≤80% | ≤80% | ≤90% | >90% |

### 2. Actions Automatiques

```typescript
// Exemple d'actions automatiques basées sur les métriques
class AutomatedActions {
  async handleLowCachePerformance(hitRatio: number) {
    if (hitRatio < 70) {
      // Redémarrer le service worker
      await this.restartServiceWorker();
      
      // Pré-charger les ressources critiques
      await this.preloadCriticalResources();
      
      // Alerter l'équipe
      await this.sendAlert('Critical cache performance', {
        hitRatio,
        action: 'service_worker_restart'
      });
    }
  }
  
  async handleHighResponseTime(responseTime: number) {
    if (responseTime > 500) {
      // Activer le cache agressif
      await this.enableAggressiveCaching();
      
      // Réduire la charge
      await this.enableRateLimiting();
      
      // Alerter l'équipe
      await this.sendAlert('High response time', {
        responseTime,
        action: 'aggressive_caching_enabled'
      });
    }
  }
}
```

## 📋 Checklist de Performance

### Optimisations Frontend
- [ ] Cache Hit Ratio ≥85%
- [ ] Page Load Time ≤2.0s
- [ ] First Contentful Paint ≤1.8s
- [ ] Largest Contentful Paint ≤2.5s
- [ ] Cumulative Layout Shift ≤0.1
- [ ] Time to Interactive ≤3.8s

### Optimisations Backend
- [ ] API Response Time ≤200ms
- [ ] Throughput ≥1000 req/sec
- [ ] Error Rate ≤1%
- [ ] Availability ≥99.9%
- [ ] CPU Usage ≤70%
- [ ] Memory Usage ≤80%

### Monitoring
- [ ] Métriques collectées automatiquement
- [ ] Alertes configurées
- [ ] Dashboard Grafana opérationnel
- [ ] Rapports de performance automatisés
- [ ] Actions automatiques en cas de problème

---

*Cette documentation fournit un cadre complet pour le monitoring et l'optimisation des performances de WakeDock.*