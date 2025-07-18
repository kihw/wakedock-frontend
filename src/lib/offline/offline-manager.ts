/**
 * Offline manager for WakeDock
 * Handles offline detection, request queuing, and synchronization
 */

export interface OfflineRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  maxRetries: number;
}

export interface SyncConfig {
  retryDelay: number;
  maxRetries: number;
  batchSize: number;
  priorityOrder: string[];
}

export interface OfflineData {
  containers: any[];
  services: any[];
  networks: any[];
  volumes: any[];
  lastSync: number;
}

export class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private requestQueue: OfflineRequest[] = [];
  private syncConfig: SyncConfig = {
    retryDelay: 5000,
    maxRetries: 3,
    batchSize: 5,
    priorityOrder: ['high', 'medium', 'low'],
  };
  private offlineData: OfflineData = {
    containers: [],
    services: [],
    networks: [],
    volumes: [],
    lastSync: Date.now(),
  };
  private syncInProgress: boolean = false;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
    this.loadOfflineData();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      this.processPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });

    // Listen to visibility change for sync when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processPendingRequests();
      }
    });
  }

  private async loadOfflineData() {
    try {
      const stored = localStorage.getItem('wakedock-offline-data');
      if (stored) {
        this.offlineData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  private async saveOfflineData() {
    try {
      localStorage.setItem('wakedock-offline-data', JSON.stringify(this.offlineData));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  async queueRequest(request: Omit<OfflineRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const queuedRequest: OfflineRequest = {
      ...request,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.requestQueue.push(queuedRequest);
    this.sortQueueByPriority();
    this.saveQueue();

    this.emit('request-queued', queuedRequest);

    // Try to process immediately if online
    if (this.isOnline) {
      this.processPendingRequests();
    }

    return queuedRequest.id;
  }

  private sortQueueByPriority() {
    this.requestQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async saveQueue() {
    try {
      localStorage.setItem('wakedock-request-queue', JSON.stringify(this.requestQueue));
    } catch (error) {
      console.error('Failed to save request queue:', error);
    }
  }

  private async loadQueue() {
    try {
      const stored = localStorage.getItem('wakedock-request-queue');
      if (stored) {
        this.requestQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load request queue:', error);
    }
  }

  async processPendingRequests() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.emit('sync-started');

    try {
      await this.loadQueue();
      
      while (this.requestQueue.length > 0 && this.isOnline) {
        const batch = this.requestQueue.splice(0, this.syncConfig.batchSize);
        await this.processBatch(batch);
      }

      this.emit('sync-completed');
    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('sync-failed', error);
    } finally {
      this.syncInProgress = false;
      this.saveQueue();
    }
  }

  private async processBatch(batch: OfflineRequest[]) {
    const promises = batch.map(request => this.processRequest(request));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const request = batch[index];
      if (result.status === 'fulfilled') {
        this.emit('request-synced', request);
      } else {
        this.handleRequestFailure(request, result.reason);
      }
    });
  }

  private async processRequest(request: OfflineRequest): Promise<any> {
    const { url, method, headers, body } = request;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private handleRequestFailure(request: OfflineRequest, error: any) {
    request.retryCount++;

    if (request.retryCount < request.maxRetries) {
      // Re-queue for retry
      this.requestQueue.push(request);
      this.emit('request-retry', request);
    } else {
      // Max retries reached, mark as failed
      this.emit('request-failed', request, error);
    }
  }

  // Data synchronization methods
  async syncContainers() {
    if (!this.isOnline) return this.offlineData.containers;

    try {
      const response = await fetch('/api/v1/containers');
      const containers = await response.json();
      this.offlineData.containers = containers;
      this.offlineData.lastSync = Date.now();
      this.saveOfflineData();
      return containers;
    } catch (error) {
      console.error('Failed to sync containers:', error);
      return this.offlineData.containers;
    }
  }

  async syncServices() {
    if (!this.isOnline) return this.offlineData.services;

    try {
      const response = await fetch('/api/v1/services');
      const services = await response.json();
      this.offlineData.services = services;
      this.offlineData.lastSync = Date.now();
      this.saveOfflineData();
      return services;
    } catch (error) {
      console.error('Failed to sync services:', error);
      return this.offlineData.services;
    }
  }

  async syncNetworks() {
    if (!this.isOnline) return this.offlineData.networks;

    try {
      const response = await fetch('/api/v1/networks');
      const networks = await response.json();
      this.offlineData.networks = networks;
      this.offlineData.lastSync = Date.now();
      this.saveOfflineData();
      return networks;
    } catch (error) {
      console.error('Failed to sync networks:', error);
      return this.offlineData.networks;
    }
  }

  async syncVolumes() {
    if (!this.isOnline) return this.offlineData.volumes;

    try {
      const response = await fetch('/api/v1/volumes');
      const volumes = await response.json();
      this.offlineData.volumes = volumes;
      this.offlineData.lastSync = Date.now();
      this.saveOfflineData();
      return volumes;
    } catch (error) {
      console.error('Failed to sync volumes:', error);
      return this.offlineData.volumes;
    }
  }

  async syncAll() {
    await Promise.all([
      this.syncContainers(),
      this.syncServices(),
      this.syncNetworks(),
      this.syncVolumes(),
    ]);
  }

  getOfflineData(): OfflineData {
    return this.offlineData;
  }

  getQueuedRequests(): OfflineRequest[] {
    return [...this.requestQueue];
  }

  getQueueStatus() {
    return {
      total: this.requestQueue.length,
      byPriority: {
        high: this.requestQueue.filter(r => r.priority === 'high').length,
        medium: this.requestQueue.filter(r => r.priority === 'medium').length,
        low: this.requestQueue.filter(r => r.priority === 'low').length,
      },
      syncInProgress: this.syncInProgress,
      lastSync: this.offlineData.lastSync,
    };
  }

  clearQueue() {
    this.requestQueue = [];
    this.saveQueue();
    this.emit('queue-cleared');
  }

  removeRequest(id: string) {
    const index = this.requestQueue.findIndex(r => r.id === id);
    if (index > -1) {
      this.requestQueue.splice(index, 1);
      this.saveQueue();
      this.emit('request-removed', id);
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(...args));
    }
  }

  // Data conflict resolution
  async resolveConflicts(localData: any, serverData: any, strategy: 'server' | 'local' | 'merge' = 'server') {
    switch (strategy) {
      case 'server':
        return serverData;
      case 'local':
        return localData;
      case 'merge':
        return this.mergeData(localData, serverData);
      default:
        return serverData;
    }
  }

  private mergeData(localData: any, serverData: any) {
    // Simple merge strategy - can be enhanced based on data structure
    if (Array.isArray(localData) && Array.isArray(serverData)) {
      // For arrays, prefer server data but keep local additions
      const serverIds = new Set(serverData.map(item => item.id));
      const localAdditions = localData.filter(item => !serverIds.has(item.id));
      return [...serverData, ...localAdditions];
    } else if (typeof localData === 'object' && typeof serverData === 'object') {
      // For objects, merge properties
      return { ...localData, ...serverData };
    }
    return serverData;
  }

  // Background sync registration
  async registerBackgroundSync(tag: string) {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      return registration.sync.register(tag);
    }
    throw new Error('Background sync not supported');
  }

  // Utility methods
  isStale(timestamp: number, maxAge: number = 5 * 60 * 1000): boolean {
    return Date.now() - timestamp > maxAge;
  }

  getDataAge(): number {
    return Date.now() - this.offlineData.lastSync;
  }

  // Configuration
  updateSyncConfig(config: Partial<SyncConfig>) {
    this.syncConfig = { ...this.syncConfig, ...config };
  }

  getSyncConfig(): SyncConfig {
    return { ...this.syncConfig };
  }
}

// Global instance
export const offlineManager = new OfflineManager();