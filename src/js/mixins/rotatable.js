'use strict';

var twoPi = Math.PI * 2;

/**
 * Wraps the angle to be within -2π & 2π
 *
 * @param angle float Angle in radians
 *
 * @return the wrapped angle
 */
function wrapRadians(angle) {

  function multiple(theAngle) {
    return Math.floor(angle / twoPi) * twoPi;
  }

  if (angle > twoPi) {
    // reduce it to a single revolution
    angle = angle - multiple(angle);
  } else if (angle < -twoPi) {
    // reduce it to a single revolution
    angle = angle + multiple(angle);
  }

  return angle;
}

module.exports = {

  isRotatable: true,

  rotate: function(radians) {
    this.angle = wrapRadians(this.angle + radians);
  },

  rotateTo: function(radians) {
    this.angle = wrapRadians(radians);
  },

  getRotation: function() {
    return this.angle;
  }
}
