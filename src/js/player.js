'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    shootable = require('./mixins/shootable'),
    energised = require('./mixins/energised'),
    colourable = require('./mixins/colourable'),
    collidable = require('./mixins/collidable'),
    renderable = require('./mixins/renderable'),
    transformer = require('./mixins/transformer'),
    identifiable = require('./mixins/identifiable'),
    objectAssign = require('object-assign');

var path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4'),
    UUID = 0;

module.exports = function getPlayer() {

  var player = objectAssign(
    {},
    movable,
    identifiable,
    colourable,
    collidable,
    scalable,
    shootable(),
    strokable,
    energised,
    renderable,
    transformer
  );

  player.setId(UUID);
  UUID++;

  player.setColour('blue');
  player.setScale(5);
  player.setLineWidth(1);
  player.setPath(path);
  player.setCollisionBounds([
    {x: -10.5, y: -4.5},
    {x: 10.5, y: 0.5},
    {x: -10.5, y: 4.5}
  ]);

  return player;
};
