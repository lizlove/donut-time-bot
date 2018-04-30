var debug = require('debug')('botkit:leaderboard');
const leaderController = require('../../bin/leaderController');

module.exports = function (webserver, controller) {

    debug('Configured /leader');
    webserver.get('/leader', leaderController.getLeaders);

};