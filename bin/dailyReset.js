#!/usr/bin/env node

resetAllDailyCounts();

function resetAllDailyCounts() {
    console.log('Resetting dailyDonutsDonated for all users...');

    var mongoStorage = require('botkit-storage-mongo')({
        mongoUri: process.env.MONGO_URI,
        tables: ['users']
    });

    return mongoStorage.users.all()
        .then(users => 
            users.map(user => {
                user.dailyDonutsDonated = 0;
                return mongoStorage.users.save(user);
            })
        )
        .then(users => {
            console.log(`Done resetting dailyDonutsDonated for ${ users.length } users.`)
        });
}
