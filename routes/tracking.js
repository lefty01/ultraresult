var express = require('express');
var router = express.Router();

function isValidUrl(url) {
    var valid = /^(http|https):\/\/[^ "]+$/.test(url);
    if (! valid) {
	return false;
    }
    return true;
}

function isValidName(name) {
    var valid = /^[\w _-]{2,32}$/.test(name);
    if (! valid) {
	return false;
    }
    return true;
}


router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('trackinglinks');

    collection.find({}, {projections: { _id: 0,
					name : 1,
					url : 1,
                                      }, sort : {name : 1}
                        }, function(err, docs) {
                            console.log(docs);
                            res.json(docs);
    });
});

router.get('/add', function(req, res) {
    if (! req.session.loggedIn) {
	req.session.aidurl = '/tracking/add';
	res.redirect('/login');
	return;
    }
    res.render('post-tracking-link');
});

router.post('/add', function(req, res) {
    console.log("add tracking link, url:  " + req.body.url);
    console.log("add tracking link, name: " + req.body.name);

    
    if (! req.session.loggedIn) {
	req.session.aidurl = '/tracking/add';
	res.redirect('/login');
	return;
    }

    if (! isValidName(req.body.name)) {
	res.render('post-tracking-link', { msg: 'invalid name' });
	return;
    }

    if (! isValidUrl(req.body.url)) {
	res.render('post-tracking-link', { msg: 'invalid url' });
	return;
    }

    var db = req.db;
    var collection = db.get('trackinglinks');

    var data = {
	'name': req.body.name,
	'url':  req.body.url
    };

    collection.update({'name': req.body.name},
		      { $set:  data },
		      { replaceOne: true, upsert: true},
		      function(err, cnt, stat) {
			  console.log('update:  ' + JSON.stringify(cnt));
			  
			  if (err === null) {
 			      res.redirect('/');
			      return;
			  }
			  console.log('collection update error: ' + err);
			  res.render('post-tracking-link', { msg: 'db error' });
    });
});


module.exports = router;
