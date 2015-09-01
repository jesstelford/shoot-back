'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    rotatable = require('./mixins/rotatable'),
    colourable = require('./mixins/colourable'),
    collidable = require('./mixins/collidable'),
    renderable = require('./mixins/renderable'),
    transformer = require('./mixins/transformer'),
    objectAssign = require('object-assign');

var path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4');

module.exports = function getEnemy() {

  var enemy = objectAssign(
    {},
    movable,
    colourable,
    collidable,
    rotatable,
    scalable,
    strokable,
    renderable,
    transformer
  );

  enemy.moveTo(0, 0);
  enemy.setColour('#ffff00');
  enemy.setScale(1);
  enemy.setLineWidth(3);
  enemy.rotateTo(Math.PI);
  enemy.setPath(path);
  enemy.setCollisionBounds([
    {x: -10.5, y: -4.5},
    {x: 10.5, y: 0.5},
    {x: -10.5, y: 4.5}
  ]);

  return enemy;
};
