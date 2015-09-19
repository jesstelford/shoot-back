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
    ctx.font = this.getFontString();
    ctx.textAlign = this.textAlign || 'left';
    ctx.textBaseline = this.textBaseline || 'bottom';

    // NOTE: We position it at 0, 0, and instead use the `transformer` mixin to
    // move the text around
    ctx.fillText(this.text, 0, 0);
  }

};
