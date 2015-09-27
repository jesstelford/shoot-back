'use strict';

var forOf = require('../utils/for-of'),
    random = require('../random'),
    updater = require('../mixins/updater'),
    enemies = require('../enemies'),
    renderer = require('../mixins/renderer'),
    getBullet = require('../bullet'),
    getPlayer = require('../player'),
    getCamera = require('../camera'),
    recording = require('../recording'),
    objectAssign = require('object-assign'),
    subscribable = require('../mixins/subscribable'),
    cacheGenerator = require('../cache-generator'),
    inputGenerator = require('../input-generator'),
    obstacleGenerator = require('../obstacle-generator'),
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
    players = cacheGenerator('players'),
    keyState = new Map(),
    obstacles,
    gameWidth = 0,
    gameHeight = 0,
    keysRecord = new Map(),
    bulletCache = cacheGenerator('bullets'),
    bulletsLive = cacheGenerator('bullets:live'),
    playersLive = cacheGenerator('players:live'),
    enemiesLive = cacheGenerator('enemies:live'),
    viewBoundary,
    totalGameTime = 0,
    currentPlayer,
    sequencesLive = [],
    playerMoveSpeed = 5,
    playerBulletSpeed = 10,
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

  keysRecord.get(currentPlayer).recording.put({
    type: 'keydown',
    keyCode: event.keyCode
  })

  return false;
}

function keyup(event) {

  event.preventDefault && event.preventDefault();

  keyState.get(currentPlayer).handleKeyUp(event.keyCode);

  keysRecord.get(currentPlayer).recording.put({
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

  forOf(keysRecord.get(currentPlayer).recording, function(keyRecord) {
    if (!keyRecord) {
      return false;
    }
    if (typeof keyRecord.whenHandled === 'undefined') {
      keyRecord.whenHandled = when;
    }
  });

}

function handleInput(player, steps) {

  var keyStateForPlayer = keyState.get(player),
      newBullet,
      playerPos,
      unregisterCollisionCheck,
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

      newBullet = player.shoot(player.getPos(), [
        {
          when: 0,
          func: 'move',
          params: function(elapsedTime) {
            var steps = elapsedTime / targetElapsedTime;
            return [steps * playerBulletSpeed, 0];
          },
          loopFor: -1
        }
      ]);

      newBullet.forPlayer = player;

      unregisterCollisionCheck = newBullet.registerUpdatable(function() {

        var thisBullet = this;

        // Bullet is already dead, so early out
        if (thisBullet.dead()) {
          return;
        }

        forOf(enemiesLive, function(enemy) {
          if (thisBullet.collidingWith(enemy)) {

            // kill this bullet
            thisBullet.die();

            // kill this enemy
            enemy.die();
            enemiesLive.delete(enemy);
            enemies.put(enemy);

            score++;

            // TODO: Make this a subscriber
            self.trigger('score', score);
            /* scoreText.setText('score: ' + score); */
          }

          // Can only kill 1 enemy at a time
          return false;
        });
      });

      newBullet.onDeathOnce(function() {
        unregisterCollisionCheck();
        player.changeEnergy(1);
        if (player === currentPlayer) {
          self.trigger('energy', player.getEnergy());
          // TODO: Change to be a this.trigger('energy', player.getEnergy())
          /* energyText.setText('energy: ' + player.getEnergy()); */
        }
      });

      player.changeEnergy(-1);
      if (player === currentPlayer) {
        self.trigger('energy', player.getEnergy());
        // TODO: Change to be a this.trigger('energy', player.getEnergy())
        /* energyText.setText('energy: ' + player.getEnergy()); */
      }
    }
  }
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
    initEnemy: function(enemy, index) {
      enemy._sequenceNumber = index;
      enemy.resetKeyframes();
      enemy.moveTo(viewBoundary.right, spawnInfo.yPos);
      enemy.birth();
    },
    onCreated: function(enemy, index) {

      enemiesLive.put(enemy);

      enemy._unsubShoot = enemy.on('shoot', function(bullet) {

        bullet.setColour(enemy.colour);
      });

    },
    onDeath: function(enemy) {

      if (enemy._unsubShoot) {
        enemy._unsubShoot();
        delete enemy._unsubShoot;
      }

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

function initObstacles() {

  obstacles = obstacleGenerator(camera);

}

function resetKeys() {
  // reset the state of all the keys (ie; delete 'em all)
  forOf(keyState, function(keyStateMap) {
    keyStateMap[1].reset();
  });
}

function resetGame() {

  // Clean up reusable game objects
  forOf(bulletsLive, function(bullet) {
    bulletCache.put(bullet);
  });

  bulletsLive.clear();

  obstacles.reset();

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
    player.moveTo(200, gameHeight / 2);
    player.setEnergy(10);
  });

  setupEnemies.call(this);

  totalGameTime = 0;

  forAllPlayers(function(player) {
    var keyRecordForPlayer = keysRecord.get(player);
    // create a new iterator for replaying the keys
    keyRecordForPlayer.iterator = keyRecordForPlayer.recording[Symbol.iterator]();
  });

  resetKeys();
}

function createNewCurrentPlayer() {

  var player,
      keysRecordForPlayer;

  // Colour replay players differently
  // TODO: Alpha?
  if (currentPlayer) {
    currentPlayer.setColour('#0000bb');
  }

  player = getPlayer();
  keysRecordForPlayer = recording('player-' + player.getId() + '-keys')

  currentPlayer = player;
  player.setEnergy(10);
  player.moveTo(200, gameHeight / 2);
  playersLive.put(player);

  keysRecord.set(currentPlayer, {
    recording: keysRecordForPlayer,
    iterator: keysRecordForPlayer[Symbol.iterator]()
  });

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

function collisionWithPlayer(totalGameTime, player) {

  if (player === currentPlayer) {

    // Current player dying causes a game reset
    playerDeath.call(this, totalGameTime);
    return false;

  } else {

    // kill this player
    playersLive.delete(player);
    players.put(player);
  }
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
  renderer,
  {
    init: function(width, height) {
      totalGameTime = 0;
      createNewCurrentPlayer.call(this);

      camera = getCamera(0, 0, width, height);

      initObstacles();

      viewBoundary = {
        top: camera.getPos().y,
        right: camera.getPos().x + camera.getSize().width,
        bottom: camera.getPos().y + camera.getSize().height,
        left: camera.getPos().x
      };

      gameWidth = width;
      gameHeight = height;

      this.on('resize', camera.setSize.bind(camera));

      resetGame.call(this);
    },

    transitionIn: function() {
      document.addEventListener('keydown', keydown, false);
      document.addEventListener('keyup', keyup, false);
    },

    transitionOut: function() {
      document.removeEventListener('keydown', keydown, false);
      document.removeEventListener('keyup', keyup, false);
    },

    update: function(elapsedTime) {

      var self = this,
          steps = elapsedTime / targetElapsedTime;

      totalGameTime += elapsedTime;

      self.trigger('update', elapsedTime, totalGameTime, steps);

      setWhenOnKeypresses(totalGameTime);

      camera.move(1, 0);

      viewBoundary = {
        top: camera.getPos().y,
        right: camera.getPos().x + camera.getSize().width,
        bottom: camera.getPos().y + camera.getSize().height,
        left: camera.getPos().x
      };

      obstacles.update();

      // Don't replay keys currently being recorded for current player
      forNotCurrentPlayer(function(player) {

        var keyStateForPlayer = keyState.get(player),
            keyRecorded;

        function getKeyRecorded() {

          return keysRecord.get(player).iterator.next(function(keyPress) {

            return keyPress
              && keyPress.whenHandled >= totalGameTime - elapsedTime
              && keyPress.whenHandled < totalGameTime;

          });
        }

        // replay the keys that haven't been played yet
        keyRecorded = getKeyRecorded();

        while (keyRecorded.value) {

          // replay the input
          switch (keyRecorded.value.type) {
            case 'keydown':
              keyStateForPlayer.handleKeyDown(keyRecorded.value.keyCode);
              break;
            case 'keyup':
              keyStateForPlayer.handleKeyUp(keyRecorded.value.keyCode);
              break;
          }

          keyRecorded = getKeyRecorded();
        }

      });

      forAllPlayers(function(player) {

        handleInput.call(self, player, steps);

        forOf(obstacles.live, function(obstacle) {

          var collisionResponse = player.collidingWith(obstacle, true, true);

          if (collisionResponse) {
            // Shift the player back along the collision response vector
            player.move(-collisionResponse.x, -collisionResponse.y);
          }
        });

      });

      forOf(bulletsLive, function(bullet) {
        bullet.trigger('update', elapsedTime);
      });

      forOf(enemiesLive, function(enemy) {

        // update enemy keyframes
        enemy.updateKeyframes(elapsedTime);

        // check for player collisions
        forOf(playersLive, function(player) {

          if (enemy.collidingWith(player)) {

            // kill this enemy
            enemy.die();
            enemiesLive.delete(enemy);
            enemies.put(enemy);

            collisionWithPlayer.call(self, totalGameTime, player);
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

      forOf(obstacles.live, function(obstacle) {
        if (obstacle.collidingWith(camera, false)) {
          obstacle.render(ctx);
        }
      });

      forOf(bulletsLive, function(bullet) {

        if (!bullet.dead()) {
          // only render when on screen
          if (bullet.collidingWith(camera, false)) {
            bullet.render(ctx);
          }
        }

      });

      camera.resetTransformations(ctx);

      this.trigger('render', ctx);

    }
  }
);
