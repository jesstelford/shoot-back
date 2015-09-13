'use strict';

var forOf = require('./utils/for-of'),
    cacheGenerator = require('./cache-generator');

module.exports = function(name, createNew, defaultValue) {

  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Must specifiy a name for this recording');
    }
    if (createNew && typeof createNew !== 'function') {
      throw new Error('Optional `createNew` param must be a function');
    }
  }

  var cacheName = name + ':recording',
      cache = cacheGenerator(cacheName);

  var recording = {
    put: cache.put,
    forOf: function(iterator) {
      forOf(cache[Symbol.iterator](), iterator);
    }
  }

  // An iterator generator (can't use actual generators as uglifyjs doesn't yet
  // support them, even though they're supported in browsers. Ugh.
  recording[Symbol.iterator] = function() {

    var nextStoredResult,
        lastStoredResult,
        storedIterator = cache[Symbol.iterator](),
        newValue,
        result,
        size = cache.size(),
        i;

    // define the iterator
    return {

      /**
       * @param canUse Function Will be passed the current iteration value.
       * Should return true if this value is to be used now, or false if default
       * value is to be used.
       * @param ... Mixed Will be passed through to createNew function if
       * executed
       *
       * @return Object {value, done}
       */
      next: function(canUse) {

        var newSize = cache.size(),
            args = Array.prototype.slice.call(arguments),
            i;

        if (typeof canUse === 'function') {
          args = args.slice(1);
        } else {
          canUse = undefined;
        }

        // items have been added or removed since iterator was generated
        // So let's fix up the iterator and start again
        if (newSize !== size) {

          storedIterator = cache[Symbol.iterator]();

          for (i = 0; i < size && i < newSize; i++) {
            storedIterator.next();
          }

          size = newSize;
        }

        // Was there a value that we stalled on last time?
        if (lastStoredResult) {
          nextStoredResult = lastStoredResult;
        } else {
          nextStoredResult = storedIterator.next();
        }

        if (canUse) {

          // perform the check for this iteration
          if (canUse(nextStoredResult.value)) {

            // clear the stored value
            lastStoredResult = undefined;

          } else {

            // store the value so on next iteration we can re-check
            lastStoredResult = nextStoredResult;

            // YOU SHALL NOT PASS!
            nextStoredResult = {
              done: false,
              value: defaultValue
            }
          }

        }

        // then start generating new items
        if (nextStoredResult.done && createNew) {

          // generate a new item
          // pass-through any creation parameters
          newValue = createNew.apply(this, args);

          // Save the newly generated item for next run-through
          cache.put(newValue);

          result = {
            done: false,
            value: newValue
          };

        } else {

          // there's still stored items, so keep iterating
          result = nextStoredResult;
        }

        // return the current sequence value
        return result;
      }
    }
  }

  return recording;
}
