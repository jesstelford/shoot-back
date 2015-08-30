'use strict';

module.exports = {

  isTransformer: true,

  /**
   * Apply tranformations on a renderable object
   *
   * Transformations (as with any matrix transformation) must be applied in
   * reverse order, so it's best to read these transforms from bottom to top
   *
   * @param Object ctx The Canvas' 2D Context
   */
  setTransformations: function(ctx, inverse) {

    var pos,
        scale;

    ctx.save();

    if (this.isMovable) {
      pos = this.getPos();
      pos.x = Math.floor(pos.x);
      pos.y = Math.floor(pos.y);
      if (inverse) {
        ctx.translate(-pos.x, -pos.y);
      } else {
        ctx.translate(pos.x, pos.y);
      }
    }

    if (this.isScalable) {
      scale = this.getScale();
      ctx.scale(scale, scale);
    }

    if (this.isRotatable) {
      if (inverse) {
        ctx.rotate(this.getRotation());
      } else {
        ctx.rotate(this.getRotation());
      }
    }

  },

  resetTransformations: function(ctx) {
    ctx.restore();
  }

};
