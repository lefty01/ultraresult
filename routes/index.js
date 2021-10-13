var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',  (req, res) => {
  var progver = req.progver;
  res.render('index', { title: progver, progver: progver });
});

module.exports = router;
