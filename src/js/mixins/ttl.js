'use strict';

module.exports = {

  isTtl: true,

  setTtl: function(ms) {
    this.ttl = ms;
  },

  updateTtl: function(steps) {

    // Game is timed at 60fps
    var timeElapsed = 1000 * steps / 60;
    this.ttl -= timeElapsed;

  },

  getTtl: function() {
    return this.ttl;
  }

};
