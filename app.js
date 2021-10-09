const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongo = require('mongodb');
const monk = require('monk');
const assert = require('assert');

const fs = require('fs');
const nconf = require('nconf');

//var passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');

nconf.file('ultraresult.conf');

const database_name       = nconf.get('database:name');
const database_host       = nconf.get('database:host');
const database_port       = nconf.get('database:port');
const database_sslcafile  = nconf.get('database:sslcafile');
const database_sslkeyfile = nconf.get('database:sslkeyfile');
const database_authdb     = nconf.get('database:authdb');
const database_username   = nconf.get('database:username');
const database_password   = nconf.get('database:password');

const db_conn_uri = 'mongodb://' + database_host + ':' + database_port + '/' + database_name
      + '?tls=true&tlsCAFile=' + database_sslcafile + '&tlsCertificateKeyFile='
      + database_sslkeyfile + '&username=' + database_username + '&password='
      + database_password + '&authenticationDatabase=' + database_authdb;

console.log('database uri:  ' + db_conn_uri);

console.log(process.env.npm_package_name, process.env.npm_package_version);
var progname = (typeof process.env.npm_package_name !== 'undefined') ? process.env.npm_package_name : "";
var progver  = (typeof process.env.npm_package_name !== 'undefined') ? process.env.npm_package_version : "";

const db = monk(db_conn_uri, function(err, db){
    if (err) {
	console.error("error: not connected to database:", err.message);
    } else {
	console.log("connected to database");
    }
});

var routes     = require('./routes/index');
var runners    = require('./routes/runners');
var starters   = require('./routes/starters');
var aidstation = require('./routes/aidstation');
var results    = require('./routes/results');


const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db and progver accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    req.progver = progname + " " + progver;
    next();
});

app.use('/', results);
app.use('/runners',  runners); // update runner results (aid in/out times)
app.use('/starters', starters);
app.use('/aid',      aidstation);
app.use('/results',  results);

//console.log('env: ' + app.get('env'));

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
