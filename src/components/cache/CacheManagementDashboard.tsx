import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { ProgressBar } from '../ui/ProgressBar';
import { MetricCard } from '../ui/MetricCard';
import { LoadingSpinner } from '../ui/loading-spinner';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  HardDrive,
  Zap,
  AlertCircle,
  Download,
  Settings
} from 'lucide-react';
import { cacheMetrics, CacheMetrics } from '@/lib/cache/cache-metrics';
import { toast } from '@/lib/toast';

interface CacheStats {
  type: string;
  size: number;
  entries: number;
  hitRate: number;
  hits: number;
  misses: number;
  averageResponseTime: number;
}

export const CacheManagementDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cacheStats, setCacheStats] = useState<CacheStats[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<{
    totalSize: number;
    totalEntries: number;
    hitRate: number;
    averageResponseTime: number;
  } | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const loadCacheData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les métriques de cache
      const metrics = cacheMetrics.getMetrics() as Map<string, CacheMetrics>;
      const stats: CacheStats[] = [];
      let totalSize = 0;
      let totalEntries = 0;
      let totalHits = 0;
      let totalRequests = 0;
      let totalResponseTime = 0;

      metrics.forEach((metric, type) => {
        stats.push({
          type,
          size: metric.cacheSize,
          entries: metric.totalRequests,
          hitRate: metric.hitRate,
          hits: metric.hits,
          misses: metric.misses,
          averageResponseTime: metric.averageResponseTime,
        });

        totalSize += metric.cacheSize;
        totalEntries += metric.totalRequests;
        totalHits += metric.hits;
        totalRequests += metric.totalRequests;
        totalResponseTime += metric.averageResponseTime;
      });

      setCacheStats(stats);
      setOverallMetrics({
        totalSize,
        totalEntries,
        hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
        averageResponseTime: stats.length > 0 ? totalResponseTime / stats.length : 0,
      });

      // Récupérer les données de performance
      const topUrls = cacheMetrics.getTopPerformingUrls(10);
      setPerformanceData(topUrls);

      // Récupérer les recommandations
      const efficiency = cacheMetrics.getCacheEfficiency();
      setRecommendations(efficiency.recommendations);

    } catch (error) {
      console.error('Failed to load cache data:', error);
      toast.error('Failed to load cache statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCacheData();
    const interval = setInterval(loadCacheData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async (cacheType?: string) => {
    try {
      if (cacheType) {
        // Effacer un cache spécifique
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE',
            cacheType,
          });
        }
        toast.success(`Cache ${cacheType} cleared`);
      } else {
        // Effacer tous les caches
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_ALL_CACHE',
          });
        }
        toast.success('All caches cleared');
      }
      
      // Recharger les données
      await loadCacheData();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const handleOptimizeCache = async () => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'OPTIMIZE_CACHE',
        });
      }
      toast.success('Cache optimization started');
      await loadCacheData();
    } catch (error) {
      console.error('Failed to optimize cache:', error);
      toast.error('Failed to optimize cache');
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const exportCacheMetrics = () => {
    const data = cacheMetrics.exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cache-metrics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Cache Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor and optimize application caching performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={Download}
            onClick={exportCacheMetrics}
            size="sm"
          >
            Export
          </Button>
          <Button
            variant="outline"
            icon={Zap}
            onClick={handleOptimizeCache}
            size="sm"
          >
            Optimize
          </Button>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={loadCacheData}
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      {overallMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Cache Size"
            value={formatBytes(overallMetrics.totalSize)}
            icon={HardDrive}
            trend={{ value: 0, direction: 'up' }}
          />
          <MetricCard
            title="Cache Entries"
            value={overallMetrics.totalEntries}
            icon={Database}
            trend={{ value: 0, direction: 'up' }}
          />
          <MetricCard
            title="Hit Rate"
            value={`${(overallMetrics.hitRate * 100).toFixed(1)}%`}
            icon={TrendingUp}
            trend={{ value: overallMetrics.hitRate > 0.7 ? 5 : -5, direction: overallMetrics.hitRate > 0.7 ? 'up' : 'down' }}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${overallMetrics.averageResponseTime.toFixed(0)}ms`}
            icon={Clock}
            trend={{ value: overallMetrics.averageResponseTime < 100 ? 5 : -5, direction: overallMetrics.averageResponseTime < 100 ? 'up' : 'down' }}
          />
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium">Recommendations</h3>
            </div>
          </Card.Header>
          <Card.Content>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card>
      )}

      {/* Cache Statistics by Type */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Cache Statistics by Type</h3>
            <Button
              variant="outline"
              icon={Trash2}
              onClick={() => handleClearCache()}
              size="sm"
            >
              Clear All
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <Table
            columns={[
              { key: 'type', label: 'Cache Type' },
              { key: 'size', label: 'Size' },
              { key: 'entries', label: 'Entries' },
              { key: 'hitRate', label: 'Hit Rate' },
              { key: 'performance', label: 'Performance' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={cacheStats.map((stat) => ({
              type: (
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{stat.type}</span>
                </div>
              ),
              size: <span className="text-sm">{formatBytes(stat.size)}</span>,
              entries: <Badge variant="secondary">{stat.entries}</Badge>,
              hitRate: (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {(stat.hitRate * 100).toFixed(1)}%
                    </span>
                    <Badge 
                      variant={stat.hitRate > 0.7 ? 'success' : stat.hitRate > 0.4 ? 'warning' : 'error'}
                      size="sm"
                    >
                      {stat.hitRate > 0.7 ? 'Good' : stat.hitRate > 0.4 ? 'Fair' : 'Poor'}
                    </Badge>
                  </div>
                  <ProgressBar value={stat.hitRate * 100} className="h-2" />
                </div>
              ),
              performance: (
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>{stat.hits} hits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>{stat.averageResponseTime.toFixed(0)}ms</span>
                  </div>
                </div>
              ),
              actions: (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Settings}
                    onClick={() => {
                      // Ouvrir les détails du cache
                      toast.info('Cache details coming soon');
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => handleClearCache(stat.type)}
                  />
                </div>
              ),
            }))}
          />
        </Card.Content>
      </Card>

      {/* Top Performing URLs */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">Top Performing URLs</h3>
        </Card.Header>
        <Card.Content>
          <Table
            columns={[
              { key: 'url', label: 'URL' },
              { key: 'hitRate', label: 'Hit Rate' },
              { key: 'responseTime', label: 'Avg Response Time' },
              { key: 'requests', label: 'Requests' },
            ]}
            data={performanceData.map((item) => ({
              url: (
                <span className="text-sm font-mono truncate" title={item.url}>
                  {item.url}
                </span>
              ),
              hitRate: (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{(item.hitRate * 100).toFixed(1)}%</span>
                  <Badge 
                    variant={item.hitRate > 0.8 ? 'success' : item.hitRate > 0.5 ? 'warning' : 'error'}
                    size="sm"
                  >
                    {item.hitRate > 0.8 ? 'Excellent' : item.hitRate > 0.5 ? 'Good' : 'Poor'}
                  </Badge>
                </div>
              ),
              responseTime: (
                <span className="text-sm">{item.averageResponseTime.toFixed(0)}ms</span>
              ),
              requests: <Badge variant="secondary">{item.totalRequests}</Badge>,
            }))}
          />
        </Card.Content>
      </Card>
    </div>
  );
};