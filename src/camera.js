'use strict';

var movable = require('./mixins/movable'),
    collidable = require('./mixins/collidable'),
    objectAssign = require('object-assign');

function setCollisionBoundsFor(camera, width, height) {
  camera.setCollisionBounds([
    {x: 0, y: 0},
    {x: width, y: 0},
    {x: width, y: height},
    {x: 0, y: height}
  ]);
}

module.exports = function getCamera(x, y, width, height) {

  var camera = objectAssign(
    {},
    movable,
    collidable,
    {
      x: x,
      y: y,

      setSize: function(width, height) {
        setCollisionBoundsFor(camera, width, height);
      }
    }
  );

  camera.setSize(width, height);

  return camera;
};
