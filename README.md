# Donut Time

Find your center. Give thanks with donuts on slack.

![rolling-donut](https://raw.githubusercontent.com/lizlove/donut-time-bot/master/donuttime-board/public/rolling-donut.gif)

![rolling-donut](/uploads/5d6b5fce2535c93aba38557e96c6c511/rolling-donut.gif)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
See deployment for notes on how to deploy the project on a live system. 

## Startup Scripts

To start the Donuttime Bot use:
``` 
node bot.js
```

To start the Donuttime Board run:
```
node app.js
```

Please note that you will need to either have the configs stored locally in an .env file or pass them in the command line. 

Example local CLI startup:
```
MONGO_URI=<MY MONGO URI> SLACK_TOKEN=<MY SLACK TOKEN> PORT=3000 node app.js
```


## Install Donut Time on Slack

Authenticate from this button!

[![Login with Slack](https://platform.slack-edge.com/img/add_to_slack.png)](https://slack.com/oauth/authorize?scope=commands+team%3Aread&client_id=13962040612.323802081317)

## Deployment

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Authors

* **Luis Flores** - [lespritdescalier](https://github.com/lespritdescalier)
* **Liz Lovero** - [lizlove](https://github.com/lizlove)
* **Alex Pear**  - [alexpear](https://github.com/alexpear)

## Acknowledgments

Thanks to the following:
* [Howdy.ai](https://www.botkit.ai/) botkit studio for bot infrastructure
* Gulshan Kirat for inspiration and product support
* [Lenny](https://www.instagram.com/lillenlen/) for canine awesomeness


## Remaining Questions
* Set dailyreset function to an AWS chron job


## Future ToDos:

* Add [slash commands](https://github.com/howdyai/botkit/blob/master/examples/slack/slackbutton_slashcommand.js)
