'use strict';

/**
 * Iterate over consecutive pairs in an array
 *
 * @param array Array the array to iterate over
 * @param iterator Function the iteration function. Called with (item1, item2)
 * where item1 is the first of the pair, and item2 is the second. Return `false`
 * to end the iteration early.
 * @param wrap Boolean if truthy, and array.length > 1, will call iterator with
 * pair of (lastElement, firstElement)
 */
module.exports = function(array, iterator, wrap) {
  for (var i = 0; i < array.length - 1; i++) {
    if (iterator(array[i], array[i+1]) === false) {
      // detected early out
      return;
    }
  }

  if (wrap && array.length > 1) {
    iterator(array[array.length - 1], array[0]);
  }
}
