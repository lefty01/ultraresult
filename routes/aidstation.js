var express = require('express');
var router = express.Router();
var assert = require('assert');


/*
 *
 */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('aidstations');

    //res.render('index', { title: 'List of Aidstations' });

    collection.find( {}, {}, function(err, docs) {
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
router.get('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('aidstations');
    var aidstationId = req.params.id.toUpperCase();
    var match = /^(VP|K)\d$/;
    var found = match.test(aidstationId);

    // validate aidstation id or name
    // right now allow VPn or Kn with n as single digit decimal number
    console.log("aidstation: " + aidstationId);
    console.log("valid name? " + found);
    if (! found) {
        // FIXME: 
        res.render('aid', { params : {
            title : 'aidstation not found',
            id    : aidstationId,
            type  : 'undef', totalDistance : 'undef', legDistance : 'undef'
        }});
        return;
    }

    collection.findOne({ name: aidstationId }, function(err, docs) {
        if (err === null) {
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
            res.json({msg: 'error: ' + err});
    	}
    });



//    res.render('index', { title: 'Express aidstation ' + req.params.id });
    
});


module.exports = router;
