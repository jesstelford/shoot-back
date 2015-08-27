'use strict';

module.exports = {

  isStrokable: true,

  setLineWidth: function(width) {
    this.lineWidth = width;
  },

  setPath: function(path) {
    this.path = path;
  },

  stroke: function(ctx) {

    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.isColourable) {
      ctx.strokeStyle = this.colour;
    }

    ctx.stroke(this.path);
  }

};
