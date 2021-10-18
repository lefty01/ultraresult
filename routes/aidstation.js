const express = require('express');
const router = express.Router();
const assert = require('assert');
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
            return res.json(docs);
        }
        else {
            debug(docs);
            return res.json({msg: 'error: ' + err});
        }
    });
});
           
/*
 * GET entry page for specific aidstation by their (short) name.
 * note: directions field hold long descriptive name (P Rittweg)
 *       name field is the short id (vp1,k1,...)
 */
// establish session / go to login page if not authenticated
router.get('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('aidstations');
    var aidstationId = req.params.id.toUpperCase();
    var match_num = /^(\d\d?)$/;
    var match_aid = /^(((VP)\d\d?)|START|FINISH|DNF)$/;
    var found_num = match_num.test(aidstationId);
    var vps = [];

    // if only one or two digit then prepend 'VP'
    if (found_num) {
	aidstationId = 'VP' + aidstationId;
    }

    var found_aid = match_aid.test(aidstationId);

    if (found_aid) {
	req.session.aidurl = '/aid/' + aidstationId;
    }

    debug("aidstation: " + aidstationId);
    debug("valid name? " + found_aid);
    debug(req.session);

    if (! req.session.loggedIn) {
	res.redirect('/login');
	return;
    }

    if (! found_aid) {
        // FIXME: 
        return res.render('aid', { params : {
            title : 'aidstation not found',
            id    : aidstationId,
            type  : 'undef', totalDistance : 'undef', legDistance : 'undef'
        }});
    }

    // DNF / reset results
    if (found_aid && req.session.isAdmin && aidstationId === 'DNF') {
        return res.render('aid', { params : {
            title         : 'DNF / Reset Results',
            id            : 'DNF',
            type          : 'DNF',
            legDistance   : 'n/a',
            legVpDistance : '',
            totalDistance : 'n/a',
            loc : { lat : '', lng : '' }
        }});
    }

    // get all aidstation names for aidstation links
    // const promise1 = find aidstation names ();
    // const promise2 = promise1.then(successCb, failCb);

    // collection.find({}, {projections: { _id: 0, name: 1 }, sort: ['totalDistance', 'asc']})
    // 	.then(function(result) {

    const ret = collection.find({}, {projections: { _id: 0, name: 1 }, sort: ['totalDistance', 'asc']});
    //if (ret) {
    ret.each((vp, {close, pause, resume})  => {
        debug('collection.find vp name: ' + vp.name);
        vps.push(vp.name);
    }).then(() => {
	// I think now we can get rid of one ".then()" level
	if (req.session.isAdmin)
	    vps.push('DNF');
    }).then(() => {
        debug('vps: ' + vps);

        collection.findOne({ name: aidstationId }, function(err, docs) {
            if (err === null && docs !== null) {
                debug("findOne name: " + aidstationId);
                debug(docs);
                debug('vps: ' + vps);

                var numCheckpoints = 0;
            
                if (docs.checkpoints) {
                    numCheckpoints = docs.checkpoints.length;
                    console.log(docs.name + " has " + numCheckpoints + " previous checkpoints: " + docs.checkpoints);
                }
            
                res.render('aid', { aid: vps, params : {
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
    }); // then(() => {... after ret.each.
});


module.exports = router;
