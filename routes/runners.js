var express = require('express');
var router = express.Router();

/* GET runner list */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('runnerlist');
    //collection.find({}, {sort: {datefield: 1}}).toArray(function(err, docs) {...});


    // collection.find().sort({ a: -1 }).toArray(function (err2, items2) {
    //     if (err2) console.log(err2);
    //     console.log(items2);
    //     db.close();
    // });

    collection.find({}, {fields: { _id: 0,
                                   startnum : 1,
                                   firstname : 1,
                                   lastname : 1
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
    //var collection = db.get('results');
    var runnerToUpdate = req.params.num;

    console.log("Update runner: startnum=" + runnerToUpdate);

//    var confirmation = confirm('Are you sure you want to save changes for this runner?');
    var aidName = req.body.aid;
    var isIn = (req.body.inout === "tin") ? true : false;


    // collection.find( { 'startnum' : runnerToUpdate, "aidstations.name" : aidName},
    // 		     { fields: { _id: 0,
    //                              startnum : 1,
    //                              aidstations : 1
    //                            }
    //                  }, function(err, docs) {
    //                      console.log(docs);
    //                      res.json(docs);
    // });

    

    if (isIn) {
	collection.updateOne({ 'startnum' : runnerToUpdate, "aidstations.name" : aidName},
			     { $set : {
				 "aidstations.$.intime_valid" : req.body.intime_valid,
				 "aidstations.$.intime" : req.body.intime 
	                     }},

     			     function(err, cnt, stat){
     				 res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
     				 console.log("update  count=" + cnt);
     				 console.log("update status=" + stat);
	     });
    }
    else {
	collection.updateOne({ 'startnum' : runnerToUpdate, "aidstations.name" : aidName},
			     { $set : {
				 "aidstations.$.outtime_valid" : req.body.outtime,
				 "aidstations.$.outtime" : req.body.outtime 
	                     }},

     			     function(err, cnt, stat){
     				 res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
     				 console.log("update  count=" + cnt);
     				 console.log("update status=" + stat);
	     });
    }
    
});

module.exports = router;
