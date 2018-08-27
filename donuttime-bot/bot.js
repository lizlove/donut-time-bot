/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a Slack bot built with Botkit.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var Botkit = require('botkit');
var nconf = require('nconf');
var logger = require('@havenlife/logger');

nconf.argv().env();
nconf.file({ file: './config.json' });

const appName = 'donuttime';
const logConfig = {
    name: appName,
    level: nconf.get('logConfig:level') || 'info'
};

const id =  nconf.get('CLIENT_ID');
const secret = nconf.get('CLIENT_SECRET');
const uri = nconf.get('MONGO_URI');

if (!id || !secret) {
  usage_tip();
}

var bot_options = {
    CLIENT_ID: id,
    CLIENT_SECRET: secret,
    MONGO_URI: uri,
    scopes: ['bot']
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (uri) {
    var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: uri,
        tables: ['users']
    });
    bot_options.storage = mongoStorage;
} else {
    bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);

controller.startTicking();

controller.log = logger.getSystemLogger(logConfig);

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

if (!id || !secret) {

    let msg = ['WARNING: This application is not fully configured. Update config.json or pass your variables through the command line like this: CLIENT_ID=<MY SLACK CLIENT ID> CLIENT_SECRET=<MY CLIENT SECRET> MONGO_URI=<MY MONGO URI> PORT=3000 node bot.js'];
    usage_tip(msg);

} else {
    
    // Set up a simple storage backend for keeping a record of customers
    // who sign up for the app via the oauth
    require(__dirname + '/components/user_registration.js')(controller);

    // Send an onboarding message when a new team joins
    require(__dirname + '/components/onboarding.js')(controller);

    var normalizedPath = require("path").join(__dirname, "skills");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        if (! /[.]js$/.test(file)) {
            return;
        }

        require("./skills/" + file)(controller);
    });

    usage_tip(`bot.js after requiring skills started.`);

}

function usage_tip(msg) {
    controller.log.info('Donut Time Leaderboard: Find your center.');
    controller.log.info(msg);
}