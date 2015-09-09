'use strict';

module.exports = {

  every: function(promises, complete) {

    var done = [];

    if (process.env.NODE_ENV !== 'production') {
      if (!Array.isArray(promises)) {
        throw new Error('Must pass an array of Promise objects');
      }
    }

    promises.forEach(function(promise, index) {
      promise.then(function(result) {
        var doneLength;
        done[index] = result;

        // must use reduce as `done` is a sparse array, and so `.length` is
        // unreliable
        doneLength = done.reduce(function(count) { return count + 1 }, 0);
        if (doneLength === promises.length) {
          complete(done);
        }
      });
    })

  },

  some: function(promises, complete) {

    var done = false;

    if (process.env.NODE_ENV !== 'production') {
      if (!Array.isArray(promises)) {
        throw new Error('Must pass an array of Promise objects');
      }
    }

    promises.forEach(function(promise, index) {
      promise.then(function(result) {
        if (!done) {
          done = true;
          complete();
        }
      });
    })

  }
}
