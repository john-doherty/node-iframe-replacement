'use strict';

var path = require('path'),
    express = require('express'),               // use an actual instance of express to test
    exphbs = require('express-handlebars'),     // handlebars view engine
    request = require('supertest'),             // HTTP assertions made easy via superagent
    nock = require('nock'),                     // HTTP mocking library, allows us to intercept http requests and return canned responses
    cheerio = require('cheerio'),               // used to convert raw html into jQuery style object to we can use css selectors
    iframeReplacement = require('../index.js'), // Our express middleware under test
    app = null,                                 // global placeholder for our express instance (reset before each test)
    sourceUrl = 'http://intercepted.com';       // fake source url which we'll intercept using nock

describe('intergration-tests', function () {

    // before each test, setup an new enviroment
    beforeEach(function() {

        // create new express instance
        app = express();

        // setup default view engine
        app.set('views', path.resolve(__dirname, 'views'));
        app.engine('hbs', exphbs());
        app.set('view engine', 'hbs');

        // add our middleware
        app.use(iframeReplacement);

        // tell nock to intercept requests for http://intercepted.com and return our external.html content
        nock(sourceUrl).get('/').replyWithFile(200, __dirname + '/data/external.html');
    });

    it('should have res.merge method', function (done) {

        // rexpress route
        app.get('/', function(req, res){

            // as our middleware was added in the beforeEach, the req.merge sould exist!
            expect(res.merge).toBeDefined();

            res.status(200).end();
        });
        
        // execute the request
        request(app).get('/').expect(200, done); 
    });

    it('should merge view with external html', function (done) {

        // express route
        app.get('/', function(req, res){

            // respond with merge request
            res.merge('test-view', { 
                // source url will be intercepted using nock (above)
                sourceUrl: sourceUrl,
                // element where we want to inject our view content
                sourcePlaceholder: 'main'
            });
        });
        
        // execute the request
        request(app).get('/').expect(200).end(function(err, res) {

            // convert response into jquery object for testing
            var $ = cheerio.load(res.text);

            // check the title was modified
            expect($('main h1').text()).toEqual('Hello World');

            done();
        });
    });

    it('should inject base tag', function (done) {

        // express route
        app.get('/', function(req, res){

            // respond with merge request
            res.merge('test-view', { 
                // source url will be intercepted using nock (above)
                sourceUrl: sourceUrl
            });
        });
        
        // execute the request
        request(app).get('/').expect(200).end(function(err, res) {

            // convert response into jquery object for testing
            var $ = cheerio.load(res.text);

            // check the base tag exists within the header and contains matching url
            expect($('head base').attr("href")).toEqual(sourceUrl);

            done();
        });
    });

    it('should call transform if present', function (done) {

        var modifiedPageTitle = 'Title was modified';

        var transformer = function($, model){
            // check the title matches that in our external.html file
            expect($('title').text()).toEqual('Mock External HTML');

            // modify the page title
            $('title').text(modifiedPageTitle);
        };

        // express route
        app.get('/', function(req, res){

            // respond with merge request
            res.merge('test-view', { 
                // source url will be intercepted using nock (above)
                sourceUrl: sourceUrl,
                // function we want to be called with the source html as a jquery object
                transform: transformer
            });
        });
        
        // execute the request
        request(app).get('/').expect(200).end(function(err, res) {

            // convert response into jquery object for testing
            var $ = cheerio.load(res.text);

            // check the title was modified
            expect($('title').text()).toEqual(modifiedPageTitle);

            done();
        });
    });

});