'use strict';

module.exports = {

  isFillable: true,

  fill: function(ctx) {
    if (this.isColourable) {
      ctx.fillStyle = this.colour;
    }
  }

};
