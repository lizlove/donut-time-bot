module.exports = function(controller) {

    controller.hears(['help'], 'direct_message,direct_mention,mention', function (bot, message) {
        let help = '\n Directions\nAdd a donut after someones username like this `@username : donut:`. You can include a message as well. Everyone has 6 donuts to give out per day and can only give donuts in the #donuttime channel. \n To see the donut time leaderboard, click here: https://dashboard.heroku.com/apps/donuttime';

        if (user && user.name) {
            bot.replyPrivate(message, `Hello ${user.name}!!!` + help);
        } else {
            bot.replyPrivate(message, 'Hello.');
        }

    });

}