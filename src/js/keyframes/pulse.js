'use strict';

var tween = require('./tween');

module.exports = function(when, func, valueFrom, valueTo, duration, modifier) {

  var durationOn2 = duration / 2;

  modifier = modifier || function(param) { return param; }

  return [
    {
      when: when,
      func: func,
      params: tween(valueFrom, valueTo, durationOn2, modifier),
      loopFor: durationOn2
    },
    {
      when: when + durationOn2,
      func: func,
      params: tween(valueTo, valueFrom, durationOn2, modifier),
      loopFor: durationOn2
    }
  ];

}
