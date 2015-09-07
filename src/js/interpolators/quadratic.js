'use strict';

module.exports = function(fraction, target) {

  fraction = fraction * 2;

  if (fraction < 1.0) {
    // ease-in
    return (target / 2) * fraction * fraction;
  } else {
    // ease-out
    fraction--;
    return (-target / 2) * (fraction * (fraction - 2) - 1)
  }

}
