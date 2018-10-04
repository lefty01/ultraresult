var express = require('express');
var router = express.Router();


function isValidNum(num) {
    var reNum = /^\d{1,4}$/;
    if (! reNum.test(num)) {
	return false;
    }
    return true;
}

function isValidAid(aid) {
    var reAid = /^(START|FINISH|VP\d\d?)+$/i;
    if (! reAid.test(aid)) {
	return false;
    }
    return true;
}

function isValidDateTime(time) {
    var reTime = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\+\d\d:\d\d$/;
    if (! reTime.test(time)) {
	return false;
    }
    return true;
}
function isValidTime(time) {
    var reTime = /^\d\d:\d\d$/;
    if (! reTime.test(time)) {
	return false;
    }
    return true;
}
function isValidTimeObj(time) {
    //return Object.prototype.toString.call(time) === '[object Date]'
    return time instanceof Date;
}



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
/* GET starter list */
router.get('/starterlist', function(req, res) {
    var db = req.db;
    var collection = db.get('runnerlist');

    collection.find({}, {fields: { _id: 0,
                                   duvid : 1,
                                   firstname : 1,
                                   lastname : 1,
                                   nationality : 1,
                                   residence : 1,
                                   club : 1,
                                   catger : 1
                                 }
                        }, function(err, docs) {
                            console.log(docs);
                            res.json(docs);
    });
});


/*
 * update in/out time
 */
router.put('/update/:num', function(req, res) {
    var db = req.db;
    var collection = db.get('runnerlist');

    //console.log("time valid: " + req.body.time_valid); -> prints true!

    var isIn      = (req.body.inout === "tin") ? true : false;
    var timeValid = (req.body.time_valid === 'true') ? true : false; // -> false !?
    var startnum  = isValidNum(req.params.num) ? req.params.num : "INVALID"; // res.sed('invalid input')
    var aidName   = isValidAid(req.body.aid)   ? req.body.aid   : "INVALID";
    var time      = isValidTimeObj(req.body.time) ? req.body.time.toJSON()  : "INVALID";

    console.log("Update runner: startnum=" + startnum);
    console.log("aid name:   " + aidName);
    console.log("isIn:       " + isIn);
    console.log("time:       " + time);
    console.log("time valid: " + timeValid);


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
	};
    }

    collection.update({ 'startnum' : startnum },
		      { $set : aidData },
		      function(err, cnt, stat) {
     			  res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
			  console.log("update  count=" + cnt.nModified);
			  console.log("update status=" + stat);
    });

});

module.exports = router;
