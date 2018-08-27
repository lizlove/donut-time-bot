'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var hbs = require('express-hbs');
var nconf = require('nconf');

module.exports = function(log) {

    var webserver = express();
    webserver.use(cookieParser());
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({
        extended: true
    }));

    // set up handlebars ready for tabs
    webserver.engine('hbs', hbs.express4({
        partialsDir: __dirname + '/../views/partials'
    }));
    webserver.set('view engine', 'hbs');
    webserver.set('views', __dirname + '/../views/');

    hbs.registerHelper('inc', function(value) {
        return parseInt(value) + 1;
    });

    hbs.registerHelper('imgerr', function(value) {
        value.onerror = '';
        value.src = './favicon-96x96.png';
    });

    hbs.registerHelper('zilcher', function(value) {
        return value > 0 ? value : 0;
    });

    webserver.use(express.static('public'));

    var server = http.createServer(webserver);
    const port = nconf.get('PORT');

    server.listen(port || 3000, null, function() {

        log.info('Express webserver configured and listening at http://localhost:' + port || 3000);

    });

    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require('path').join(__dirname, 'routes');
    require('fs').readdirSync(normalizedPath).forEach((file) => {
        require('./routes/' + file)(webserver, log);
    });

    return webserver;

};