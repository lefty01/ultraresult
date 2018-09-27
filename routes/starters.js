var express = require('express');
var router = express.Router();


/* GET starter list */
router.get('/', function(req, res) {
    res.render('starterlist', { title: 'Teilnehmerliste' });
});

module.exports = router;
