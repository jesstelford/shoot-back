'use strict';

var caches = new Map();

module.exports = function(cacheName) {

  var newCache,
      cache;

  if (caches.has(cacheName)) {
    return caches.get(cacheName);
  }

  cache = new Set();

  newCache = {

    get: function(constructor, selector) {

      var result;

      if (typeof selector !== 'function') {
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

    size: function() {
      return cache.size;
    },
  };

  // Allow iteration with for...of
  newCache[Symbol.iterator] = function() {
    return cache[Symbol.iterator]();
  }

  caches.set(cacheName, newCache);
  return newCache;

}

