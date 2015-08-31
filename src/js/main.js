'use strict';

var getPlayer = require('./player'),
    getBullet = require('./bullet'),
    getCamera = require('./camera'),
    framerate = require('./framerate')(60),
    cacheGenerator = require('./cache-generator'),
    obstacles = require('./obstacles'),
    forOf = require('./utils/for-of');

var canvas = document.querySelector('canvas'),
    bulletCache = cacheGenerator('bullets'),
    obstaclesLive = cacheGenerator('obstacles:live'),
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
    gameStartTime = Date.now(),
    elapsedTime = 0,
    targetElapsedTime = 1000 / 60, // 60fps
    playerPos,
    steps,
    isRecording = true,
    keysRecord = [],
    collisionResponse;

// Key states:
// undefined === up
// 1 === just pressed
// 2 === held
function isKeyDown(key) {
  return !!keyState[key];
}

function isKeyPressed(key) {
  return keyState[key] === 1;
}

function isKeyHeld(key) {
  return keyState[key] === 2;
}

function handleKeyDown(keyCode) {
  if (!keyState[keyCode]) {
    keyState[keyCode] = 1;
  }
}

function handleKeyUp(keyCode) {
  delete keyState[keyCode];
}

function startReplay() {

  // reset everything
  resetGame();

  // restart the game time
  gameStartTime = Date.now();

  console.log('Replaying ' + keysRecord.length + ' input events');
}

function triggerReplay() {

  isRecording = false;

  // start the replay
  startReplay();

}

function keydown(event) {

  event.preventDefault();

  if (event.keyCode == 27) {
    triggerReplay();
  }

  if (isRecording) {

    handleKeyDown(event.keyCode);

    keysRecord.push({
      type: 'keydown',
      keyCode: event.keyCode,
      when: Date.now() - gameStartTime
    })
  }

  return false;
}

function keyup(event) {

  event.preventDefault();

  if (isRecording) {

    handleKeyUp(event.keyCode);

    keysRecord.push({
      type: 'keyup',
      keyCode: event.keyCode,
      when: Date.now() - gameStartTime
    })
  }

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

function resetGame() {

  var i,
      obstacle;

  // Clean up reusable game objects
  forOf(bullets, function(bullet) {
    bulletCache.put(bullet);
  });

  bullets.clear();

  forOf(bullets, function(bullet) {
    bulletCache.put(bullet);
  });

  forOf(obstaclesLive, function(obstacle) {
    obstacles.put(obstacle);
  });

  obstaclesLive.clear();

  // Setup the live game objects
  camera.moveTo(0, 0);
  player.moveTo(50, 50);
  player2.moveTo(300, 200);

  for (i = 0; i < 4; i++) {
    obstacle = obstacles.get(i);
    obstacle.moveTo(500 + (i * 250), 10);
    obstaclesLive.put(obstacle);
  }

  for (i = 0; i < 4; i++) {
    obstacle = obstacles.get(i);
    obstacle.moveTo(500 + (i * 250), canvas.height);
    obstacle.rotateTo(Math.PI);
    obstaclesLive.put(obstacle);
  }
}

function init() {

  resizeCanvas();
  resetGame();

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
      if (bullet.collidingWith(camera, false)) {
        bullet.render(ctx);
      }
    }

  });
}

function loop() {

  var now = Date.now(),
      gameTimeElapsed = now - gameStartTime;

  elapsedTime = framerate.time(now);
  steps = elapsedTime / targetElapsedTime;

  if (!isRecording) {
    // replay the keys that haven't been played yet
    keysRecord.filter(function(keyPress) {

      return keyPress.when < gameTimeElapsed;

    }).forEach(function(keyPress) {

      // replay the input
      switch (keyPress.type) {
        case 'keydown':
          handleKeyDown(keyPress.keyCode);
          break;
        case 'keyup':
          handleKeyUp(keyPress.keyCode);
          break;
      }
    });

    // remove the replayed keys from the array
    keysRecord = keysRecord.filter(function(keyPress) {
      return keyPress.when >= gameTimeElapsed;
    });

  }


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

  camera.move(1, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  camera.setTransformations(ctx, true);

  forOf(bullets, function(bullet) {
    if (player2.collidingWith(bullet, true)) {
      player2.setColour('red');
      return false;
    } else {
      player2.setColour('blue');
    }
  });

  forOf(obstaclesLive, function(obstacle) {

    collisionResponse = player.collidingWith(obstacle, true, true);

    if (collisionResponse) {
      // Shift the player back along the collision response vector
      player.move(-collisionResponse.x, -collisionResponse.y);
    }
  });

  // only render when on screen
  if (player.collidingWith(camera, false)) {
    player.render(ctx);
  }

  if (player2.collidingWith(camera, false)) {
    player2.render(ctx);
  }

  // Don't need to check if on camera since we've manually placed them
  forOf(obstaclesLive, function(obstacle) {
    obstacle.render(ctx);
  });

  handleBullets(bullets, steps);

  camera.resetTransformations(ctx);

  keysProcessed();
  requestAnimationFrame(loop);

}

window.addEventListener('resize', resizeCanvas, false);
document.addEventListener('keydown', keydown, false);
document.addEventListener('keyup', keyup, false);

init();
