/**
 * Offline storage management using IndexedDB
 * Provides structured storage for offline data with versioning and conflict resolution
 */

export interface StorageItem {
  id: string;
  data: any;
  timestamp: number;
  version: number;
  syncStatus: 'pending' | 'synced' | 'conflict';
  lastModified: number;
}

export interface StorageConfig {
  dbName: string;
  dbVersion: number;
  stores: string[];
}

export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private config: StorageConfig;
  private initialized: boolean = false;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase) {
    this.config.stores.forEach(storeName => {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('syncStatus', 'syncStatus');
        store.createIndex('lastModified', 'lastModified');
      }
    });
  }

  async set(storeName: string, id: string, data: any, syncStatus: 'pending' | 'synced' = 'pending'): Promise<void> {
    await this.ensureInitialized();
    
    const item: StorageItem = {
      id,
      data,
      timestamp: Date.now(),
      version: 1,
      syncStatus,
      lastModified: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Check if item exists to increment version
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          item.version = existing.version + 1;
        }
        
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async get(storeName: string, id: string): Promise<StorageItem | null> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string): Promise<StorageItem[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingItems(storeName: string): Promise<StorageItem[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('syncStatus');
      const request = index.getAll('pending');
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getConflictItems(storeName: string): Promise<StorageItem[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('syncStatus');
      const request = index.getAll('conflict');
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncStatus(storeName: string, id: string, status: 'pending' | 'synced' | 'conflict'): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.syncStatus = status;
          item.lastModified = Date.now();
          
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Item doesn't exist, nothing to update
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async bulkSet(storeName: string, items: Array<{ id: string; data: any; syncStatus?: 'pending' | 'synced' }>): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let completedCount = 0;
      const totalCount = items.length;
      
      if (totalCount === 0) {
        resolve();
        return;
      }
      
      items.forEach(({ id, data, syncStatus = 'pending' }) => {
        const item: StorageItem = {
          id,
          data,
          timestamp: Date.now(),
          version: 1,
          syncStatus,
          lastModified: Date.now(),
        };
        
        const request = store.put(item);
        request.onsuccess = () => {
          completedCount++;
          if (completedCount === totalCount) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getItemsByDateRange(storeName: string, startDate: number, endDate: number): Promise<StorageItem[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageStats(storeName: string): Promise<{
    total: number;
    pending: number;
    synced: number;
    conflicts: number;
    totalSize: number;
  }> {
    await this.ensureInitialized();
    
    const allItems = await this.getAll(storeName);
    const stats = {
      total: allItems.length,
      pending: 0,
      synced: 0,
      conflicts: 0,
      totalSize: 0,
    };
    
    allItems.forEach(item => {
      switch (item.syncStatus) {
        case 'pending':
          stats.pending++;
          break;
        case 'synced':
          stats.synced++;
          break;
        case 'conflict':
          stats.conflicts++;
          break;
      }
      
      // Estimate size (rough calculation)
      stats.totalSize += JSON.stringify(item).length;
    });
    
    return stats;
  }

  async cleanup(storeName: string, maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    await this.ensureInitialized();
    
    const cutoffTime = Date.now() - maxAge;
    const allItems = await this.getAll(storeName);
    const itemsToDelete = allItems.filter(item => 
      item.timestamp < cutoffTime && item.syncStatus === 'synced'
    );
    
    let deletedCount = 0;
    
    for (const item of itemsToDelete) {
      try {
        await this.delete(storeName, item.id);
        deletedCount++;
      } catch (error) {
        console.error('Failed to delete item during cleanup:', error);
      }
    }
    
    return deletedCount;
  }

  async export(storeName: string): Promise<string> {
    const items = await this.getAll(storeName);
    return JSON.stringify(items, null, 2);
  }

  async import(storeName: string, data: string): Promise<void> {
    try {
      const items = JSON.parse(data) as StorageItem[];
      await this.clear(storeName);
      
      // Bulk insert imported items
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        let completedCount = 0;
        const totalCount = items.length;
        
        if (totalCount === 0) {
          resolve();
          return;
        }
        
        items.forEach(item => {
          const request = store.put(item);
          request.onsuccess = () => {
            completedCount++;
            if (completedCount === totalCount) {
              resolve();
            }
          };
          request.onerror = () => reject(request.error);
        });
      });
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

// Create default storage instance
export const offlineStorage = new OfflineStorage({
  dbName: 'wakedock-offline',
  dbVersion: 1,
  stores: ['containers', 'services', 'networks', 'volumes', 'requests', 'settings'],
});