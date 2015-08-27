'use strict';

module.exports = {

  isTimerDeath: true,

  setTtl: function(ms) {
    this.ttl = ms;
  },

  updateDeath: function(steps) {

    // Game is timed at 60fps
    var timeElapsed = 1000 * steps / 60;
    this.ttl -= timeElapsed;

    if (this.ttl < 0) {
      this.alive = false;
      this.ttl = 0;
    }
  }
};
