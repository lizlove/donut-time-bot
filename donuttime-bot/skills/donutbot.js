/* eslint-disable no-trailing-spaces */
/* eslint-disable no-useless-escape */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    .___                    __    ___.           __   
  __| _/____   ____  __ ___/  |_  \_ |__   _____/  | 
 / __ |/  _ \ /    \|  |  \   __\  | __ \ /  _ \   __\
/ /_/ (  <_> )   |  \  |  /|  |    | \_\ (  <_> )  |
\____ |\____/|___|  /____/ |__|    |___  /\____/|__|  
     \/           \/                   \/             


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

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
'use strict';

module.exports = function(controller) {
    controller.hears([':doughnut:', ':donut:', ':donuttime:', ':donut2:', ':rolling_donut:'], 'ambient', function(bot, message) {
        controller.log.info('message', message);
        let senderId = message.user.replace(/[<@>]/g, '');

        controller.storage.users.get(message.user)
            .then(senderObj => {
                controller.log.info('hears(), after getting senderObj, which is: ' + JSON.stringify(senderObj));

                if (! senderObj) {
                    // New user that is not in the donut DB.
                    senderObj = {
                        id: senderId,
                        dailyDonutsDonated: 0,
                        lifetimeDonuts: 0
                    };
                }

                let secretMode = message.text.indexOf('thesecretpassword') > -1;

                const dailyDonutsDonated = secretMode ?
                    0 :
                    senderObj.dailyDonutsDonated;

                // eslint-disable-next-line max-len
                let lastMsg = "You've given your last donut for the day. You've truly shown there's no I in donut. Donut worry be happy! You'll have a fresh box of donuts tomorrow.";

                if (dailyDonutsDonated >= 6) {
                    bot.reply(message, lastMsg);
                }
                else {
                    let recipientsArr = message.text.match(/\<@(.*?)\>/g);

                    // Remove duplicates
                    recipientsArr = Array.from(new Set(recipientsArr))
                        // Format
                        .map((recipientId) => recipientId.replace(/[<@>]/g, ''))
                        // Sanitize for security
                        .filter((recipientId) =>
                            recipientId.match(/^[A-Z0-9]+$/) &&
                            recipientId.length >= 8 &&
                            recipientId.length <= 13
                        )
                        // Anticheat
                        .filter((recipientId) => (recipientId !== senderId) || secretMode);

                    const count = message.text.match(/\:d(.*?)\:/g).length;
                    const total = recipientsArr.length * count;
                    const remain = 6 - dailyDonutsDonated;
                    // eslint-disable-next-line max-len
                    const maxMsg = "Your generosity knows no bounds! Unfortunately your donut box does know bounds. You don't have enough in there to send all of those donuts.";

                    if (total > remain) {
                        bot.reply(message, maxMsg);
                    }
                    else {
                        recipientsArr.forEach(recipientId => {
                            notifySenderOfDonutsSent(recipientId, senderObj, count, bot)
                                .then(
                                    notifyRecipientOfDonutGiven.bind(undefined, recipientId, senderObj, count, bot)
                                );
                        });
                    }
                }
            });
    });

    function notifyRecipientOfDonutGiven(recipientId, senderObj, count, bot) {
        let message;

        return controller.storage.users.get(recipientId)
            .then((recipientObj) => {
                controller.log.info(
                    `notifyRecipientOfDonutGiven, just got recipientObj, which is: ${ JSON.stringify(recipientObj) }`
                );

                if (! recipientObj) {
                    recipientObj = {
                        id: recipientId,
                        dailyDonutsDonated: 0,
                        lifetimeDonuts: 0,
                        lifetimeDonutsGiven: 0
                    };
                }

                recipientObj.lifetimeDonuts += count;
                // eslint-disable-next-line max-len
                let receivedText = `You received ${ nDonuts(count) } :donuttime: from <@${senderObj.id}>! You have received ${ nDonuts(recipientObj.lifetimeDonuts) } in total.`;
                message = {
                    text: receivedText,
                    channel: recipientId // a valid slack channel, group, mpim, or im ID
                };

                controller.log.info('notifyRecipientOfDonutGiven(), about to save: ' + JSON.stringify(recipientObj));
                return controller.storage.users.save(recipientObj);
            })
            .then(() => {
                if (! message) {
                    return;
                }

                return bot.say(message, function(res, err) {
                    controller.log.info(res, err, 'Notified recipient');
                });
            });
    }

    function notifySenderOfDonutsSent(recipientId, senderObj, count, bot) {
        senderObj.dailyDonutsDonated += count;

        // Increment field while staying robust to missing data.
        const givenSoFar = senderObj.lifetimeDonutsGiven;
        senderObj.lifetimeDonutsGiven = givenSoFar ? givenSoFar + count : count;

        controller.log.info(`notifySenderOfDonutsSent, about to save: ${ JSON.stringify(senderObj) }`);

        return controller.storage.users.save(senderObj)
            .then(() => {
                let message = {
                    // eslint-disable-next-line max-len
                    text: `<@${ recipientId }> received ${ nDonuts(count) } from you. You have ${ nDonuts(6 - senderObj.dailyDonutsDonated) } remaining to give out today.`,
                    channel: senderObj.id // a valid slack channel, group, mpim, or im ID
                };

                bot.say(message, function(res, err) {
                    controller.log.info(res, err, 'Notified sender');
                });
            })
            .catch((error) => controller.log.error(error));
    }

    // Example usages:
    // nDonuts(1) === '1 donut'
    // nDonuts(2) === '2 donuts'
    function nDonuts(n) {
        return `${ n } ${ n === 1 ? 'donut' : 'donuts' }`;
    }

    // Listens for @donuttime help in the channel and returns a help message.
    controller.hears(['help'], 'direct_mention', function(bot, message) {
        // eslint-disable-next-line max-len
        let helpText = '\n Directions\nAdd a donut after someones username like this `@username : donut:`. You can include a message as well. Everyone has 6 donuts to give out per day and can only give donuts in the #donuttime channel.';
        let senderId = message.user.replace(/[<@>]/g, '');

        let replyMsg = {
            text: helpText,
            channel: senderId// a valid slack channel, group, mpim, or im ID
        };

        bot.say(replyMsg, function(res, err) {
            controller.log.info(res, err, `Sent help message to ${replyMsg.channel}`);
        });

    });
};
