'use strict';

module.exports = {

  isRenderable: true,

  render: function(ctx) {

    if (this.isTransformer) {
      this.setTransformations(ctx);
    }

    if (this.isStrokable) {
      this.stroke(ctx);
    }

    if (this.isFillable) {
      this.fill(ctx);
    }

    if (this.isFont) {
      this.writeText(ctx);
    }

    if (this.isTransformer) {
      this.resetTransformations(ctx);
    }
  }

};
