'use strict';

var forOf = require('../utils/for-of');

module.exports = function() {

  var listeners = new Map();

  function getListenerSet(event) {

    var listenerSet;

    if (listeners.has(event)) {
      listenerSet = listeners.get(event);
    } else {
      listenerSet = new Set();
      listeners.set(event, listenerSet);
    }

    return listenerSet;
  }

  function createUnsubcribe(event, callback) {

    var listenerSet = getListenerSet(event);

    return function() {
      if (listenerSet.has(callback)) {
        listenerSet.delete(callback);
      }
    }
  }

  return {

    isSubscribable: true,

    /**
     * @param event Mixed Some unique ID for a set of event listeners. Can be
     * any type Map supports as a key.
     * @param cb Function The callback to execute every time the event occurs.
     * Will be given the context of the object mixed into
     *
     * @return Function An unsubscribe function to stop listening to this event
     */
    on: function(event, cb) {

      var listenerSet = getListenerSet(event),
          callback = cb.bind(this);

      listenerSet.add(callback);

      return createUnsubcribe(event, callback);

    },


    /**
     * @param event Mixed Some unique ID for a set of event listeners. Can be
     * any type Map supports as a key.
     * @param cb Function The callback to execute only once when the event next
     * occurs. Will be given the context of the object mixed into.
     *
     * @return Function An unsubscribe function to stop listening to this event
     */
    once: function(event, cb) {

      var listenerSet = getListenerSet(event),
          unsub,
          self = this,
          callback = function() {
            cb.apply(self, Array.prototype.slice.call(arguments));
            // immediately unsubscribe after executing the callback
            unsub();
          };

      unsub = createUnsubcribe(event, callback);

      listenerSet.add(callback);

      return unsub;
    },

    /**
     * Execute all the listening events for the given event
     *
     * @param event Mixed The event's UID
     * @param ... Mixed Any extra parameters are passed through to the listeners
     */
    trigger: function(event) {

      var listenerSet = getListenerSet(event),
          restArgs = Array.prototype.slice.call(arguments, 1);

      forOf(listenerSet, function(listener) {
        // context doesn't matter, we have already set it in on/once
        listener.apply(null, restArgs)
      });
    }
  }

}
