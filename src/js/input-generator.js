'use strict';

module.exports = function() {

  var keyState = Object.create(null);

  return {

    // Key states:
    // undefined === up
    // 1 === just pressed
    // 2 === held
    isKeyDown: function isKeyDown(key) {
      return !!keyState[key];
    },

    isKeyPressed: function isKeyPressed(key) {
      return keyState[key] === 1;
    },

    isKeyHeld: function isKeyHeld(key) {
      return keyState[key] === 2;
    },

    handleKeyDown: function handleKeyDown(keyCode) {
      if (!keyState[keyCode]) {
        keyState[keyCode] = 1;
      }
    },

    handleKeyUp: function handleKeyUp(keyCode) {
      delete keyState[keyCode];
    },

    reset: function reset() {
      keyState = Object.create(null); // enable for...in without .hasOwnProperty
    },

    markDownAsHeld: function markDownAsHeld() {
      for (var key in keyState) {
        keyState[key] = 2;
      };
    }
  };
}
