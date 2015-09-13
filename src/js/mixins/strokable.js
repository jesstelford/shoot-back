'use strict';

module.exports = {

  isStrokable: true,

  setLineWidth: function(width) {
    this.lineWidth = width;
  },

  setAbsoluteLineWidth: function(width) {
    this.absoluteLineWidth = width;
  },

  setPath: function(path) {
    this.path = path;
  },

  stroke: function(ctx) {

    if (this.absoluteLineWidth) {
      if (this.isScalable) {
        ctx.lineWidth = this.absoluteLineWidth / this.getScale();
      } else {
        ctx.lineWidth = this.absoluteLineWidth;
      }
    } else {
      ctx.lineWidth = this.lineWidth;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.isColourable) {
      ctx.strokeStyle = this.colour;
    }

    ctx.stroke(this.path);
  }

};
