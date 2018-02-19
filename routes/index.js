var express = require('express');
var router = express.Router();

/* GET home page. */
// select database
// what about authentication ...
router.get('/', function(req, res) {
  res.render('index', { title: 'Aidstations' });
});

module.exports = router;
