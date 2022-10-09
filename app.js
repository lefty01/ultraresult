// Copyright (C) 2016-2022 Andreas Loeffler (https://exitzero.de)

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
const pdfkit = require('pdfkit');
const version = require('project-version');
const nconf = require('nconf');
//const compression = require('compression');
//var passport = require('passport');
const Strategy = require('passport-local').Strategy;
const express_session = require('express-session');
const MongoStore = require('connect-mongo');
//const FileStore = require('session-file-store')(express_session);

const app = express();


const config_file = process.env.CONFIG_FILE || 'ultraresult.conf';
if (! fs.existsSync(config_file)) {
    throw new Error('config file not available!');
}
else {
    debug_app('opening config file: ' + config_file);
    nconf.file(config_file);
}

const database_name       = nconf.get('database:name');
const database_host       = nconf.get('database:host');
const database_port       = nconf.get('database:port');
const database_sslcafile  = nconf.get('database:sslcafile');
const database_sslkeyfile = nconf.get('database:sslkeyfile');
const database_authdb     = nconf.get('database:authdb');
const database_username   = nconf.get('database:username');
const database_password   = nconf.get('database:password');

const session_secret      = nconf.get('aidauth:session_secret');
const session_key         = nconf.get('aidauth:session_key');
const salt                = nconf.get('aidauth:salt');
const cookiesession_key1  = nconf.get('csrf:session_key1');
const cookiesession_key2  = nconf.get('csrf:session_key2');
const cookieparser_key    = nconf.get('csrf:parser_key');
const csrf_token_key      = nconf.get('csrf:token_key');

const conf_trackinglinks = nconf.get('trackinglinks');
const conf_aidlinks      = nconf.get('aidlinks');
const conf_certlinks     = nconf.get('certlinks');

app.set('aid_secret',         process.env.UR_SESSION_SECRET     || session_secret);
app.set('aid_key',            process.env.UR_SESSION_KEY        || session_key);
app.set('salty',              process.env.UR_SALT               || salt);
app.set('cookieSession_key1', process.env.UR_COOKIESESSION_KEY1 || cookiesession_key1);
app.set('cookieSession_key2', process.env.UR_COOKIESESSION_KEY1 || cookiesession_key1);
app.set('cookieParser_key'  , process.env.UR_COOKIEPARSER_KEY   || cookieparser_key);
app.set('csrf_token_key'    , process.env.UR_CSRF_TOKEN_KEY     || csrf_token_key);

const monk_db_uri = 'mongodb://' + database_host + ':' + database_port + '/' + database_name +
      '?tls=true&tlsCAFile=' + database_sslcafile + '&tlsCertificateKeyFile=' +
      database_sslkeyfile + '&username=' + database_username + '&password=' +
      encodeURIComponent(database_password) + '&authenticationDatabase=' + database_authdb;

const mongo_uri = 'mongodb://' + database_username + ":" + database_password + "@" + database_host + ':' + database_port + '/' +
      '?authSource=' + database_authdb + '&tls=true&tlsCAFile=' + database_sslcafile + '&tlsCertificateKeyFile=' + database_sslkeyfile;

const progname = process.env.npm_package_name    || "ultraresult";
const progver  = process.env.npm_package_version || version;

debug_app('monk  database uri:   ' + monk_db_uri);
debug_app('mongo database uri:   ' + mongo_uri);
debug_app('session secret: ' + app.get('aid_secret') + ', key: ' + app.get('aid_key'));
debug_app('name + version: ' + progname, progver);
debug_app('config: show tracking links:    ' + conf_trackinglinks);
debug_app('config: show aidstation links:  ' + conf_aidlinks);
debug_app('config: show certificate links: ' + conf_certlinks);


const db = monk(monk_db_uri, function(err, db) {
    if (err) {
	console.error("error: not connected to database:", err.message);
    } else {
	debug_app("connected to database");
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
const urkunde    = require('./routes/urkunde');

const allowedOrigins = ['https://localhost:2022', 'https://sut100.de'];

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
// ??? do we need this with sesstion store
//app.use(cookieParser(app.get('cookieParser_key')));
// app.use(cookieSession({
//   keys: [
//     app.get('cookieSession_key1'),
//     app.get('cookieSession_key2')
//   ]
// }));


app.use(express_session({
    key: app.get('aid_key'),
    secret: app.get('aid_secret'),
    resave: false,
    saveUninitialized: false,
    name: 'ultra_result_session',

    cookie: {
      maxAge: 172800000, // 48h
      secure: true,
      httpOnly: true,
      sameSite: 'strict'
    },

    store: MongoStore.create({
        mongoUrl: mongo_uri,
        ttl: 172800000, // 48
        dbName: database_name,
        collection: "sessions"
    })
}));

// somehow not working: ReferenceError: CSRFValidator is not defined ... still investigating why
// CSRFValidator.instance(
//         {
//           tokenSecretKey: 'A secret key for encrypting csrf token',
//           ignoredMethods: [],
//           ignoredRoutes: ['/login'],
//           entryPointRoutes: ['/login'],
//           cookieKey: 'Optional - Custom csrf cookie key',
//           cookieSecretKey: 'Cookie secret key for cookie-parser',
//           cookieSessionKeys: [
//             'First session key for cookie-session',
//             'Second session key for cookie-session'
//           ]
//         }
// ).configureApp(app);

// app.use(CSRFValidator.instance({
//   tokenSecretKey: app.get('csrf_token_key'), // 'A secret key for encrypting csrf token'
//   ignoredMethods: [],
//   ignoredRoutes: ['/login'],
//   entryPointRoutes: ['/login'],
//   cookieKey: 'ultraresult cookie key'
// }).configure());

// app.use(function(req, res, next) {
//   const origin = req.headers['origin'];
//   console.log('origin: ', origin)
// //  if (allowedOrigins.includes(origin)) {
//   next();
// });

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
app.use('/urkunde',  urkunde);



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
