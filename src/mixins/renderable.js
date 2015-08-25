'use strict';

module.exports = {

  isRenderable: true,

  render: function() {

    this.ctx.save();

    if (this.isMovable) {
      this.ctx.translate(Math.floor(this.x), Math.floor(this.y));
    }

    if (this.isScalable) {
      this.ctx.scale(this.scale, this.scale);
    }

    if (this.isStrokable) {
      this.stroke();
    }

    this.ctx.restore();
  }

};
