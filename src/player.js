'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    renderable = require('./mixins/renderable'),
    objectAssign = require('object-assign');

var path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4');

module.exports = function getPlayer(ctx) {

  return objectAssign({}, movable, colourable, scalable, strokable, renderable, {

    x: 50,
    y: 50,
    colour: 'blue',
    scale: 1,
    lineWidth: 1,
    path: path,
    ctx: ctx

  });
};
