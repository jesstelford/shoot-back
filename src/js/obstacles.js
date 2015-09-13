'use strict';

var getObstacle = require('./obstacle'),
    random = require('./random'),
    cache = require('./cache-generator')('obstacles'),
    forOf = require('./utils/for-of');

var types = [
  {
    path: new Path2D('M0 0 l0.37 0.74 l0.18 0.18 l0.37 -0.18 l0.07 -0.74'),
    collision: [
      {x: 0,    y: 0},
      {x: 0.37, y: 0.74},
      {x: 0.55, y: 0.92},
      {x: 0.92, y: 0.74},
      {x: 1,    y: 0}
    ]
  },
  {
    path: new Path2D('M0 0 l0.25 1 l0.16 -0.66 l0.08 0.33 l0.25 -0.66'),
    // Note: We purposely remove the vertex when the point is internal. The
    // collision boundaries must be a right hand wound convex shape.
    collision: [
      {x: 0,    y: 0},
      {x: 0.25, y: 1},
      {x: 0.5,  y: 0.66},
      {x: 0.75, y: 0}
    ]
  },
  {
    path: new Path2D('M0 0 l0.08 0.33 l0.12 -0.17 l0.05 0.25 l0.13 -0.3 l0.2 0.88 l0.33 -1'),
    // Note: We purposely remove the vertex when the point is internal. The
    // collision boundaries must be a right hand wound convex shape.
    collision: [
      {x: 0,    y: 0},
      {x: 0.83, y: 0.33},
      {x: 0.25, y: 0.42},
      {x: 0.58, y: 1},
      {x: 0.92, y: 0}
    ]
  },
  {
    path: new Path2D('M0.36 0 l-0.36 0.36 l0.54 0.18 l0.18 0.45 l0.18 -1'),
    // Note: We purposely remove the vertex when the point is internal. The
    // collision boundaries must be a right hand wound convex shape.
    collision: [
      {x: 0.36, y: 0},
      {x: 0,    y: 0.36},
      {x: 0.73, y: 1},
      {x: 0.91, y: 0}
    ]
  }
];

var obstacles = {

  get: function(type) {

    if (typeof type === 'undefined') {
      type = random.betweenInts(0, types.length)
    }

    return cache.get(

      // custom construction function to set the type
      function() {
        return getObstacle({
          type: type,
          path: types[type].path,
          collision: types[type].collision
        });
      },

      // we're looking for a particular type
      function(toSearch) {

        var found;

        forOf(toSearch, function(obstacle) {
          if (obstacle.type === type) {
            found = obstacle;
            return false;
          }
        });

        return found;

      }
    );

  },

  put: function(obstacle) {
    cache.put(obstacle);
  }

}

/**
 * Allow iteration of the cache values using ES6 Iterators
 *
 * @return Iterable
 */
obstacles[Symbol.iterator] = function() {
  return cache[Symbol.iterator]();
}

module.exports = obstacles;
