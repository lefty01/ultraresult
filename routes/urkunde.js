const express = require('express');
const router = express.Router();
const debug  = require('debug')('ultraresult:urkunde');
const fs = require('fs');
const pdfkit = require('pdfkit');
const blobStream = require('blob-stream');

const doc = new pdfkit({size: 'A4'})
const stream = doc.pipe(blobStream());

const dateY = 550
let name;
let time;
let rank;


router.get('/:id', function(req, res) {
  var db = req.db;
  var runnerlist = db.get('runnerlist');
  var startnum   = req.params.id.toUpperCase();
  var match_num  = /^(\d\d?)$/;
  var found_num  = match_num.test(startnum);
  
  if (! found_num) {
    return res.sendStatus(400);
  }

  //res.contentType("application/pdf");
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
		       
// "firstname":"Andreas","lastname":"Löffler","catger":"M45","finish_time":"20:06","rank_all":"2
		       if (null !== doc) {
			 name = doc.firstname + ' ' + doc.lastname;
			 time = doc.finish_time;
			 rank = doc.rank_all + '. Platz';
		       }
		       return;
		     }).then(() => {
		       //res.send(name + ", " + time + ", " + rank);
		       var filename = "urkunde_" + startnum + ".pdf";
		       debug("filename: " + filename);

		       res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
		       res.setHeader('Content-type', 'application/pdf');

		       doc.fontSize(72).text('URKUNDE', 100, 50, { align: 'center'});
		       doc.image('6_sut100_2022_laam_logo.jpg', {
			 cover: [395, 395],
			 align: 'center',
		       });
		       doc.fontSize(28).text("21. - 23. Oktober 2022", 100, dateY, { align: 'center'})
		       doc.fontSize(32).text(name, 100, dateY + 60, {align: 'center'})
		       doc.fontSize(8).moveDown();
		       doc.fontSize(32).text(time, {align: 'center'});
		       doc.fontSize(8).moveDown();
		       doc.fontSize(32).text(rank, {align: 'center'});
		       
		       doc.pipe(res);
		       doc.end();

		       //doc.pipe(fs.createWriteStream("public/" + filename));
		       //res.download(filename);
		       return;
		     });
});

module.exports = router;
