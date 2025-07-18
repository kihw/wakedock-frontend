/**
 * Cache metrics and performance monitoring
 */

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  cacheSize: number;
  averageResponseTime: number;
  lastUpdated: number;
}

export interface CachePerformanceEntry {
  url: string;
  method: string;
  cacheType: string;
  strategy: string;
  hit: boolean;
  responseTime: number;
  size: number;
  timestamp: number;
}

export class CacheMetricsCollector {
  private metrics: Map<string, CacheMetrics> = new Map();
  private performanceEntries: CachePerformanceEntry[] = [];
  private maxEntries = 1000;

  recordCacheHit(cacheType: string, url: string, responseTime: number, size: number): void {
    this.updateMetrics(cacheType, true, responseTime, size);
    this.addPerformanceEntry({
      url,
      method: 'GET',
      cacheType,
      strategy: 'hit',
      hit: true,
      responseTime,
      size,
      timestamp: Date.now(),
    });
  }

  recordCacheMiss(cacheType: string, url: string, responseTime: number, size: number): void {
    this.updateMetrics(cacheType, false, responseTime, size);
    this.addPerformanceEntry({
      url,
      method: 'GET',
      cacheType,
      strategy: 'miss',
      hit: false,
      responseTime,
      size,
      timestamp: Date.now(),
    });
  }

  private updateMetrics(cacheType: string, hit: boolean, responseTime: number, size: number): void {
    const existing = this.metrics.get(cacheType) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      cacheSize: 0,
      averageResponseTime: 0,
      lastUpdated: Date.now(),
    };

    if (hit) {
      existing.hits++;
    } else {
      existing.misses++;
    }

    existing.totalRequests++;
    existing.hitRate = existing.hits / existing.totalRequests;
    existing.cacheSize += size;
    existing.averageResponseTime = 
      (existing.averageResponseTime * (existing.totalRequests - 1) + responseTime) / existing.totalRequests;
    existing.lastUpdated = Date.now();

    this.metrics.set(cacheType, existing);
  }

  private addPerformanceEntry(entry: CachePerformanceEntry): void {
    this.performanceEntries.push(entry);
    
    // Limiter le nombre d'entrées
    if (this.performanceEntries.length > this.maxEntries) {
      this.performanceEntries = this.performanceEntries.slice(-this.maxEntries);
    }
  }

  getMetrics(cacheType?: string): CacheMetrics | Map<string, CacheMetrics> {
    if (cacheType) {
      return this.metrics.get(cacheType) || {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        cacheSize: 0,
        averageResponseTime: 0,
        lastUpdated: Date.now(),
      };
    }
    return this.metrics;
  }

  getPerformanceEntries(
    cacheType?: string,
    limit: number = 100
  ): CachePerformanceEntry[] {
    let entries = this.performanceEntries;
    
    if (cacheType) {
      entries = entries.filter(entry => entry.cacheType === cacheType);
    }
    
    return entries.slice(-limit);
  }

  getTopPerformingUrls(limit: number = 10): Array<{
    url: string;
    hitRate: number;
    averageResponseTime: number;
    totalRequests: number;
  }> {
    const urlStats = new Map<string, {
      hits: number;
      misses: number;
      totalResponseTime: number;
      totalRequests: number;
    }>();

    this.performanceEntries.forEach(entry => {
      const existing = urlStats.get(entry.url) || {
        hits: 0,
        misses: 0,
        totalResponseTime: 0,
        totalRequests: 0,
      };

      if (entry.hit) {
        existing.hits++;
      } else {
        existing.misses++;
      }

      existing.totalResponseTime += entry.responseTime;
      existing.totalRequests++;
      urlStats.set(entry.url, existing);
    });

    return Array.from(urlStats.entries())
      .map(([url, stats]) => ({
        url,
        hitRate: stats.hits / stats.totalRequests,
        averageResponseTime: stats.totalResponseTime / stats.totalRequests,
        totalRequests: stats.totalRequests,
      }))
      .sort((a, b) => b.hitRate - a.hitRate)
      .slice(0, limit);
  }

  getSlowestUrls(limit: number = 10): Array<{
    url: string;
    averageResponseTime: number;
    totalRequests: number;
  }> {
    const urlStats = new Map<string, {
      totalResponseTime: number;
      totalRequests: number;
    }>();

    this.performanceEntries.forEach(entry => {
      const existing = urlStats.get(entry.url) || {
        totalResponseTime: 0,
        totalRequests: 0,
      };

      existing.totalResponseTime += entry.responseTime;
      existing.totalRequests++;
      urlStats.set(entry.url, existing);
    });

    return Array.from(urlStats.entries())
      .map(([url, stats]) => ({
        url,
        averageResponseTime: stats.totalResponseTime / stats.totalRequests,
        totalRequests: stats.totalRequests,
      }))
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, limit);
  }

  getCacheEfficiency(): {
    overall: number;
    byType: Map<string, number>;
    recommendations: string[];
  } {
    const overall = this.calculateOverallEfficiency();
    const byType = this.calculateEfficiencyByType();
    const recommendations = this.generateRecommendations();

    return {
      overall,
      byType,
      recommendations,
    };
  }

  private calculateOverallEfficiency(): number {
    let totalHits = 0;
    let totalRequests = 0;

    this.metrics.forEach(metric => {
      totalHits += metric.hits;
      totalRequests += metric.totalRequests;
    });

    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }

  private calculateEfficiencyByType(): Map<string, number> {
    const efficiency = new Map<string, number>();

    this.metrics.forEach((metric, cacheType) => {
      efficiency.set(cacheType, metric.hitRate);
    });

    return efficiency;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const slowUrls = this.getSlowestUrls(5);
    const lowHitRateTypes = Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.hitRate < 0.5)
      .map(([type]) => type);

    if (slowUrls.length > 0) {
      recommendations.push(
        `Consider optimizing slow URLs: ${slowUrls.map(u => u.url).join(', ')}`
      );
    }

    if (lowHitRateTypes.length > 0) {
      recommendations.push(
        `Low hit rate for cache types: ${lowHitRateTypes.join(', ')}. Consider adjusting cache strategies.`
      );
    }

    const totalCacheSize = Array.from(this.metrics.values())
      .reduce((sum, metric) => sum + metric.cacheSize, 0);

    if (totalCacheSize > 50 * 1024 * 1024) { // 50MB
      recommendations.push(
        'Cache size is growing large. Consider implementing more aggressive cleanup policies.'
      );
    }

    return recommendations;
  }

  exportMetrics(): string {
    const data = {
      metrics: Object.fromEntries(this.metrics),
      performanceEntries: this.performanceEntries,
      timestamp: Date.now(),
    };

    return JSON.stringify(data, null, 2);
  }

  reset(): void {
    this.metrics.clear();
    this.performanceEntries = [];
  }
}

// Instance globale pour la collecte de métriques
export const cacheMetrics = new CacheMetricsCollector();