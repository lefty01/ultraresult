// results.js display leaderboard
// calculate pace and avg. pace, ...

// TODO:
// for certificate store rank and finish time ...
// 'rank_cat'  => 1,
// 'rank_all'  => 1,
// 'finish_time'  => 1

// TODO: clean up this mess!!
//       probably could  "outsource" functions into module
//       I admit I'm no javascript/web dev expert, learn callbacks/async/wait...

// TODO:
// use socket io to get table updates direclty once aidstations get updated

"use strict";

var finisher = {};
var runnerList = {};
var rankedRunnerList = [];

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

	//rankedRunnerList = genRankedList(runnerList); not yet available ...
	//console.log("rankedRunnerList:");
	//console.log(rankedRunnerList);
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

	// console.log("data:");
	// console.log(data.length);
	// console.log(data);
	$("h3#trackerlinks").text("live tracking links:");

        $.each(data, function() {
	    console.log("tracking link name: " + this.name);
	    console.log("tracking link url:  " + this.url);
	    let skip = false;
	    // Canonical Decomposition, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
	    let name = this.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

	    if (!isValidName(name)) {
		console.log("invalid tracking link name!");
		skip = true;
	    }
	    if (!isValidUrl(this.url)) {
		console.log("invalid tracking link url!");
		skip = true;
	    }
	    // populate ul with live tracking links if available
	    if (!skip) {
		let li_item = '<li>' + name + ': <a href="' + this.url + '">' + this.url + '</a></li>';
		console.log("<li>: " + li_item);
		$("ul#trackerlinks").append(li_item);
	    }
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
// fixme: split function, eg. rank table cell update as extra function
function genRankedList(o) {
    var a = [], i, n;
    for (i in o) {
	if (o.hasOwnProperty(i)) {
            a.push([i, o[i]]);
	}
    }
    a.sort(function(a, b) {
	// we need FINISH before VPx
	var idA = a[1].lastAidIn.toUpperCase() === 'FINISH' ? 'ZZZ' : a[1].lastAidIn.toUpperCase();
	var idB = b[1].lastAidIn.toUpperCase() === 'FINISH' ? 'ZZZ' : b[1].lastAidIn.toUpperCase();

	if (idA < idB)  return 1;
	if (idA > idB)  return -1;
	// same VP (aidstation name), check time
	if (a[1].totalTime > b[1].totalTime) return  1; // totalTime format: "hh:mm"
	if (a[1].totalTime < b[1].totalTime) return -1;
	return 0;
    });

    // fill-out rank
    for (n in a) {
	var startnum = a[n][0];
	var rank = parseInt(n) + 1;

	a[n][1]['rank'] = rank;
	runnerList[startnum].rank = rank;
	console.log("genrankedklist: startnum=" + startnum + ", rank=" + rank);
	document.getElementById('rank_' + startnum).innerHTML = rank;
	//console.log("rank td#rank_" + startnum + ", " + document.getElementById('rank_' + startnum).innerHTML);
    }

    return a;
}


function setRunnerList(num, aid, time) {
    if (typeof runnerList[num] === 'undefined') {
	runnerList[num] = {};
    }
    runnerList[num].rank = 0;
    runnerList[num].lastAidIn = aid;
    runnerList[num].totalTime = time;
}


function isFinisher(num) {
    if ((typeof runnerList[num] !== 'undefined') &&
	('FINISH' === runnerList[num].lastAidIn.toUpperCase())) {
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

function paceStr2Min(p) {

}

// expect t to be a string "hh:mm", d is distance in km
function calcPace(t, d) {
    var intime = t.split(':');
    //console.log("intime h="+intime[0]+", intime m="+intime[1]);
    if (isNaN(intime[0])) return "n/a";

    var mins = parseInt(intime[0], 10) * 60 + parseInt(intime[1], 10); //intime[0] * 60 + intime[1];
    var pace = mins / d;

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

function addTimeDate2Str(startTime, startDate, delta) { // start date/time + estTotalTime hh:mm
    var dt = new Date(startDate + " " + startTime);
    var d = delta.split(":");
    var dMins = parseInt(d[0], 10) * 60 + parseInt(d[1], 10);
    //console.log("addTimeDate2Str: start=" + dt + ", dMins=" + dMins);
    // add minutes
    var newD = new Date(dt.getTime() + dMins * 60000);
    //console.log("addTimeDate2Str: intime=" + newD);
    var newMinutes = newD.getMinutes() < 10 ? "0" + newD.getMinutes() : newD.getMinutes();
    var result = newD.getHours() + ":" + newMinutes;
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

function calcTotalTime(totalDist, avgpace){
    var p = avgpace.split(':'); // input pace "mm:ss"
    var minsPerK = parseInt(p[0], 10) + (parseInt(p[1], 10) / 60);
    var totalMins = Math.floor(minsPerK * totalDist);
    //console.log("minsPerK:  " + minsPerK + " min/km");
    //console.log("totalMins: " + totalMins + " min");

    var result = String(100 + Math.floor(totalMins / 60)).substr(1) + ':' +
        String(100 + totalMins % 60).substr(1);

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

        if (('START' === idA) && ('FINISH' === idB))
            return -1;

        if (('START' === idB) && ('FINISH' === idA))
            return 1;

        if (('START' === idA) || ('FINISH' === idB))
            return -1;

        if (('START' === idB) || ('FINISH' === idA))
            return 1;

        return idA.localeCompare(idB, 'en', {numeric: true});
    });
    return a;
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
    }).done(function(response) {
        // Check for a successful (blank) response
        if (response.msg === '') {
	    console.log("update rank/time for runner " + data.startnum + " OK!");
        }
        else {
            alert('Error: ' + response.msg);
        }

    });

}

// function fillEstimatedTime() { ... }
function getAidstationNames(aid) {
    var a = [], n;
    for (n in aid) {
	a.push(aid[n].name);
    }
    return a;
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
kursiv (roter Hintergrund) Hochrechnung basierend auf avg. pace';

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
			aidEstimates.shift(); // remove this aidstation

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
				console.log('start    time: ' + startTime);
				console.log('start    date: ' + startDate);

				lasttime  = substractTimeDate2Str(prevOutTime, prevOutDate, intime, indate);
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
		for (k in aidEstimates) {
		    console.log("estimate for aid: " + aidEstimates[k]);
		    if ('START' === aidEstimates[k]) break;
		    var aidIdx = aidStations.findIndex(x => x.name === aidEstimates[k]);
		    var thisTotalDist = aidStations[aidIdx].totalDistance;
		    console.log("totaldist=" + thisTotalDist);
		    var estTotalTime = calcTotalTime(thisTotalDist, avgpace); //(min/km) -> min
		    console.log("estTotalTime=" + estTotalTime);

		    var estIntime = addTimeDate2Str(startTime, startDate, estTotalTime); // start date/time + estTotalTime hh:mm

		    tableContent += '<td class="estimate"><i>' + estIntime + '</i></td>';
		    tableContent += '<td></td>';
		    tableContent += '<td></td>';
		    tableContent += '<td></td>';
		    tableContent += '<td class="estimate"><i>' + estTotalTime + '</i></td>';
		    tableContent += '<td></td>';
		    tableContent += '<td></td>';
		}

		if (isFinisher(curStarter)) {
		    tableContent += '<td><b>' + totaltime  + '</b></td>'; // totaltime
		    tableContent += '<td>'    + totalpause + '</td>';     // totalpause
		}
		tableContent += '</tr>';

            }); // end each
	
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

	    rankedRunnerList = callback(runnerList);
	    console.log("rankedRunnerList:");
	    console.log(rankedRunnerList);
	});
    });
}

