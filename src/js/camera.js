'use strict';

var movable = require('./mixins/movable'),
    collidable = require('./mixins/collidable'),
    transformer = require('./mixins/transformer'),
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
    transformer,
    {
      x: x,
      y: y,

      setSize: function(width, height) {
        setCollisionBoundsFor(camera, width, height);
      },

      // Overwite the movement function to go in the other direction
      getPos: function() {
        return {x: -this.x, y: -this.y}
      }
    }
  );

  camera.setSize(width, height);

  return camera;
};
