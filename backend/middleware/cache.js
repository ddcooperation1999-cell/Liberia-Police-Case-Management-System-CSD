// Caching middleware for improved performance
const cacheStore = new Map();

// Cache configuration (in milliseconds)
const CACHE_DURATIONS = {
  short: 1 * 60 * 1000, // 1 minute
  medium: 5 * 60 * 1000, // 5 minutes
  long: 15 * 60 * 1000, // 15 minutes
};

// Generate cache key from request
const generateCacheKey = (req) => {
  const baseUrl = req.originalUrl || `${req.method} ${req.path}`;
  const userId = req.user?.id || 'anonymous';
  return `${userId}:${baseUrl}`;
};

// Cache middleware factory
const cacheMiddleware = (duration = CACHE_DURATIONS.medium) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cached = cacheStore.get(cacheKey);

    // Check if cached data exists and is still valid
    if (cached && cached.expiresAt > Date.now()) {
      if (process.env.NODE_ENV === 'development') console.log(`Cache HIT for ${cacheKey}`);
      return res.json(cached.data);
    }

    // Remove expired cache
    if (cached) {
      cacheStore.delete(cacheKey);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data) {
      cacheStore.set(cacheKey, {
        data,
        expiresAt: Date.now() + duration,
      });
      if (process.env.NODE_ENV === 'development') console.log(`Cache SET for ${cacheKey} (${duration}ms)`);
      return originalJson(data);
    };

    next();
  };
};

// Clear cache for specific patterns
const clearCache = (pattern) => {
  const regex = new RegExp(pattern);
  let cleared = 0;
  for (const [key] of cacheStore.entries()) {
    if (regex.test(key)) {
      cacheStore.delete(key);
      cleared++;
    }
  }
  console.log(`Cleared ${cleared} cache entries matching pattern: ${pattern}`);
  return cleared;
};

// Clear all cache
const clearAllCache = () => {
  const size = cacheStore.size;
  cacheStore.clear();
  console.log(`Cleared all ${size} cache entries`);
  return size;
};

// Invalidate cache on write operations
const invalidateCacheOnWrite = (pattern = '.*') => {
  return (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      clearCache(pattern);
    }
    next();
  };
};

// Cache stats
const getCacheStats = () => {
  return {
    size: cacheStore.size,
    entries: Array.from(cacheStore.keys()),
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache,
  invalidateCacheOnWrite,
  getCacheStats,
  CACHE_DURATIONS,
};
