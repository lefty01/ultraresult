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
app.set('aid_secret', process.env.UR_SESSION_SECRET || session_secret);
app.set('aid_key', process.env.UR_SESSION_KEY || session_key);

const db_conn_uri = 'mongodb://' + database_host + ':' + database_port + '/' + database_name
      + '?tls=true&tlsCAFile=' + database_sslcafile + '&tlsCertificateKeyFile='
      + database_sslkeyfile + '&username=' + database_username + '&password='
      + database_password + '&authenticationDatabase=' + database_authdb;

console.log('database uri:   ' + db_conn_uri);
console.log('session secret: ' + app.get('aid_secret') + ', key: ' + app.get('aid_key'));
console.log('session user: ' + aid_username + ', pass: ' + aid_password);

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


const routes     = require('./routes/index');
const runners    = require('./routes/runners');
const starters   = require('./routes/starters');
const aidstation = require('./routes/aidstation');
const results    = require('./routes/results');
const tracking   = require('./routes/tracking');


app.use(express.static(path.join(__dirname, 'public')));

// Make our db and progver accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    req.progver = progname + " " + progver;
    next();
});

app.use('/',         results);
app.use('/version',  routes);
app.use('/runners',  runners); // update runner results (aid in/out times)
app.use('/starters', starters);
app.use('/aid',      aidstation);
app.use('/results',  results);
app.use('/tracking', tracking);



app.post('/auth', (req, res, next) => {
    if (req.body.username === aid_username &&
	req.body.password === aid_password) {
	//res.locals.username = req.body.username
	console.log("OK ... authenticated!");
	next();
    }
    else {
	res.sendStatus(401);
    }
}, (req, res) => {
    req.session.loggedIn = true;
    console.log(req.session);

    aid_url = req.session.aidurl || '/';
    console.log("auth aid_url: " + aid_url);

    res.redirect(aid_url); // next->original url request!?
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/logout',(req,res) => {
    req.session.destroy((err)=>{})
    res.send('good bye!')
});



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
