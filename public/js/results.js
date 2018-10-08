// results.js display leaderboard
// calculate pace and avg. pace, ...

// TODO:
// for certificate store rank and finish time ...
// 'rank_cat'  => 1,
// 'rank_all'  => 1,
// 'finish_time'  => 1

// TODO:
// calc rank for each runner as we go ...
// that is sort by aidstation number that has valid in time
// then second sort by total time


"use strict";


// DOM Ready =============================================================
$(document).ready(function() {

    //    var now = date();
    
    if (document.title === "results not found") {
        alert("no results found!");
    } else {
        // fill table and make it sortable
        //fillResultTableX(document.title, now);
        fillResultTable();

	// FIXME: does not sort yet!?
	var tableObj = document.getElementById('results-table');
        sorttable.makeSortable(tableObj);
    }

});

var finisher = {};
var ranking = {};

function setRanking(num, aid, time) {
    ranking[num] = {'lastAidIn': aid,
		    'totalTime': time};
}

function setFinisher(num) {
    finisher[num] = true;
}
function isFinisher(num) {
    if ((typeof finisher[num] !== 'undefined') &&
	(true === finisher[num])) {
	return true;
    }
    return false;
}

function isValidAid(aid) {
    var reAid = /^(START|FINISH|VP\d{1,3})+$/i;
    if (! reAid.test(aid)) {
	return false;
    }
    return true;
}

function isValidDate(time) {
    var reTime = /^\d\d\d\d-\d\d-\d\d$/;
    if (! reTime.test(time)) {
	return false;
    }
    return true;
}

function isValidTime(time) {
    var reTime = /^\d\d:\d\d$/;
    if (! reTime.test(time)) {
	return false;
    }
    return true;
}

// expect t to be a string "hh:mm", d is distance in km
function calcPace(t, d) {
    var intime = t.split(':');
    //console.log("intime h="+intime[0]+", intime m="+intime[1]);

    var mins = parseInt(intime[0], 10) * 60 + parseInt(intime[1], 10); //intime[0] * 60 + intime[1];
    var pace = mins / d;
    //console.log("pace="+pace);

    var paceSec = Math.floor(60 * (pace - Math.floor(pace)));
    var paceSecStr = paceSec < 10 ? "0" + paceSec : paceSec;
    var result = Math.floor(pace) + ":" + paceSecStr;
    return result;
}
/*
 * substractTimeDate2Str(outTime, outDate, intime, indate);
 * substrace the in time/date from out date/time
 * return difference as hours and minutes in the form "hh:mm"
 * parm outTime
 * parm outDate
 * parm inTime
 * parm inTime
 */
function substractTimeDate2Str(outTime, outDate, inTime, inDate) {
    var outD = new Date(outDate + " " + outTime);
    var inD  = new Date(inDate + " " + inTime);
    var diffMin = ((inD - outD) / 1000) / 60;
    //console.log(outD); console.log(inD);
    var result = String(100 + Math.floor(diffMin / 60)).substr(1) + ':' +
        String(100 + diffMin % 60).substr(1);

    return result;
}

function calcTotalPause(totalp, delta) {
    var d = delta.split(':');
    var t = totalp.split(':');
    var dMins = parseInt(d[0], 10) * 60 + parseInt(d[1], 10);
    var tMins = parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
    var sum = tMins + dMins;

    var result = String(100 + Math.floor(sum / 60)).substr(1) + ':' +
        String(100 + sum % 60).substr(1);
    return result;
}

/*
 *
 */
function sortResultObject(o) {
    var a = [], i;
    for (i in o) {
	if (o.hasOwnProperty(i)) {
            a.push([i, o[i]]);
	}
    }
    a.sort(function(a, b) {
	var idA = a[0].toUpperCase();
	var idB = b[0].toUpperCase();

	if ((idA < idB) || ('FINISH' === idB)) {
	    return -1;
	}
	if ((idA > idB) || ('FINISH' === idA)) {
	    return 1;
	}
	return 0; // should not happen!
    })
    return a;
}

function sortRunnerByAidAndTime() {
    ranking.sort(function(a, b) {
	
    });
    return ranking;
}

/*
 *
 */
function setRankAndFinishtime(data) {

    var ranking = {
	'startnum'   : data.startnum,
	'rankall'    : data.rankall,
	'rankcat'    : rankcat,
	'finishtime' : finishtime
    };

    $.ajax({
        type: 'PUT',
        dataType: 'JSON',
        data: ranking,
        url: '/runners/update/rank/' + data.startnum
    }).done(function( response ) {
        // Check for a successful (blank) response
        if (response.msg === '') {
	    console.log("update rank/time for runner " + data.startnum + " OK!");
        }
        else {
            alert('Error: ' + response.msg);
        }

    });

}



function generateResultTableRankedList() {

    // for each runner get in/out time for each aidstation, stop if aid as invalid intime
    // in addition calculate (total/last aid) time and pace
    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    var intimeValid  = false;
	    var outtimeValid = false;
	    var resultsList = [];
	    var intime     = "n/a";
	    var indate     = "n/a";
	    var outtime    = "n/a";
	    var outdate    = "n/a";
	    var pause      = "n/a";
	    var lastpace   = "n/a";
	    var avgpace    = "n/a";
	    var lasttime   = "n/a";
	    var totaltime  = "n/a";
	    var place      = "n/a";
	    var totalpause = "0:00";
	    var curStarter = this.startnum;

	    console.log("=== checking runner #" + this.startnum + " ===");
	    // check the results field if we have valid times for this runner/aid
	    var results = this.results;


	    // sort result list ... if VPn data for some reason was entered before VPn-1 (eg. entering data after the run)
	    resultsList = sortResultObject(results);

	    // for each aidstation the runner reached. res[0] is aidID (START, VP1, VPn..., FINISH),
	    //                                         res[1] is in/out time,date and valid flag
	    $.each(resultsList, function(index, res) {
		var aidId = isValidAid(res[0]) ? res[0] : "INVALID"; // validate aidId
		var times = res[1];
		
		console.log("AIDID: " + aidId + ":"); //console.log(times); // note: only log single obj to view in chrome dev tool
		pause = "n/a";

		if (results[aidId]) {
		    // make sure valids are really only true or false
		    intimeValid = ((typeof results[aidId].intime_valid !== 'undefined')
				   && (true === results[aidId].intime_valid)) ? true : false;
		    outtimeValid = ((typeof results[aidId].outtime_valid !== 'undefined')
				    && (true === results[aidId].outtime_valid)) ? true : false;

		    if (true === intimeValid) {
			intime  = isValidTime(results[aidId].intime) ? results[aidId].intime  : "n/a";
			indate  = isValidDate(results[aidId].indate) ? results[aidId].indate  : "n/a";
		    }
		    else {
			intime = "n/a";
		    }
		    if (true === outtimeValid) {
			outtime = isValidTime(results[aidId].outtime) ? results[aidId].outtime : "n/a";
			outdate = isValidDate(results[aidId].outdate) ? results[aidId].outdate : "n/a";
		    }
		    else {
			outtime = "n/a";
		    }

		    console.log('fillStarterTable: ' + aidId + ' in valid:  ' + intimeValid);
		    console.log('fillStarterTable: ' + aidId + ' in time:   ' + intime);
		    console.log('fillStarterTable: ' + aidId + ' in date:   ' + indate);
		    console.log('fillStarterTable: ' + aidId + ' out valid: ' + outtimeValid);
		    console.log('fillStarterTable: ' + aidId + ' out time:  ' + outtime);
		    console.log('fillStarterTable: ' + aidId + ' out date:  ' + outdate);


		    if ((true === outtimeValid) && (true === intimeValid)) {
			pause = substractTimeDate2Str(intime, indate, outtime, outdate);
			//console.log("pause=" + pause + ", total pause=" + totalpause);
			var zzz = totalpause;
			totalpause = calcTotalPause(zzz, pause);
			console.log('calc total pause: ' + totalpause);
			console.log('fillStarterTable: ' + aidId + ' pause:     ' + pause);
                    }

		    // get last time (between last aid out and this aid in)
		    var prevAidIdx = aidStations.findIndex(x => x.name === aidId) - 1;
		    console.log('prevAidIdx: ' + prevAidIdx);
		    if (prevAidIdx >= 0) {
			var prevAid = aidStations[prevAidIdx];
			console.log('prevAid.name=' + prevAid.name);
			console.log('prev aid results: ' + results[prevAid.name]);
			if ((typeof prevAid !== 'undefined') &&
			    (typeof results[prevAid.name] !== 'undefined') &&
			    (true === results[prevAid.name].outtime_valid) &&
		     	    (true === results[aidId].intime_valid)) {
			    // FIXME: check if prev time valid, validate time
			    var prevOutTime = isValidTime(results[prevAid.name].outtime) ? results[prevAid.name].outtime : "n/a";
			    var prevOutDate = isValidDate(results[prevAid.name].outdate) ? results[prevAid.name].outdate : "n/a";
			    var startTime   = isValidTime(results["START"].outtime) ? results["START"].outtime : "n/a";
			    var startDate   = isValidDate(results["START"].outdate) ? results["START"].outdate : "n/a";

			    console.log('last out time: ' + prevOutTime);
			    console.log('last out date: ' + prevOutDate);//results[prevAid.name].outdate);
			    console.log('this  in time: ' + intime);
			    console.log('this  in date: ' + indate);
			    console.log('start    time: ' + startTime);
			    console.log('start    date: ' + startDate);

			    lasttime  = substractTimeDate2Str(prevOutTime, prevOutDate, intime, indate);
			    totaltime = substractTimeDate2Str(startTime, startDate, intime, indate);
			}
			else {
			    lasttime = "n/a";
			    totaltime = "n/a";
			}
		    }
		    // calc pace ...
		    // P1: avg. pace between aid stations
		    var lastDist = aidStations.find(x => x.name === aidId).legDistance;
		    var totalDist = aidStations.find(x => x.name === aidId).totalDistance;
		    //console.log("lasttime=" + lasttime + ", totaltime=" + totaltime);
		    //console.log("lastDist=" + lastDist + ", totalDist=" + totalDist);
		    lastpace = calcPace(lasttime, lastDist);
		    // P2: avg between start and current aidstation in
		    avgpace = calcPace(totaltime, totalDist);
		}
		if ("START" === aidId) {
		    console.log('aidId === START !!!');

		    return true;
		}
		if ("FINISH" === aidId) {
		    console.log('aidId === FINISH !!!');
		    if (true === intimeValid) setFinisher(curStarter);

		    return true;
		}
		// tableContent += '<td>' + intime    + '</td>';
		// tableContent += '<td>' + outtime   + '</td>';
		// tableContent += '<td>' + pause     + '</td>';
		// tableContent += '<td>' + lasttime  + '</td>';
		// tableContent += '<td><b>' + totaltime + '</b></td>';
		// tableContent += '<td>' + lastpace  + '</td>';
		// tableContent += '<td>' + avgpace   + '</td>';
		return true;
	    });

	    if (isFinisher(curStarter)) {
		// tableContent += '<td><b>' + totaltime  + '</b></td>'; // totaltime
		// tableContent += '<td>'    + totalpause + '</td>';     // totalpause
	    }
        }); // for each runner
    });

    $.each(ranking, function(index, r) {

    });

}


function fillResultTable() {
    var tableContent = '';
    var tableHeader  = '';
    var aidStations  = [];

    var tableCaption = '\
T<sub>1</sub>(hh:mm): Zeit zwischen VP<sub>n-1<sub>Tout</sub></sub> und VP<sub>n<sub>Tin</sub></sub> , &nbsp; \
T<sub>2</sub>(hh:mm): Zeit zwischen Start und VP<sub>n<sub>Tin</sub></sub> , &nbsp; \
P<sub>1</sub>(mm:ss/km): Ø Pace zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub> , &nbsp; \
P<sub>2</sub>(mm:ss/km): Ø Pace zwischen Start und VP<sub>n<sub>Tin</sub></sub>';

    tableHeader += '<tr>';
    tableHeader += '<th class="sortable_numeric">Rang</th>';
    tableHeader += '<th class="sortable_numeric">#</th>';
    tableHeader += '<th class="name">Name</th>';
    tableHeader += '<th class="starttime">Start</th>';

    
    // fill the table header with aidstation info
    // note: /aid returns data sorted by total distance
    $.getJSON('/aid', function(data) {
        $.each(data, function() {
	    //console.log("aid data: " + this.name);
	    if (!isValidAid(this.name)) {
		console.log("invalid aid name!");
		return;
	    }
	    aidStations.push(this);

	    if ('START' === this.name) { return true; }
	    if ('FINISH' === this.name) {
		// colspan number of cells in finish coloumn: in, last pace, avg. pace, last time
		tableHeader += '<th colspan="5">' + this.name + ' ' + this.directions +
		    ', @' + this.totalDistance.toFixed(1) + ',  &Delta; ' + this.legDistance.toFixed(1) + '</th>';
		return true;
	    }
	    tableHeader += '<th colspan="7" id="' + this.name + '">' + this.name + ' '
		+ this.directions + ', @km ' + this.totalDistance.toFixed(1) + ',  &Delta; ' + this.legDistance.toFixed(1) + '</th>';
	    return true;
	});
    });

    // FIXME check input validation (using database input)
    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    var intimeValid  = false;
	    var outtimeValid = false;
	    var resultsList = [];
	    var intime     = "n/a";
	    var indate     = "n/a";
	    var outtime    = "n/a";
	    var outdate    = "n/a";
	    var pause      = "n/a";
	    var lastpace   = "n/a";
	    var avgpace    = "n/a";
	    var lasttime   = "n/a";
	    var totaltime  = "n/a";
	    var place      = "n/a";
	    var totalpause = "0:00";
	    var curStarter = this.startnum;

	    tableContent += '<tr>';
	    tableContent += '<td>' + place + '</td>'; // place
            tableContent += '<td>' + this.startnum  + '</td>';
	    tableContent += '<td>' + this.firstname + ' ' + this.lastname + '</td>';

	    console.log("=== checking runner #" + this.startnum + " ===");

	    // check the results field if we have valid times for this runner/aid
	    var results = this.results;
	    //console.log(results);

	    // sort result list ... if VPn data for some reason was entered before VPn-1 (eg. entering data after the run)
	    resultsList = sortResultObject(results);

	    $.each(resultsList, function(index, res) {
		var aidId = isValidAid(res[0]) ? res[0] : "INVALID"; // validate aidId
		var times = res[1];
		
		console.log("AIDID: " + aidId + ":"); //console.log(times); // note: only log single obj to view in chrome dev tool
		pause = "n/a";

		if (results[aidId]) {
		    // make sure valids are really only true or false
		    intimeValid = ((typeof results[aidId].intime_valid !== 'undefined')
				   && (true === results[aidId].intime_valid)) ? true : false;
		    outtimeValid = ((typeof results[aidId].outtime_valid !== 'undefined')
				    && (true === results[aidId].outtime_valid)) ? true : false;

		    if (true === intimeValid) {
			intime  = isValidTime(results[aidId].intime) ? results[aidId].intime  : "n/a";
			indate  = isValidDate(results[aidId].indate) ? results[aidId].indate  : "n/a";
		    }
		    else {
			intime = "n/a";
		    }
		    if (true === outtimeValid) {
			outtime = isValidTime(results[aidId].outtime) ? results[aidId].outtime : "n/a";
			outdate = isValidDate(results[aidId].outdate) ? results[aidId].outdate : "n/a";
		    }
		    else {
			outtime = "n/a";
		    }

		    console.log('fillStarterTable: ' + aidId + ' in valid:  ' + intimeValid);
		    console.log('fillStarterTable: ' + aidId + ' in time:   ' + intime);
		    console.log('fillStarterTable: ' + aidId + ' in date:   ' + indate);
		    console.log('fillStarterTable: ' + aidId + ' out valid: ' + outtimeValid);
		    console.log('fillStarterTable: ' + aidId + ' out time:  ' + outtime);
		    console.log('fillStarterTable: ' + aidId + ' out date:  ' + outdate);


		    if ((true === outtimeValid) && (true === intimeValid)) {
			pause = substractTimeDate2Str(intime, indate, outtime, outdate);
			//console.log("pause=" + pause + ", total pause=" + totalpause);
			var zzz = totalpause;
			totalpause = calcTotalPause(zzz, pause);
			console.log('calc total pause: ' + totalpause);
			console.log('fillStarterTable: ' + aidId + ' pause:     ' + pause);
                    }

		    // get last time (between last aid out and this aid in)
		    var prevAidIdx = aidStations.findIndex(x => x.name === aidId) - 1;
		    console.log('prevAidIdx: ' + prevAidIdx);
		    if (prevAidIdx >= 0) {
			var prevAid = aidStations[prevAidIdx];
			console.log('prevAid.name=' + prevAid.name);
			console.log('prev aid results: ' + results[prevAid.name]);
			if ((typeof prevAid !== 'undefined') &&
			    (typeof results[prevAid.name] !== 'undefined') &&
			    (true === results[prevAid.name].outtime_valid) &&
		     	    (true === results[aidId].intime_valid)) {
			    // FIXME: check if prev time valid, validate time
			    var prevOutTime = isValidTime(results[prevAid.name].outtime) ? results[prevAid.name].outtime : "n/a";
			    var prevOutDate = isValidDate(results[prevAid.name].outdate) ? results[prevAid.name].outdate : "n/a";
			    var startTime   = isValidTime(results["START"].outtime) ? results["START"].outtime : "n/a";
			    var startDate   = isValidDate(results["START"].outdate) ? results["START"].outdate : "n/a";

			    console.log('last out time: ' + prevOutTime);
			    console.log('last out date: ' + prevOutDate);//results[prevAid.name].outdate);
			    console.log('this  in time: ' + intime);
			    console.log('this  in date: ' + indate);
			    console.log('start    time: ' + startTime);
			    console.log('start    date: ' + startDate);

			    lasttime  = substractTimeDate2Str(prevOutTime, prevOutDate, intime, indate);
			    totaltime = substractTimeDate2Str(startTime, startDate, intime, indate);
			    setRanking(curStarter, aidId, totaltime);
			    console.log(ranking);
			}
			else {
			    lasttime = "n/a";
			    totaltime = "n/a";
			}
		    }
		    // calc pace ...
		    // P1: avg. pace between aid stations
		    var lastDist = aidStations.find(x => x.name === aidId).legDistance;
		    var totalDist = aidStations.find(x => x.name === aidId).totalDistance;
		    //console.log("lasttime=" + lasttime + ", totaltime=" + totaltime);
		    //console.log("lastDist=" + lastDist + ", totalDist=" + totalDist);
		    lastpace = calcPace(lasttime, lastDist);
		    // P2: avg between start and current aidstation in
		    avgpace = calcPace(totaltime, totalDist);
		}
		if ("START" === aidId) {
		    tableContent += '<td>' + outtime  + '</td>';
		    return true;
		}
		if ("FINISH" === aidId) {
		    tableContent += '<td>' + intime  + '</td>';
		    tableContent += '<td>' + lasttime + '</td>';
		    tableContent += '<td><b>' + totaltime + '</b></td>'; // -> Ziel/Gesamtzeit
		    tableContent += '<td>' + lastpace + '</td>';
		    tableContent += '<td>' + avgpace  + '</td>';
		    //console.log('***** welcome num=' + curStarter + ' FINISHED!!!');
		    if (true === intimeValid) setFinisher(curStarter);

		    return true;
		}
		tableContent += '<td>' + intime    + '</td>';
		tableContent += '<td>' + outtime   + '</td>';
		tableContent += '<td>' + pause     + '</td>';
		tableContent += '<td>' + lasttime  + '</td>';
		tableContent += '<td><b>' + totaltime + '</b></td>';
		tableContent += '<td>' + lastpace  + '</td>';
		tableContent += '<td>' + avgpace   + '</td>';
		return true;
	    });

	    if (isFinisher(curStarter)) {
		tableContent += '<td><b>' + totaltime  + '</b></td>'; // totaltime
		tableContent += '<td>'    + totalpause + '</td>';     // totalpause
	    }
            tableContent += '</tr>';

        });
	
	//console.log("tableContent2 : " + tableContent);
	// Inject the whole content string into our existing HTML table
	tableHeader += '<th>Zeit</th>';
	tableHeader += '<th>&sum; Pause</th>';
	tableHeader += '</tr>';

	// second header line ...
	tableHeader += '<tr>';
	tableHeader += '<th></th>';
	tableHeader += '<th></th>';
	tableHeader += '<th></th>';
	tableHeader += '<th></th>';
	$.each(aidStations, function() {
	    if ('START'  === this.name) { return true; }
	    if ('FINISH' === this.name) { return true; }
	    tableHeader += '<th>IN</th>';
	    tableHeader += '<th>OUT</th>';
	    tableHeader += '<th>Pause</th>';
	    tableHeader += '<th class="" headers="' + this.name + '">T<sub>1</sub></th>';
	    tableHeader += '<th class="" headers="' + this.name + '">T<sub>2</sub></th>';
	    tableHeader += '<th class="" headers="' + this.name + '">P<sub>1</sub></th>';
	    tableHeader += '<th class="" headers="' + this.name + '">P<sub>2</sub></th>';
	});
	tableHeader += '<th>IN</th>';
	tableHeader += '<th>T<sub>1</sub></th>';
	tableHeader += '<th>T<sub>2</sub></th>'; // -> Ziel/Gesamtzeit
	tableHeader += '<th>P<sub>1</sub></th>';
	tableHeader += '<th>P<sub>2</sub></th>';
	tableHeader += '<th></th>';
	tableHeader += '<th></th>';
	tableHeader += '</tr>';

	$('#resultstable table thead').html(tableHeader);
	$('#resultstable table caption').html(tableCaption);
	$('#resultstable table tbody').html(tableContent);
    });

}


