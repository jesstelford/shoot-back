'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    killable = require('./mixins/killable'),
    strokable = require('./mixins/strokable'),
    rotatable = require('./mixins/rotatable'),
    keyframed = require('./mixins/keyframed'),
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
 *             - lineWidth: [optional]. Default: 3
 *
 * @return Object the enemy
 */
module.exports = function getEnemy(opts) {

  // Throw warning in dev mode
  if (process.env.NODE_ENV !== 'production') {
    if (!opts.path || !opts.collision) {
      throw new Error('Must supply a path and collision hull');
    }
  }

  var enemy = objectAssign(
    {},
    movable,
    killable(),
    keyframed,
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
    colour: 'yellow',
    scale: 1,
    lineWidth: 3,
    rotation: 0,
    keyframes: []
  }, opts);

  if (typeof options.type !== 'undefined') {
    enemy.type = options.type;
  }

  enemy.setPath(options.path);
  enemy.setCollisionBounds(options.collision);

  enemy.rotateTo(options.rotation);
  enemy.moveTo(options.pos.x, options.pos.y);
  enemy.setColour(options.colour);
  enemy.setScale(options.scale);
  enemy.setLineWidth(options.lineWidth);
  enemy.setKeyframes(options.keyframes);

  return enemy;
};
