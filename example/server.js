var path = require('path'),
    express = require('express'),
    exphbs = require('express-handlebars'),
    iframeReplacement = require('../index.js');

function Server() {

    // create an instance of express
    var app = express();

    // add iframe replacement to express as middleware (adds res.merge method)
    app.use(iframeReplacement);

    // add handlebars view engine (you can use any)
    app.engine('hbs', exphbs());

    // let express know how to locate the views/templates
    app.set('views', path.resolve(__dirname, 'views'));
    app.set('view engine', 'hbs');

    // create simple route to test our fake news
    app.get('/', function(req, res) {

        // respond to this request with our fake-new content embedded within the BBC News home page
        res.merge('fake-news', {
            sourceUrl: 'http://www.bbc.co.uk/news',                             // external url to fetch
            sourcePlaceholder: 'div[data-entityid="container-top-stories#1"]'   // css selector to inject our content into
        });
    });

    // start the server
    app.listen(8080, function() {
        console.log('Server running... Visit http://localhost:8080 in your browser');
    });
}

module.exports = new Server();