var express = require('express');
var router = express.Router();
var assert = require('assert');


/*
 * GET entry page for specific aidstation by their number.
 */
router.get('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');

    console.log("aidstation id: " + req.params.id);
    // collection.findOne({_id: req.params.id}, function(err, docs) {
    // 	if (err === null) {
    // 	    res.json(docs);
    // 	}
    //     else {
    // 	    res.json({msg: 'error: ' + err});
    // 	}
    // });

    res.render('index', { title: 'Express aidstation ' + req.params.id });
    
});


module.exports = router;
