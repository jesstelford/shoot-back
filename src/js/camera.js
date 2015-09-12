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

      width: width,
      height: height,

      setSize: function(width, height) {
        this.width = width;
        this.height = height;
        setCollisionBoundsFor(camera, width, height);
      },

      getSize: function() {
        return {
          width: this.width,
          height: this.height
        }
      }

    }
  );

  camera.setSize(width, height);

  return camera;
};
