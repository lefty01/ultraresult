var express = require('express');
var router = express.Router();

/* GET runner list */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');

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


module.exports = router;
