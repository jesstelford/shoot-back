'use strict';

var forOf = require('../utils/for-of');

module.exports = function() {

  var listeners = new Set();

  var createUnsubcribe = function(callback) {
    return function() {
      if (listeners.has(callback)) {
        listeners.delete(callback);
      }
    }
  }

  return {

    isKillable: true,

    isAlive: function() {
      return this.alive;
    },

    birth: function() {
      this.alive = true;
    },

    die: function() {
      this.alive = false;
      forOf(listeners, function(listener) {
        listener()
      });
    },

    onDeath: function(cb) {

      var callback = cb.bind(this);

      listeners.add(callback);

      return createUnsubcribe(callback);
    },

    onDeathOnce: function(cb) {

      var unsub,
          callback;

      callback = function() {
        cb.call(this);
        unsub();
      }

      unsub = createUnsubcribe(callback);

      listeners.add(callback);

      return unsub;
    }
  };
}
