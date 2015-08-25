'use strict';

module.exports = {

  isStrokable: true,

  stroke: function() {

    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.isColourable) {
      this.ctx.strokeStyle = this.colour;
    }

    this.ctx.stroke(this.path);
  }

};
