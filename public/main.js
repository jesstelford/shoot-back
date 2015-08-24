(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function(averageOver) {

  var timeHistory = [];

  averageOver = averageOver || 60;

  return {

    time: function(time) {

      timeHistory.unshift(time);

      if (timeHistory.length > averageOver) {
        timeHistory.pop(); // remove the oldest (last)
      }

      return timeHistory[0] - timeHistory[1];

    },

    rate: function() {

      var averageTime = timeHistory[0] - timeHistory[1];

      for (var index = 0; index < timeHistory.length - 1; index++) {
        averageTime += timeHistory[index] - timeHistory[index + 1];
      }

      return averageTime / timeHistory.length;

    }

  };

}

},{}],2:[function(require,module,exports){
'use strict';

var framerate = require('./framerate')(60);

var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    KEY_PAGE_UP = 34,
    KEY_PAGE_DOWN = 33,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_SPACE = 32,
    keyState = Object.create(null), // for...in without .hasOwnProperty
    player = getPlayer(ctx),
    bulletCache = new Set(),
    bullets = new Set(),
    bulletPath = new Path2D('M-2.5 0.5 l4 0'),
    newBullet = null;

function resizeCanvas() {
  var w = window;
  canvas.width = w.innerWidth
  canvas.height = w.innerHeight;

  loop();
}

/*
 * Key states:
 * undefined === up
 * 1 === just pressed
 * 2 === held
 */
function isKeyDown(key) {
  return !!keyState[key];
}

function isKeyPressed(key) {
  return keyState[key] === 1;
}

function isKeyHeld(key) {
  return keyState[key] === 2;
}

function keydown(event) {
  if (!keyState[event.keyCode]) {
    keyState[event.keyCode] = 1;
  }
}

function keyup(event) {
  delete keyState[event.keyCode];
}

function keysProcessed() {
  // transition to the 'held' state
  for (var key in keyState) {
    keyState[key] = 2;
  }
}

window.addEventListener('resize', resizeCanvas, false);
window.addEventListener('keydown', keydown, false);
window.addEventListener('keyup', keyup, false);

resizeCanvas();

function handleBullets(bullets, steps) {

  bullets.forEach(function(bullet) {

    // move / age / etc
    bullet.update(steps);

    // when dead, remove it from the list of bullets
    if (bullet.dead()) {
      // remove from the active bullets list
      bullets.delete(bullet);

      // put onto the cached bullets list
      bulletCache.add(bullet);
    } else {
      bullet.render();
    }

  });
}

function loop() {

  var elapsedTime = framerate.time(Date.now()),
      targetElapsedTime = 1000 / 60, // 60fps
      steps = elapsedTime / targetElapsedTime;

  /* console.log('average time for last 60 frames: ', framerate.rate()); */

  if (isKeyDown(KEY_UP)) {
    player.move(0, -1 * steps);
  }

  if (isKeyDown(KEY_DOWN)) {
    player.move(0, 1 * steps);
  }

  if (isKeyDown(KEY_LEFT)) {
    player.move(-1 * steps, 0);
  }

  if (isKeyDown(KEY_RIGHT)) {
    player.move(1 * steps, 0);
  }

  if (isKeyDown(KEY_PAGE_UP)) {
    player.setColour('red');
  }

  if (isKeyDown(KEY_PAGE_DOWN)) {
    player.setColour('green');
  }

  if (isKeyPressed(KEY_SPACE)) {

    if(bulletCache.size > 0) {
      newBullet = bulletCache.values().next().value;
      bulletCache.remove(newBullet);
    } else {
      newBullet = getBullet(ctx);
    }

    newBullet.init();
    bullets.add(newBullet);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.render();

  handleBullets(bullets, steps);

  keysProcessed();
  requestAnimationFrame(loop);

}

function getPlayer(ctx) {

  var x = 50,
      y = 50,
      scale = 5,
      colour = 'blue',
      path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4');

  return {

    render: function() {
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = colour;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.stroke(path);
      ctx.restore();
    },

    setScale: function(toScale) {
      scale = toScale;
    },

    setColour: function(toColour) {
      colour = toColour;
    },

    moveTo: function(toX, toY) {
      x = toX;
      y = toY;
    },

    move: function(dx, dy) {
      x += dx;
      y += dy;
    }

  };
}

function getBullet(ctx) {

  var x = 0,
      y = 0,
      alive = true,
      scale = 1,
      colour = 'blue';

  return {

    init: function() {
      x = 0;
      y = 0;
      alive = true;
      scale = 1;
      colour = 'blue';
    },

    update: function(steps) {
      this.movement(steps);
    },

    movement: function(steps) {
      this.move(steps, 0);
      if (x >= canvas.width) {
        alive = false;
      }
    },

    render: function() {
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = colour;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.stroke(bulletPath);
      ctx.restore();
    },

    setScale: function(toScale) {
      scale = toScale;
    },

    setColour: function(toColour) {
      colour = toColour;
    },

    moveTo: function(toX, toY) {
      x = toX;
      y = toY;
    },

    move: function(dx, dy) {
      x += dx;
      y += dy;
    },

    dead: function() {
      return !alive;
    }

  };
}


},{"./framerate":1}]},{},[2]);
