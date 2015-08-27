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

    if (this.isTransformer) {
      this.resetTransformations(ctx);
    }
  }

};
