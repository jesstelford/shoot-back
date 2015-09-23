'use strict';

var objectAssign = require('object-assign');

function invariant() {
  if (process.env.NODE_ENV !== 'production') {
    if (!this.isSubscribable) {
      throw new Error('Updater requires Subscribable to be mixed in');
    }
  }
}

module.exports = {

  isUpdater: true,

  /**
   * @param updatable Function A function to execute each update. Will be bound
   * to the context of this object
   *
   * @return Function an unsubscribe function to stop executing on update
   */
  registerUpdatable: function(updatable) {
    invariant.call(this);
    return this.on('update', updatable.bind(this));
  }

}
