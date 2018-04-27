var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var assert = require('assert');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var session = require('express-session');

//var db = monk('localhost:9999/sutrunners1');
//var database_name = "sutrunners_demo";
var database_name = "ultraresult_test";
// sutrunners_wsut_2017

var db = monk('localhost:27017/' + database_name, function(err, db) {
    if (err) {
	console.error("error: not connected to database:", err.message);
    } else {
	console.log("connected to database");
    }
});

var routes = require('./routes/index');
var runners = require('./routes/runners');
var aidstation = require('./routes/aidstation');
var results = require('./routes/results');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    next();
});

app.use('/', routes);

app.use('/runners', runners); // update runner results (aid in/out times)
app.use('/aid',     aidstation);
app.use('/results', results);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
