'use strict';

var font = require('./mixins/font'),
    movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    fillable = require('./mixins/fillable'),
    keyframed = require('./mixins/keyframed'),
    colourable = require('./mixins/colourable'),
    renderable = require('./mixins/renderable'),
    transformer = require('./mixins/transformer'),
    pulseKeyframe = require('./keyframes/pulse'),
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

  text.setTextBaseline('middle');
  text.setTextAlign('center');

  text.setKeyframes([
    {
      when: 500,
      func: 'setFontSize',
      params: pulseKeyframe(20, 30, 500, function(params) {
        return [params[0] + 'pt'];
      }),
      loopFor: -1
    },
  ]);

  return text;
};
