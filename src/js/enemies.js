'use strict';

var getEnemy = require('./enemy'),
    random = require('./random'),
    cache = require('./cache-generator')('enemies'),
    forOf = require('./utils/for-of'),
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
        when: 1000,
        func: 'move',
        params: function() { return [0, 20] },
        loopFor: 0
      },
      {
        when: 0,
        func: 'move',
        params: function(elapsedTime) { return [-1, 0] },
        loopFor: 4000 // loop for 10ms. if < 0, loop forever. if 0, no loop
      },
      {
        when: 0,
        func: 'rotate',
        params: function(elapsedTime) { return [0.1] },
        loopFor: 4000 // loop for 10ms. if < 0, loop forever. if 0, no loop
      },
      {
        when: 0,
        func: 'setColour',
        params: function(elapsedTime, state) {

          state.colour = state.colour || 0;
          state.change = state.change || 1;

          var result = 'rgb(' + state.colour + ',' + state.colour + ',' + state.colour + ')';

          state.colour += state.change;

          if (state.colour > 255) {
            state.change = -1;
            state.colour = 254;
          }
          if (state.colour < 0) {
            state.change = 1;
            state.colour = 1;
          }
          return [result];
        },
        loopFor: -1
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
