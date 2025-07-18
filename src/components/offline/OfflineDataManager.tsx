import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table } from '../ui/Table';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ProgressBar } from '../ui/ProgressBar';
import { 
  Database, 
  Sync, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { offlineStorage } from '@/lib/offline/offline-storage';
import { SyncStrategies, ConflictItem } from '@/lib/offline/sync-strategies';
import { offlineManager } from '@/lib/offline/offline-manager';
import { toast } from '@/lib/toast';

interface StorageStats {
  name: string;
  total: number;
  pending: number;
  synced: number;
  conflicts: number;
  totalSize: number;
}

export const OfflineDataManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [storageStats, setStorageStats] = useState<StorageStats[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [queuedRequests, setQueuedRequests] = useState<any[]>([]);

  const stores = ['containers', 'services', 'networks', 'volumes'];

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get storage stats for each store
      const stats: StorageStats[] = [];
      for (const storeName of stores) {
        const stat = await offlineStorage.getStorageStats(storeName);
        stats.push({
          name: storeName,
          ...stat,
        });
      }
      setStorageStats(stats);
      
      // Get conflicts
      const allConflicts: ConflictItem[] = [];
      for (const storeName of stores) {
        const storeConflicts = await offlineStorage.getConflictItems(storeName);
        allConflicts.push(...storeConflicts.map(item => ({
          id: item.id,
          localData: item.data,
          serverData: null, // Will be populated when needed
          lastModified: item.lastModified,
          strategy: 'manual' as const,
        })));
      }
      setConflicts(allConflicts);
      
      // Get queued requests
      const requests = offlineManager.getQueuedRequests();
      setQueuedRequests(requests);
      
    } catch (error) {
      console.error('Failed to load offline data:', error);
      toast.error('Failed to load offline data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncStore = async (storeName: string) => {
    try {
      setSyncInProgress(true);
      
      let result;
      switch (storeName) {
        case 'containers':
          result = await SyncStrategies.syncContainers('server-wins');
          break;
        case 'services':
          result = await SyncStrategies.syncServices('server-wins');
          break;
        default:
          result = await SyncStrategies.syncAll('server-wins');
      }
      
      if (result.success || (result as any).containers?.success) {
        toast.success(`${storeName} synchronized successfully`);
      } else {
        toast.error(`Failed to sync ${storeName}`);
      }
      
      await loadData();
    } catch (error) {
      console.error(`Sync failed for ${storeName}:`, error);
      toast.error(`Sync failed for ${storeName}`);
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncInProgress(true);
      const results = await SyncStrategies.syncAll('server-wins');
      
      let successCount = 0;
      let failedCount = 0;
      
      Object.values(results).forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      });
      
      if (failedCount === 0) {
        toast.success('All data synchronized successfully');
      } else {
        toast.warning(`${successCount} stores synced, ${failedCount} failed`);
      }
      
      await loadData();
    } catch (error) {
      console.error('Sync all failed:', error);
      toast.error('Failed to sync all stores');
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleClearStore = async (storeName: string) => {
    if (!confirm(`Are you sure you want to clear all ${storeName} data?`)) return;
    
    try {
      await offlineStorage.clear(storeName);
      toast.success(`${storeName} data cleared`);
      await loadData();
    } catch (error) {
      console.error(`Failed to clear ${storeName}:`, error);
      toast.error(`Failed to clear ${storeName}`);
    }
  };

  const handleExportData = async (storeName: string) => {
    try {
      const data = await offlineStorage.export(storeName);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storeName}-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${storeName} data exported`);
    } catch (error) {
      console.error(`Failed to export ${storeName}:`, error);
      toast.error(`Failed to export ${storeName}`);
    }
  };

  const handleImportData = async (storeName: string, file: File) => {
    try {
      const text = await file.text();
      await offlineStorage.import(storeName, text);
      toast.success(`${storeName} data imported`);
      await loadData();
    } catch (error) {
      console.error(`Failed to import ${storeName}:`, error);
      toast.error(`Failed to import ${storeName}`);
    }
  };

  const handleResolveConflict = async (conflict: ConflictItem, strategy: 'local' | 'server') => {
    try {
      // Implementation depends on the specific conflict resolution logic
      toast.info(`Resolving conflict with ${strategy} data`);
      await loadData();
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      toast.error('Failed to resolve conflict');
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getTotalStats = () => {
    return storageStats.reduce((total, stat) => ({
      total: total.total + stat.total,
      pending: total.pending + stat.pending,
      synced: total.synced + stat.synced,
      conflicts: total.conflicts + stat.conflicts,
      totalSize: total.totalSize + stat.totalSize,
    }), { total: 0, pending: 0, synced: 0, conflicts: 0, totalSize: 0 });
  };

  const totalStats = getTotalStats();

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
            Offline Data Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage offline data storage and synchronization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={loadData}
            size="sm"
          >
            Refresh
          </Button>
          <Button
            icon={Sync}
            onClick={handleSyncAll}
            loading={syncInProgress}
            size="sm"
          >
            Sync All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-xl font-semibold">{totalStats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Sync</p>
              <p className="text-xl font-semibold">{totalStats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conflicts</p>
              <p className="text-xl font-semibold">{totalStats.conflicts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Storage Size</p>
              <p className="text-xl font-semibold">{formatBytes(totalStats.totalSize)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Storage Stats Table */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">Storage Statistics</h3>
        </Card.Header>
        <Card.Content>
          <Table
            columns={[
              { key: 'name', label: 'Store' },
              { key: 'items', label: 'Items' },
              { key: 'status', label: 'Status' },
              { key: 'size', label: 'Size' },
              { key: 'syncStatus', label: 'Sync Status' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={storageStats.map((stat) => ({
              name: (
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-400" />
                  <span className="font-medium capitalize">{stat.name}</span>
                </div>
              ),
              items: <Badge variant="secondary">{stat.total}</Badge>,
              status: (
                <div className="space-y-1">
                  {stat.pending > 0 && (
                    <Badge variant="warning" size="sm">
                      {stat.pending} pending
                    </Badge>
                  )}
                  {stat.conflicts > 0 && (
                    <Badge variant="error" size="sm">
                      {stat.conflicts} conflicts
                    </Badge>
                  )}
                  {stat.synced > 0 && (
                    <Badge variant="success" size="sm">
                      {stat.synced} synced
                    </Badge>
                  )}
                </div>
              ),
              size: <span className="text-sm">{formatBytes(stat.totalSize)}</span>,
              syncStatus: (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Synced: {((stat.synced / stat.total) * 100).toFixed(0)}%</span>
                  </div>
                  <ProgressBar 
                    value={(stat.synced / stat.total) * 100} 
                    className="h-2"
                  />
                </div>
              ),
              actions: (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Sync}
                    onClick={() => handleSyncStore(stat.name)}
                    loading={syncInProgress}
                    disabled={stat.pending === 0}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Download}
                    onClick={() => handleExportData(stat.name)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => handleClearStore(stat.name)}
                  />
                </div>
              ),
            }))}
          />
        </Card.Content>
      </Card>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-medium">Data Conflicts</h3>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {conflicts.map((conflict, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Item: {conflict.id}</h4>
                      <p className="text-sm text-gray-600">
                        Modified: {new Date(conflict.lastModified).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict, 'local')}
                      >
                        Keep Local
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict, 'server')}
                      >
                        Keep Server
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Queued Requests */}
      {queuedRequests.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium">Queued Requests</h3>
            </div>
          </Card.Header>
          <Card.Content>
            <Table
              columns={[
                { key: 'method', label: 'Method' },
                { key: 'url', label: 'URL' },
                { key: 'priority', label: 'Priority' },
                { key: 'timestamp', label: 'Queued' },
                { key: 'retries', label: 'Retries' },
              ]}
              data={queuedRequests.map((request) => ({
                method: (
                  <Badge variant="secondary">
                    {request.method}
                  </Badge>
                ),
                url: (
                  <span className="text-sm font-mono truncate" title={request.url}>
                    {request.url}
                  </span>
                ),
                priority: (
                  <Badge
                    variant={
                      request.priority === 'high' ? 'error' :
                      request.priority === 'medium' ? 'warning' : 'info'
                    }
                  >
                    {request.priority}
                  </Badge>
                ),
                timestamp: (
                  <span className="text-sm">
                    {new Date(request.timestamp).toLocaleString()}
                  </span>
                ),
                retries: (
                  <span className="text-sm">
                    {request.retryCount}/{request.maxRetries}
                  </span>
                ),
              }))}
            />
          </Card.Content>
        </Card>
      )}
    </div>
  );
};