const express = require('express');
const router = express.Router();
const debug  = require('debug')('ultraresult:urkunde');



router.get('/:id', function(req, res) {
  var db = req.db;
  var runnerlist = db.get('runnerlist');
  var startnum   = req.params.id.toUpperCase();
  var match_num  = /^(\d\d?)$/;
  var found_num  = match_num.test(startnum);

  if (! found_num) {
    return res.sendStatus(400);
  }

  debug("runner: " + startnum);

  // var collection = db.get('runnerlist');
  // collection.findOne({ "startnum" : parseInt(startnum) }, function(err, docs) {
  // //   if (err === null && docs !== null) {
  // //     debug("findOne:");
  // });


  //   else {
  //     debug("nothing ...")
  //     return res.sendStatus(400);
  //   }
  // });
  
  runnerlist.findOne({'startnum': parseInt(startnum)},
    		     'firstname lastname catger rank_cat rank_all finish_time').then((doc) => {
		      // all the fields except the name projection will be selected
		      debug(doc);
		      res.json(doc);
		      return;

		    });

});




// $firstname = utf8_decode($runner['firstname']);
// $lastname  = utf8_decode($runner['lastname']);


// $pdf->SetFont('Arial', '', 32);
// $pdf->SetXY(83, 102);
// $pdf->Write(0, "{$runner['rank_cat']}. {$runner['catger']}");

// $pdf->SetFont('Arial', '', 40);
// $pdf->SetXY(35, 214);
// $pdf->Write(0, "{$firstname} {$lastname}");

// $pdf->SetXY(105, 232);
// $pdf->Write(0, "{$runner['finish_time']}");


module.exports = router;
