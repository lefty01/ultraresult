const express = require('express');
const router = express.Router();
const debug  = require('debug')('ultraresult:results');

/*
 *
 */
router.get('/', function(req, res) {
    var progver = req.progver;
    var db = req.db;
    var collection = db.get('aidstations');
    var vps = [];//['START'];

    debug("is admin: " + req.session.isAdmin);
    debug("finding aidstations ...");

    // compare with the code in routes/aidstation.js, in the get('/:id') route we also need
    // to get the aid names in order to pass it to the aid.pug template

    // collection.find({}, 'name').then((docs) => {
    //  console.log("docs: " + docs);
    //  if (docs !== null) {
    //      aid = docs;
    //  }
    // });
    // console.log(aid); // -> undefined! async call to mongo

    collection.find({name: {$regex: '^vp[0-9]{1,2}$',  $options: 'i'}}, {sort: {name: 1}}).each((aid, {close, pause, resume}) => {
        // aidstations are streaming here
        // call close() to stop the stream
        debug('aid.name: ' + aid.name);
        vps.push(aid.name);
    }).then(() => {
        // stream is over
        vps.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        vps.unshift('START');
        vps.push('FINISH');
        if (req.session.isAdmin)
            vps.push('DNF');

        debug('aid array: ' + vps);

        return res.render('results', {
            title: 'SUT 100 - Live Results', progver: progver, aid: vps
        });
    })

    //collection.find( {}, { 'sort' : ['totalDistance', 'asc']}, function(err, docs) {
    // ohh ok ... I used somw other way of sorting here earlier ;)
});


module.exports = router;
