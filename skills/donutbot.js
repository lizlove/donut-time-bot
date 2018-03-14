/*

    This is a sample bot that provides a simple todo list function
    and demonstrates the Botkit storage system.

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

const Bluebird = require('bluebird');

module.exports = function(controller) {

    controller.hears([':doughnut:', ':donut:', ':donuttime:', ':donut2:'], 'ambient', function(bot, message) {
        console.log('message', message);
        let sender = message.user.replace(/[<@>]/g, '');
        controller.storage.users.get(message.user)
            .then((senderObj) => {
                const dailyDonutsDonated = senderObj && senderObj.dailyDonutsDonated;
                if (senderObj && dailyDonutsDonated >= 6 ) {

                    bot.reply(message, "You've given your last donut for the day. You've truly shown there's no I in donut. Donut worry be happy! You'll have a fresh box of donuts tomorrow.");
                } else {
                    const recipientsArr = message.text.match(/\<@(.*?)\>/g);
                    const count = message.text.match(/\:d(.*?)\:/g).length;
                    const total = recipientsArr.length * count;
                    const remain = 6 - dailyDonutsDonated;

                    if (total > remain) {
                        bot.reply(message, "Your generosity knows no bounds! Unfortunately your donut box does know bounds. You don't have enough in there to send all of those donuts.");
                    } else {
                        recipientsArr.forEach(recipient => {
                            let getter = recipient.replace(/[<@>]/g, '');

                            // TODO async timing
                            notifyRecipeintOfDonutGiven(getter, sender, count);
                            notifySenderOfDonutsSent(getter, sender, count);
                        });
                    }
                }
            });
    });

    function notifyRecipeintOfDonutGiven(recipientId, sender, count) {
        let message = {
          text: `You received ${count} donut :donuttime: from <@${sender}>!`,
          channel: recipientId // a valid slack channel, group, mpim, or im ID
        };
        bot.say(message, function(res, err) {
            console.log(res, err, 'Notified reciever');
        });
        return controller.storage.users.get(recipientId)
            .then((recipient) => {
                console.log('recipient ddd')
                return controller.storage.users.save({
                    id: recipient ? recipient.id : recipientId,
                    dailyDonutsDonated: recipient ? recipient.dailyDonutsDonated : 0,
                    lifetimeDonuts: recipient ? recipient.lifetimeDonuts + count : count
                });
            });
    }

    function notifySenderOfDonutsSent(recipient, sender, count) {
        // TODO: increment in the database
        controller.storage.users.get(sender)
            .then((donor) => {
                return controller.storage.users.save({
                    id: donor ? donor.id : sender,
                    dailyDonutsDonated: donor ? donor.dailyDonutsDonated + count : count,
                    lifetimeDonuts: donor ? donor.lifetimeDonuts : 0
                });
            })
            .then(() => {
                let message = {
                    text: `<@${recipient}> received ${count} donuts from you. You have ${6 - count} donuts remaining donuts left to give out today.`,
                    channel: sender // a valid slack channel, group, mpim, or im ID
                };

                bot.say(message, function(res, err) {
                    console.log(res, err, 'Notified sender');
                });
            })
            .catch((error) => console.log(error));
    }

    function getLeaderboardData() {
        // For now, just get all rows from users table and put them into a array, sort them.
        return controller.storage.users.all((error, users) => {
            if (error) {
                throw new Error(error);
            }

            return users;
        }).then(
            (users) => users.sort()
        );
    }
}
