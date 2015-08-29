'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    collidable = require('./mixins/collidable'),
    renderable = require('./mixins/renderable'),
    transformer = require('./mixins/transformer'),
    objectAssign = require('object-assign');

var path = new Path2D('M0.5 0.5 l20 40 l10 10 l20 -10 l4 -40');

module.exports = function getObstacle() {

  var obstacle = objectAssign(
    {},
    movable,
    colourable,
    collidable,
    scalable,
    strokable,
    renderable,
    transformer,
    {
      type: 1
    }
  );

  obstacle.moveTo(500, 30);
  obstacle.setColour('red');
  obstacle.setScale(1);
  obstacle.setLineWidth(3);
  obstacle.setPath(path);
  obstacle.setCollisionBounds([
    {x: 0.5, y: 0.5},
    {x: 20.5, y: 40.5},
    {x: 30.5, y: 50.5},
    {x: 50.5, y: 40.5},
    {x: 54.5, y: 0.5}
  ]);

  return obstacle;
};
