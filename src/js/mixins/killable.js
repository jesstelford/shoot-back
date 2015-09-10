'use strict';

function invariant() {
  if (process.env.NODE_ENV !== 'production') {
    if (!this.isSubscribable) {
      throw new Error('Killable requires Subscribable to be mixed in');
    }
  }
}

module.exports = {

  isKillable: true,

  isAlive: function() {
    return this.alive;
  },

  birth: function() {
    this.alive = true;
  },

  die: function() {
    invariant.call(this);

    this.alive = false;
    this.trigger('death');
  },

  onDeath: function(cb) {
    invariant.call(this);

    return this.on('death', cb);
  },

  onDeathOnce: function(cb) {
    invariant.call(this);

    return this.once('death', cb);
  }
}
