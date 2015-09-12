'use strict';

module.exports = {

  setState: function(state) {
    this.state = state;
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

  render: function(elapsedTime) {
    this.state.render(elapsedTime);
  }

}
