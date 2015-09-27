'use strict';

var getEnemy = require('./enemy'),
    random = require('./random'),
    cache = require('./cache-generator')('enemies'),
    forOf = require('./utils/for-of'),
    keyframeSin = require('./keyframes/sin'),
    keyframeCircle = require('./keyframes/circle'),
    objectAssign = require('object-assign');

function fullWave(when, durationPerWave, waves, amplitude, direction) {

  var radiansInCircle = Math.PI * 2,
      duration = durationPerWave * waves,
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
    {
      when: when + durationPerLoop,
      reset: true
    },
    circle(when + durationPerLoop, durationPerLoop, radius, 1),
    {
      when: when + durationPerLoop * 2,
      reset: true
    },
  ]
}

function cycle(when, durationPerCycle, cycles, func, paramsFuncs) {

  var duration = durationPerCycle * cycles;

  return {
    when: when,
    func: func,
    params: function(elapsedTime, state) {

      state.whichFunc = state.whichFunc || 0;
      state.accumulatedElapsedTime = state.accumulatedElapsedTime || 0;

      state.accumulatedElapsedTime += elapsedTime;

      // We're done with this cycle
      if (state.accumulatedElapsedTime >= durationPerCycle) {

        // move along one cycle
        state.whichFunc++;

        // and wrap to the beginning if necessary
        if (state.whichFunc >= paramsFuncs.length) {
          state.whichFunc = 0;
        }

        // change the accumulated time
        state.accumulatedElapsedTime -= durationPerCycle;
      }

      return paramsFuncs[state.whichFunc].call(this, elapsedTime, state);
    },
    loopFor: duration
  }
}

function move(when, duration, rateX, rateY) {
  if (rateY === undefined) {
    rateY = 0;
  }
  return {
    when: when,
    func: 'move',
    params: function(elapsedTime) {
      var step = elapsedTime / (1000 / 60);
      return [step * rateX, step * rateY];
    },
    loopFor: duration
  }
}

function shoot(when, frequency, duration, speedX) {

  var timeSinceLast = 0,
      pos;

  if (speedX === undefined) {
    speedX = -10;
  }

  return {
    whenFunc: function() {
      this._sequenceNumber = this._sequenceNumber || 0;
      return when + 100 * this._sequenceNumber;
    },
    func: 'shoot',
    params: function(elapsedTime, state) {

      state.timeSinceLast = state.timeSinceLast || 0;
      state.timeSinceLast += elapsedTime;

      if (state.timeSinceLast < frequency) {
        // We don't want to shoot yet
        return false;
      }

      state.timeSinceLast -= frequency;

      if (this.isMovable) {
        pos = this.getPos();
      } else {
        pos = {
          x: 0,
          y: 0
        }
      }

      return [pos, [move(0, -1, speedX)]];

    },
    loopFor: duration
  }
}

var path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4'),
    collision = [
      {x: -10.5, y: -4.5},
      {x: 10.5, y: 0.5},
      {x: -10.5, y: 4.5}
    ];

var types = [
  {
    path: path,
    collision: collision,
    rotation: Math.PI,
    keyframes: [
      move(0, 500, -2),
      shoot(500, 2000, -1),

      fullWave(500, 4000, 30, 200, -1),

      cycle(4500, 4500, 26, 'move', [
        function (elapsedTime) {
          return false;
        },
        function (elapsedTime) {
          var step = elapsedTime / (1000 / 60);
          return [step * 2, 0];
        }
      ]),

      move(120000, -1, -2)
    ]
  },
  {
    path: path,
    collision: collision,
    rotation: Math.PI,
    keyframes: [
      move(0, 2000, -2),
      move(2000, 1000, 2),
      semiCircle(2000, 1000, 120, -1),
      move(3000, 1000, -2),
      move(4000, 1000, 2),
      semiCircle(4000, 1000, 120, 1),
      move(5000, -1, -4)
    ]
  },
  {
    path: path,
    collision: collision,
    rotation: Math.PI,
    keyframes: [
      move(0, 2000, -4),
      move(2000, 20000, 1),
      move(22000, -1, -4)
    ].concat(
      figure8(2000, 2000, 80),
      figure8(6000, 2000, 80),
      figure8(10000, 2000, 80),
      figure8(14000, 2000, 80),
      figure8(18000, 2000, 80)
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
        var enemy = getEnemy(objectAssign({type: type}, types[type])),
            unsubShoot;

        unsubShoot = enemy.on('shoot', function(bullet) {
          bullet.setColour(enemy.colour);
        });

        enemy.onDeathOnce(unsubShoot);

        return enemy;
      },

      // we're looking for a particular type
      function(toSearch) {

        var found,
            unsubShoot;

        forOf(toSearch, function(enemy) {
          if (enemy.type === type) {
            found = enemy;
            return false;
          }
        });

        unsubShoot = found.on('shoot', function(bullet) {
          bullet.setColour(found.colour);
        });

        found.onDeathOnce(unsubShoot);

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
