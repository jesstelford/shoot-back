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
    players = cacheGenerator('players'),
    playersLive = cacheGenerator('players:live'),
    ctx = canvas.getContext('2d'),
    KEY_PAGE_UP = 34,
    KEY_PAGE_DOWN = 33,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_SPACE = 32,
    keyState = new Map(),
    keysRecord = new Map(),
    camera,
    currentPlayer,
    playerMoveSpeed = 5,
    bullets = new Set(),
    newBullet = null,
    gameStartTime = Date.now(),
    elapsedTime = 0,
    targetElapsedTime = 1000 / 60, // 60fps
    playerPos,
    steps,
    collisionResponse;

// Key states:
// undefined === up
// 1 === just pressed
// 2 === held
function isKeyDown(key, player) {
  return (keyState.has(player) && !!keyState.get(player)[key]);
}

function isKeyPressed(key, player) {
  return (keyState.has(player) && keyState.get(player)[key] === 1);
}

function isKeyHeld(key, player) {
  return (keyState.has(player) && keyState.get(player)[key] === 2);
}

function handleKeyDown(keyCode, player) {

  var keyStateForPlayer = keyState.get(player);

  if (!keyStateForPlayer[keyCode]) {
    keyStateForPlayer[keyCode] = 1;
  }
}

function handleKeyUp(keyCode, player) {

  var keyStateForPlayer = keyState.get(player);
  delete keyStateForPlayer[keyCode];

}

function startReplay() {

  // reset everything
  resetGame();
  createNewCurrentPlayer();

}

function playerDeath() {

  // start the replay
  startReplay();

}

function keydown(event) {

  event.preventDefault();

  if (event.keyCode == 27) {
    playerDeath();
  }

  handleKeyDown(event.keyCode, currentPlayer);

  keysRecord.get(currentPlayer).push({
    type: 'keydown',
    keyCode: event.keyCode
  })

  return false;
}

function keyup(event) {

  event.preventDefault();

  handleKeyUp(event.keyCode, currentPlayer);

  keysRecord.get(currentPlayer).push({
    type: 'keyup',
    keyCode: event.keyCode
  })

  return false;
}

function keysProcessed() {
  var key;
  // transition to the 'held' state
  forOf(keyState, function(keyStateMap) {
    // [1] is the value in the map's for...of iteration
    for (key in keyStateMap[1]) {
      keyStateMap[1][key] = 2;
    };
  });
}

function setWhenOnKeypresses(when) {

  keysRecord.get(currentPlayer).forEach(function(keyRecord) {
    if (typeof keyRecord.whenHandled === 'undefined') {
      keyRecord.whenHandled = when;
    }
  });
}

function resetKeys() {
  var key;
  // reset the state of all the keys (ie; delete 'em all)
  forOf(keyState, function(keyStateMap) {
    keyState.set(keyStateMap[0], Object.create(null)); // Wipe out the key states
  });
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

  forAllPlayers(function(player) {
    player.moveTo(50, 50);
  });

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

  resetKeys();

  // restart the game time
  gameStartTime = Date.now();
}

function createNewCurrentPlayer() {

  // Colour replay players differently
  // TODO: Alpha?
  if (currentPlayer) {
    currentPlayer.setColour('#0000bb');
  }

  var player = getPlayer();
  currentPlayer = player;
  playersLive.put(player);
  keysRecord.set(currentPlayer, []);
  keyState.set(currentPlayer, Object.create(null)); // for...in without .hasOwnProperty
}

function setupGame() {
  createNewCurrentPlayer();
}

function init() {

  resizeCanvas();
  setupGame();
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

function handleInput(player) {

  if (isKeyDown(KEY_UP, player)) {
    player.move(0, -playerMoveSpeed * steps);
  }

  if (isKeyDown(KEY_DOWN, player)) {
    player.move(0, playerMoveSpeed * steps);
  }

  if (isKeyDown(KEY_LEFT, player)) {
    player.move(-playerMoveSpeed * steps, 0);
  }

  if (isKeyDown(KEY_RIGHT, player)) {
    player.move(playerMoveSpeed * steps, 0);
  }

  if (isKeyPressed(KEY_SPACE, player)) {

    newBullet = bulletCache.get(getBullet);

    newBullet.init();

    playerPos = player.getPos();
    newBullet.moveTo(playerPos.x, playerPos.y);

    bullets.add(newBullet);
  }
}

function forNotCurrentPlayer(cb) {

  forOf(playersLive, function(player) {

    if (player !== currentPlayer) {
      cb(player);
    }

  });

}

function forAllPlayers(cb) {
  forOf(playersLive, cb);
}

function loop() {

  var now = Date.now(),
      gameTimeElapsed = now - gameStartTime;

  elapsedTime = framerate.time(now);
  steps = elapsedTime / targetElapsedTime;

  setWhenOnKeypresses(gameTimeElapsed);

  // Don't replay keys currently being recorded for current player
  forNotCurrentPlayer(function(player) {

    // replay the keys that haven't been played yet
    keysRecord.get(player).filter(function(keyPress) {

      return keyPress.whenHandled >= gameTimeElapsed - elapsedTime
        && keyPress.whenHandled < gameTimeElapsed;

    }).forEach(function(keyPress) {

      // replay the input
      switch (keyPress.type) {
        case 'keydown':
          handleKeyDown(keyPress.keyCode, player);
          break;
        case 'keyup':
          handleKeyUp(keyPress.keyCode, player);
          break;
      }
    });

  });

  forAllPlayers(function(player) {

    handleInput(player);

    forOf(obstaclesLive, function(obstacle) {

      collisionResponse = player.collidingWith(obstacle, true, true);

      if (collisionResponse) {
        // Shift the player back along the collision response vector
        player.move(-collisionResponse.x, -collisionResponse.y);
      }
    });

  });

  // check for bullet collisions
  forOf(bullets, function(bullet) {
  });

  camera.move(1, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  camera.setTransformations(ctx, true);

  // only render when on screen
  forOf(playersLive, function(player) {
    if (player.collidingWith(camera, false)) {
      player.render(ctx);
    }
  });

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
