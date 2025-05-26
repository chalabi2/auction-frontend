/**
 * Shared caching utilities for API endpoints
 */

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  oldestEntry?: number;
  newestEntry?: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Generate cache key from request data
   */
  generateKey(data: any): string {
    return JSON.stringify(data);
  }

  /**
   * Check if cache entry is valid
   */
  isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get cached data if valid
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set cache entry
   */
  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    const timestamps = entries.map(e => e.timestamp);
    const totalRequests = this.stats.hits + this.stats.misses;

    return {
      totalEntries: this.cache.size,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    };
  }

  /**
   * Get cache entry age in seconds
   */
  getEntryAge(key: string): number | null {
    const entry = this.cache.get(key);
    return entry ? Math.floor((Date.now() - entry.timestamp) / 1000) : null;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Default TTL values
export const CACHE_TTL = {
  RPC_QUERIES: 30 * 1000,      // 30 seconds for RPC queries
  AUCTION_DATA: 30 * 1000,     // 30 seconds for auction data
  BLOCK_DATA: 10 * 1000,       // 10 seconds for block data
  STATIC_DATA: 5 * 60 * 1000,  // 5 minutes for static data
}; 