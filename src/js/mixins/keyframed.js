'use strict';

function ensureDefaults() {

  if (!this._keyframeElapsedTime) {
    this._keyframeElapsedTime = 0;
  }

  if (!this._keyframeState) {
    this._keyframeState = this.keyframes.map(function() {
      return {}
    });
  }
}

/**
 * A keyframe action mixin
 *
 * Allows arbitrary execution of methods on the object mixed into. Concurrent
 * keyframes can execute at any given start time, with limited loops, indefinite
 * looping, or one-off events.
 */
module.exports = {

  isKeyframed: true,

  /**
   * @param keyframes Array list of keyframes and their associated actions. Will
   * be called with the conxtext of the object mixed into.
      {
        when: After how many milliseconds does this keyframe occur?
        func: What function on `this` is called?
        params: A function accepting param `elapsedTime` (in ms), returning an
                array of parameters to apply to func. Return `false` to cancel
                calling `func`
        loopFor: How many ms to loop for.
                 if < 0, loop forever
                 if 0, never loop
                 if > 0, loop continuously until that time is reached
        reset: if true, will reset the state once. func, params, loopFor is ignored.
      }
   */
  setKeyframes: function(keyframes) {
    this.keyframes = keyframes;
  },

  updateKeyframes: function(elapsedTime) {

    var self = this;

    ensureDefaults.call(this);

    this.keyframes.forEach(function(frame, index) {

      var frameState = self._keyframeState[index],
          elapsedTimeForFrame,
          loopUntil,
          params;

      if (
        // skip this keyframe, it's not applicable anymore
        frameState.complete
        // If it's not time for this keyframe to be executed, skip it
        || frame.when > self._keyframeElapsedTime
      ) {
        return;
      }

      if (frame.reset) {
        self._keyframeState[index] = {
          complete: true
        };
        return;
      }

      // Setup state for the keyframe functions
      frameState[frame.func] = frameState[frame.func] || {};

      elapsedTimeForFrame = elapsedTime;
      loopUntil = frame.when + frame.loopFor;

      // limited loop time
      if (frame.loopFor >= 0) {
        // The time for the last loop has expired, so this is the last loop (and
        // may be a partial loop)
        if (loopUntil <= self._keyframeElapsedTime) {
          frameState.complete = true;
          elapsedTimeForFrame = self._keyframeElapsedTime - loopUntil;
        } // else: it's in the middle of a loop
      } // else: loop forever

      // Calculate the params to pass to the function
      params = frame.params.call(self, elapsedTime, frameState[frame.func]);

      if (params !== false) {
        // Call the keyframe update function
        self[frame.func].apply(self, params);
      }
    })

    this._keyframeElapsedTime += elapsedTime;
  },

  resetKeyframes: function() {
    delete this._keyframeElapsedTime;
    delete this._keyframeState;
  }

};
