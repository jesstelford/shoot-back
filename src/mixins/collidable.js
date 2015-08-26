'use strict';

function calculateAABB(bounds) {

  // Calculate Axis Aligned Bounding Box (AABB)
  var min = {
      x: Infinity,
      y: Infinity
    },
    max = {
      x: -Infinity,
      y: -Infinity
    };

  bounds.forEach(function(point) {
    min.x = Math.min(point.x, min.x);
    min.y = Math.min(point.y, min.y);
    max.x = Math.max(point.x, max.x);
    max.y = Math.max(point.y, max.y);
  });

  return {
    x: min.x,
    y: min.y,
    w: max.x - min.x,
    h: max.y - min.y
  }
}

module.exports = {

  isCollidable: true,

  /**
   * @param bounds Array a list of points ({x, y}) in which make up the bounding
   * area in clockwise / left-hand winding order
   */
  setCollisionBounds: function(bounds) {
    this.bounds = bounds;
    this._calcBounds = calculateAABB(this.bounds);
  },

  getAABB: function() {

    if (!this.bounds) {
      return {
        x: 0,
        y: 0,
        w: 0,
        h: 0
      }
    }

    var aabb = {
      x: this._calcBounds.x,
      y: this._calcBounds.y,
      w: this._calcBounds.w,
      h: this._calcBounds.h
    };

    if (this.isScalable) {
      aabb.x *= this.scale;
      aabb.y *= this.scale;
      aabb.w *= this.scale;
      aabb.h *= this.scale;
    }

    // When it's movable, translate the collision bounds
    if (this.isMovable) {
      aabb.x += this.x;
      aabb.y += this.y;
    }

    return aabb;

  },

  // TODO: Better than AABB collision
  collidingWith: function(collidable) {

    var bounds = this.getAABB();
    var otherBounds = collidable.getAABB();

    // Do AABB collision
    if (
      bounds.x < otherBounds.x + otherBounds.w
      && bounds.x + bounds.w > otherBounds.x
      && bounds.y < otherBounds.y + otherBounds.h
      && bounds.h + bounds.y > otherBounds.y
    ) {
      return true;
    }

    return false;

  }

};
