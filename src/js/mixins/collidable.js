'use strict';

var forPairs = require('../utils/for-pairs');

function normal(p1, p2) {
  return {
    x: p1.y - p2.y,
    y: p2.x - p1.x
  }
}

/**
 * Get the bounds rotated by `angle`
 *
 * Will just return `bounds` if `angle` === 0 or not set
 *
 * @param bounds Array of {x, y}
 * @param angle Float Radian angle
 *
 * @return Arrray of {x, y} the rotated bounds
 */
function calculateRotatedBounds(bounds, angle) {

  var cosA,
      sinA,
      result = [];

  if (typeof angle === 'undefined' || angle === 0) {
    return bounds;
  }

  // pre-calculate a couple of math things outside the loop below
  cosA = Math.cos(angle);
  sinA = Math.sin(angle);

  bounds.forEach(function(point) {

    var x,
        y;

    // rotate the point
    result.push({
      x: point.x * cosA - point.y * sinA,
      y: point.y * cosA + point.x * sinA
    });

  });

  return result;
}

function calculateNormals(bounds) {

  var result = []

  forPairs(bounds, function(p1, p2) {
    result.push(normal(p1, p2));
  }, true);

  return result;

}

/**
 * Axis Aligned Bounding Box
 *
 * ie; The smallest area we can draw an upright rectangle to contain all the
 * points.
 *
 * @param bounds Array of points {x, y}
 * @param angle Float Radian angle of rotation of the points
 *
 * @return Object {x, y, w, h} where; x = left position, y = top position, w =
 * width, and h = height
 */
function calculateAABB(bounds) {

  // Start with the smallest possible box then grow it to fit later
  var min = {
        x: Infinity,
        y: Infinity
      },
      max = {
        x: -Infinity,
        y: -Infinity
      },
      x,
      y;

  bounds.forEach(function(point) {

    x = point.x;
    y = point.y;

    // grow the box to fit this point
    min.x = Math.min(x, min.x);
    min.y = Math.min(y, min.y);
    max.x = Math.max(x, max.x);
    max.y = Math.max(y, max.y);
  });

  return {
    x: min.x,
    y: min.y,
    w: max.x - min.x,
    h: max.y - min.y
  }
}

/**
 * Detect collision between two AABBs
 *
 * @param AABB1 Object {x, y, w, h}
 * @param AABB2 Object {x, y, w, h}
 *
 * @return Boolean true if collision
 */
function AABBCollision(AABB1, AABB2) {

  return (
    AABB1.x < AABB2.x + AABB2.w
    && AABB1.x + AABB1.w > AABB2.x
    && AABB1.y < AABB2.y + AABB2.h
    && AABB1.h + AABB1.y > AABB2.y
  );

}

/**
 * Separating Axis Theorem collision detection
 *
 * @param bounds1 Array of {x, y} points
 * @param bounds2 Array of {x, y} points
 *
 * @return Boolean true if colliding
 */
function SATCollision(bounds1, bounds2) {
  // TODO
  return true;
}

module.exports = {

  isCollidable: true,

  /**
   * @param bounds Array a list of points ({x, y}) in which make up the bounding
   * area in clockwise / left-hand winding order
   */
  setCollisionBounds: function(bounds) {

    this.bounds = bounds;

    this.clearStaleCollisionData();
    this.updateAllCollisionData();
  },

  updateAllCollisionData: function() {
    this.updateCommonCollisionData();
    this.updateAABBCollisionData();
    this.updateSATCollisionData();
  },

  updateCommonCollisionData: function() {

    if (this._calcRotated) {
      return;
    }

    this._calcRotated = calculateRotatedBounds(this.bounds, this._collisionAngleCache);
  },

  updateAABBCollisionData: function() {

    if (this._calcAABB) {
      return;
    }

    this._calcAABB = calculateAABB(this._calcRotated);
  },

  updateSATCollisionData: function() {

    if (this._calcNormals) {
      return;
    }

    this._calcNormals = calculateNormals(this._calcRotated);
  },

  clearStaleCollisionData: function() {

    var clearIt = false;

    var clearIt = (
      this.isRotatable
      && this.getRotation() !== this._collisionAngleCache
    );

    clearIt = clearIt || (
      this.isScalable
      && this.getScale() !== this._collisionScaleCache
    );

    if (clearIt) {
      this._collisionAngleCache = this.isRotatable ? this.getRotation(): 0;
      this._collisionScaleCache = this.isScalable ? this.getScale(): 1;
      this._calcRotated = null;
      this._calcAABB = null;
      this._calcNormals = null;
    }

  },

  /**
   * Get the most up to date AABB.
   *
   * Will take into account translations
   *
   * @return Object {x, y, w, h}
   */
  getAABB: function() {

    var newAngle;

    if (!this.bounds) {
      return {
        x: 0,
        y: 0,
        w: 0,
        h: 0
      }
    }

    var aabb = {
      x: this._calcAABB.x,
      y: this._calcAABB.y,
      w: this._calcAABB.w,
      h: this._calcAABB.h
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

  /**
   * Check if this is colliding with another collidable
   *
   * Will do 2 phases:
   * 1. AABB collision
   * 2. SAT collision
   *
   * @param collidable Object Another collidable object
   * @param details Boolean Whether or not to do detailed phase collision
   *
   * @return Boolean true if colliding
   */
  collidingWith: function(collidable, detailed) {

    // TODO: Move these out into some kind of 'update' function so they happen
    // only once per loop rather than once per collision check
    this.clearStaleCollisionData();
    this.updateCommonCollisionData();
    this.updateAABBCollisionData();

    collidable.clearStaleCollisionData();
    collidable.updateCommonCollisionData();
    collidable.updateAABBCollisionData();

    // quickest check is for AABB's
    if (!AABBCollision(this.getAABB(), collidable.getAABB())) {
      return false;
    }

    if (!detailed) {
      return true;
    }

    this.updateSATCollisionData();
    collidable.updateSATCollisionData();

    return SATCollision(this.bounds, collidable.bounds);

  }

};
