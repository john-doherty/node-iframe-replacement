'use strict';

var express = require('express'),
    request = require('supertest'),
    nock = require('nock'),
    iframeReplacement = require('../index.js');

var app = express(); // create the express app

app.use(iframeReplacement); // add middleware to test

describe('intergration-tests', function () {

    it('res.merge should exist', function (done) {

        // route with middleware
        app.get('/', function(req, res){
            expect(res.merge).toBeDefined();
            res.status(200).end();
        });
        
        // execute the request
        request(app).get('/').expect(200, done); 
    });
});