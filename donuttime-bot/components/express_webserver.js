'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var nconf = require('nconf');

module.exports = function(controller) {

    var webserver = express();
    webserver.use(cookieParser());
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    webserver.use(express.static('public'));

    var server = http.createServer(webserver);
    const port = nconf.get('PORT');

    server.listen(port || 3000, null, function() {

        controller.log.info('Express webserver configured and listening at http://localhost:' + port || 3000);

    });

    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require('path').join(__dirname, 'routes');
    require('fs').readdirSync(normalizedPath).forEach(function(file) {
        require('./routes/' + file)(webserver, controller);
    });

    controller.webserver = webserver;
    controller.httpserver = server;

    return webserver;

};
