'use strict';

var async = require('./utils/async'),
    objectAssign = require('object-assign');

module.exports = function createEnemySequence(opts) {

  var creationPromises = [],
      deathPromises = [],
      options = objectAssign({
        onEveryCreated: function() {},
        onEveryDead: function() {},
        onCreated: function() {},
        onDeath: function() {}
      }, opts);

  if (process.env.NODE_ENV !== 'production') {
    if (!options.spawnInfo) {
      throw new Error('Must provide opts.spawnInfo');
    }
    if (!options.getEnemy) {
      throw new Error('Must provide opts.getEnemy');
    }
    if (!options.initEnemy) {
      throw new Error('Must provide opts.initEnemy');
    }
  }

  for (var i = 0; i < options.spawnInfo.count; i++) {

    (function(enemy) {

      var creationPromise,
          deathPromise,
          deathUnsub;

      deathPromise = new Promise(function(resolveDeath) {
        creationPromise = new Promise(function(resolveCreation) {

          // if any of these timeouts are cancelled, then the promise will not
          // resolve, and hence the `.every` call below will never execute
          options.spawnInfo.timeouts.push(window.setTimeout(function() {

            options.initEnemy(enemy);

            // if any of these subscriptoins are unsubscribed from, then the
            // promise will not resolve, and hence the `.every` call below will
            // never execute
            options.spawnInfo.unsubs.push(enemy.onDeathOnce(function() {
              options.onDeath(enemy);
              resolveDeath();
            }));

            options.onCreated(enemy);

            resolveCreation();

          }, options.spawnInfo.spawnSpeed * i));

        });

        creationPromises.push(creationPromise);

      });

      deathPromises.push(deathPromise);

    })(options.getEnemy(options.spawnInfo.type));

  }

  async.every(creationPromises, function() {
    // All enemies created
    options.onEveryCreated();
  });

  async.every(deathPromises, function() {
    // All enemies dead
    options.onEveryDead();
  });

  options.spawnInfo.creationPromises = creationPromises;
  options.spawnInfo.deathPromises = deathPromises;

  return options.spawnInfo;

}
