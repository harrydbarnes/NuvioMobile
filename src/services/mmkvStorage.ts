import { createMMKV } from 'react-native-mmkv';
import { logger } from '../utils/logger';

class MMKVStorage {
  private static instance: MMKVStorage;
  private storage = createMMKV();
  // In-memory cache for frequently accessed data
  private cache = new Map<string, { value: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly MAX_CACHE_SIZE = 100; // Limit cache size to prevent memory issues

  private constructor() {}

  public static getInstance(): MMKVStorage {
    if (!MMKVStorage.instance) {
      MMKVStorage.instance = new MMKVStorage();
    }
    return MMKVStorage.instance;
  }

  // Cache management methods
  private getCached(key: string): string | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCached(key: string, value: any): void {
    // Implement LRU-style eviction if cache is too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  private invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // AsyncStorage-compatible API
  async getItem(key: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.getCached(key);
      if (cached !== null) {
        return cached;
      }
      
      // Read from storage
      const value = this.storage.getString(key);
      const result = value ?? null;
      
      // Cache the result
      if (result !== null) {
        this.setCached(key, result);
      }
      
      return result;
    } catch (error) {
      logger.error(`[MMKVStorage] Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.set(key, value);
      // Update cache immediately
      this.setCached(key, value);
    } catch (error) {
      logger.error(`[MMKVStorage] Error setting item ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      // MMKV V4 uses 'remove' method, not 'delete'
      if (this.storage.contains(key)) {
        this.storage.remove(key);
      }
      // Invalidate cache
      this.invalidateCache(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error removing item ${key}:`, error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = this.storage.getAllKeys();
      return Array.from(keys) as string[];
    } catch (error) {
      logger.error('[MMKVStorage] Error getting all keys:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const results: [string, string | null][] = [];
      for (const key of keys) {
        const value = this.storage.getString(key);
        results.push([key, value ?? null]);
      }
      return results;
    } catch (error) {
      logger.error('[MMKVStorage] Error in multiGet:', error);
      return keys.map(key => [key, null] as [string, string | null]);
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clearAll();
      this.cache.clear();
    } catch (error) {
      logger.error('[MMKVStorage] Error clearing storage:', error);
    }
  }

  // Direct MMKV access methods (for performance-critical operations)
  getString(key: string): string | undefined {
    try {
      return this.storage.getString(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error getting string ${key}:`, error);
      return undefined;
    }
  }

  setString(key: string, value: string): void {
    try {
      this.storage.set(key, value);
    } catch (error) {
      logger.error(`[MMKVStorage] Error setting string ${key}:`, error);
      return;
    }

    try {
      this.setCached(key, value);
    } catch (error) {
      logger.error(`[MMKVStorage] Error caching string ${key}:`, error);
    }
  }

  getNumber(key: string): number | undefined {
    try {
      return this.storage.getNumber(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error getting number ${key}:`, error);
      return undefined;
    }
  }

  setNumber(key: string, value: number): void {
    try {
      this.storage.set(key, value);
    } catch (error) {
      logger.error(`[MMKVStorage] Error setting number ${key}:`, error);
      return;
    }

    try {
      this.invalidateCache(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error invalidating cache for number ${key}:`, error);
    }
  }

  getBoolean(key: string): boolean | undefined {
    try {
      return this.storage.getBoolean(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error getting boolean ${key}:`, error);
      return undefined;
    }
  }

  setBoolean(key: string, value: boolean): void {
    try {
      this.storage.set(key, value);
    } catch (error) {
      logger.error(`[MMKVStorage] Error setting boolean ${key}:`, error);
      return;
    }

    try {
      this.invalidateCache(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error invalidating cache for boolean ${key}:`, error);
    }
  }

  contains(key: string): boolean {
    try {
      return this.storage.contains(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error checking contains for ${key}:`, error);
      return false;
    }
  }

  delete(key: string): void {
    try {
      if (this.storage.contains(key)) {
        this.storage.remove(key);
      }
    } catch (error) {
      logger.error(`[MMKVStorage] Error deleting key ${key}:`, error);
      return;
    }

    try {
      this.invalidateCache(key);
    } catch (error) {
      logger.error(`[MMKVStorage] Error invalidating cache for deleted key ${key}:`, error);
    }
  }

  // Additional AsyncStorage-compatible methods
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      for (const [key, value] of keyValuePairs) {
        this.storage.set(key, value);
      }
    } catch (error) {
      logger.error('[MMKVStorage] Error in multiSet:', error);
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        if (this.storage.contains(key)) {
          this.storage.remove(key);
        }
      }
    } catch (error) {
      logger.error('[MMKVStorage] Error in multiRemove:', error);
    }
  }
}

export const mmkvStorage = MMKVStorage.getInstance();
