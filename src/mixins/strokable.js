'use strict';

module.exports = {

  isStrokable: true,

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
