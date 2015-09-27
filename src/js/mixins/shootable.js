'use strict';

var forOf = require('../utils/for-of'),
    getBullet = require('../bullet'),
    cacheGenerator = require('../cache-generator');

var bulletCache = cacheGenerator('bullets'),
    bulletsLive = cacheGenerator('bullets:live');

function invariant() {
  if (process.env.NODE_ENV !== 'production') {
    if (!this.isSubscribable) {
      throw new Error('Killable requires Subscribable to be mixed in');
    }
  }
}

module.exports = function() {

  var bullets = new Set();

  return {
    isShootable: true,

    shoot: function(startPos, keyframes) {

      var bullet;

      invariant.call(this);

      bullet = bulletCache.get(getBullet);

      keyframes = keyframes || [];

      bullet.init();

      bullet.moveTo(startPos.x, startPos.y);

      bullet.setKeyframes(keyframes);

      bullet.shotFrom = this;

      // when dead, remove it from the list of bullets
      bullet.onDeathOnce(function() {

        // remove from the active bullets list
        bulletsLive.delete(this);

        bullets.delete(bullet);

        // put onto the cached bullets list
        bulletCache.put(this);

      });

      bullets.add(bullet);
      bulletsLive.put(bullet);

      this.trigger('shoot', bullet);

      return bullet;

    },

    updateBullets: function(elapsedTime) {
      forOf(bullets, function(bullet) {
        bullet.update(elapsedTime);
      });
    },

    getBullets: function() {
      return bullets;
    }
  }

}
