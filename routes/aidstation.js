var express = require('express');
var router = express.Router();
var assert = require('assert');
const debug = require('debug')('ultraresult:aid');

/*
 *
 */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('aidstations');

    //res.render('index', { title: 'List of Aidstations' });
    // FIXME filter only adistation and checkpoints (in case we have other stuff in this collection)
    //collection.find({}, {}).sort({'totalDistance': 1}).exec(function(err, docs) { -> not working
    collection.find( {}, { 'sort' : ['totalDistance', 'asc']}, function(err, docs) {
        console.log("find in collection ...");
        if (err === null) {
     	    res.json(docs);
            //res.render('aid', { title: 'Aidstation: ' + docs.directions });
    	}
        else {
            res.json({msg: 'error: ' + err});
    	}

        console.log(docs);
        //res.json(docs);
    });

});
           
/*
 * GET entry page for specific aidstation by their (short) name.
 * note: directions field hold long descriptive name (P Rittweg)
 *       name field is the short id (vp1,k1,...)
 */
// @auth-session establish / login page if no session
router.get('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('aidstations');
    var aidstationId = req.params.id.toUpperCase();
    var match_num = /^(\d\d?)$/;
    var match_aid = /^(((VP)\d\d?)|START|FINISH|DNF)$/;
    var found_num = match_num.test(aidstationId);

    // if only one or two digit then prepend 'VP'
    if (found_num) {
	aidstationId = 'VP' + aidstationId;
    }

    var found_aid = match_aid.test(aidstationId);

    if (found_aid) {
	req.session.aidurl = '/aid/' + aidstationId;
    }

    console.log("aidstation: " + aidstationId);
    console.log("valid name? " + found_aid);
    console.log(req.session);

    if (! req.session.loggedIn) {
	res.redirect('/login');
	return;
    }

    if (! found_aid) {
        // FIXME: 
        res.render('aid', { params : {
            title : 'aidstation not found',
            id    : aidstationId,
            type  : 'undef', totalDistance : 'undef', legDistance : 'undef'
        }});
        return;
    }

    // DNF / reset results
    if (found_aid && aidstationId === 'DNF') {
	// TODO
        res.render('aid', { params : {
            title         : 'DNF / Reset Results',
            id            : 'DNF',
            type          : 'DNF',
            legDistance   : 'n/a',
            legVpDistance : '',
            totalDistance : 'n/a',
            loc : { lat : '', lng : '' }
        }});
	return;
    }

    collection.findOne({ name: aidstationId }, function(err, docs) {
        if (err === null && docs !== null) {
     	    //res.json(docs);
            console.log(docs);

            var numCheckpoints = 0;
            
            if (docs.checkpoints) {
                numCheckpoints = docs.checkpoints.length;
                console.log(docs.name + " has " + numCheckpoints + " previous checkpoints: " + docs.checkpoints);
            }
            
            res.render('aid', { params : {
                title         : docs.name + ': ' + docs.directions,
                id            : docs.name,
                type          : docs.pointType,
                legDistance   : docs.legDistance,
                legVpDistance : docs.legVpDistance,
                totalDistance : docs.totalDistance,
                loc : { lat : docs.lat, lng : docs.lng }
            }});
    	}
        else {
            //res.json({msg: 'error: ' + err});
	    res.render('aid', { params : {
		title : 'aidstation not found',
		id    : aidstationId,
		type  : 'undef', totalDistance : 'undef', legDistance : 'undef'
            }});
            return;
    	}
    });

});


module.exports = router;
