'use strict';

module.exports = function pulseKeyframe(scaleFrom, scaleTo, duration, modifier) {

  var initialScaleSet = false,
      done = false,
      durationOn2 = duration / 2,
      reachedHalfWay = false,
      scale,
      scaleDiff = scaleTo - scaleFrom,
      pulsedFor = 0;

  modifier = modifier || function(param) { return param; }

  return function(elapsedTime, state) {

    if (!initialScaleSet) {
      initialScaleSet = true;
      return modifier([scaleFrom]);
    }

    if (done) {
      return modifier([scaleFrom]);
    }

    pulsedFor += elapsedTime;

    if (pulsedFor >= duration) {
      // Pulse is complete
      done = true;
      // Only want to calculate partial pulse animation
      elapsedTime = pulsedFor - duration;

      scale = scaleFrom;
    } else if (!reachedHalfWay && pulsedFor >= durationOn2) {
      // half the pusle is complete, so force it to be the 'maximum'
      // Next frame it will catch up
      elapsedTime = durationOn2

      scale = scaleTo;

      reachedHalfWay = true;
    } else if (pulsedFor < durationOn2) {

      // scaling toward `scaleTo`
      scale = scaleFrom + ((pulsedFor / durationOn2) * scaleDiff);
    } else {

      // scaling toward `scaleFrom`
      scale = scaleTo - (((pulsedFor - durationOn2) / durationOn2) * scaleDiff);
    }

    return modifier([scale]);
  }

}
