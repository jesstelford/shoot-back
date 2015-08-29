'use strict';

var getObstacle = require('./obstacle'),
    random = require('./random'),
    cache = require('./cache-generator')('obstacles');

var types = [
  {
    path: new Path2D('M0.5 0.5 l20 40 l10 10 l20 -10 l4 -40'),
    collision: [
      {x:  0.5, y:  0.5},
      {x: 20.5, y: 40.5},
      {x: 30.5, y: 50.5},
      {x: 50.5, y: 40.5},
      {x: 54.5, y:  0.5}
    ]
  },
  {
    path: new Path2D('M0.5 0.5 l15 60 l10 -40 l5 20 l15 -40'),
    // Note: We purposely remove the vertex when the point is internal. The
    // collision boundaries must be a right hand wound convex shape.
    collision: [
      {x:  0.5, y:  0.5},
      {x: 15.5, y: 60.5},
      {x: 30.5, y: 40.5},
      {x: 45.5, y:  0.5}
    ]
  },
  {
    path: new Path2D('M0.5 0.5 l5 20 l7 -10 l3 15 l8 -18 l12 53 l20 -60'),
    // Note: We purposely remove the vertex when the point is internal. The
    // collision boundaries must be a right hand wound convex shape.
    collision: [
      {x:  0.5, y:  0.5},
      {x:  5.5, y: 20.5},
      {x: 15.5, y: 25.5},
      {x: 35.5, y: 60.5},
      {x: 55.5, y:  0.5}
    ]
  },
  {
    path: new Path2D('M20.5 0.5 l-20 20 l30 10 l10 25 l10 -55'),
    // Note: We purposely remove the vertex when the point is internal. The
    // collision boundaries must be a right hand wound convex shape.
    collision: [
      {x: 20.5, y:  0.5},
      {x:  0.5, y: 20.5},
      {x: 30.5, y: 30.5},
      {x: 40.5, y: 55.5},
      {x: 50.5, y:  0.5}
    ]
  }
];

module.exports = {

  get: function(type) {

    if (typeof type === 'undefined') {
      type = random.betweenInts(0, types.length)
    }

    return cache.get(

      // custom construction function to set the type
      function() {
        var obstacle = getObstacle();
        obstacle.type = type;
        obstacle.setPath(types[type].path);
        obstacle.setCollisionBounds(types[type].collision);
        return obstacle;
      },

      // we're looking for a particular type
      function(toSearch) {

        for (let obstacle of toSearch) {
          if (obstacle.type === type) {
            return obstacle;
          }
        }

      }
    );

  },

  put: function(obstacle) {
    cache.put(obstacle);
  }

}
