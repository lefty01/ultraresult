var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Ultra-Result 2.0 (c) 2017 andreas loeffler' });
});

module.exports = router;
