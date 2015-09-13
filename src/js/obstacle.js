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

/**
 * @param opts Object with keys
 *             - path: a 2DPath instance to stroke
 *             - collision: An array of {x, y} points making a convex collision
 *             hull
 *             - type: [optional] A unique type identifier. Default: undefined
 *             - pos: [optional] {x, y} position. Default: {x: 0, y: 0}
 *             - colour: [optional]. Default: 'red'
 *             - scale: [optional]. Default: 1
 *             - lineWidth: [optional] Absolute line width. Default: 3
 *
 * @return Object the obstacle
 */
module.exports = function getObstacle(opts) {

  // Throw warning in dev mode
  if (process.env.NODE_ENV !== 'production') {
    if (!opts.path || !opts.collision) {
      throw new Error('Must supply a path and collision hull');
    }
  }

  var obstacle = objectAssign(
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

  var options = objectAssign({}, {
    pos: {x: 0, y: 0},
    colour: 'red',
    scale: 1,
    lineWidth: 3,
    path: [],
    collision: []
  }, opts);

  if (typeof options.type !== 'undefined') {
    obstacle.type = options.type;
  }

  obstacle.setPath(options.path);
  obstacle.setCollisionBounds(options.collision);

  obstacle.moveTo(options.pos.x, options.pos.y);
  obstacle.setColour(options.colour);
  obstacle.setScale(options.scale);
  obstacle.setAbsoluteLineWidth(options.lineWidth);

  return obstacle;
};
