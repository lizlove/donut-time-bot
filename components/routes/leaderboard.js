var debug = require('debug')('botkit:leaderboard');
const leaderController = require('../../bin/leaderController');

module.exports = function (webserver, controller) {

    debug('Configured /leaders');
    webserver.get('/leaders', leaderController.getLeaders);

};