'use strict';

var getEnemy = require('./enemy'),
    random = require('./random'),
    cache = require('./cache-generator')('enemies'),
    forOf = require('./utils/for-of'),
    keyframeCircle = require('./keyframes/circle'),
    objectAssign = require('object-assign');

var types = [
  {
    path: new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4'),
    collision: [
      {x: -10.5, y: -4.5},
      {x: 10.5, y: 0.5},
      {x: -10.5, y: 4.5}
    ],
    rotation: Math.PI,
    keyframes: [
      {
        when: 0,
        func: 'move',
        params: function(elapsedTime) {
          var step = elapsedTime / (1000 / 60);
          return [step * -1, 0];
        },
        loopFor: -1
      },
      {
        when: 2000,
        func: 'move',
        params: keyframeCircle(80, -0.05),
        loopFor: 2000
      },
      {
        when: 4000,
        func: 'move',
        params: keyframeCircle(80, 0.05),
        loopFor: 2000
      }
    ]
  }
];

var enemies = {

  get: function(type) {

    if (typeof type === 'undefined') {
      type = random.betweenInts(0, types.length)
    }

    return cache.get(

      // custom construction function to set the type
      function() {
        return getEnemy(objectAssign({type: type}, types[type]));
      },

      // we're looking for a particular type
      function(toSearch) {

        var found;

        forOf(toSearch, function(enemy) {
          if (enemy.type === type) {
            found = enemy;
            return false;
          }
        });

        return found;

      }
    );

  },

  put: function(enemy) {
    cache.put(enemy);
  }

}

/**
 * Allow iteration of the cache values using ES6 Iterators
 *
 * @return Iterable
 */
enemies[Symbol.iterator] = function() {
  return cache[Symbol.iterator]();
}

module.exports = enemies;
