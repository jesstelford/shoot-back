'use strict';

var getCanvas = require('./canvas'),
    getText = require('./text'),
    framerate = require('./framerate')(60),
    gameState = require('./states/game'),
    menuState = require('./states/menu'),
    stateManager = require('./state-manager'),
    zoomAndMove = require('./keyframes/zoom-and-move');

var canvas = getCanvas(),
    ctx,
    livesText,
    energyText,
    scoreText,
    gameRunning = false;

function setupHUD() {

  var screenWidth = canvas.getWidth();

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
      startPos: [canvas.getWidth() / 2, canvas.getHeight() / 2],
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

}


function setupCanvas() {

  // when canvas resizes, also resize the gamestate
  canvas.on('resize', gameState.trigger.bind(gameState, 'resize'));

  canvas.init('canvas');

  ctx = canvas.getContext();
}

function setupGame() {

  gameState.on('score', function(score) {
    scoreText.setText('score: ' + score);
  });

  gameState.on('energy', function(energy) {
    energyText.setText('energy: ' + energy);
  });

  gameState.on('lives', function(lives) {
    livesText.setText('lives: ' + lives);
  });

  stateManager.setState(menuState);
  stateManager.init(canvas.getWidth(), canvas.getHeight());

  menuState.on('selection', function(menuId) {
    switch(menuId) {

      case 'HELP':
        window.location.href = '/help';
        break;

      case 'CREDITS':
        window.location.href = '/credits';
        break;

      case 'START':
        stateManager.setState(gameState);
        stateManager.init(canvas.getWidth(), canvas.getHeight());
        break;
    }
  });
}

function init() {

  setupCanvas();

  setupHUD();

  gameRunning = true;
  setupGame();

  loop();
}

function loopHUD(elapsedTime) {

  // update keyframes
  energyText.updateKeyFrames(elapsedTime);
  livesText.updateKeyFrames(elapsedTime);
  scoreText.updateKeyFrames(elapsedTime);
}

function renderHUD() {

  // HUD is rendered last (on top), and after camera transorms have been removed
  energyText.render(ctx);
  livesText.render(ctx);
  scoreText.render(ctx);
}

function loop() {

  var now = Date.now(),
      elapsedTime = framerate.time(now);

  stateManager.update(elapsedTime);

  // TODO: Optimize this
  ctx.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());

  stateManager.render(ctx);

  loopHUD(elapsedTime);

  renderHUD();

  requestAnimationFrame(loop);

}

init();
