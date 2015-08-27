'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    collidable = require('./mixins/collidable'),
    renderable = require('./mixins/renderable'),
    timerDeath = require('./mixins/timer-death'),
    transformer = require('./mixins/transformer'),
    objectAssign = require('object-assign');

var bulletPath = new Path2D('M-2.5 0.5 l4 0'),
    speed = 10;

module.exports = function getBullet() {

  var bullet = objectAssign(
    {},
    movable,
    colourable,
    collidable,
    scalable,
    strokable,
    renderable,
    timerDeath,
    transformer,
    {
      x: 0,
      y: 0,
      colour: 'blue',
      lineWidth: 3,
      path: bulletPath,

      init: function() {
        this.moveTo(0, 0);
        this.setScale(1);
        this.setColour('blue');
        this.setTtl(3000);
      },

      update: function(steps) {
        this.movement(steps);
        this.updateDeath(steps);
      },

      movement: function(steps) {
        this.move(steps * speed, 0);
      },

      dead: function() {
        return this.ttl <= 0;
      }

    }
  );

  bullet.setCollisionBounds([
    {x: -2.5, y: -1.5},
    {x: 2.5, y: -1.5},
    {x: 2.5, y: 1.5},
    {x: -2.5, y: 1.5}
  ]);

  return bullet;
};
