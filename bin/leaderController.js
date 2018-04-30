exports.getLeaders = (req, res) => {

    var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: process.env.MONGO_URI,
        tables: ['users']
    });

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
        .catch(
            err => {
                res.json({ err: err });
            }
        )

    const leaderData = mongoPromise;
    if (!leaderData.length) {
        res.json({ leaderData: "NO DATA" });
        return;
    }

    res.json({ leaderData: leaderData });
};
