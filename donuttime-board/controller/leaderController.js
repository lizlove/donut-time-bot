'use strict';

var rp = require('request-promise');
var nconf = require('nconf');
var logger = require('@havenlife/logger');
const appName = 'donuttime';
const logConfig = {
    name: appName,
    level: nconf.get('logConfig:level') || 'info'
};
let log = logger.getSystemLogger(logConfig);

exports.getLeaders = (req, res, next) => {

    var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: nconf.get('MONGO_URI'),
        tables: ['users']
    });

    const blacklist = nconf.get('BLACKLIST');

    // Query the database for a list of all users and filter out blacklist
    mongoStorage.users.all()
        .then(
            users => {
                return users.filter(
                    user => blacklist.indexOf(user.id) === -1
                );
            }
        )
        .then(
            data => {
                if (!data.length) {
                    res.json({ leaders: [] });
                }
                req.users = data;
                next();
            }
        )
        .catch(
            err => {
                log.error({
                    data: {
                        body: 'err in getLeaders',
                        error: err
                    }
                });
                res.json({ err: err });
            }
        );
};

exports.getLeaderSlackIds = (req, res) => {

    const token = nconf.get('SLACK_TOKEN');
    const users = req.users;

    let options = users.map(
        user => {
            let option = {};
            option.method = 'GET';
            option.uri =  'https://slack.com/api/users.info';
            option.qs = {
                token: token,
                user: user.id
            };
            return rp(option);
        }
    );

    // Handles deactivated slack users with filter. Refactor to consolidate iteration.
    return Promise.all(options)
        .then(
            slackData => {
                let leaders = slackData
                    .map(
                        slack => JSON.parse(slack)
                    )
                    .filter(
                        slack => slack.ok
                    )
                    .map(slack => {
                        let leader = users.find(user => user.id === slack.user.id);
                        leader.avatar = slack.user.profile.image_72 || '';
                        leader.id = slack.user.id || '';
                        leader.name = slack.user.profile.real_name_normalized || '';
                        return leader;
                    })
                    .sort(
                        (a, b) => b.lifetimeDonuts - a.lifetimeDonuts
                    );
                res.render('index', {
                    domain: req.get('host'),
                    protocol: req.protocol,
                    layout: 'layouts/default',
                    leaders: leaders
                });
            }
        )
        .catch(
            err => {
                log.error({
                    data: {
                        body: 'err in getLeaderSlackIds',
                        error: err
                    }
                });
                res.json({ err: err });
            }
        );
};

exports.getInstallPage = (req, res) => {
    res.render('installation', {
        domain: req.get('host'),
        protocol: req.protocol,
        layout: 'layouts/default'
    });
};