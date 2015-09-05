'use strict';

var font = require('./mixins/font'),
    movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    fillable = require('./mixins/fillable'),
    keyframed = require('./mixins/keyframed'),
    colourable = require('./mixins/colourable'),
    renderable = require('./mixins/renderable'),
    transformer = require('./mixins/transformer'),
    objectAssign = require('object-assign');

var path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4');

module.exports = function getText() {

  var text = objectAssign(
    {},
    font,
    movable,
    fillable,
    colourable,
    scalable,
    keyframed,
    renderable,
    transformer
  );

  text.moveTo(50, 50);
  text.setColour('white');
  text.setScale(1);

  text.setFont('Sans-Serif');
  text.setFontSize('20pt');
  text.setFontStyle('bold');
  text.setText("Let's play!");

  text.setKeyframes([
    {
      when: 500,
      func: 'setScale',
      params: function(elapsedTime, state) {

        var scale = this.getScale(),
            step = elapsedTime / (1000 / 60);

        state.done = state.done || false;
        state.scaleDirection = state.scaleDirection || 1;
        state.originalScale = state.originalScale || scale;
        state.targetScale = state.targetScale || scale * 2; // double in size
        state.hitTargetScale = state.hitTargetScale || false;

        if (state.done || elapsedTime === 0) {
          return [scale];
        }

        scale += step * 0.1 * state.scaleDirection;

        if (scale >= state.targetScale) {
          state.hitTargetScale = true;
          state.scaleDirection = -1;
        }

        if (scale <= state.originalScale && state.hitTargetScale) {
          scale = state.originalScale;
          state.done = true;
        }

        return [scale];

      },
      loopFor: -1
    },
  ]);

  return text;
};
