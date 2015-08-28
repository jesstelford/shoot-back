'use strict';

var getPlayer = require('./player'),
    getBullet = require('./bullet'),
    getCamera = require('./camera'),
    framerate = require('./framerate')(60),
    bulletCache = require('./bullet-cache');

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
    camera,
    player = getPlayer(),
    player2 = getPlayer(),
    playerMoveSpeed = 5,
    bullets = new Set(),
    newBullet = null,
    elapsedTime = 0,
    targetElapsedTime = 1000 / 60, // 60fps
    playerPos,
    steps;

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
  event.preventDefault();
  if (!keyState[event.keyCode]) {
    keyState[event.keyCode] = 1;
  }
  return false;
}

function keyup(event) {
  event.preventDefault();
  delete keyState[event.keyCode];
  return false;
}

function keysProcessed() {
  // transition to the 'held' state
  for (var key in keyState) {
    keyState[key] = 2;
  }
}

function resizeCanvas() {
  var w = window;
  canvas.width = w.innerWidth
  canvas.height = w.innerHeight;

  if (!camera) {
    camera = getCamera(0, 0, canvas.width, canvas.height);
  } else {
    camera.setSize(canvas.width, canvas.height);
  }
}

function init() {
  resizeCanvas();
  player2.moveTo(300, 200);
  loop();
}

function handleBullets(bullets, steps) {

  bullets.forEach(function(bullet) {

    // move / age / etc
    bullet.update(steps);

    // when dead, remove it from the list of bullets
    if (bullet.dead()) {
      // remove from the active bullets list
      bullets.delete(bullet);

      // put onto the cached bullets list
      bulletCache.put(bullet);
    } else {
      // only render when on screen
      if (bullet.collidingWith(camera)) {
        bullet.render(ctx);
      }
    }

  });
}

function loop() {

  elapsedTime = framerate.time(Date.now());
  steps = elapsedTime / targetElapsedTime;

  if (isKeyDown(KEY_UP)) {
    player.move(0, -playerMoveSpeed * steps);
  }

  if (isKeyDown(KEY_DOWN)) {
    player.move(0, playerMoveSpeed * steps);
  }

  if (isKeyDown(KEY_LEFT)) {
    player.move(-playerMoveSpeed * steps, 0);
  }

  if (isKeyDown(KEY_RIGHT)) {
    player.move(playerMoveSpeed * steps, 0);
  }

  if (isKeyDown(KEY_PAGE_UP)) {
    player.setColour('red');
  }

  if (isKeyDown(KEY_PAGE_DOWN)) {
    player.setColour('green');
  }

  if (isKeyPressed(KEY_SPACE)) {

    newBullet = bulletCache.get(getBullet);

    newBullet.init();

    playerPos = player.getPos();
    newBullet.moveTo(playerPos.x, playerPos.y);

    bullets.add(newBullet);
  }

  for(var bullet of bullets) {
    if (player2.collidingWith(bullet)) {
      player2.setColour('red');
      break;
    } else {
      player2.setColour('blue');
    }
  }

  camera.move(1, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  camera.setTransformations(ctx);

  // only render when on screen
  if (player.collidingWith(camera)) {
    player.render(ctx);
  }
  if (player2.collidingWith(camera)) {
    player2.render(ctx);
  }

  handleBullets(bullets, steps);

  camera.resetTransformations(ctx);

  keysProcessed();
  requestAnimationFrame(loop);

}

window.addEventListener('resize', resizeCanvas, false);
document.addEventListener('keydown', keydown, false);
document.addEventListener('keyup', keyup, false);

init();
