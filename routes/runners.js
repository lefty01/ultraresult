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
function isValidDate(time) {
    var reTime = /^\d\d\d\d-\d\d-\d\d$/;
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
function isValidJsonTime(time) {
    // 2018-10-04T20:27:10.106Z
    console.list("isValidJsonTime: " + time);

    var reTime = /^\d{4,4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ$/;
    if (! reTime.test(time)) {
	return false;
    }
    return true;
}
function isValidTimeObj(time) {
    //return Object.prototype.toString.call(time) === '[object Date]'
    return time instanceof Date;
}

function isValidRank(rank) {
    var reRank = /^\d{1,4}$/;
    if (! reRank.test(rank)) {
	return false;
    }
    return true;
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
				   startnum : 1,
                                   duvid : 1,
                                   firstname : 1,
                                   lastname : 1,
                                   nationality : 1,
                                   residence : 1,
                                   club : 1,
                                   catger : 1
                                 }, sort : {startnum : 1}
                        }, function(err, docs) {
                            console.log(docs);
                            res.json(docs);
    });
});

/*
 * set rank/finish time
 * 'rank_cat'
 * 'rank_all'
 * 'finish_time'
 */
router.put('/update/rank/:num', function(req, res) {
    if (! req.session.loggedIn) {
	res.sendStatus(418);
	return;
    }

    var db = req.db;
    var collection = db.get('runnerlist');

    var startnum   = isValidNum(req.params.num) ? parseInt(req.params.num) : "INVALID";
    // res.send('invalid input') // FIXME parseInt -> store startnum as in not string

    var rankCat    = isValidRank(req.body.rankcat) ? req.body.rankcat : "INVALID";
    var rankAll    = isValidRank(req.body.rankall) ? req.body.rankall : "INVALID";
    var finishTime = isValidTime(req.body.finishtime) ? req.body.time : "INVALID";

    console.log("runner: " + startnum + ", finish_time: " + finishTime +
		", rank_all: " + rankAll + ", rank_cat: " + rankCat);

    var resultData = { 'rank_all': rankAll, 'rank_cat': rankCat, 'finish_time': finishTime };
    //var resultData = { 'rank_all': 1, 'rank_cat': 1, 'finish_time': "99:99" };

    collection.updateOne({ 'startnum' : startnum },
			 { $set : resultDate },
			 function(err, cnt, stat) {
			     res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
			     console.log("update  count=" + cnt.nModified);
			     console.log("update status=" + stat);
			 });
});

/*
 * update in/out time
 */
router.put('/update/:num', function(req, res) {
    if (! req.session.loggedIn) {
	res.sendStatus(418);
	return;
    }

    var db = req.db;
    var collection = db.get('runnerlist');

    //console.log("time valid: " + req.body.time_valid); -> prints true!

    var isIn      = (req.body.inout === "tin") ? true : false;
    var timeValid = (req.body.time_valid === 'true') ? true : false; // -> false !?
    var startnum  = isValidNum(req.params.num) ? parseInt(req.params.num) : "INVALID";
    // res.sed('invalid input')  // FIXME parseInt -> store startnum as in not string
    // we get startnum via param and req.body.startnum -> can use as sanity check

    var aidName   = isValidAid(req.body.aid)   ? req.body.aid   : "INVALID";
    var time      = isValidTime(req.body.time) ? req.body.time  : "INVALID";
    //var datetime  = isValidJsonTime(req.body.datetime) ? req.body.datetime  : "INVALID";
    var date      = isValidDate(req.body.date) ? req.body.date  : "INVALID";

    console.log("Update runner: startnum=" + startnum);
    console.log("typeof startnum: " + (typeof startnum));
    console.log("aid name:   " + aidName);
    console.log("isIn:       " + isIn);
    console.log("date:       " + date);
    console.log("time:       " + time);
    console.log("time valid: " + timeValid);


    var aidData = {};
    if (isIn) {
	aidData = {
    	    [ "results." + aidName + ".intime_valid" ] : timeValid,
	    [ "results." + aidName + ".intime" ] : time,
	    [ "results." + aidName + ".indate" ] : date
	};
    } else {
    	aidData = {
    	    [ "results." + aidName + ".outtime_valid" ] : timeValid,
	    [ "results." + aidName + ".outtime" ] : time,
	    [ "results." + aidName + ".outdate" ] : date
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


/*
 * reset all in/out times
 */
router.put('/resetresult/:num', function(req, res) {
    if (! (req.session.loggedIn && req.session.isAdmin)) {
	res.sendStatus(418);
	return;
    }

    var db = req.db;
    var collection = db.get('runnerlist');
    var startnum  = isValidNum(req.params.num) ? parseInt(req.params.num) : "INVALID";
    console.log("reset all results for runner with startnum=" + startnum);

    collection.update({ 'startnum' : startnum },
		      { $unset: {results: 1}}, //false, true,
		      function(err, cnt, stat) {
			  console.log("update  count=" + cnt.nModified);
			  console.log("update status=" + stat);
			  res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
			  return;
    });
});

/*
 * set runner status to DNF
 */
router.put('/setdnf/:num', function(req, res) {
    if (! (req.session.loggedIn && req.session.isAdmin)) {
	res.sendStatus(418);
	return;
    }

    var db = req.db;
    var collection = db.get('runnerlist');
    var startnum  = isValidNum(req.params.num) ? parseInt(req.params.num) : "INVALID";
    console.log("set DNF status for runner with startnum=" + startnum);
    // FIXME
    // collection.update({ 'startnum' : startnum },
    // 		      { $unset: {results: 1}}, //false, true,
    // 		      function(err, cnt, stat) {
    // 			  console.log("update  count=" + cnt.nModified);
    // 			  console.log("update status=" + stat);
    // 			  res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
    // 			  return;
    // });
    res.send({ msg: 'NOT IMPLEMENTED YET!' });
    return;
});


module.exports = router;
