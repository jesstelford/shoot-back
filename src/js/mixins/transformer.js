'use strict';

module.exports = {

  isTransformer: true,

  setTransformations: function(ctx) {

    var pos,
        scale;

    ctx.save();

    if (this.isMovable) {
      pos = this.getPos();
      ctx.translate(Math.floor(pos.x), Math.floor(pos.y));
    }

    if (this.isScalable) {
      scale = this.getScale();
      ctx.scale(scale, scale);
    }

  },

  resetTransformations: function(ctx) {
    ctx.restore();
  }

};
