'use strict';

var forOf = require('../utils/for-of'),
    random = require('../random'),
    updater = require('../mixins/updater'),
    enemies = require('../enemies'),
    getBullet = require('../bullet'),
    getPlayer = require('../player'),
    getCamera = require('../camera'),
    obstacles = require('../obstacles'),
    objectAssign = require('object-assign'),
    subscribable = require('../mixins/subscribable'),
    cacheGenerator = require('../cache-generator'),
    inputGenerator = require('../input-generator'),
    createEnemySequence = require('../create-enemy-sequence');

var KEY_PAGE_UP = 34,
    KEY_PAGE_DOWN = 33,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_SPACE = 32,
    score = 0,
    lives = 4,
    camera,
    deaths = 0,
    bullets = new Set(),
    players = cacheGenerator('players'),
    keyState = new Map(),
    gameWidth = 0,
    gameHeight = 0,
    keysRecord = new Map(),
    bulletCache = cacheGenerator('bullets'),
    playersLive = cacheGenerator('players:live'),
    enemiesLive = cacheGenerator('enemies:live'),
    viewBoundary,
    obstaclesLive = cacheGenerator('obstacles:live'),
    totalGameTime = 0,
    currentPlayer,
    sequencesLive = [],
    playerMoveSpeed = 5,
    targetElapsedTime = 1000 / 60, // 60fps
    sequencesGenerated = [],
    sequenceGenerators = [
      function() {
        return {
          // yPos is always within middle half of screen height
          yPos: random.betweenInts(gameHeight / 4, gameHeight * 3 / 4),
          type: 0,
          count: 10,
          spawnSpeed: 300,
          timeouts: [],
          unsubs: []
        }
      },
      function() {
        return {
          // yPos is always within middle half of screen height
          yPos: random.betweenInts(gameHeight / 4, gameHeight * 3 / 4),
          type: 1,
          count: 15,
          spawnSpeed: 100,
          timeouts: [],
          unsubs: []
        }
      },
      function() {
        return {
          // yPos is always within middle half of screen height
          yPos: random.betweenInts(gameHeight / 4, gameHeight * 3 / 4),
          type: 2,
          count: 20,
          spawnSpeed: 200,
          timeouts: [],
          unsubs: []
        }
      }
    ];

function keydown(event) {

  event.preventDefault && event.preventDefault();

  keyState.get(currentPlayer).handleKeyDown(event.keyCode);

  keysRecord.get(currentPlayer).push({
    type: 'keydown',
    keyCode: event.keyCode
  })

  return false;
}

function keyup(event) {

  event.preventDefault && event.preventDefault();

  keyState.get(currentPlayer).handleKeyUp(event.keyCode);

  keysRecord.get(currentPlayer).push({
    type: 'keyup',
    keyCode: event.keyCode
  })

  return false;
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


function keysProcessed() {
  forOf(keyState, function(keyStateMap) {
    keyStateMap[1].markDownAsHeld()
  });
}

function releaseAllKeys() {
  keyState.get(currentPlayer).getAllNotUp().forEach(function(keyCode) {
    keyup({keyCode: keyCode});
  });
}

function setWhenOnKeypresses(when) {

  keysRecord.get(currentPlayer).forEach(function(keyRecord) {
    if (typeof keyRecord.whenHandled === 'undefined') {
      keyRecord.whenHandled = when;
    }
  });
}

function handleInput(player, steps) {

  var keyStateForPlayer = keyState.get(player),
      newBullet,
      playerPos,
      self = this;

  // TODO: Refactor to use subscription model
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
          self.trigger('energy', player.getEnergy());
          // TODO: Change to be a this.trigger('energy', player.getEnergy())
          /* energyText.setText('energy: ' + player.getEnergy()); */
        }
      });

      bullets.add(newBullet);

      player.changeEnergy(-1);
      if (player === currentPlayer) {
        self.trigger('energy', player.getEnergy());
        // TODO: Change to be a this.trigger('energy', player.getEnergy())
        /* energyText.setText('energy: ' + player.getEnergy()); */
      }
    }
  }
}

function loopBullets(bullets, steps) {

  bullets.forEach(function(bullet) {

    // move / age / etc
    bullet.update(steps);

    // when dead, remove it from the list of bullets
    if (bullet.dead()) {
      // remove from the active bullets list
      bullets.delete(bullet);

      // put onto the cached bullets list
      bulletCache.put(bullet);
    }

  });
}

function setupEnemies() {

  var spawnInfo,
      self = this;

  if (sequencesLive.length >= sequenceGenerators.length) {
    // no more enemy sequenceGenerators
    return;
  }

  if (sequencesGenerated.length > sequencesLive.length) {

    // get the next generated item
    spawnInfo = sequencesGenerated[sequencesLive.length];

  } else {

    // create a brand new item
    spawnInfo = sequenceGenerators[sequencesGenerated.length]();
    sequencesGenerated.push(spawnInfo);

  }

  sequencesLive.push(spawnInfo);

  createEnemySequence({
    spawnInfo: spawnInfo,
    getEnemy: enemies.get,
    initEnemy: function(enemy) {
      enemy.resetKeyframes();
      enemy.moveTo(viewBoundary.right, spawnInfo.yPos);
      enemy.birth();
    },
    onCreated: function(enemy) {
      enemiesLive.put(enemy);
    },
    onEveryDead: function() {
      // all enemies dead!

      // score bonus for killing all the sequence
      score += 10;
      // TODO: Change to be a subscriber
      self.trigger('score', score);
      /* scoreText.setText('score: ' + score); */

      setupEnemies.call(self);
    }
  });

}

function setupObstacles() {

  var i,
      minScale = Math.floor(gameHeight / 4),
      maxScale = Math.floor(gameHeight / 3),
      obstacle;

  for (i = 0; i < 4; i++) {
    obstacle = obstacles.get(i);
    obstacle.moveTo(500 + (i * 250), 0);
    obstacle.setScale(random.betweenInts(minScale, maxScale));
    obstaclesLive.put(obstacle);
  }

  for (i = 0; i < 4; i++) {
    obstacle = obstacles.get(i);
    obstacle.moveTo(500 + (i * 250), gameHeight);
    obstacle.setScale(random.betweenInts(minScale, maxScale));
    obstacle.rotateTo(Math.PI);
    obstaclesLive.put(obstacle);
  }

}

function resetKeys() {
  // reset the state of all the keys (ie; delete 'em all)
  forOf(keyState, function(keyStateMap) {
    keyStateMap[1].reset();
  });
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

  forOf(sequencesLive, function(sequence) {

    forOf(sequence.timeouts, function(timeout) {
      window.clearTimeout(timeout);
    });

    // clear out the array
    sequence.timeouts.length = 0;

    // unsubscribe where necessary
    sequence.unsubs.forEach(function(unsub) {
      unsub();
    });

    // clear out the array
    sequence.unsubs.length = 0;

  });

  sequencesLive.length = 0;

  forOf(enemiesLive, function(enemy) {
    enemy.resetKeyframes();
    enemies.put(enemy);
  });

  enemiesLive.clear();

  // Setup the live game objects
  camera.moveTo(0, 0);

  // revive killed players
  forOf(players, function(player) {
    playersLive.put(player);
    players.delete(player);
  });

  forAllPlayers(function(player) {
    player.moveTo(50, 50);
    player.setEnergy(10);
  });

  setupEnemies.call(this);
  setupObstacles();

  totalGameTime = 0;

  resetKeys();
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

  // TODO: Make subscribers
  this.trigger('energy', player.getEnergy());
  this.trigger('lives', lives - deaths);
  this.trigger('score', score);
  /* energyText.setText('energy: ' + player.getEnergy()); */
  /* livesText.setText('lives: ' + (lives - deaths)); */
}


function startReplay() {

  // reset everything
  resetGame.call(this);
  createNewCurrentPlayer.call(this);

}

function playerDeath(when) {

  releaseAllKeys();
  setWhenOnKeypresses(when);

  deaths++;

  if (deaths > lives) {
    // Game Over man, Game Over!
    // TODO
    console.log('game over');
  } else {

    // start the replay
    startReplay.call(this);
  }

}


module.exports = objectAssign(
  {},
  subscribable(),
  updater,
  {
    init: function(width, height) {
      totalGameTime = 0;
      createNewCurrentPlayer.call(this);

      camera = getCamera(0, 0, width, height);

      viewBoundary = {
        top: camera.getPos().y,
        right: camera.getPos().x + camera.getSize().width,
        bottom: camera.getPos().y + camera.getSize().height,
        left: camera.getPos().x
      };

      gameWidth = width;
      gameHeight = height;

      this.on('resize', camera.setSize.bind(camera));

      document.addEventListener('keydown', keydown, false);
      document.addEventListener('keyup', keyup, false);

      resetGame.call(this);
    },

    update: function(elapsedTime) {

      var self = this,
          steps = elapsedTime / targetElapsedTime;

      totalGameTime += elapsedTime;

      setWhenOnKeypresses(totalGameTime);

      camera.move(1, 0);

      viewBoundary = {
        top: camera.getPos().y,
        right: camera.getPos().x + camera.getSize().width,
        bottom: camera.getPos().y + camera.getSize().height,
        left: camera.getPos().x
      };

      loopBullets(bullets, steps);

      // Don't replay keys currently being recorded for current player
      forNotCurrentPlayer(function(player) {

        var keyStateForPlayer = keyState.get(player);

        // replay the keys that haven't been played yet
        keysRecord.get(player).filter(function(keyPress) {

          return keyPress.whenHandled >= totalGameTime - elapsedTime
            && keyPress.whenHandled < totalGameTime;

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

        handleInput.call(self, player, steps);

        forOf(obstaclesLive, function(obstacle) {

          var collisionResponse = player.collidingWith(obstacle, true, true);

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
              playerDeath.call(self, totalGameTime);
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
            bullet.die();
            bullets.delete(bullet);
            bulletCache.put(bullet);

            // kill this enemy
            enemy.die();
            enemiesLive.delete(enemy);
            enemies.put(enemy);

            score++;

            // TODO: Make this a subscriber
            self.trigger('score', score);
            /* scoreText.setText('score: ' + score); */
          }
        });
      });

      keysProcessed();

    },

    render: function(ctx) {

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

      forOf(obstaclesLive, function(obstacle) {
        if (obstacle.collidingWith(camera, false)) {
          obstacle.render(ctx);
        }
      });

      bullets.forEach(function(bullet) {

        if (!bullet.dead()) {
          // only render when on screen
          if (bullet.collidingWith(camera, false)) {
            bullet.render(ctx);
          }
        }

      });

      camera.resetTransformations(ctx);

    }
  }
);
