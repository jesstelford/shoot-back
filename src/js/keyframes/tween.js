'use strict';

var linearInterpolation = require('../interpolators/linear');

module.exports = function tween(tweenFrom, tweenTo, duration, modifier, interpolator) {

  var initialValueSet = false,
      done = false,
      value,
      tweenDiff,
      tweenCalc,
      tweenedFor = 0;

  if (process.env.NODE_ENV !== 'production') {
    if (
      Array.isArray(tweenFrom) !== Array.isArray(tweenTo)
      || tweenFrom.length !== tweenTo.length
    ) {
      throw new Error('`tweenFrom` and `tweenTo` must be single values, or arrays with the same length');
    }
  }

  // default to linear interpolation
  interpolator = interpolator || linearInterpolation;

  // we're tweening multiple values at once
  if (Array.isArray(tweenFrom)) {

    tweenDiff = tweenFrom.map(function(tweenFromValue, index) {
      return tweenTo[index] - tweenFromValue;
    });

    tweenCalc = function(elapsedTime) {
      return tweenDiff.map(function(tweenDiffValue, index) {
        return tweenFrom[index] + interpolator(elapsedTime / duration, tweenDiffValue);
      });
    }

  } else {

    tweenDiff = tweenTo - tweenFrom;

    tweenCalc = function(elapsedTime) {
      return [tweenFrom + interpolator(elapsedTime / duration, tweenDiff)];
    }
  }

  modifier = modifier || function(param) { return param; }

  return function(elapsedTime, state) {

    tweenedFor += elapsedTime;

    if (!initialValueSet) {
      initialValueSet = true;
      return modifier(tweenCalc(0));
    }

    if (done) {
      return modifier(tweenCalc(duration));
    }

    if (tweenedFor >= duration) {
      // Tween is complete
      done = true;
      tweenedFor = duration;
    }

    // scaling toward `tweenTo`
    value = tweenCalc(tweenedFor);

    return modifier(value);
  }

}
