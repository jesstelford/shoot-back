'use strict';

var getEnemy = require('./enemy'),
    random = require('./random'),
    cache = require('./cache-generator')('enemies'),
    forOf = require('./utils/for-of'),
    keyframeSin = require('./keyframes/sin'),
    keyframeCircle = require('./keyframes/circle'),
    objectAssign = require('object-assign');

function fullWave(when, duration, waves, amplitude, direction) {

  var radiansInCircle = Math.PI * 2,
      rotationRate = direction * waves * radiansInCircle / (60 * duration / 1000);

  return {
    when: when,
    func: 'move',
    params: keyframeSin(amplitude, rotationRate, 'middle', 'y'),
    loopFor: duration
  }
}

function circle(when, duration, radius, direction) {

  var radiansInCircle = Math.PI * 2,
      rotationRate = direction * radiansInCircle / (60 * duration / 1000);

  return {
    when: when,
    func: 'move',
    params: keyframeCircle(radius, rotationRate),
    loopFor: duration
  }
}

function semiCircle(when, duration, radius, direction) {

  var radiansInCircle = Math.PI * 2,
      rotationRate = direction * radiansInCircle / (60 * duration / 1000) / 2;

  return {
    when: when,
    func: 'move',
    params: keyframeCircle(radius, rotationRate),
    loopFor: duration
  }
}

function figure8(when, durationPerLoop, radius) {
  return [
    circle(when, durationPerLoop, radius, -1),
    circle(when + durationPerLoop, durationPerLoop, radius, 1)
  ]
}

function move(when, duration, rate) {
  return {
    when: when,
    func: 'move',
    params: function(elapsedTime) {
      var step = elapsedTime / (1000 / 60);
      return [step * rate, 0];
    },
    loopFor: duration
  }
}

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
      move(0, 1000, -4),
      move(1000, 5000, 1),
      move(5000, -1, -4)
    ].concat(
      fullWave(1000, 4000, 2, 100, -1)
      /* semiCircle(2000, 1000, 120, -1) */
      /* figure8(2000, 4000, 120) */
    )
  },
  {
    path: new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4'),
    collision: [
      {x: -10.5, y: -4.5},
      {x: 10.5, y: 0.5},
      {x: -10.5, y: 4.5}
    ],
    rotation: Math.PI,
    keyframes: [
      move(0, 2000, -4),
      move(3000, -1, -4)
    ].concat(
      figure8(2000, 4000, 120)
    )
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
