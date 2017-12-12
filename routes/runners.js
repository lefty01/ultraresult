var express = require('express');
var router = express.Router();

/* GET runner list */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('runnerlist');

    collection.find({}, {fields: { _id: 0,
                                   startnum : 1,
                                   firstname : 1,
                                   lastname : 1,
				   results: 1
                                 }, sort : {startnum : 1}
                        }, function(err, docs) {
                            console.log(docs);
                            res.json(docs);
    });
});


/*
 *
 */
router.put('/update/:num', function(req, res) {
    var db = req.db;
    var collection = db.get('runnerlist');

    var isIn = (req.body.inout === "tin") ? true : false;
    var startnum = req.params.num;
    var aidName = req.body.aid;
    var timeValid = req.body.time_valid;
    var time = req.body.time;

    console.log("Update runner: startnum=" + startnum);
    console.log("aid name:   " + aidName);
    console.log("inout:      " + req.body.inout);
    console.log("time:       " + time);
    console.log("time valid: " + timeValid);

    // var keyInTimeVld = "results." + aidName + ".intime_valid";
    // var keyInTime    = "results." + aidName + ".intime";
    // var key = {
    // 	[ keyInTimeVld ] : timeValid,
    // };

    
    var aidData = {};
    if (isIn) {
	aidData = {
    	    [ "results." + aidName + ".intime_valid" ] : timeValid,
	    [ "results." + aidName + ".intime" ] : time
	};
    } else {
    	aidData = {
    	    [ "results." + aidName + ".outtime_valid" ] : timeValid,
	    [ "results." + aidName + ".outtime" ] : time
	}
    }

    collection.update({ 'startnum' : startnum },
		      { $set : aidData },
		      function(err, cnt, stat) {
     			  res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
     			  console.log("update  count=" + cnt);
     			  console.log("update status=" + stat);
    });

    
});

module.exports = router;
