'use strict';

var cache = new Set();

module.exports = {

  get: function(constructor) {

    var result;

    if(cache.size > 0) {
      result = cache.values().next().value;
      cache.delete(result);
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
  }

}

