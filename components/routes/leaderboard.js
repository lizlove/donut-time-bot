var debug = require('debug')('botkit:leaderboard');
const leaderController = require('../../bin/leaderController');

module.exports = function (webserver, controller) {
    // TODO: Remove this route?
    debug('Configured /leaders');
    webserver.get('/leaders', leaderController.getLeaders, leaderController.getLeaderSlackIds);

};