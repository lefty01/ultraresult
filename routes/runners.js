var express = require('express');
var router = express.Router();

/* GET runner list */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
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
    var collection = db.get('userlist');
    var runnerToUpdate = req.params.num;

    console.log("Update runner: startnum=" + runnerToUpdate);

    var confirmation = confirm('Are you sure you want to save changes for this runner?');
    

    collection.update({ startnum: runnerToUpdate}, req.body, function(err, cnt, stat){
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
        console.log("update  count=" + cnt);
        console.log("update status=" + stat);
    });
    
});

module.exports = router;
