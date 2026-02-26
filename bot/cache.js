/**
 * ASTRALMIA — Cache Module
 * Simple in-memory cache with TTL support
 */

class Cache {
  constructor(defaultTTL = 3600_000) {
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data, ttl) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttl || this.defaultTTL),
    });
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    // Clean expired entries
    for (const [key, entry] of this.store) {
      if (Date.now() > entry.expiresAt) {
        this.store.delete(key);
      }
    }
    return this.store.size;
  }
}

module.exports = { Cache };
