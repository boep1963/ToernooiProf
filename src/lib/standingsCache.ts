/**
 * Simple in-memory cache for standings calculations
 * TTL: 30 seconds
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class StandingsCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly TTL = 30 * 1000; // 30 seconds in milliseconds

  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate cache key for standings
   */
  private getKey(orgNummer: number, compNumber: number, periode: number): string {
    return `standings-${orgNummer}-${compNumber}-${periode}`;
  }

  /**
   * Get cached standings if not expired
   */
  get<T>(orgNummer: number, compNumber: number, periode: number): T | null {
    const key = this.getKey(orgNummer, compNumber, periode);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.TTL) {
      // Expired - remove from cache
      this.cache.delete(key);
      return null;
    }

    console.log(`[CACHE] HIT: ${key} (age: ${age}ms)`);
    return entry.data as T;
  }

  /**
   * Set cached standings
   */
  set<T>(orgNummer: number, compNumber: number, periode: number, data: T): void {
    const key = this.getKey(orgNummer, compNumber, periode);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log(`[CACHE] SET: ${key}`);
  }

  /**
   * Invalidate cache for a specific competition (all periods)
   */
  invalidateCompetition(orgNummer: number, compNumber: number): void {
    const keysToDelete: string[] = [];

    // Find all keys matching this competition
    for (const key of this.cache.keys()) {
      if (key.startsWith(`standings-${orgNummer}-${compNumber}-`)) {
        keysToDelete.push(key);
      }
    }

    // Delete matching keys
    for (const key of keysToDelete) {
      this.cache.delete(key);
      console.log(`[CACHE] INVALIDATE: ${key}`);
    }
  }

  /**
   * Clear all cache entries (for testing or maintenance)
   */
  clear(): void {
    this.cache.clear();
    console.log('[CACHE] CLEARED ALL');
  }

  /**
   * Get cache stats (for debugging)
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
const standingsCache = new StandingsCache();
export default standingsCache;
