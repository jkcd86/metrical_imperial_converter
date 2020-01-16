'use strict';

var cors = require('cors');
var fs = require('fs');
var runner = require('../test-runner');

module.exports = function (app) {
    app.route('/_api/server.js')
    .get(function(req, res, next) {
        console.log('requested');
        fs.readFile(__dirname + '/server.js', function(err, data) {
            if(err) return next(err);
            res.send(data.toString());
        });
    });

    app.route('/_api/routes/api,js')
    .get(function(req, res, next) {
        console.log('requested');
        fs.readFile(__dirname + '/routes/api.js', function(err, data) {
            if(err) return next(err);
            res.type('txt').send(data.toString());
        });
    });

    app.route('/_api/controllers/convertHandler.js')
    .get(function(req, res, next) {
        console.log('requested');
        console.log('requested');
        fs.readFile(__dirname + '/controllers/convertHandler.js', function (err, data) {
            if (err) return next(err);
            res.type('txt').send(data.toString());
        });
    });

    var error;
    app.get('/_api/get-tests', cors(), function (req, res, next) {
        console.log(error);
        if (!error && process.env.NODE_ENV === 'test') return next();
        res.json({ status: 'unavailable' });
    },
        function (req, res, next) {
            if (!runner.report) return next();
            res.json(testFilter(runner.report, req.query.type, req.query.n));
        },
        function (req, res) {
            runner.on('done', function (report) {
                process.nextTick(() => res.json(testFilter(runner.report, req.query.type, req.query.n)));
            });
        });
    app.get('/_api/app-info', function (req, res) {
        var hs = Object.keys(res._headers)
            .filter(h => !h.match(/^access-control-\w+/));
        var hObj = {};
        hs.forEach(h => { hObj[h] = res._headers[h] });
        delete res._headers['strict-transport-security'];
        res.json({ headers: hObj });
    });

};

function testFilter(tests, type, n) {
    var out;
    switch (type) {
        case 'unit':
            out = tests.filter(t => t.context.match('Unit Tests'));
            break;
        case 'functional':
            out = tests.filter(t => t.context.match('Functional Tests') && !t.title.match('#example'));
            break;
        default:
            out = tests;
    }
    if (n !== undefined) {
        return out[n] || out;
    }
    return out;
}