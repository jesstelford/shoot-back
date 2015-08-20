'use strict';

var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    w = window,
    x = w.innerWidth,
    y = w.innerHeight;

function resizeCanvas() {
  var w = window;
  canvas.width = w.innerWidth
  canvas.height = w.innerHeight;

  draw();
}

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

function draw() {

}
