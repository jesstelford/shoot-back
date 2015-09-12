'use strict';

var subscribable = require('./mixins/subscribable'),
    objectAssign = require('object-assign');

function windowResize() {
  var w = window,
      width = w.innerWidth,
      height = w.innerHeight;

  this.trigger('resize', width, height);
}

module.exports = function getCanvas() {

  var resizeListener;

  return objectAssign(
    {},
    subscribable(),
    {
      init: function(selector) {

        this.canvas = document.querySelector(selector);
        this.context = this.canvas.getContext('2d');

        // setup a handler for resizing the canvas
        this.on('resize', function(width, height) {
          this.canvas.width = width;
          this.canvas.height = height;
        });

        resizeListener = windowResize.bind(this);
        window.addEventListener('resize', resizeListener, false);

        // trigger an initial resize event
        resizeListener();
      },

      delete: function() {
        window.removeEventListener('resize', resizeListener);
      },

      getContext: function() {
        return this.context;
      },

      getWidth: function() {
        return this.canvas.width;
      },

      getHeight: function() {
        return this.canvas.height;
      }
    }
  );
}
