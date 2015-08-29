'use strict';

module.exports = function forOf(iterable, iteration) {

  var iterator = iterable[Symbol.iterator](),
      value = iterator.next();

  // keep looping until we reach the end of the iterator
  while (!value.done) {

    // return false breaks the loop
    if (iteration(value.value, iterable) === false) {
      return;
    }

    value = iterator.next();
  }
}
