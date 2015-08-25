'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    renderable = require('./mixins/renderable'),
    objectAssign = require('object-assign');

var bulletPath = new Path2D('M-2.5 0.5 l4 0');

module.exports = function getBullet(ctx, canvasWidth) {

  var alive = true;

  return objectAssign({}, movable, colourable, scalable, strokable, renderable, {

    x: 0,
    y: 0,
    colour: 'blue',
    ctx: ctx,
    lineWidth: 3,
    path: bulletPath,

    init: function() {
      this.x = 0;
      this.y = 0;
      alive = true;
      this.scale = 1;
      this.colour = 'blue';
    },

    update: function(steps) {
      this.movement(steps);
    },

    movement: function(steps) {
      this.move(steps * 10, 0);
      if (this.x >= canvasWidth) {
        alive = false;
      }
    },

    dead: function() {
      return !alive;
    }

  });
};
