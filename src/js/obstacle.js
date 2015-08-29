'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    collidable = require('./mixins/collidable'),
    renderable = require('./mixins/renderable'),
    transformer = require('./mixins/transformer'),
    objectAssign = require('object-assign');

module.exports = function getObstacle() {

  var obstacle = objectAssign(
    {},
    movable,
    colourable,
    collidable,
    scalable,
    strokable,
    renderable,
    transformer
  );

  obstacle.moveTo(500, 30);
  obstacle.setColour('red');
  obstacle.setScale(1);
  obstacle.setLineWidth(3);

  return obstacle;
};
