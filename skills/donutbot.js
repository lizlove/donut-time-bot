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

module.exports = function(controller) {

    controller.hears([':doughnut:', ':donut:', ':donuttime:'], 'ambient', function(bot, message) {

        // load sender from storage
        // add error handling
        // verify that sender dailyDonutsDonated < 6 (return donatedDonuts)
            // TODO: replace when you have db access variable
            let dailyDonutsRemain = 5;
            // If no
            // bot.reply( message, "You've given your last donut for the day. You've truly shown there's no "I" in donut. Donut worry be happy! You'll have a fresh box of donuts tomorrow.");
            // If yes
            // send DM's to the recipients
            let recipientsArr = message.text.match(/\<@(.*?)\>/g);
            let donutCount = [...message.text.match(/^:donut:$/), ...message.text.match(/^:doughnut:$/), ...message.text.match(/^:donuttime:$/)].length;
            recipientsArr.forEach(recipient => {
                let dmChannel = recipient.replace(/[<@>]/g, '');
                let sender = message.user.replace(/[<@>]/g, '');
                notifyRecipeintOfDonutGiven(dmChannel, message.user, donutCount);
                incrementdailyDonutsDonated(dmChannel, message.user, donutCount, dailyDonutsRemain);
                // increment the recipients lifetimeDonuts
            });

    });

    function notifyRecipeintOfDonutGiven(recipient, sender, donutCount) {
        console.log('DONUT COUNT', donutCount);
        let message = {
          text: `You received 1 donut :doughnut: from ${sender}!`,
          channel: recipient // a valid slack channel, group, mpim, or im ID
        };
        bot.say(message, function(res, err) {
            console.log(res, err, 'Notified recipient');
        });
    }

    function incrementdailyDonutsDonated(dmChannel, message.user, donutCount, dailyDonutsRemain) {
        // increment in the database
        let message = {
          text: `${recipient} received ${donutCount} donut from you. You have ${dailyDonutsRemain} donuts remaining donuts left to give out today.`,
          channel: sender // a valid slack channel, group, mpim, or im ID
        };
        bot.say(message, function(res, err) {
            console.log(res, err, 'Notified sender');
        });
    }

    // listen for a user saying "add <something>", and then add it to the user's list
    // store the new list in the storage system
    controller.hears(['add (.*)'],'direct_message,direct_mention,mention', function(bot, message) {

        var newtask = message.match[1];
        controller.storage.users.get(message.user, function(err, user) {

            if (!user) {
                user = {};
                user.id = message.user;
                user.tasks = [];
            }

            user.tasks.push(newtask);

            controller.storage.users.save(user, function(err,saved) {

                if (err) {
                    bot.reply(message, 'I experienced an error adding your task: ' + err);
                } else {
                    bot.api.reactions.add({
                        name: 'thumbsup',
                        channel: message.channel,
                        timestamp: message.ts
                    });
                }

            });
        });

    });

    // listen for a user saying "done <number>" and mark that item as done.
    controller.hears(['done (.*)'],'direct_message', function(bot, message) {

        var number = message.match[1];

        if (isNaN(number)) {
            bot.reply(message, 'Please specify a number.');
        } else {

            // adjust for 0-based array index
            number = parseInt(number) - 1;

            controller.storage.users.get(message.user, function(err, user) {

                if (!user) {
                    user = {};
                    user.id = message.user;
                    user.tasks = [];
                }

                if (number < 0 || number >= user.tasks.length) {
                    bot.reply(message, 'Sorry, your input is out of range. Right now there are ' + user.tasks.length + ' items on your list.');
                } else {

                    var item = user.tasks.splice(number,1);

                    // reply with a strikethrough message...
                    bot.reply(message, '~' + item + '~');

                    if (user.tasks.length > 0) {
                        bot.reply(message, 'Here are our remaining tasks:\n' + generateTaskList(user));
                    } else {
                        bot.reply(message, 'Your list is now empty!');
                    }
                }
            });
        }

    });
}
