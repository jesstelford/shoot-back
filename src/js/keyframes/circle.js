'use strict';

module.exports = function(radius, angleChangePerFrame) {
  return function rotateClockwise(elapsedTime, state) {

    var step = elapsedTime / (1000 / 60),
        result,
        newX,
        newY;

    state.radius = state.radius || radius;

    // initial position is at the top or bottom of the circle
    state.angle = state.angle || (angleChangePerFrame > 0 ? Math.PI / 2 : -Math.PI / 2);
    state.lastX = state.lastX || 0;
    state.lastY = state.lastY || (angleChangePerFrame > 0 ? state.radius : -state.radius);

    // rotate clockwise
    state.angle += step * angleChangePerFrame;

    if (state.angle > Math.PI * 2) {
      state.angle -= Math.PI * 2;
    } else if (state.angle < 0) {
      state.angle += Math.PI * 2;
    }

    newX = state.radius * Math.cos(state.angle);
    newY = state.radius * Math.sin(state.angle);

    result = [newX - state.lastX, newY - state.lastY];

    state.lastX = newX;
    state.lastY = newY;

    return result;
  }
}
