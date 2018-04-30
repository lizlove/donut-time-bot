var rp = require('request-promise');

exports.getLeaders = (req, res, next) => {

    var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: process.env.mongoUri,
        tables: ['users']
    });

    const BLACKLIST = [
        'D0GK339RN', // slackbot
        'D9Q0NDWKF', // climatebot
        'D9PA82SGH', // Birthday Bot
        'D38NAD5CZ', // heytaco
        'D9QU70Y3H' // sameroom
    ];

    // Query the database for a list of all users and filter out blacklist
    mongoStorage.users.all()
        .then(
            users => {
                return users.filter(
                    user => BLACKLIST.indexOf(user.id) === -1
                )
                    .sort(
                        (a, b) => b.lifetimeDonuts - a.lifetimeDonuts
                    );
                    
            }
        )
        .then(
            data => {
                if(!data.length) {
                    res.json({ leaderData: 'NO DATA' });
                }
                req.users = data;
                next();
            }
        )
        .catch(
            err => {
                console.log(err);
                res.json({ err: err });
            }
        )
};

exports.getLeaderSlackIds = (req, res) => {

    const token = process.env.slackToken
    const users = req.users;

    let options = users.map(
        user => {
            let option = {};
            option.method = 'GET';
            option.uri =  'https://slack.com/api/users.info';
            option.qs = {
                    token: token,
                    user: user.id
                }
            return rp(option);
        }
    );

    return Promise.all(options)
        .then(
            slackData => {
                let leaderboard = slackData.map(
                    slack => {
                        slack = JSON.parse(slack);
                        let leader = users.find(user => user.id === slack.user.id);
                        leader.avatar = slack.user.profile.image_72 || '';
                        leader.id = slack.user.id || '';
                        leader.real_name = slack.user.profile.real_name_normalized || '';
                        return leader;
                    }
                );
                res.json({ leaderboard: leaderboard });
            }
        )
        .catch(
            err => {
                console.log('err in getLeaders');
                res.json({ err: err });
            }
        )
};