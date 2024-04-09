
"use strict";

// todo: consider one single export statement

export let runnerList = {};
export let rankedRunnerList = [];


// validation
export function isValidAid(aid) {
    var reAid = /^(START|FINISH|VP\d{1,3})+$/i;
    if (! reAid.test(aid)) {
	return false;
    }
    return true;
}

export function isValidDate(time) {
    var reTime = /^\d\d\d\d-\d\d-\d\d$/;
    if (! reTime.test(time)) {
	return false;
    }
    return true;
}

export function isValidTime(time) {
    var reTime = /^\d\d:\d\d$/;
    if (! reTime.test(time)) {
	return false;
    }
    return true;
}

// calculation
/*
 * expect t to be a string "hh:mm", d is distance in km
 */
export function calcPace(t, d) {
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

export function calcTotalPause(totalp, delta) {
    var d = delta.split(':');
    var t = totalp.split(':');
    var dMins = parseInt(d[0], 10) * 60 + parseInt(d[1], 10);
    var tMins = parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
    var sum = tMins + dMins;

    var result = String(100 + Math.floor(sum / 60)).substr(1) + ':' +
        String(100 + sum % 60).substr(1);
    return result;
}

export function calcTotalTime(totalDist, avgpace){
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
 * substractTimeDate2Str(outTime, outDate, intime, indate);
 * substrace the in time/date from out date/time
 * return difference as hours and minutes in the form "hh:mm"
 * parm outTime
 * parm outDate
 * parm inTime
 * parm inTime
 */
export function substractTimeDate2Str(outTime, outDate, inTime, inDate) {
    var outD = new Date(outDate + " " + outTime);
    var inD  = new Date(inDate + " " + inTime);
    var diffMin = ((inD - outD) / 1000) / 60;
    //console.log(outD); console.log(inD);
    var result = String(100 + Math.floor(diffMin / 60)).substr(1) + ':' +
        String(100 + diffMin % 60).substr(1);

    return result;
}

export function addTimeDate2Str(startTime, startDate, delta) { // start date/time + estTotalTime hh:mm
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


export function getAidstationNames(aid) {
    var a = [], n;
    for (n in aid) {
	a.push(aid[n].name);
    }
    return a;
}

export function setRunnerList(num, aid, time) {
    if (typeof runnerList[num] === 'undefined') {
	runnerList[num] = {};
    }
    //runnerList[num].rank = 0;
    runnerList[num].lastAidIn = aid;
    runnerList[num].totalTime = time;
}

export function isFinisher(num) {
    if ((typeof runnerList[num] !== 'undefined') &&
	('FINISH' === runnerList[num].lastAidIn.toUpperCase())) {
	return true;
    }
    return false;
}

/*
 *
 */
export function sortResultObject(o) {
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
function setRankAndFinishtime(startnum) {
    var ranking = {
	'rankall'    : runnerList[startnum].rank,
	'finishtime' : runnerList[startnum].totalTime
	//'startnum'   : data.startnum,
	//'rankcat'    : data.rankcat,
    };
    console.log("setRankAndFinishtime, ranking: " + ranking);

    $.ajax({
        type: 'PUT',
        dataType: 'JSON',
        data: ranking,
        url: '/runners/update/rank/' + startnum
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

export function genRankedList(o) {
    var rankedList = [], i, n;
    for (i in o) {
	if (o.hasOwnProperty(i)) {
            rankedList.push([i, o[i]]);
	}
    }
    rankedList.sort(function(a, b) {
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
    for (n in rankedList) {
	var startnum = rankedList[n][0];
	var rank = parseInt(n) + 1;

	rankedList[n][1]['rank']  = rank;
	runnerList[startnum].rank = rank;

	console.log("genrankedklist: startnum=" + startnum + ", totalTime=" + runnerList[startnum].totalTime
		    + ", rank=" + rank + ", isFinisher=" + runnerList[startnum].finisher);

	// here we update the html result table FIXME: do this in result.js
	// (which might need to be renamed to something like fillResuts.js)
	if (null !== document.getElementById('rank_' + startnum)) {
	    document.getElementById('rank_' + startnum).innerHTML = rank;
	}
	else if (true === runnerList[startnum].finisher) {
	    // update database with rank and finisher time
            setRankAndFinishtime(startnum);
	}
    }

    //    return rankedList;
    rankedRunnerList = rankedList;
}

export function prepareResultsTable(callback) {
    var aidStations  = [];

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
		//var aidEstimates = getAidstationNames(aidStations);
		//console.log(aidEstimates);

		console.log("=== checking runner #" + this.startnum + " ===");

		// check the results field if we have valid times for this runner/aid
		var results = this.results;
		console.log(results);

		// sort result list ... if VPn data for some reason was entered before VPn-1 (eg. entering data after the run)
		resultsList = sortResultObject(results);
		console.log('num results: ' + resultsList.length);

		$.each(resultsList, function(index, res) {
		    var aidId = isValidAid(res[0]) ? res[0] : "INVALID"; // validate aidId
		    var times = res[1];
		    var prevAidIdx = aidStations.findIndex(x => x.name === aidId) - 1;

		    console.log("AIDID: " + aidId + ":");
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

		    // fixme: we might skip the estimate calculation here as we only need actual results to get the ranking
		    if (results[aidId]) {
			//if ("FINISH" === aidId)
			//    return;
			//aidEstimates.shift(); // remove this aidstation

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
			lastpace = calcPace(lasttime, lastDist);

			// P2: avg between start and current aidstation in or out
			avgpace = calcPace(totaltime, totalDist);
		    }

		    if ("START" === aidId) {
			//tableContent += '<td>' + outtime  + '</td>';
			return true;
		    }
                    if ("FINISH" === aidId) {
			return true;
		    }
		    return true;
		});

		if (isFinisher(curStarter)) {
		    runnerList[curStarter].finisher = true;
		}

            }); // end each

	    rankedRunnerList = callback(runnerList);
	    console.log("rankedRunnerList:");
	    console.log(rankedRunnerList);
	});
    });
}
