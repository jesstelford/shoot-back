'use strict';

var forPairs = require('../utils/for-pairs');

function dot(p1, p2) {
  return p1.x * p2.x + p1.y * p2.y;;
}

function normal(p1, p2) {
  return {
    x: p1.y - p2.y,
    y: p2.x - p1.x
  }
}

/**
 * Get the bounds rotated by `angle`
 *
 * Will just return `bounds` if angle, scale, or pos are defaults
 *
 * @param bounds Array of {x, y}
 * @param angle Float Radian angle
 * @param scale Float Scale of object
 * @param pos Object {x, y} position of object
 *
 * @return Arrray of {x, y} the rotated bounds
 */
function calculateTransformedBounds(bounds, angle, scale, pos) {

  var cosA,
      sinA,
      x,
      y,
      result = [];

  if (angle === 0 && scale === 1 && pos.x === 0 && pos.y === 0) {
    return bounds;
  }

  if (angle !== 0) {
    // pre-calculate a couple of math things outside the loop below
    cosA = Math.cos(angle);
    sinA = Math.sin(angle);
  }

  bounds.forEach(function(point) {

    x = point.x;
    y = point.y;

    // scale the point
    x *= scale;
    y *= scale;

    x += pos.x;
    y += pos.y;

    // rotate the point
    if (angle !== 0) {
      x = point.x * cosA - point.y * sinA;
      y = point.y * cosA + point.x * sinA;
    }

    result.push({x: x, y: y});

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

function projectOntoAxis(points, axis) {

  // Start with the smallest possible line then grow it to fit later
  var min = Infinity,
      max = -Infinity,
      axisDotPoint;

  points.forEach(function(point) {

    axisDotPoint = dot(axis, point);

    // grow the box to fit this point
    min = Math.min(axisDotPoint, min);
    max = Math.max(axisDotPoint, max);
  });

  return {
    min: min,
    max: max
  }

}

function projectionsOverlap(projection1, projection2) {
  return projection1.max >= projection2.min
    && projection1.min <= projection2.max;
}

/**
 * Separating Axis Theorem collision detection
 *
 * @param bounds1 Array of {x, y} points
 * @param bounds2 Array of {x, y} points
 *
 * @return Boolean true if colliding
 */
function SATCollision(bounds1, normals1, bounds2, normals2) {

  var projection1,
      projection2;

  return normals1
    // join the two sets of normals together
    .concat(normals2)
    // short-circuit the loop if a separation is found
    .every(function(normal) {

      projection1 = projectOntoAxis(bounds1, normal);
      projection2 = projectOntoAxis(bounds2, normal);

      return projectionsOverlap(projection1, projection2);

    });

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

    if (this._calcTransformed) {
      return;
    }

    this._calcTransformed = calculateTransformedBounds(
      this.bounds,
      this._collisionAngleCache,
      this._collisionScaleCache,
      this._collisionPosCache
    );
  },

  updateAABBCollisionData: function() {

    if (this._calcAABB) {
      return;
    }

    this._calcAABB = calculateAABB(this._calcTransformed);
  },

  updateSATCollisionData: function() {

    if (this._calcNormals) {
      return;
    }

    this._calcNormals = calculateNormals(this._calcTransformed);
  },

  clearStaleCollisionData: function() {

    var clearIt = (
      this.isRotatable
      && (
        this._collisionAngleCache === undefined
        || this.getRotation() !== this._collisionAngleCache
      )
    );

    clearIt = clearIt || (
      this.isScalable
      && (
        this._collisionScaleCache === undefined
        || this.getScale() !== this._collisionScaleCache
      )
    );

    clearIt = clearIt || (
      this.isMovable
      && (
        this._collisionPosCache === undefined
        || this.getPos().x !== this._collisionPosCache.x
        || this.getPos().y !== this._collisionPosCache.y
      )
    );

    if (clearIt) {
      this._collisionAngleCache = this.isRotatable ? this.getRotation() : 0;
      this._collisionScaleCache = this.isScalable ? this.getScale() : 1;
      this._collisionPosCache = this.isMovable ? this.getPos() : {x: 0, y: 0};
      this._calcTransformed = null;
      this._calcAABB = null;
      this._calcNormals = null;
    }

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
    if (!AABBCollision(this._calcAABB, collidable._calcAABB)) {
      return false;
    }

    if (!detailed) {
      return true;
    }

    this.updateSATCollisionData();
    collidable.updateSATCollisionData();

    return SATCollision(this.bounds, this._calcNormals, collidable.bounds, collidable._calcNormals);

  }

};
