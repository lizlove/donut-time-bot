'use strict';
const leaderController = require('../../controller/leaderController');

module.exports = function(webserver) {
    // Alternate route for the board
    webserver.get('/leaders', leaderController.getLeaders, leaderController.getLeaderSlackIds);

};