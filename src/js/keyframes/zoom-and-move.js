'use strict';

var quadraticInterpolator = require('../interpolators/quadratic'),
    objectAssign = require('object-assign'),
    tween = require('./tween');

module.exports = function(opts) {

  var options = objectAssign({
        when: 0,
        duration: 1000,
        interpolator: quadraticInterpolator,
        maxZoom: 2,
        restZoom: 1,
        startPos: [0, 0],
        endPos: [100, 100],
        modifier: function(params) { return params; }
      }, opts),
      durationOn2 = options.duration / 2;

  return [
    {
      when: options.when,
      func: 'moveTo',
      params: function() { return options.startPos },
      loopFor: 0
    },
    {
      when: options.when,
      func: 'setFontSize',
      params: tween(
        0,
        options.maxZoom,
        durationOn2,
        options.modifier,
        options.interpolator
      ),
      loopFor: durationOn2
    },
    {
      when: options.when + durationOn2,
      func: 'setFontSize',
      params: tween(
        options.maxZoom,
        options.restZoom,
        durationOn2,
        options.modifier,
        options.interpolator
      ),
      loopFor: durationOn2
    },
    {
      when: options.when + durationOn2,
      func: 'moveTo',
      params: tween(
        options.startPos,
        options.endPos,
        durationOn2,
        null,
        options.interpolator
      ),
      loopFor: durationOn2
    }
  ];
}
