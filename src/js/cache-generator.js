'use strict';

var caches = new Map();

/**
 * Create caches to store arbitrary sets of data.
 *
 * Data stored in the created caches will be deduplicated.
 * Caches are global based on the cacheName
 *
 * @param cacheName String A UUID to identify this cache
 *
 * @return Object The cache.
 */
module.exports = function(cacheName) {

  var newCache,
      cache;

  if (caches.has(cacheName)) {
    return caches.get(cacheName);
  }

  cache = new Set();

  newCache = {

    /**
     * @param constructor Function When creating a new item, use this
     * @param selector Function called with single argument: (cache). Return
     * either an element from the cache which should be used, or null to
     * generate a new one
     *
     * @return Mixed the selected or created cache item
     */
    get: function(constructor, selector) {

      var result;

      if (typeof selector !== 'function') {
        // when no selector set, always grab the first in the cache
        selector = function(cacheToSelectFrom) {
          return cache.values().next().value;
        }
      }

      if(cache.size > 0) {
        result = selector(cache);
        if (result) {
          cache.delete(result);
        } else {
          result = constructor();
        }
      } else {
        result = constructor();
      }

      return result;

    },

    put: function(item) {
      cache.add(item);
    },

    delete: function(item) {
      cache.delete(item);
    },

    size: function() {
      return cache.size;
    },

    clear: function() {
      return cache.clear();
    }
  };

  /**
   * Allow iteration of the cache values using ES6 Iterators
   *
   * @return Iterable
   */
  newCache[Symbol.iterator] = function() {
    return cache[Symbol.iterator]();
  }

  // Store this newly created cache in a global cache of caches... CACHE!
  caches.set(cacheName, newCache);

  return newCache;

}

