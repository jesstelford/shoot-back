'use strict';

module.exports = {

  isFont: true,

  setFont: function(font) {
    this.font = font;
  },

  setText: function(text) {
    this.text = text;
  },

  setTextAlign: function(alignment) {
    this.textAlign = alignment;
  },

  setTextBaseline: function(baseline) {
    this.textBaseline = baseline;
  },

  setFontSize: function(fontSize) {
    this.fontSize = fontSize;
  },

  setFontStyle: function(fontStyle) {
    this.fontStyle = fontStyle;
  },

  getFontString: function() {
    return (this.fontStyle + ' ' + this.fontSize + ' ' + this.font).trim();
  },

  writeText: function(ctx) {
    var pos;

    if (this.isMovable) {
      pos = this.getPos();
    } else {
      pos = {x: 0, y: 0}
    }

    ctx.font = this.getFontString();
    ctx.textAlign = this.textAlign || 'left';
    ctx.textBaseline = this.textBaseline || 'bottom';
    ctx.fillText(this.text, pos.x, pos.y);
  }

};
