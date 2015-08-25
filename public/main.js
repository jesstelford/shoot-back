(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],2:[function(require,module,exports){
'use strict';

var cache = new Set();

module.exports = {

  get: function(constructor) {

    var result;

    if(cache.size > 0) {
      result = cache.values().next().value;
      cache.delete(result);
    } else {
      result = constructor();
    }

    return result;

  },

  put: function(item) {
    cache.add(item);
  },

  size: function() {
    return cache.size;
  }

}


},{}],3:[function(require,module,exports){
'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    renderable = require('./mixins/renderable'),
    objectAssign = require('object-assign');

var bulletPath = new Path2D('M-2.5 0.5 l4 0');

module.exports = function getBullet(ctx, canvasWidth) {

  var alive = true;

  return objectAssign({}, movable, colourable, scalable, strokable, renderable, {

    x: 0,
    y: 0,
    colour: 'blue',
    ctx: ctx,
    lineWidth: 3,
    path: bulletPath,

    init: function() {
      this.x = 0;
      this.y = 0;
      alive = true;
      this.scale = 1;
      this.colour = 'blue';
    },

    update: function(steps) {
      this.movement(steps);
    },

    movement: function(steps) {
      this.move(steps * 10, 0);
      if (this.x >= canvasWidth) {
        alive = false;
      }
    },

    dead: function() {
      return !alive;
    }

  });
};

},{"./mixins/colourable":6,"./mixins/movable":7,"./mixins/renderable":8,"./mixins/scalable":9,"./mixins/strokable":10,"object-assign":1}],4:[function(require,module,exports){
'use strict';

module.exports = function(averageOver) {

  var timeHistory = [];

  averageOver = averageOver || 60;

  return {

    time: function(time) {

      timeHistory.unshift(time);

      if (timeHistory.length > averageOver) {
        timeHistory.pop(); // remove the oldest (last)
      }

      return timeHistory[0] - timeHistory[1];

    },

    rate: function() {

      var averageTime = timeHistory[0] - timeHistory[1];

      for (var index = 0; index < timeHistory.length - 1; index++) {
        averageTime += timeHistory[index] - timeHistory[index + 1];
      }

      return averageTime / timeHistory.length;

    }

  };

}

},{}],5:[function(require,module,exports){
'use strict';

var getPlayer = require('./player'),
    getBullet = require('./bullet'),
    framerate = require('./framerate')(60),
    bulletCache = require('./bullet-cache');

var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    KEY_PAGE_UP = 34,
    KEY_PAGE_DOWN = 33,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_SPACE = 32,
    keyState = Object.create(null), // for...in without .hasOwnProperty
    player = getPlayer(ctx),
    bullets = new Set(),
    newBullet = null,
    elapsedTime = 0,
    targetElapsedTime = 1000 / 60, // 60fps
    playerPos,
    steps;

function resizeCanvas() {
  var w = window;
  canvas.width = w.innerWidth
  canvas.height = w.innerHeight;

  loop();
}

/*
 * Key states:
 * undefined === up
 * 1 === just pressed
 * 2 === held
 */
function isKeyDown(key) {
  return !!keyState[key];
}

function isKeyPressed(key) {
  return keyState[key] === 1;
}

function isKeyHeld(key) {
  return keyState[key] === 2;
}

function keydown(event) {
  event.preventDefault();
  console.log(event.keyCode);
  if (!keyState[event.keyCode]) {
    keyState[event.keyCode] = 1;
  }
  return false;
}

function keyup(event) {
  event.preventDefault();
  delete keyState[event.keyCode];
  return false;
}

function keysProcessed() {
  // transition to the 'held' state
  for (var key in keyState) {
    keyState[key] = 2;
  }
}

window.addEventListener('resize', resizeCanvas, false);
document.addEventListener('keydown', keydown, false);
document.addEventListener('keyup', keyup, false);

resizeCanvas();

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
      bullet.render();
    }

  });
}

function loop() {

  elapsedTime = framerate.time(Date.now());
  steps = elapsedTime / targetElapsedTime;

  /* console.log('average time for last 60 frames: ', framerate.rate()); */

  if (isKeyDown(KEY_UP)) {
    player.move(0, -1 * steps);
  }

  if (isKeyDown(KEY_DOWN)) {
    player.move(0, 1 * steps);
  }

  if (isKeyDown(KEY_LEFT)) {
    player.move(-1 * steps, 0);
  }

  if (isKeyDown(KEY_RIGHT)) {
    player.move(1 * steps, 0);
  }

  if (isKeyDown(KEY_PAGE_UP)) {
    player.setColour('red');
  }

  if (isKeyDown(KEY_PAGE_DOWN)) {
    player.setColour('green');
  }

  if (isKeyPressed(KEY_SPACE)) {

    newBullet = bulletCache.get(getBullet.bind(this, ctx, canvas.width));

    newBullet.init();

    playerPos = player.getPos();
    newBullet.moveTo(playerPos.x, playerPos.y);

    bullets.add(newBullet);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.render();

  handleBullets(bullets, steps);

  keysProcessed();
  requestAnimationFrame(loop);

}

},{"./bullet":3,"./bullet-cache":2,"./framerate":4,"./player":11}],6:[function(require,module,exports){
'use strict';

module.exports = {

  isColourable: true,

  setColour: function(toColour) {
    this.colour = toColour;
  }

};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = {

  isMovable: true,

  moveTo: function(toX, toY) {
    this.x = toX;
    this.y = toY;
  },

  move: function(dx, dy) {
    this.x += dx;
    this.y += dy;
  },

  getPos: function() {
    return {x: this.x, y: this.y}
  }
}

},{}],8:[function(require,module,exports){
'use strict';

module.exports = {

  isRenderable: true,

  render: function() {

    this.ctx.save();

    if (this.isMovable) {
      this.ctx.translate(Math.floor(this.x), Math.floor(this.y));
    }

    if (this.isScalable) {
      this.ctx.scale(this.scale, this.scale);
    }

    if (this.isStrokable) {
      this.stroke();
    }

    this.ctx.restore();
  }

};

},{}],9:[function(require,module,exports){
'use strict';

module.exports = {

  isScalable: true,

  setScale: function(toScale) {
    this.scale = toScale;
  }

};

},{}],10:[function(require,module,exports){
'use strict';

module.exports = {

  isStrokable: true,

  stroke: function() {

    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.isColourable) {
      this.ctx.strokeStyle = this.colour;
    }

    this.ctx.stroke(this.path);
  }

};

},{}],11:[function(require,module,exports){
'use strict';

var movable = require('./mixins/movable'),
    scalable = require('./mixins/scalable'),
    strokable = require('./mixins/strokable'),
    colourable = require('./mixins/colourable'),
    renderable = require('./mixins/renderable'),
    objectAssign = require('object-assign');

var path = new Path2D('M-10.5 -4.5 l20 4 l-20 4 l5 -4 l-5 -4');

module.exports = function getPlayer(ctx) {

  return objectAssign({}, movable, colourable, scalable, strokable, renderable, {

    x: 50,
    y: 50,
    colour: 'blue',
    scale: 1,
    lineWidth: 1,
    path: path,
    ctx: ctx

  });
};

},{"./mixins/colourable":6,"./mixins/movable":7,"./mixins/renderable":8,"./mixins/scalable":9,"./mixins/strokable":10,"object-assign":1}]},{},[5]);
