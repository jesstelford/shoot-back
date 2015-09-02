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

module.exports = {

  isKeyframed: true,

  setKeyframes: function(keyframes) {
    this.keyframes = keyframes;
  },

  updateKeyFrames: function(elapsedTime) {

    var self = this;

    ensureDefaults.call(this);

    this.keyframes.forEach(function(frame, index) {

      var frameState = self._keyframeState[index],
          elapsedTimeForFrame,
          loopUntil;

      if (
        // skip this keyframe, it's not applicable anymore
        frameState.complete
        // If it's not time for this keyframe to be executed, skip it
        || frame.when > self._keyframeElapsedTime
      ) {
        return;
      }

      elapsedTimeForFrame = elapsedTime;
      loopUntil = frame.when + frame.loopFor;

      // limited loop time
      if (frame.loopFor >= 0) {
        // The time for the last loop has expired, so this is the last loop (and
        // is a partial loop)
        if (loopUntil < self._keyframeElapsedTime) {
          frameState.complete = true;
          elapsedTimeForFrame = self._keyframeElapsedTime - loopUntil;
        } // else: it's in the middle of a loop
      } // else: loop forever

      // Call the keyframe update function
      self[frame.func].apply(self, frame.params.call(self, elapsedTime));
    })

    this._keyframeElapsedTime += elapsedTime;
  },

  resetKeyframes: function() {
    delete this._keyframeElapsedTime;
    delete this._keyframeState;
    ensureDefaults.call(this);
  }

};
