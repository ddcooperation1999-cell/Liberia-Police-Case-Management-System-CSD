import { useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing function calls
 * Delays function execution until user stops calling it
 */
export const useDebounce = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Custom hook for throttling function calls
 * Limits function execution to once per time interval
 */
export const useThrottle = (callback, delay = 300) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);
};

/**
 * Custom hook for request deduplication
 * Prevents duplicate API calls for the same resource
 */
export const useRequestCache = () => {
  const cacheRef = useRef(new Map());

  const get = useCallback((key) => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key, value) => {
    cacheRef.current.set(key, value);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const has = useCallback((key) => {
    return cacheRef.current.has(key);
  }, []);

  return { get, set, clear, has };
};

/**
 * Custom hook for lazy loading data with caching
 */
export const useLazyData = (fetchFunction, cacheKey) => {
  const [data, setData] = require('react').useState(null);
  const [loading, setLoading] = require('react').useState(false);
  const [error, setError] = require('react').useState(null);
  const cache = useRequestCache();

  const fetch = useCallback(async (...args) => {
    // Check cache first
    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(...args);
      cache.set(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, cacheKey, cache]);

  return { data, loading, error, fetch };
};

/**
 * Custom hook for prefetching data
 * Loads data before user needs it
 */
export const usePrefetch = () => {
  const pendingRef = useRef(new Map());

  const prefetch = useCallback(async (key, fetchFunction) => {
    if (!pendingRef.current.has(key)) {
      const promise = fetchFunction().catch(err => {
        console.error('Prefetch error:', err);
      });
      pendingRef.current.set(key, promise);
    }
    return pendingRef.current.get(key);
  }, []);

  const get = useCallback((key) => {
    return pendingRef.current.get(key);
  }, []);

  return { prefetch, get };
};
