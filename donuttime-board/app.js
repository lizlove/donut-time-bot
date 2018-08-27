// /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// .____                      .___          ___.                          .___
// |    |    ____ _____     __| _/__________\_ |__   _________ _______  __| _/
// |    |  _/ __ \\__  \   / __ |/ __ \_  __ \ __ \ /  _ \__  \\_  __ \/ __ | 
// |    |__\  ___/ / __ \_/ /_/ \  ___/|  | \/ \_\ (  <_> ) __ \|  | \/ /_/ | 
// |_______ \___  >____  /\____ |\___  >__|  |___  /\____(____  /__|  \____ | 
//         \/   \/     \/      \/    \/          \/           \/           \/                                                    
// 
// This is a Donut leaderboard.
// 
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var leaderController = require("./controller/leaderController.js");
var nconf = require('nconf');
var logger = require('@havenlife/logger');

nconf.argv().env();
nconf.file({ file: './config.json' });

const uri =  nconf.get('MONGO_URI');
const token = nconf.get('SLACK_TOKEN');

const appName = 'donuttime';
const logConfig = {
    name: appName,
    level: nconf.get('logConfig:level') || 'info'
};
let log = logger.getSystemLogger(logConfig);

// Set up an Express-powered webserver to expose leaderboard
let webserver = require(__dirname + '/components/express_webserver.js')(log);

if (!uri || !token) {
    webserver.get('/', leaderController.getInstallPage);
    let msg = 'WARNING: This application is not fully configured. Update your configs or pass inline arguments like this: MONGO_URI=<MY MONGO URI> SLACK_TOKEN=<MY SLACK TOKEN> PORT=3000 node app.js';
    usage_tip(msg);
} else {
    webserver.get('/', leaderController.getLeaders, leaderController.getLeaderSlackIds);
    usage_tip('Leaderboard controller started.');
}

function usage_tip(msg) {
    log.info('Donut Time Leaderboard: Find your center.');
    log.info(msg);
}