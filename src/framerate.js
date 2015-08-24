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
