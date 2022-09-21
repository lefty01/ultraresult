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
const debug_app = require('debug')('ultraresult:app');
const fs = require('fs');
const version = require('project-version');
const nconf = require('nconf');
//const compression = require('compression');
//var passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');
const app = express();

nconf.file('ultraresult.conf');

const database_name       = nconf.get('database:name');
const database_host       = nconf.get('database:host');
const database_port       = nconf.get('database:port');
const database_sslcafile  = nconf.get('database:sslcafile');
const database_sslkeyfile = nconf.get('database:sslkeyfile');
const database_authdb     = nconf.get('database:authdb');
const database_username   = nconf.get('database:username');
const database_password   = nconf.get('database:password');

const aid_username = nconf.get('aidauth:username');
const aid_password = nconf.get('aidauth:password');

const session_secret = nconf.get('aidauth:session_secret');
const session_key    = nconf.get('aidauth:session_key');
const salt           = nconf.get('aidauth:salt');

const conf_trackinglinks = nconf.get('trackinglinks');
const conf_aidlinks      = nconf.get('aidlinks');

app.set('aid_secret', process.env.UR_SESSION_SECRET || session_secret);
app.set('aid_key', process.env.UR_SESSION_KEY || session_key);
app.set('salty', process.env.UR_SALT || salt);

const db_conn_uri = 'mongodb://' + database_host + ':' + database_port + '/' + database_name +
      '?tls=true&tlsCAFile=' + database_sslcafile + '&tlsCertificateKeyFile=' +
      database_sslkeyfile + '&username=' + database_username + '&password=' +
      encodeURIComponent(database_password) + '&authenticationDatabase=' + database_authdb;

debug_app('database uri:   ' + db_conn_uri);
debug_app('session secret: ' + app.get('aid_secret') + ', key: ' + app.get('aid_key'));
debug_app('name + version: ' + process.env.npm_package_name, process.env.npm_package_version);
debug_app('config: show tracking links:   ' + conf_trackinglinks);
debug_app('config: show aidstation links: ' + conf_aidlinks);

var progname = (typeof process.env.npm_package_name !== 'undefined') ? process.env.npm_package_name    : "ultraresult";
var progver  = (typeof process.env.npm_package_name !== 'undefined') ? process.env.npm_package_version : version;

const db = monk(db_conn_uri, function(err, db){
    if (err) {
	console.error("error: not connected to database:", err.message);
    } else {
	console.log("connected to database");
    }
});


// route files being used
const appver     = require('./routes/index');
const auth       = require('./routes/auth');
const runners    = require('./routes/runners');
const starters   = require('./routes/starters');
const aidstation = require('./routes/aidstation');
const results    = require('./routes/results');
const tracking   = require('./routes/tracking');



app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
// 	"script-src-attr": ["'self'", "'unsafe-inline'"]
//     },
//   })
// );

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

app.use(session({
    key: app.get('aid_key'),
    secret: app.get('aid_secret'),
    resave: false,
    saveUninitialized: false,
    name: 'ultra_result_session',
    cookie: {
	maxAge: 172800000, // 48h
	sameSite: 'strict'
    }
}));


// app.use(compression());  // compress all routes

app.use(express.static(path.join(__dirname, 'public')));

// make db, config, and progver accessible to router
app.use(function(req, res, next) {
    req.db                 = db;
    req.conf_trackinglinks = conf_trackinglinks;
    req.conf_aidlinks      = conf_aidlinks;
    req.progver            = progname + " " + progver;
    next();
});

app.use('/',         auth);

app.use('/',         results);
app.use('/version',  appver);
app.use('/runners',  runners); // update runner results (aid in/out times)
app.use('/starters', starters);
app.use('/aid',      aidstation);
app.use('/results',  results);
app.use('/tracking', tracking);




// catch 404 and forwarding to error handler
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
