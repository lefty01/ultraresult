const express = require('express');
const router = express.Router();
const assert = require('assert');
const bcrypt = require('bcryptjs');
const debug = require('debug')('ultraresult:auth');




router.post('/auth', (req, res, next) => {
    var db = req.db;
    var collection = db.get('users');
    var reUser = /^\w{2,32}$/;
    var rePass = /^.{4,32}$/;
    var user = '';
    var pass = '';
    var hash = '';

    if (reUser.test(req.body.username)) {
	user = req.body.username;
    }
    if (rePass.test(req.body.password)) {
	pass = req.body.password;
    }

    // lookup user
    collection.findOne({user: user}).then((doc) => {
	if (doc === null)
	    return res.sendStatus(401);

	//debug('compare pass: ' + pass + ' with hash: ' + doc.pass);
	if (bcrypt.compareSync(pass, doc.pass)) {
	    if ('admin' === doc.user) {
		req.session.isAdmin = true;
	    }
	    debug("OK ... authenticated!");
	    next();
	}
	else {
	    return res.sendStatus(401);
	}
    });

}, (req, res) => {
    req.session.loggedIn = true;

    if (true === req.session.isAdmin)
	debug('admin session:');
    debug(req.session);

    aid_url = req.session.aidurl || '/';
    debug("auth aid_url: " + aid_url);

    return res.redirect(aid_url);
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
	return res.send('already logged in!');
    }
    return res.render('login');
});


router.get('/logout',(req,res) => {
    req.session.destroy((err) => {});
    return res.redirect('/');
});



module.exports = router;
