'use strict';

module.exports = function tween(tweenFrom, tweenTo, duration, modifier) {

  var initialValueSet = false,
      done = false,
      value,
      tweenDiff = tweenTo - tweenFrom,
      tweenedFor = 0;

  modifier = modifier || function(param) { return param; }

  return function(elapsedTime, state) {

    tweenedFor += elapsedTime;

    if (!initialValueSet) {
      initialValueSet = true;
      return modifier([tweenFrom]);
    }

    if (done) {
      return modifier([tweenTo]);
    }

    if (tweenedFor >= duration) {
      // Tween is complete
      done = true;
      value = tweenTo;
    } else {
      // scaling toward `tweenTo`
      value = tweenFrom + ((tweenedFor / duration) * tweenDiff);
    }

    return modifier([value]);
  }

}
