'use strict';

module.exports = {

  isMovable: true,

  moveTo: function(toX, toY) {
    this.x = toX;
    this.y = toY;
  },

  move: function(dx, dy) {
    this.x += dx;
    this.y += dy;
  },

  getPos: function() {
    return {x: this.x, y: this.y}
  }
}
