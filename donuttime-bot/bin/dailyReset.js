#!/usr/bin/env node
'use strict';

var nconf = require('nconf');
var logger = require('@havenlife/logger');
const appName = 'donuttime';
const logConfig = {
    name: appName,
    level: nconf.get('logConfig:level') || 'info'
};
let log = logger.getSystemLogger(logConfig);

resetAllDailyCounts();

function resetAllDailyCounts() {
    log.info('Resetting dailyDonutsDonated for all users...');

    // Will this work with AWS configs?
    let uri = nconf.get('MONGO_URI');

    var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: uri,
        tables: ['users']
    });

    return mongoStorage.users.all()
        .then(users =>
            Promise.all(
                users.map(user => {
                    user.dailyDonutsDonated = 0;
                    return mongoStorage.users.save(user);
                })
            )
        )
        .then(users => {
            log.info(`Done resetting dailyDonutsDonated for ${ users.length } users.`);
            return users;
        });
}
