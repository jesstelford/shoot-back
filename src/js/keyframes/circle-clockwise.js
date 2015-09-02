'use strict';

module.exports = function(radius, angleChangePerFrame) {
  return function rotateClockwise(elapsedTime, state) {

    var step = elapsedTime / (1000 / 60),
        result,
        newX,
        newY;

    state.radius = state.radius || radius;

    // initial position is at the bottom of the circle
    state.angle = state.angle || Math.PI / 2;
    state.lastX = state.lastX || 0;
    state.lastY = state.lastY || state.radius;

    // rotate clockwise
    state.angle += step * angleChangePerFrame;

    newX = state.radius * Math.cos(state.angle);
    newY = state.radius * Math.sin(state.angle);

    result = [newX - state.lastX, newY - state.lastY];

    state.lastX = newX;
    state.lastY = newY;

    return result;
  }
}
