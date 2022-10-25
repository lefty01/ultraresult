// results.js display leaderboard
// calculate pace and avg. pace, ...


// TODO: clean up this mess!!
//       probably could  "outsource" functions into module
//       I admit I'm no javascript/web dev expert, learn callbacks/async/wait...

// TODO:
// use socket io to get table updates direclty once aidstations get updated

"use strict";

import {runnerList,
	rankedRunnerList,
	genRankedList,
	isValidAid,
	isValidDate,
	isValidTime,
	calcPace,
	calcTotalPause,
	calcTotalTime,
	substractTimeDate2Str,
	addTimeDate2Str,
	sortResultObject,
	setRunnerList,
	isFinisher,
	getAidstationNames
       } from './process_results.js';


// DOM Ready =============================================================
$(document).ready(function() {
    //var now = date();
    showLiveTrackerLinks();

    // showAidstationLinks(); // depending on logged in status!?
    // NOTE: right now I implemented this via the results.js route and results.pug template
    
    if (document.title === "results not found") {
        alert("no results found!");
    } else {
        // fill table and make it sortable
        fillResultTable(genRankedList);

	// FIXME: does not sort yet!?
	var tableObj = document.getElementById('results-table');
        sorttable.makeSortable(tableObj);

	//rankedRunnerList = genRankedList(runnerList); not yet available ... therefore using a callback for now
    }

    // $("td#rank_").each(function( index ) {
    // 	console.log( index + ": " + $( this ).text() );
    // });

});

function showLiveTrackerLinks() {

    $.getJSON('/tracking', function(data) {
	if (data === undefined || typeof data == 'undefined' ||
	    data.length === 0) {
	    return false;
	}

	console.log("data:");
	console.log(data.length);
	console.log(data);
	$("h3#trackerlinks").text("live tracking links:");

        $.each(data, function() { // anonymous function so return will act as 'next'
	    console.log("tracking link name: " + this.name);
	    console.log("tracking link url:  " + this.url);
	    if (this.name === undefined || this.url === undefined) {
		console.log("error: no name/url provided");
		return;
	    }

	    // Canonical Decomposition:
	    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
	    let name = this.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

	    if (!isValidName(name)) {
		console.log("invalid tracking link name!");
		return;
	    }
	    if (!isValidUrl(this.url)) {
		console.log("invalid tracking link url!");
		return;
	    }
	    // populate ul with live tracking links if available
	    let li_item = '<li><a href="' + this.url + '"target="_blank">' + name + '</a></li>';
	    console.log("<li>: " + li_item);
	    $("ul#trackerlinks").append(li_item);
	});

    });
}

//function showAidstationLinks() {
//}

/*
 * sort runnerList by aidId and time, fill in rank
 * return sorted array
 */

// fixme: callback ...
function fillRankId() {

}


function isValidUrl(url) {
    var valid = /^(http|https):\/\/[^ "]+$/.test(url);
    if (! valid) {
	return false;
    }
    return true;
}

function isValidName(name) {
    var valid = /^[\w _-]+$/.test(name);
    if (! valid) {
	return false;
    }
    return true;
}

function isValidNum(num) {
    var valid = /^\d{1,3}$/.test(num);
    if (! valid) {
	return false;
    }
    return true;
}



// FIXME: quite some large piece of function code...
// callback to sort when result table done ??!!
function fillResultTable(callback) {
    var tableContent = '';
    var tableHeader  = '';
    var aidStations  = [];
    //var aidStationsEstimates = []; // copy of aidStations list where we pop off those reached by runner

    var tableCaption = '\
T<sub>1</sub>(hh:mm): Zeit zwischen VP<sub>n-1<sub>Tout</sub></sub> und VP<sub>n<sub>Tin</sub></sub>, &nbsp; \
T<sub>2</sub>(hh:mm): Zeit zwischen Start und VP<sub>n<sub>Tin</sub></sub>, &nbsp; \
P<sub>1</sub>(mm:ss/km): Ø Pace zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub>, &nbsp; \
P<sub>2</sub>(mm:ss/km): Ø Pace zwischen Start und VP<sub>n<sub>Tin</sub></sub>, &nbsp; \
kursiv (roter Hintergrund) Hochrechnung basierend auf avg. pace. &nbsp; \
<br>Note: T<sub>2</sub> und P<sub>2</sub> basieren entweder auf der IN-Zeit oder wenn vorhanden auf der OUT-Zeit (pause)!';

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
		return false;
	    }
	    aidStations.push(this);
	    console.log("results.js: push to aidstations:" + this.name);
	    var osmLink = 'https://www.openstreetmap.org/?mlat=' + this.lat + '&mlon=' + this.lng + '#map=18/' + this.lat + '/' + this.lng
	    console.log("osmlink: " + osmLink);

	    if ('START' === this.name) { return true; }
	    if ('FINISH' === this.name) {
                // colspan number of cells in finish coloumn: in, last pace, avg. pace, last time
	        tableHeader += '<th colspan="5">' + this.name + ' ' + this.directions +
		               ', @' + this.totalDistance.toFixed(1) + ',  &Delta; ' + this.legDistance.toFixed(1) + '</th>';
		return true;
	    }
	    tableHeader += '<th colspan="7" id="' + this.name + '">' + '<a href="' + osmLink + '">' + this.name + '</a> '
		+ this.directions + ', @km ' + this.totalDistance.toFixed(1) + ',  &Delta; ' + this.legDistance.toFixed(1) + '</th>';
	    return true;
	});
    })
    .then(function(aidstations) {
	console.log("results.js: aidstations: " + aidStations); // aidStations are objects!

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
	        var finishTime = "n/a";
		var rank       = "n/a";
		var totalpause = "0:00";
		var curStarter = this.startnum;
		var rankId = "rank_" + this.startnum;
		var k;
		var startTime, startDate;
		var aidEstimates = getAidstationNames(aidStations);
		console.log(aidEstimates);

		tableContent += '<tr>';
		tableContent += '<td id=' + rankId + '>' + rank + '</td>'; // rank
		tableContent += '<td>' + this.startnum  + '</td>';
		tableContent += '<td>' + this.firstname + ' ' + this.lastname + '</td>';

		console.log("=== checking runner #" + this.startnum + " ===");

		// check the results field if we have valid times for this runner/aid
		var results = this.results;
		//console.log(results);

		// sort result list ... if VPn data for some reason was entered before VPn-1 (eg. entering data after the run)
		resultsList = sortResultObject(results);
		console.log('num results: ' + resultsList.length);

		$.each(resultsList, function(index, res) {
		    var aidId = isValidAid(res[0]) ? res[0] : "INVALID"; // validate aidId
		    var times = res[1];
		    var prevAidIdx = aidStations.findIndex(x => x.name === aidId) - 1;

		    console.log("AIDID: " + aidId + ":"); //console.log(times); // note: only log single obj to view in chrome dev tool
		    console.log("index: " + index);
		    pause = "n/a";
		    if ("INVALID" === aidId) {
			console.log('Error invalid data for runner: ' + curStarter);
			return true;
		    }
		    // sanity check if number of results index of this aidstation (name)
		    if ((prevAidIdx + 1) != index) {
			console.log('Error invalid result data for runner: ' + curStarter + ' (prevAidIdx: ' + prevAidIdx + ')');
			return true;
		    }

		    if (results[aidId]) {
			//if ("FINISH" === aidId)
			//    return;
			aidEstimates.shift(); // remove this aidstation (fixme: only if outtime?)

			// make sure valids are really only true or false
			intimeValid = ((typeof results[aidId].intime_valid !== 'undefined')
				       && (true === results[aidId].intime_valid)) ? true : false;
			outtimeValid = ((typeof results[aidId].outtime_valid !== 'undefined')
					&& (true === results[aidId].outtime_valid)) ? true : false;

			// if (outtimeValid || (("FINISH" === aidId) && intimeValid)) {
			//     aidEstimates.shift(); // remove this aidstation, only if outtime
			// }

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

			console.log('fillResultTable: ' + aidId + ' in valid:  ' + intimeValid);
			console.log('fillResultTable: ' + aidId + ' in time:   ' + intime);
			console.log('fillResultTable: ' + aidId + ' in date:   ' + indate);
			console.log('fillResultTable: ' + aidId + ' out valid: ' + outtimeValid);
			console.log('fillResultTable: ' + aidId + ' out time:  ' + outtime);
			console.log('fillResultTable: ' + aidId + ' out date:  ' + outdate);

			if ((true === outtimeValid) && (true === intimeValid)) {
			    pause = substractTimeDate2Str(intime, indate, outtime, outdate);
			    //console.log("pause=" + pause + ", total pause=" + totalpause);
			    var zzz = totalpause;
			    totalpause = calcTotalPause(zzz, pause);
			    console.log('calc total pause: ' + totalpause);
			    console.log('fillResultTable: ' + aidId + ' pause:     ' + pause);
			}

			// get last time (between last aid out and this aid in)
			//var prevAidIdx = aidStations.findIndex(x => x.name === aidId) - 1;
			console.log('prevAidIdx: ' + prevAidIdx);
			if (prevAidIdx >= 0) { // index=0 means START
			    var prevAid = aidStations[prevAidIdx];
			    console.log('prevAid.name=' + prevAid.name);
			    console.log('prev aid results: ' + results[prevAid.name]);
			    // FIXME: if results[prevAid.name] == undefined then this result cannot be valid either

			    if ((typeof prevAid !== 'undefined') &&
				(typeof results[prevAid.name] !== 'undefined') &&
				(true === results[prevAid.name].outtime_valid) &&
				(true === results[aidId].intime_valid)) {
				// FIXME: check if prev time valid, validate time
				var prevOutTime = isValidTime(results[prevAid.name].outtime) ? results[prevAid.name].outtime : "n/a";
				var prevOutDate = isValidDate(results[prevAid.name].outdate) ? results[prevAid.name].outdate : "n/a";
				startTime   = isValidTime(results["START"].outtime) ? results["START"].outtime : "n/a";
				startDate   = isValidDate(results["START"].outdate) ? results["START"].outdate : "n/a";

				console.log('last out time: ' + prevOutTime);
				console.log('last out date: ' + prevOutDate);//results[prevAid.name].outdate);
				console.log('this  in time: ' + intime);
				console.log('this  in date: ' + indate);
				console.log('this out time: ' + outtime);
				console.log('this out date: ' + outdate);
				console.log('start    time: ' + startTime);
				console.log('start    date: ' + startDate);

                                lasttime  = substractTimeDate2Str(prevOutTime, prevOutDate, intime, indate);
				// total time includes pause time at aidstation once the out-time is valid (saved)
                                if (true === outtimeValid)
                                    totaltime = substractTimeDate2Str(startTime, startDate, outtime, outdate);
                                else
                                    totaltime = substractTimeDate2Str(startTime, startDate, intime, indate);

				setRunnerList(curStarter, aidId, totaltime);
				//console.log(runnerList);
			    }
			    else {
				lasttime = "n/a";
				totaltime = "n/a";
			    }
			}
			// calc pace ...
			// P1: avg. pace between aid stations
			var lastDist  = aidStations.find(x => x.name === aidId).legDistance;
			var totalDist = aidStations.find(x => x.name === aidId).totalDistance;
			//console.log("lasttime=" + lasttime + ", totaltime=" + totaltime);
			//console.log("lastDist=" + lastDist + ", totalDist=" + totalDist);
			lastpace = calcPace(lasttime, lastDist);
			// P2: avg between start and current aidstation in or out
			avgpace = calcPace(totaltime, totalDist);
		    }

		    if ("START" === aidId) {
			tableContent += '<td>' + outtime  + '</td>';
			return true;
		    }
                    if ("FINISH" === aidId) {
			finishTime = totaltime;
			tableContent += '<td>' + intime  + '</td>';
			tableContent += '<td>' + lasttime + '</td>';
			tableContent += '<td><b>' + totaltime + '</b></td>'; // -> Ziel/Gesamtzeit
			tableContent += '<td>' + lastpace + '</td>';
			tableContent += '<td>' + avgpace  + '</td>';
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

		// iterate over remaining aidstations/finish for this runner
		// and fill in estimated in-time and total-time (T2)
		// estimated arrival at next VPs and Finish with current avg. pace
		console.log("last avg pace = " + avgpace);
		var atFinish = false;
		for (k in aidEstimates) {
		    console.log("--- ESTIMATE for aid: " + aidEstimates[k]);
		    if ('START' === aidEstimates[k]) break;
		    if ('FINISH' === aidEstimates[k]) {
			atFinish = true;
		    }
		    var aidIdx = aidStations.findIndex(x => x.name === aidEstimates[k]);
		    var thisTotalDist = aidStations[aidIdx].totalDistance;
		    var estTotalTime = calcTotalTime(thisTotalDist, avgpace); //(min/km) -> min
		    var estIntime = addTimeDate2Str(startTime, startDate, estTotalTime); // start date/time + estTotalTime hh:mm

		    console.log("aidIdx=" + aidIdx);
		    console.log("totaldist=" + thisTotalDist);
		    console.log("estTotalTime=" + estTotalTime);
		    console.log('total pause: ' + totalpause);
		    console.log("Arrive at FINISH ..." + atFinish);

		    tableContent += '<td class="estimate"><i>' + estIntime + '</i></td>';
		    if (false === atFinish) { // out and pause fields not present at finish
			tableContent += '<td></td>';
			tableContent += '<td></td>';
		    }
		    tableContent += '<td></td>';
		    tableContent += '<td class="estimate"><i>' + estTotalTime + '</i></td>';
		    tableContent += '<td></td>';
		    tableContent += '<td></td>';
		    if (true === atFinish) { // out and pause fields not present at finish
			tableContent += '<td></td>';
			tableContent += '<td></td>';
		    }
		}

		if (isFinisher(curStarter)) {
		    runnerList[curStarter].finisher = true;
		    tableContent += '<td><b>' + totaltime  + '</b></td>'; // totaltime
		    tableContent += '<td>'    + totalpause + '</td>';     // totalpause
		    tableContent += '<td><a href="/urkunde/' + curStarter + '">PDF</a></td>';
		}
		tableContent += '</tr>';

            }); // end each
	
	    // Inject the whole content string into our existing HTML table
	    tableHeader += '<th>Zeit</th>';
	    tableHeader += '<th>&sum; Pause</th>';
	    tableHeader += '<th>&darr; Urkunde</th>';
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

	    //rankedRunnerList = callback(runnerList);
	    callback(runnerList);
	    console.log("rankedRunnerList:");
	    console.log(rankedRunnerList);
	});
    });
}

