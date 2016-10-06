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


module.exports = router;
