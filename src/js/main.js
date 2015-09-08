'use strict';

var getEnemy = require('./enemy'),
    getPlayer = require('./player'),
    getBullet = require('./bullet'),
    getCamera = require('./camera'),
    getText = require('./text'),
    framerate = require('./framerate')(60),
    cacheGenerator = require('./cache-generator'),
    inputGenerator = require('./input-generator'),
    obstacles = require('./obstacles'),
    enemies = require('./enemies'),
    random = require('./random'),
    tween = require('./keyframes/tween'),
    async = require('./utils/async'),
    quadraticInterpolator = require('./interpolators/quadratic'),
    zoomAndMove = require('./keyframes/zoom-and-move'),
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
    collisionResponse,
    spawnSequence = [],
    spawnTimeouts = [],
    score = 0,
    lives = 5,
    deaths = 0,
    livesText,
    energyText,
    scoreText;

function startReplay() {

  // reset everything
  resetGame();
  createNewCurrentPlayer();

}

function playerDeath() {

  deaths++;

  // start the replay
  startReplay();

}

function keydown(event) {

  event.preventDefault();

  if (event.keyCode == 27) {
    return playerDeath();
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

  forOf(spawnTimeouts, function(timeout) {
    window.clearTimeout(timeout);
  });

  forOf(enemiesLive, function(enemy) {
    enemy.resetKeyframes();
    enemies.put(enemy);
  });

  // clear out the array
  spawnTimeouts.length = 0;

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

  energyText.setText('energy: ' + player.getEnergy());
  livesText.setText('lives: ' + (lives - deaths));
}

function setupEnemies() {

  var spawnInfo,
      creationPromises = [],
      deathPromises = [];

  if (spawnSequence.length > 0) {

    // there is already a spawn sequence set, so let's use that one
    spawnInfo = spawnSequence[0];

  } else {

    // brand new spawn instance required
    spawnInfo = {
      // yPos is always within middle half of screen height
      yPos: random.betweenInts(canvas.height / 4, canvas.height * 3 / 4),
      type: 0,
      count: 10,
      spawnSpeed: 300
    }

    // store it
    spawnSequence.push(spawnInfo);
  }

  for (var i = 0; i < spawnInfo.count; i++) {

    let enemy = enemies.get(spawnInfo.type),
        creationPromise,
        deathPromise;

    deathPromise = new Promise(function(resolveDeath) {
      creationPromise = new Promise(function(resolveCreation) {

        spawnTimeouts.push(window.setTimeout(function() {

          enemy.resetKeyframes();
          enemy.moveTo(canvas.width + camera.getPos().x, spawnInfo.yPos);
          enemy.birth();

          // TODO: How do I cancel this on game reset?
          enemy.onDeathOnce(function() {
            console.log('enemy dead');
            resolveDeath();
          });

          enemiesLive.put(enemy);

          resolveCreation();

        }, spawnInfo.spawnSpeed * i));

      });

      creationPromises.push(creationPromise);

    });

    deathPromises.push(deathPromise);

  }

  async.every(creationPromises, function() {
    // All enemies created
    console.log('all enemies created');
  });

  async.every(deathPromises, function() {
    // All enemies dead
    console.log('all enemies dead');
  });

}

function setupGame() {

  var screenWidth = canvas.width / 2;

  var texts = [100, screenWidth / 2, screenWidth - 100].map(function(xPos, index) {

    var text = getText(),
        duration = 600;

    text.moveTo(0, 0);

    text.setFont('Sans-Serif');
    text.setFontSize('0pt');
    text.setFontStyle('bold');

    text.setTextBaseline('middle');
    text.setTextAlign('center');

    text.setKeyframes(zoomAndMove({
      when: index * duration,
      duration: duration,
      startPos: [canvas.width / 4, canvas.height / 4],
      endPos: [xPos, 20],
      maxZoom: 40,
      restZoom: 20,
      modifier: function(params) {
        return [params[0] + 'pt'];
      }
    }));

    return text;
  });

  energyText = texts[0];
  livesText = texts[1];
  scoreText = texts[2];

  energyText.setText('energy: 100');
  livesText.setText('lives: ' + lives);
  scoreText.setText('score: ' + score);

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
        if (player === currentPlayer) {
          energyText.setText('energy: ' + player.getEnergy());
        }
      });

      bullets.add(newBullet);

      player.changeEnergy(-1);
      if (player === currentPlayer) {
        energyText.setText('energy: ' + player.getEnergy());
      }
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
          playerDeath();
          return false;

        } else {

          // kill this player
          playersLive.delete(player);
          players.put(player);

          // kill this enemy
          enemy.die();
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
        enemy.die();
        enemiesLive.delete(enemy);
        enemies.put(enemy);

        score++;
        scoreText.setText('score: ' + score);
      }
    });
  });

  // update keyframes
  energyText.updateKeyFrames(elapsedTime);
  livesText.updateKeyFrames(elapsedTime);
  scoreText.updateKeyFrames(elapsedTime);

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

  // HUD is rendered last (on top), and after camera transorms have been removed
  energyText.render(ctx);
  livesText.render(ctx);
  scoreText.render(ctx);

  keysProcessed();
  requestAnimationFrame(loop);

}

window.addEventListener('resize', resizeCanvas, false);
document.addEventListener('keydown', keydown, false);
document.addEventListener('keyup', keyup, false);

init();
