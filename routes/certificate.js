const express = require('express');
const router = express.Router();
const debug  = require('debug')('ultraresult:urkunde');
const fs = require('fs');
const certificate = require('../services/certificate-pdf.js');



router.get('/:id', function(req, res) {
  var db = req.db;
  var runnerlist = db.get('runnerlist');
  var startnum   = req.params.id.toUpperCase();
  var match_num  = /^(\d\d?)$/;
  var found_num  = match_num.test(startnum);
  var validData  = false;

  let name;
  let time;
  let rank;
  let cert_date;
  let cert_logo;

  if (! found_num) {
    return res.sendStatus(400);
  }
  if (! req.conf_certlinks) {
    return res.sendStatus(400);
  }
  cert_date = `${req.conf_cert_days} ${req.conf_cert_year}`;
  cert_logo = req.conf_cert_logo;

  debug("generate certificate for runner: " + startnum);
  debug("query database for runner stats...");
  debug("cert logo file: " + cert_logo);
  debug("cert date: " + cert_date);

  // todo: provide template name via config or database collection
  //       or even better in the future store the gpx track in the database and generate svg from there on the fly

//  runnerlist.findOne({'startnum': parseInt(startnum)},
//     		     { projection: { firstname:1, lastname: 1, catger: 1, rank_all: 1, finish_time: 1 }}).then((data) => {
// same thing but shorter without the projection keyword
  runnerlist.findOne({'startnum': parseInt(startnum)},
		     'firstname lastname catger rank_cat rank_all finish_time').then((data) => {
		       debug(data);
		       if (null !== data && data.finish_time) {
			 name = `${data.firstname} ${data.lastname}`;
			 time = data.finish_time;
			 rank = `${data.rank_all}. Platz`;

			 const stream = res.writeHead(200, {
			   'Content-Type': 'application/pdf',
			   'Content-Disposition': `attachment;filename=urkunde_${startnum}.pdf`,
			 });

			 certificate.createPdf(
			   {name, time, rank, cert_logo, cert_date},
			   (chunk) => stream.write(chunk),
			   () => stream.end()
			 );
		       }
		       else {
			 return res.sendStatus(400);
		       }
		     });
});

module.exports = router;
