var express = require('express');
var router = express.Router();
var assert = require('assert');

/*
 *
 */
router.get('/', function(req, res) {
    var progver = req.progver;
    //var collection = db.get('runnerlist');
    res.render('results', { title: 'SUT 100 - Live Results', progver: progver });

    // collection.find({}, {fields: { _id: 0,
    //                 startnum : 1,
    //                 firstname : 1,
    //                 lastname : 1,
    //                 results : 1
    //                 }, sort : {startnum : 1}
    //     }, function(err, docs) {
    //         console.log(docs);
    //         //res.json(docs);
    // });

});


module.exports = router;
