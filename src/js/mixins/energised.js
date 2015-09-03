'use strict';

module.exports = {

  isEnergised: true,

  setEnergy: function(toEnergy) {
    this.energy = toEnergy;
  },

  changeEnergy: function(dEnergy) {
    this.energy += dEnergy;
  },

  getEnergy: function() {
    return this.energy;
  }

};
