'use strict';

var ttl = require('./mixins/ttl'),
    movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    killable = require('./mixins/killable'),
    strokable = require('./mixins/strokable'),
    keyframed = require('./mixins/keyframed'),
    colourable = require('./mixins/colourable'),
    collidable = require('./mixins/collidable'),
    renderable = require('./mixins/renderable'),
    transformer = require('./mixins/transformer'),
    subscribable = require('./mixins/subscribable'),
    objectAssign = require('object-assign');

var targetElapsedTime = 1000 / 60, // 60fps
    bulletPath = new Path2D('M-2.5 0.5 l4 0'),
    speed = 10;

module.exports = function getBullet() {

  var bullet = objectAssign(
    {},
    subscribable(),
    movable,
    colourable,
    collidable,
    scalable,
    killable,
    keyframed,
    strokable,
    renderable,
    ttl,
    transformer,
    {
      init: function() {
        this.moveTo(0, 0);
        this.setScale(1);
        this.setLineWidth(3);
        this.setPath(bulletPath);
        this.setColour('blue');
        this.setTtl(3000);
        this.birth();
        this.resetKeyframes();
        this.setKeyframes([
          {
            when: 0,
            func: 'move',
            params: function(elapsedTime) {
              var steps = elapsedTime / targetElapsedTime;
              return [steps * speed, 0];
            },
            loopFor: -1
          }
        ]);
      },

      update: function(steps) {
        this.updateKeyframes(steps * targetElapsedTime);
        this.updateTtl(steps);
        if (this.getTtl() < 0) {
          this.die();
        }
      },

      dead: function() {
        return this.ttl <= 0;
      }

    }
  );

  bullet.init();

  bullet.setCollisionBounds([
    {x: -2.5, y: -1.5},
    {x: 2.5, y: -1.5},
    {x: 2.5, y: 1.5},
    {x: -2.5, y: 1.5}
  ]);

  return bullet;
};
