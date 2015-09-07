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

  // A few sane defaults
  text.moveTo(0, 0);
  text.setColour('white');
  text.setScale(1);

  text.setFont('Sans-Serif');
  text.setFontSize('20pt');
  text.setFontStyle('bold');
  text.setText('[text here]');

  text.setTextBaseline('bottom');
  text.setTextAlign('left');

  return text;
};
