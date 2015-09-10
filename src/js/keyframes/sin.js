'use strict';

/**
 * @param Integer amplitude The amplitude in px of the sine wave
 * @param Float angleChangePerFrame How many radians to change per 16.6666ms
 *                                  (ie; 60fps)
 * @param Integer startAt 'bottom' for the bottom of the sine wave,
 *                        'middle' for the middle,
 *                        'top' for the top
 * @param String axis 'x' or 'y'
 */
module.exports = function(amplitude, angleChangePerFrame, startAt, axis) {

  return function sine(elapsedTime, state) {

    var step = elapsedTime / (1000 / 60),
        result,
        newX,
        newY;

    state.amplitude = state.amplitude || amplitude;

    if (state.init === undefined) {
      state.init = true;

      // initial position is at the top or bottom of the sine wave
      if (startAt === 'bottom') {
        state.angle = -Math.PI / 2;
      } else if (startAt === 'top') {
        state.angle = Math.PI / 2;
      } else {
        state.angle = 0;
      }

      state.angleChangePerFrame = angleChangePerFrame;

      if (axis === 'x') {

        let startVal = 0;

        if (startAt === 'bottom') {
          startVal = -state.amplitude;
        } else if (startAt === 'top') {
          startVal = state.amplitude;
        }

        state.lastX = startVal;

      } else {

        state.lastX = 0;
      }

      if (axis === 'y') {

        let startVal = 0;

        if (startAt === 'bottom') {
          startVal = -state.amplitude;
        } else if (startAt === 'top') {
          startVal = state.amplitude;
        }

        state.lastY = startVal;

      } else {

        state.lastY = 0;
      }

    }

    // rotate clockwise
    state.angle += step * state.angleChangePerFrame;

    if (state.angle > Math.PI / 2) {

      // change directions
      state.angleChangePerFrame *= -1;

      // cap it at the end
      state.angle = Math.PI / 2;

    } else if (state.angle < -Math.PI / 2) {

      // change directions
      state.angleChangePerFrame *= -1;

      // cap it at the end
      state.angle = -Math.PI / 2;
    }

    if (axis === 'x') {
      newX = state.amplitude * Math.sin(state.angle);
      newY = 0;
    } else {
      newX = 0;
      newY = state.amplitude * Math.sin(state.angle);
    }

    result = [newX - state.lastX, newY - state.lastY];

    state.lastX = newX;
    state.lastY = newY;

    return result;
  }
}
