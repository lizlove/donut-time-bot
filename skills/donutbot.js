/*

    This is a custom donut bot

    Botkit comes with a generic storage system that can be used to
    store arbitrary information about a user or channel. Storage
    can be backed by a built in JSON file system, or one of many
    popular database systems.

    See:

        botkit-storage-mongo
        botkit-storage-firebase
        botkit-storage-redis
        botkit-storage-dynamodb
        botkit-storage-mysql

*/

module.exports = function(controller) {

    controller.hears([':doughnut:', ':donut:', ':donuttime:', ':donut2:'], 'ambient', function(bot, message) {
        console.log('message', message);
        let sender = message.user.replace(/[<@>]/g, '');

        controller.storage.users.get(message.user)
            .then(senderObj => {
                console.log('hears(), after getting senderObj, which is: ' + JSON.stringify(senderObj));

                if (! senderObj) {
                    // New user that is not in the donut DB.
                    senderObj = {
                        id: sender,
                        dailyDonutsDonated: 0,
                        lifetimeDonuts: 0
                    };
                }

                // const dailyDonutsDonated = senderObj.dailyDonutsDonated;
                const dailyDonutsDonated = (message.text.indexOf('thesecretpassword') === -1) ?
                    senderObj.dailyDonutsDonated :
                    0;

                if (dailyDonutsDonated >= 6) {

                    bot.reply(message, "You've given your last donut for the day. You've truly shown there's no I in donut. Donut worry be happy! You'll have a fresh box of donuts tomorrow.");
                } else {
                    const recipientsArr = message.text.match(/\<@(.*?)\>/g)
                        .map((recipient) => recipient.replace(/[<@>]/g, ''));
                        // TODO: Uncomment this after testing to filter out the sender from
                        // the recipients list (anticheat). Commented for pre-alpha testing.
                        // .filter((recipient) => recipient !== sender);

                    const count = message.text.match(/\:d(.*?)\:/g).length;
                    const total = recipientsArr.length * count;
                    const remain = 6 - dailyDonutsDonated;

                    if (total > remain) {
                        bot.reply(message, "Your generosity knows no bounds! Unfortunately your donut box does know bounds. You don't have enough in there to send all of those donuts.");
                    } else {
                        // TODO race condition when one recipient is mentioned twice.
                        recipientsArr.forEach(recipient => {
                            notifySenderOfDonutsSent(recipient, senderObj, count)
                                .then(
                                    notifyRecipeintOfDonutGiven.bind(undefined, recipient, senderObj, count)
                                );
                        });
                    }
                }
            });
    });

    function notifyRecipeintOfDonutGiven(recipientId, senderObj, count) {
        console.log('top of notifyRecipeintOfDonutGiven');

        let message;

        return controller.storage.users.get(recipientId)
            .then((recipientObj) => {
                console.log(`notifyRecipeintOfDonutGiven, just got recipientObj, which is: ${ JSON.stringify(recipientObj) }`);

                let text = `You received ${count} donut(s) :donuttime: from <@${senderObj.id}>!`;

                if (recipientObj) {
                    recipientObj.lifetimeDonuts += count;
                    text += ` You have received ${ recipientObj.lifetimeDonuts } donuts in total.`;
                }
                else {
                    recipientObj = {
                        id: recipientId,
                        dailyDonutsDonated: 0,
                        lifetimeDonuts: count
                    };
                }

                message = {
                    text: text,
                    channel: recipientId // a valid slack channel, group, mpim, or im ID
                };

                console.log('notifyRecipeintOfDonutGiven(), about to save: ' + JSON.stringify(recipientObj));
                return controller.storage.users.save(recipientObj);
            })
            .then(() => {
                if (! message) {
                    return;
                }

                return bot.say(message, function(res, err) {
                    console.log(res, err, 'Notified reciever');
                });
            });
    }

    function notifySenderOfDonutsSent(recipient, senderObj, count) {
        senderObj.dailyDonutsDonated += count;

        console.log(`notifySenderOfDonutsSent, about to save: ${ JSON.stringify(senderObj) }`);

        return controller.storage.users.save(senderObj)
            .then(() => {
                let message = {
                    text: `<@${recipient}> received ${count} donuts from you. You have ${6 - senderObj.dailyDonutsDonated} remaining donuts left to give out today.`,
                    channel: senderObj.id // a valid slack channel, group, mpim, or im ID
                };

                bot.say(message, function(res, err) {
                    console.log(res, err, 'Notified sender');
                });
            })
            .catch((error) => console.log(error));
    }

    // Returns a promise that resolves to a array of all users
    // in descending order by lifetimeDonuts.
    function getLeaderboardData() {
        const BLACKLIST = [
            'D0GK339RN', // slackbot
            'D9Q0NDWKF', // climatebot
            'D9PA82SGH', // Birthday Bot
            'D38NAD5CZ', // heytaco
            'D9QU70Y3H' // sameroom
        ];

        // For now, just get all rows from users table and put them into a array, sort them.
        return controller.storage.users.all(
            (error, users) => {
                if (error) {
                    throw new Error(error);
                }

                return users;
            }
        ).then(
            (users) => {
                return users.filter(
                    (user) => BLACKLIST.indexOf(user.id) === -1
                )
                .sort(
                    (a, b) => b.lifetimeDonuts - a.lifetimeDonuts
                );
            }
        );
    }

    // Returns a promise.
    function getUserData(userId) {
        return controller.storage.users.get(
            userId,
            (error, user) => {
                if (error) {
                    throw new Error(error);
                }

                return user;
            }
        );
    }
};
