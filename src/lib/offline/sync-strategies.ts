/**
 * Synchronization strategies for offline data
 */

import { offlineStorage, StorageItem } from './offline-storage';

export type ConflictResolutionStrategy = 'server-wins' | 'client-wins' | 'merge' | 'manual';

export interface SyncResult {
  success: boolean;
  conflicts: ConflictItem[];
  synced: number;
  failed: number;
  errors: string[];
}

export interface ConflictItem {
  id: string;
  localData: any;
  serverData: any;
  lastModified: number;
  strategy: ConflictResolutionStrategy;
}

export class SyncStrategies {
  
  /**
   * Synchronize containers data
   */
  static async syncContainers(strategy: ConflictResolutionStrategy = 'server-wins'): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      conflicts: [],
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get pending local changes
      const pendingItems = await offlineStorage.getPendingItems('containers');
      
      // Get current server data
      const serverResponse = await fetch('/api/v1/containers');
      if (!serverResponse.ok) {
        throw new Error(`Server error: ${serverResponse.status}`);
      }
      
      const serverData = await serverResponse.json();
      const serverMap = new Map(serverData.map((item: any) => [item.id, item]));
      
      // Process pending changes
      for (const pendingItem of pendingItems) {
        try {
          const serverItem = serverMap.get(pendingItem.id);
          
          if (serverItem) {
            // Handle conflict
            const conflict = await this.handleConflict(
              'containers',
              pendingItem.id,
              pendingItem.data,
              serverItem,
              strategy
            );
            
            if (conflict) {
              result.conflicts.push(conflict);
            } else {
              result.synced++;
            }
          } else {
            // Item doesn't exist on server, push local change
            await this.pushToServer('containers', pendingItem);
            result.synced++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync container ${pendingItem.id}: ${error.message}`);
        }
      }
      
      // Update local storage with server data
      await this.updateLocalStorage('containers', serverData);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }
    
    return result;
  }

  /**
   * Synchronize services data
   */
  static async syncServices(strategy: ConflictResolutionStrategy = 'server-wins'): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      conflicts: [],
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const pendingItems = await offlineStorage.getPendingItems('services');
      
      const serverResponse = await fetch('/api/v1/services');
      if (!serverResponse.ok) {
        throw new Error(`Server error: ${serverResponse.status}`);
      }
      
      const serverData = await serverResponse.json();
      const serverMap = new Map(serverData.map((item: any) => [item.id, item]));
      
      for (const pendingItem of pendingItems) {
        try {
          const serverItem = serverMap.get(pendingItem.id);
          
          if (serverItem) {
            const conflict = await this.handleConflict(
              'services',
              pendingItem.id,
              pendingItem.data,
              serverItem,
              strategy
            );
            
            if (conflict) {
              result.conflicts.push(conflict);
            } else {
              result.synced++;
            }
          } else {
            await this.pushToServer('services', pendingItem);
            result.synced++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync service ${pendingItem.id}: ${error.message}`);
        }
      }
      
      await this.updateLocalStorage('services', serverData);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }
    
    return result;
  }

  /**
   * Handle conflict resolution
   */
  private static async handleConflict(
    storeName: string,
    id: string,
    localData: any,
    serverData: any,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictItem | null> {
    
    const conflict: ConflictItem = {
      id,
      localData,
      serverData,
      lastModified: Date.now(),
      strategy,
    };

    switch (strategy) {
      case 'server-wins':
        await offlineStorage.set(storeName, id, serverData, 'synced');
        return null;
        
      case 'client-wins':
        await this.pushToServer(storeName, { id, data: localData } as StorageItem);
        await offlineStorage.updateSyncStatus(storeName, id, 'synced');
        return null;
        
      case 'merge':
        const mergedData = this.mergeData(localData, serverData);
        await offlineStorage.set(storeName, id, mergedData, 'synced');
        await this.pushToServer(storeName, { id, data: mergedData } as StorageItem);
        return null;
        
      case 'manual':
        await offlineStorage.updateSyncStatus(storeName, id, 'conflict');
        return conflict;
        
      default:
        return conflict;
    }
  }

  /**
   * Push local changes to server
   */
  private static async pushToServer(storeName: string, item: StorageItem): Promise<void> {
    const endpoint = this.getEndpointForStore(storeName);
    const response = await fetch(`${endpoint}/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to push to server: ${response.status}`);
    }
    
    await offlineStorage.updateSyncStatus(storeName, item.id, 'synced');
  }

  /**
   * Update local storage with server data
   */
  private static async updateLocalStorage(storeName: string, serverData: any[]): Promise<void> {
    const items = serverData.map(data => ({
      id: data.id,
      data,
      syncStatus: 'synced' as const,
    }));
    
    await offlineStorage.bulkSet(storeName, items);
  }

  /**
   * Merge local and server data
   */
  private static mergeData(localData: any, serverData: any): any {
    if (typeof localData !== 'object' || typeof serverData !== 'object') {
      return serverData; // Fallback to server data for primitives
    }
    
    const merged = { ...serverData };
    
    // Merge strategy: prefer server data but keep local additions
    Object.keys(localData).forEach(key => {
      if (!(key in serverData)) {
        merged[key] = localData[key];
      } else if (Array.isArray(localData[key]) && Array.isArray(serverData[key])) {
        // For arrays, merge unique items
        const localItems = localData[key];
        const serverItems = serverData[key];
        const serverIds = new Set(serverItems.map((item: any) => item.id || item));
        const localAdditions = localItems.filter((item: any) => !serverIds.has(item.id || item));
        merged[key] = [...serverItems, ...localAdditions];
      }
    });
    
    return merged;
  }

  /**
   * Get API endpoint for storage type
   */
  private static getEndpointForStore(storeName: string): string {
    const endpoints = {
      containers: '/api/v1/containers',
      services: '/api/v1/services',
      networks: '/api/v1/networks',
      volumes: '/api/v1/volumes',
    };
    
    return endpoints[storeName as keyof typeof endpoints] || '/api/v1/data';
  }

  /**
   * Differential sync - only sync changed items
   */
  static async differentialSync(storeName: string, lastSyncTime: number): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      conflicts: [],
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get changes since last sync
      const response = await fetch(`${this.getEndpointForStore(storeName)}?since=${lastSyncTime}`);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const changedItems = await response.json();
      
      // Process each changed item
      for (const serverItem of changedItems) {
        try {
          const localItem = await offlineStorage.get(storeName, serverItem.id);
          
          if (localItem && localItem.syncStatus === 'pending') {
            // Handle conflict
            const conflict = await this.handleConflict(
              storeName,
              serverItem.id,
              localItem.data,
              serverItem,
              'server-wins'
            );
            
            if (conflict) {
              result.conflicts.push(conflict);
            } else {
              result.synced++;
            }
          } else {
            // No local changes, update with server data
            await offlineStorage.set(storeName, serverItem.id, serverItem, 'synced');
            result.synced++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to process ${serverItem.id}: ${error.message}`);
        }
      }
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Differential sync failed: ${error.message}`);
    }
    
    return result;
  }

  /**
   * Batch sync multiple stores
   */
  static async syncAll(strategy: ConflictResolutionStrategy = 'server-wins'): Promise<Record<string, SyncResult>> {
    const results: Record<string, SyncResult> = {};
    
    const stores = ['containers', 'services', 'networks', 'volumes'];
    
    for (const store of stores) {
      try {
        switch (store) {
          case 'containers':
            results[store] = await this.syncContainers(strategy);
            break;
          case 'services':
            results[store] = await this.syncServices(strategy);
            break;
          case 'networks':
            results[store] = await this.syncNetworks(strategy);
            break;
          case 'volumes':
            results[store] = await this.syncVolumes(strategy);
            break;
        }
      } catch (error) {
        results[store] = {
          success: false,
          conflicts: [],
          synced: 0,
          failed: 1,
          errors: [`Failed to sync ${store}: ${error.message}`],
        };
      }
    }
    
    return results;
  }

  /**
   * Sync networks (similar to containers but for networks)
   */
  private static async syncNetworks(strategy: ConflictResolutionStrategy): Promise<SyncResult> {
    // Similar implementation to syncContainers but for networks
    return this.syncGeneric('networks', strategy);
  }

  /**
   * Sync volumes (similar to containers but for volumes)
   */
  private static async syncVolumes(strategy: ConflictResolutionStrategy): Promise<SyncResult> {
    // Similar implementation to syncContainers but for volumes
    return this.syncGeneric('volumes', strategy);
  }

  /**
   * Generic sync method for any store
   */
  private static async syncGeneric(storeName: string, strategy: ConflictResolutionStrategy): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      conflicts: [],
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      const pendingItems = await offlineStorage.getPendingItems(storeName);
      
      const serverResponse = await fetch(this.getEndpointForStore(storeName));
      if (!serverResponse.ok) {
        throw new Error(`Server error: ${serverResponse.status}`);
      }
      
      const serverData = await serverResponse.json();
      const serverMap = new Map(serverData.map((item: any) => [item.id, item]));
      
      for (const pendingItem of pendingItems) {
        try {
          const serverItem = serverMap.get(pendingItem.id);
          
          if (serverItem) {
            const conflict = await this.handleConflict(
              storeName,
              pendingItem.id,
              pendingItem.data,
              serverItem,
              strategy
            );
            
            if (conflict) {
              result.conflicts.push(conflict);
            } else {
              result.synced++;
            }
          } else {
            await this.pushToServer(storeName, pendingItem);
            result.synced++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync ${storeName} ${pendingItem.id}: ${error.message}`);
        }
      }
      
      await this.updateLocalStorage(storeName, serverData);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error.message}`);
    }
    
    return result;
  }
}