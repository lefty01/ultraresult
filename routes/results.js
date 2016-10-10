var express = require('express');
var router = express.Router();
var assert = require('assert');

/*
 *
 */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist'); // FIXME once and forever change that name!

    res.render('index', { title: 'Live Results - Shows Aidstation Check In/Out times' });

    collection.find({}, {fields: { _id: 0,
                    startnum : 1,
                    firstname : 1,
                    lastname : 1,
                    aidstations : 1
                    }, sort : {startnum : 1}
        }, function(err, docs) {
            console.log(docs);
            //res.json(docs);
    });


});


module.exports = router;
