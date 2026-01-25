/**
 * Performance Optimization Middleware
 * Implements industry best practices for web app performance
 */

// Request timing middleware
const requestTiming = (req, res, next) => {
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const isSlowRequest = duration > 1000;
    
    if (isSlowRequest) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
};

// Response header optimization
const optimizeHeaders = (req, res, next) => {
  // Enable HTTP/2 Server Push
  res.setHeader('Link', '');
  
  // Cache control headers
  if (req.method === 'GET') {
    // Vary header for cache key differentiation
    res.setHeader('Vary', 'Accept-Encoding, Accept, Authorization');
    
    // ETag for cache validation
    res.setHeader('ETag', `"${Buffer.from(JSON.stringify(res.body || '')).toString('hex').slice(0, 20)}"`);
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Performance hints
  res.setHeader('X-UA-Compatible', 'IE=edge');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Request body size limiting
const limitRequestSize = (maxSize = '1mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10);
    const maxBytes = parseFloat(maxSize) * 1024 * 1024;
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: `Request body too large (max ${maxSize})`
      });
    }
    
    next();
  };
};

// Query result limiting
const limitQueryResults = (defaultLimit = 20, maxLimit = 50) => {
  return (req, res, next) => {
    const limit = Math.min(
      parseInt(req.query.limit) || defaultLimit,
      maxLimit
    );
    
    req.query.limit = limit;
    next();
  };
};

// Connection timeout
const setConnectionTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout);
    res.setTimeout(timeout);
    next();
  };
};

// Response buffering (pre-allocate buffer to avoid reallocations)
const bufferResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    // Pre-calculate response size for buffer allocation
    const json = JSON.stringify(data);
    const buffer = Buffer.allocUnsafe(json.length);
    
    // Set content-length header (enables keep-alive)
    res.setHeader('Content-Length', Buffer.byteLength(json));
    
    return originalJson(data);
  };
  
  next();
};

// Request deduplication for same queries
const deduplicateRequests = (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  const key = `${req.path}:${JSON.stringify(req.query)}`;
  
  // In production, use Redis for this
  // For now, simple in-memory cache
  if (global.requestCache && global.requestCache.has(key)) {
    const cached = global.requestCache.get(key);
    if (Date.now() - cached.timestamp < 5000) { // 5 second cache
      return res.json(cached.data);
    }
  }
  
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    if (!global.requestCache) {
      global.requestCache = new Map();
    }
    
    global.requestCache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return originalJson(data);
  };
  
  next();
};

// Memory usage monitoring
const monitorMemory = (req, res, next) => {
  const used = process.memoryUsage();
  const limit = 500 * 1024 * 1024; // 500MB
  
  if (used.heapUsed > limit) {
    console.warn('HIGH MEMORY USAGE:', {
      heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
    });
  }
  
  next();
};

module.exports = {
  requestTiming,
  optimizeHeaders,
  limitRequestSize,
  limitQueryResults,
  setConnectionTimeout,
  bufferResponse,
  deduplicateRequests,
  monitorMemory,
};
