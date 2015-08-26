'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    collidable = require('./mixins/collidable'),
    renderable = require('./mixins/renderable'),
    objectAssign = require('object-assign');

var path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4');

module.exports = function getPlayer(ctx) {

  var player = objectAssign(
    {},
    movable,
    colourable,
    collidable,
    scalable,
    strokable,
    renderable,
    {
      x: 50,
      y: 50,
      colour: 'blue',
      scale: 5,
      lineWidth: 1,
      path: path,
      ctx: ctx
    }
  );

  player.setCollisionBounds([
    {x: -10.5, y: -4.5},
    {x: 10.5, y: 0.5},
    {x: -10.5, y: 4.5}
  ]);

  return player;
};
