import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { WifiOff, Wifi, RefreshCw, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { offlineManager } from '@/lib/offline/offline-manager';
import { toast } from '@/lib/toast';

interface OfflineIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  position = 'top-right',
  showDetails = false 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueStatus, setQueueStatus] = useState({
    total: 0,
    byPriority: { high: 0, medium: 0, low: 0 },
    syncInProgress: false,
    lastSync: Date.now(),
  });
  const [showQueue, setShowQueue] = useState(false);
  const [dataAge, setDataAge] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(offlineManager.getNetworkStatus());
      setQueueStatus(offlineManager.getQueueStatus());
      setDataAge(offlineManager.getDataAge());
    };

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online - synchronizing...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You are offline - changes will be queued');
    };

    const handleSyncStarted = () => {
      updateStatus();
      toast.info('Synchronizing data...');
    };

    const handleSyncCompleted = () => {
      updateStatus();
      toast.success('Synchronization completed');
    };

    const handleSyncFailed = (error: any) => {
      updateStatus();
      toast.error(`Sync failed: ${error.message}`);
    };

    const handleRequestQueued = () => {
      updateStatus();
    };

    // Set up event listeners
    offlineManager.on('online', handleOnline);
    offlineManager.on('offline', handleOffline);
    offlineManager.on('sync-started', handleSyncStarted);
    offlineManager.on('sync-completed', handleSyncCompleted);
    offlineManager.on('sync-failed', handleSyncFailed);
    offlineManager.on('request-queued', handleRequestQueued);

    // Initial status update
    updateStatus();

    // Periodic updates
    const interval = setInterval(updateStatus, 5000);

    return () => {
      offlineManager.off('online', handleOnline);
      offlineManager.off('offline', handleOffline);
      offlineManager.off('sync-started', handleSyncStarted);
      offlineManager.off('sync-completed', handleSyncCompleted);
      offlineManager.off('sync-failed', handleSyncFailed);
      offlineManager.off('request-queued', handleRequestQueued);
      clearInterval(interval);
    };
  }, []);

  const handleRetrySync = async () => {
    try {
      await offlineManager.processPendingRequests();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const formatDataAge = (age: number): string => {
    if (age < 60000) return 'Just now';
    if (age < 3600000) return `${Math.floor(age / 60000)}m ago`;
    if (age < 86400000) return `${Math.floor(age / 3600000)}h ago`;
    return `${Math.floor(age / 86400000)}d ago`;
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="flex items-center gap-2">
        {/* Network Status Badge */}
        <Badge
          variant={isOnline ? 'success' : 'error'}
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setShowQueue(!showQueue)}
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>

        {/* Queue Status Badge */}
        {queueStatus.total > 0 && (
          <Badge
            variant="warning"
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => setShowQueue(!showQueue)}
          >
            <Clock className="h-3 w-3" />
            {queueStatus.total} queued
          </Badge>
        )}

        {/* Sync Status Badge */}
        {queueStatus.syncInProgress && (
          <Badge variant="info" className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Syncing
          </Badge>
        )}

        {/* Manual Sync Button */}
        {isOnline && queueStatus.total > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetrySync}
            className="h-6 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Queue Details Panel */}
      {showQueue && (showDetails || queueStatus.total > 0) && (
        <Card className="mt-2 w-80 max-w-sm">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {isOnline ? 'Sync Status' : 'Offline Mode'}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowQueue(false)}
                className="h-5 w-5 p-0"
              >
                ×
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {isOnline ? 'Connected to server' : 'Working offline'}
                </span>
              </div>

              {/* Data Age */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Data last updated {formatDataAge(dataAge)}
                </span>
              </div>

              {/* Queue Summary */}
              {queueStatus.total > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Queued Changes</h4>
                  <div className="space-y-1">
                    {queueStatus.byPriority.high > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-600">High Priority</span>
                        <Badge variant="error" size="sm">
                          {queueStatus.byPriority.high}
                        </Badge>
                      </div>
                    )}
                    {queueStatus.byPriority.medium > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-600">Medium Priority</span>
                        <Badge variant="warning" size="sm">
                          {queueStatus.byPriority.medium}
                        </Badge>
                      </div>
                    )}
                    {queueStatus.byPriority.low > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600">Low Priority</span>
                        <Badge variant="info" size="sm">
                          {queueStatus.byPriority.low}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-3 flex gap-2">
                {isOnline && queueStatus.total > 0 && (
                  <Button
                    size="sm"
                    onClick={handleRetrySync}
                    className="flex-1"
                    loading={queueStatus.syncInProgress}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync Now
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    offlineManager.syncAll();
                    toast.info('Refreshing data...');
                  }}
                  className="flex-1"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};