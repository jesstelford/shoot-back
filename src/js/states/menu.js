'use strict';

var getText = require('../text'),
    objectAssign = require('object-assign'),
    subscribable = require('../mixins/subscribable')

var KEY_UP = 38,
    KEY_DOWN = 40,
    KEY_SPACE = 32,
    currentMenu = 0,
    menuItemRenderMaxY,
    menuItemRenderMinY,
    menuItemRenderX,
    menuItemRenderSpace,
    activeMenus = [],
    menus = [
      {
        id: 'RESUME',
        text: 'Resume',
        condition: function(inGame) {
          return !!inGame;
        }
      },
      {
        id: 'START',
        text: 'Start',
        condition: function(inGame) {
          return !inGame;
        }
      },
      {
        id: 'HELP',
        text: 'Help'
      },
      {
        id: 'CREDITS',
        text: 'Credits'
      },
    ];

function selectMenu(id) {

  // unscale old menu
  activeMenus[currentMenu].text.setScale(1);

  currentMenu = id;

  if (currentMenu < 0) {
    currentMenu = activeMenus.length - 1;
  }

  if (currentMenu >= activeMenus.length) {
    currentMenu = 0;
  }

  activeMenus[currentMenu].text.setScale(2);
}

module.exports = objectAssign(
  {},
  subscribable(),
  {

    init: function(width, height, inGame) {

      this.on('keydown', function(keyCode) {

        switch (keyCode) {

          case KEY_UP:
            selectMenu(currentMenu - 1);
            break;

          case KEY_DOWN:
            selectMenu(currentMenu + 1);
            break;

          case KEY_SPACE:
            this.trigger('selection', activeMenus[currentMenu].id);
            break;
        }

      });

      var menusToActivate = menus.filter(function(menu) {

        return !menu.condition || menu.condition(inGame);

      });

      // leave a quarter of the screen at top & bottom
      menuItemRenderMinY = height / 4;
      menuItemRenderMaxY = height - menuItemRenderMinY;

      // centered on screen
      menuItemRenderX = width / 2;

      // space the menu items evenly over remaining space
      menuItemRenderSpace = (menuItemRenderMaxY - menuItemRenderMinY) / (menusToActivate.length - 1);

      activeMenus = menusToActivate.map(function(menu, index) {

        var result = {
          id: menu.id,
          text: getText()
        }

        result.text.setText(menu.text);
        result.text.setTextBaseline('middle');
        result.text.setTextAlign('center');

        result.text.moveTo(menuItemRenderX, menuItemRenderMinY + (menuItemRenderSpace * index));

        return result;
      });

      // default to the first menu item being selected
      selectMenu(1);

    },

    transitionIn: function() {
      this._keydownListener = this._keydown.bind(this);
      document.addEventListener('keydown', this._keydownListener, false);
    },

    transitionOut: function() {
      document.removeEventListener('keydown', this._keydownListener, false);
    },

    update: function() {
    },

    render: function(ctx) {

      activeMenus.forEach(function(menu) {
        menu.text.render(ctx);
      });

    },

    _keydown: function(event) {
      event.preventDefault && event.preventDefault();
      this.trigger('keydown', event.keyCode);
      return false;
    }

  }
);
