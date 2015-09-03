'use strict';

var getEnemy = require('./enemy'),
    getPlayer = require('./player'),
    getBullet = require('./bullet'),
    getCamera = require('./camera'),
    framerate = require('./framerate')(60),
    cacheGenerator = require('./cache-generator'),
    inputGenerator = require('./input-generator'),
    obstacles = require('./obstacles'),
    enemies = require('./enemies'),
    random = require('./random'),
    forOf = require('./utils/for-of');

var canvas = document.querySelector('canvas'),
    bulletCache = cacheGenerator('bullets'),
    obstaclesLive = cacheGenerator('obstacles:live'),
    players = cacheGenerator('players'),
    playersLive = cacheGenerator('players:live'),
    enemiesLive = cacheGenerator('enemies:live'),
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

  keyState.get(currentPlayer).handleKeyDown(event.keyCode);

  keysRecord.get(currentPlayer).push({
    type: 'keydown',
    keyCode: event.keyCode
  })

  return false;
}

function keyup(event) {

  event.preventDefault();

  keyState.get(currentPlayer).handleKeyUp(event.keyCode);

  keysRecord.get(currentPlayer).push({
    type: 'keyup',
    keyCode: event.keyCode
  })

  return false;
}

function keysProcessed() {
  forOf(keyState, function(keyStateMap) {
    keyStateMap[1].markDownAsHeld()
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
  // reset the state of all the keys (ie; delete 'em all)
  forOf(keyState, function(keyStateMap) {
    keyStateMap[1].reset();
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

function setupObstacles() {

  var i,
      obstacle;

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

function resetGame() {

  // Clean up reusable game objects
  forOf(bullets, function(bullet) {
    bulletCache.put(bullet);
  });

  bullets.clear();

  forOf(obstaclesLive, function(obstacle) {
    obstacles.put(obstacle);
  });

  obstaclesLive.clear();

  forOf(enemiesLive, function(enemy) {
    enemy.resetKeyframes();
    enemies.put(enemy);
  });

  enemiesLive.clear();

  // Setup the live game objects
  camera.moveTo(0, 0);

  forAllPlayers(function(player) {
    player.moveTo(50, 50);
    player.setEnergy(10);
  });

  setupEnemies();
  setupObstacles();

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
  player.setEnergy(10);
  playersLive.put(player);
  keysRecord.set(currentPlayer, []);
  keyState.set(currentPlayer, inputGenerator());
}

function setupEnemies() {

  var yPos = random.betweenInts(0, canvas.height);

  for (var i = 0; i < 10; i++) {
    // TODO: Cancel timeouts if game reset
    window.setTimeout(function() {
      var enemy = enemies.get(0);
      enemy.moveTo(canvas.width, yPos);
      enemiesLive.put(enemy);
    }, 400 * i);
  }

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

  var keyStateForPlayer = keyState.get(player);

  if (keyStateForPlayer.isKeyDown(KEY_UP)) {
    player.move(0, -playerMoveSpeed * steps);
  }

  if (keyStateForPlayer.isKeyDown(KEY_DOWN)) {
    player.move(0, playerMoveSpeed * steps);
  }

  if (keyStateForPlayer.isKeyDown(KEY_LEFT)) {
    player.move(-playerMoveSpeed * steps, 0);
  }

  if (keyStateForPlayer.isKeyDown(KEY_RIGHT)) {
    player.move(playerMoveSpeed * steps, 0);
  }

  if (keyStateForPlayer.isKeyPressed(KEY_SPACE)) {

    // players have a limit to the number of bullets that can be fired
    if (player.getEnergy() > 0) {
      newBullet = bulletCache.get(getBullet);

      newBullet.init();

      playerPos = player.getPos();
      newBullet.moveTo(playerPos.x, playerPos.y);

      newBullet.forPlayer = player;

      newBullet.onDeathOnce(function() {
        player.changeEnergy(1);
      });

      bullets.add(newBullet);

      player.changeEnergy(-1);
    }
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

    var keyStateForPlayer = keyState.get(player);

    // replay the keys that haven't been played yet
    keysRecord.get(player).filter(function(keyPress) {

      return keyPress.whenHandled >= gameTimeElapsed - elapsedTime
        && keyPress.whenHandled < gameTimeElapsed;

    }).forEach(function(keyPress) {

      // replay the input
      switch (keyPress.type) {
        case 'keydown':
          keyStateForPlayer.handleKeyDown(keyPress.keyCode);
          break;
        case 'keyup':
          keyStateForPlayer.handleKeyUp(keyPress.keyCode);
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

  forOf(enemiesLive, function(enemy) {

    // update enemy keyframes
    enemy.updateKeyFrames(elapsedTime);

    // check for player collisions
    forOf(playersLive, function(player) {

      if (enemy.collidingWith(player)) {

        if (player === currentPlayer) {

          // Current player dying causes a game reset
          startReplay();
          return false;

        } else {

          // kill this player
          playersLive.delete(player);
          players.put(player);

          // kill this enemy
          enemiesLive.delete(enemy);
          enemies.put(enemy);
        }
      }
    });
  });

  // check for bullet collisions
  forOf(bullets, function(bullet) {
    forOf(enemiesLive, function(enemy) {
      if (bullet.collidingWith(enemy)) {

        // kill this bullet
        bullets.delete(bullet);
        bulletCache.put(bullet);

        // kill this enemy
        enemiesLive.delete(enemy);
        enemies.put(enemy);
      }
    });
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

  forOf(enemiesLive, function(enemy) {
    if (enemy.collidingWith(camera, false)) {
      enemy.render(ctx);
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
