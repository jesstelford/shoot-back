'use strict';

var objectAssign = require('object-assign');

function invariant() {
  if (process.env.NODE_ENV !== 'production') {
    if (!this.isSubscribable) {
      throw new Error('Renderer requires Subscribable to be mixed in');
    }
  }
}

module.exports = {

  isRenderer: true,

  /**
   * @param rendarable Function A function to execute each render
   *
   * @return Function an unsubscribe function to stop executing on render
   */
  registerRenderable: function(renderable) {
    invariant.call(this);
    return this.on('render', renderable);
  }

}
