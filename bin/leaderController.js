exports.getLeaders = (req, res) => {

    var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: process.env.MONGO_URI,
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
    const mongoPromise = mongoStorage.users.all()
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
                console.log(data);
                return res.json({ leaderData: data });
            }
        )
        .catch(
            err => {
                console.log(err);
                res.json({ err: err });
            }
        )

    // const leaderData = mongoPromise;
    // if (!leaderData.length) {
    //     res.json({ leaderData: "NO DATA" });
    //     return;
    // }

    // res.json({ leaderData: leaderData });
};
