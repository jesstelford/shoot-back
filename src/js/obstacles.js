'use strict';

var getObstacle = require('./obstacle'),
    random = require('./random'),
    cache = require('./cache-generator')('obstacles');

var types = [
  {
    path: new Path2D('M0.5 0.5 l20 40 l10 10 l20 -10 l4 -40'),
    collision: [
      {x: 0.5, y: 0.5},
      {x: 20.5, y: 40.5},
      {x: 30.5, y: 50.5},
      {x: 50.5, y: 40.5},
      {x: 54.5, y: 0.5}
    ]
  }
];

module.exports = {

  get: function(type) {

    if (!type) {
      type = random.betweenInts(0, types.length)
    }

    return cache.get(getObstacle, function(toSearch) {

      // we're looking for a particular type
      for (let obstacle of toSearch) {
        if (obstacle.type === type) {
          return obstacle;
        }
      }

    });

  },

  put: function(obstacle) {
    cache.put(obstacle);
  }

}
