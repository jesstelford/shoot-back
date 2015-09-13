'use strict';

var forOf = require('./utils/for-of'),
    random = require('./random'),
    obstacles = require('./obstacles'),
    recording = require('./recording'),
    cacheGenerator = require('./cache-generator');

function initObstacles(data, live, camera, offsetCalculator) {

  var xOffset,
      spaceX,
      height = camera.getSize().height,
      minScale = Math.floor(height / 6),
      maxScale = Math.floor(height / 2),
      scale,
      obstacle;

  data.record = recording(data.name, function(startX) {

    startX = startX || 0;

    scale = random.betweenInts(minScale, maxScale);

    // Origin offset
    xOffset = offsetCalculator(scale);

    // A random amount of space between the last one and this one
    spaceX = random.betweenInts(scale / 2, scale * 2);

    data.nextX = startX + scale + spaceX;

    return {
      type: random.betweenInts(0, obstacles.getTypes().length),
      x: startX + xOffset + spaceX,
      y: data.y,
      scale: scale
    }
  });

}

function setupObstacle(obstacleData, live) {

  obstacleData.obstacle = obstacles.get(obstacleData.type);
  obstacleData.obstacle.moveTo(obstacleData.x, obstacleData.y);
  obstacleData.obstacle.setScale(obstacleData.scale);

  live.put(obstacleData.obstacle);

}

function resetObstacles(data, live, camera) {

  var obstacleData;

  data.record.forOf(function(obstacleData) {

    // The obstacle has been taken off the live list
    live.delete(obstacleData.obstacle);
    obstacles.put(obstacleData.obstacle);

    // reset the handle to the obstacle objects
    delete obstacleData.obstacle;
  });

  // The infinite iterator holding all recorded obstacles
  data.iterator = data.record[Symbol.iterator]();

  // while the generated obstacles are still on camera
  while (true) {

    obstacleData = data.iterator.next(data.nextX).value;

    setupObstacle(obstacleData, live);

    if (!obstacleData.obstacle.collidingWith(camera, false)) {
      break;
    }
  }

  // store the 'last' obstacle
  data.last = obstacleData;

  // get the iterator for the first obstacle
  data.firstIterator = data.record[Symbol.iterator]();

  // the first obstacle
  data.first = data.firstIterator.next().value;

}

module.exports = function(camera) {

  var result = {

    live: cacheGenerator('obstacles:live'),

    top: {
      name: 'obstacles:top',
      y: 0,
      nextX: 0
    },

    bottom: {
      name: 'obstacles:bottom',
      y: camera.getSize().height,
      nextX: 0
    },

    update: function() {

      var obstacleData;

      // Check if the first obstacles have moved off screen
      while (!this.top.first.obstacle.collidingWith(camera, false)) {

        // Remove it from the 'live' obstacle list
        this.live.delete(this.top.first.obstacle);
        obstacles.put(this.top.first.obstacle);
        delete this.top.first.obstacle;

        // Move along to the next obstacle which is the first
        this.top.first = this.top.firstIterator.next().value;
      }

      // check if the last obstacle is now on screen
      while (this.top.last.obstacle.collidingWith(camera, false)) {

        // Move along to the next obstacle which is the first off screen
        /* this.top.last = this.top.iterator.next(this.top.nextX).value; */
        obstacleData = this.top.iterator.next(this.top.nextX).value;
        setupObstacle(obstacleData, this.live);

        this.top.last = obstacleData;

        this.live.put(this.top.last.obstacle);
      }
    },

    reset: function() {

      resetObstacles(this.top, this.live, camera);
      /* resetObstacles(this.bottom, this.live, camera); */

    }

  }

  initObstacles(result.top, result.live, camera, function(scale) {
    // Origin is top-left of obstacle, so need to shift it in x-axis
    return -scale / 2;
  });
/*
  initObstacles(result.bottom, result.live, camera, function(scale) {
    // Origin is top-left of obstacle, so need to shift it in x-axis
    return scale / 2;
  });
  */

  result.reset();

  return result;

}
