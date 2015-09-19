'use strict';

module.exports = {

  setState: function(state) {

    if (this.state && typeof this.state.transitionOut === 'function') {
      this.state.transitionOut();
    }

    this.state = state;

    if (typeof this.state.transitionIn === 'function') {
      this.state.transitionIn();
    }

  },

  getState: function() {
    return this.state;
  },

  init: function() {
    // pass-through arguments
    this.state.init.apply(this.state, Array.prototype.slice.call(arguments));
  },

  update: function(elapsedTime) {
    this.state.update(elapsedTime);
  },

  render: function(ctx) {
    this.state.render(ctx);
  }

}
