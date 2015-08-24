(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    KEY_PAGE_UP = 34,
    KEY_PAGE_DOWN = 33,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    keysDown = {},
    player = getPlayer(ctx),
    timeHistory = [];

function resizeCanvas() {
  var w = window;
  canvas.width = w.innerWidth
  canvas.height = w.innerHeight;

  draw();
}

function keydown(event) {
  keysDown[event.keyCode] = true;
}

function keyup(event) {
  delete keysDown[event.keyCode];
}

window.addEventListener('resize', resizeCanvas, false);
window.addEventListener('keydown', keydown, false);
window.addEventListener('keyup', keyup, false);

resizeCanvas();

function draw() {

  timeHistory.unshift(Date.now());

  if (timeHistory.length > 60) {
    timeHistory.pop(); // remove the oldest (last)
  }

  var elapsedTime = timeHistory[0] - timeHistory[1],
      targetElapsedTime = 1000 / 60, // 60fps
      speedFactor = elapsedTime / targetElapsedTime,
      averageTime = elapsedTime;

  for (var index = 0; index < timeHistory.length - 1; index++) {
    averageTime += timeHistory[index] - timeHistory[index + 1];
  }

  console.log('average time for last 60 frames: ', averageTime / (timeHistory.length - 1));

  if (keysDown[KEY_UP]) {
    player.move(0, -1 * speedFactor);
  }

  if (keysDown[KEY_DOWN]) {
    player.move(0, 1 * speedFactor);
  }

  if (keysDown[KEY_LEFT]) {
    player.move(-1 * speedFactor, 0);
  }

  if (keysDown[KEY_RIGHT]) {
    player.move(1 * speedFactor, 0);
  }

  if (keysDown[KEY_PAGE_UP]) {
    player.setScale(10);
  }

  if (keysDown[KEY_PAGE_DOWN]) {
    player.setScale(5);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.render();

  requestAnimationFrame(draw);

}

function getPlayer(ctx) {

  var x = 50,
      y = 50,
      scale = 5,
      path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4');

  return {

    render: function() {
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = "blue";

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.stroke(path);
      ctx.restore();
    },

    setScale: function(toScale) {
      scale = toScale;
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

},{}]},{},[1]);
