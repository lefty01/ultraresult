// results.js display leaderboard
// calculate pace and avg. pace, ...



// DOM Ready =============================================================
$(document).ready(function() {

    var now = date();
    
    if (document.title === "results not found") {
        alert("no results found!");
    } else {
        // fill table and make it sortable
        //fillResultTableX(document.title, now);
        fillResultTable();
	
	var tableObj = document.getElementById('results-table');
        sorttable.makeSortable(tableObj);
    }

});



/*
 * set current time (hh:mm) in tinput fields
 */
function date() {
    var t_current = new Date();
    var t_hh  = t_current.getHours();
    var t_mm  = t_current.getMinutes();
    var t_day = t_current.getDay(); // 6=saturday, 0=sunday

    if (t_mm < 10) t_mm = "0" + t_mm;
    if (t_hh < 10) t_hh = "0" + t_hh;

    var now = t_hh + ":" + t_mm;

    $("input.tinput").each(function(index) {
	// index: 0 .. last element
	if (! $(this).prop("readonly")) {
	    $(this).val(now);
	}
    });
    return now;
}


function hhmmSubstract(tin, tout) {
    var intime  = tin.split(':');
    var outtime = tout.split(':');

    if (intime[0] > outtime[0]) {
	outtime[0] = outtime[0] + 24;
    }
    var minsdiff = parseInt(outtime[0], 10) * 60 + parseInt(outtime[1], 10) -
                   parseInt(intime[0],  10) * 60 - parseInt(intime[1],  10);

    var result = String(100 + Math.floor(minsdiff / 60)).substr(1) + ':' +
                 String(100 + minsdiff % 60).substr(1);
    return result;
}
// expect t to be a string "hh:mm", d is distance in km
function calcPace(t, d) {
    var intime = t.split(':');
    //console.log("intime h="+intime[0]+", intime m="+intime[1]);

    var mins = parseInt(intime[0], 10) * 60 + parseInt(intime[1], 10); //intime[0] * 60 + intime[1];
    var pace = mins / d;
    //console.log("pace="+pace);
    var result = Math.floor(pace) + ":" + Math.floor(60 * (pace - Math.floor(pace)));
    return result;
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
    tableHeader += '<th class="sortable_numeric">#</th>';
    tableHeader += '<th class="sortable_numeric">Rang</th>';
    tableHeader += '<th class="name">Name</th>';
    tableHeader += '<th class="starttime">Start</th>';

    
    // fill the table header with aidstation info
    // note: /aid returns data sorted by total distance
    $.getJSON('/aid', function(data) {
        $.each(data, function() {
	    //console.log("aid data: " + this.name);
	    aidStations.push(this);

	    if ('START' === this.name) { return true; }
	    if ('FINISH' === this.name) {
		// colspan number of cells in finish coloumn: in, last pace, avg. pace, last time
		tableHeader += '<th colspan="4">' + this.name + ' ' + this.directions +
		    ', @' + this.totalDistance.toFixed(1) + ',  &Delta; ' + this.legDistance.toFixed(1) + '</th>';
		return true;
	    }
	    tableHeader += '<th colspan="7" id="' + this.name + '">' + this.name + ' '
		+ this.directions + ', @km ' + this.totalDistance.toFixed(1) + ',  &Delta; ' + this.legDistance.toFixed(1) + '</th>';
	    return true;
	});
    });


    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    var intime    = "n/a";
	    var outtime   = "n/a";
	    // todo ...
	    var pause     = "n/a";
	    var lastpace  = "n/a";
	    var avgpace   = "n/a";
	    var lasttime  = "n/a";
	    var totaltime = "n/a";
	    var place     = 'n/a';

	    tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
	    tableContent += '<td>' + place + '</td>'; // place
	    tableContent += '<td>' + this.firstname + ' ' + this.lastname + '</td>';

	    console.log("=== checking runner #" + this.startnum + " ===");

	    // check the results field if we have valid times for this runner/aid
	    var results = this.results;
	    // for each aidstation ... aka $each(this.results, function() { ... }) -> aidstations that are stored with runner!
	    // todo/fixme: interate over ALL aidstations $.each(aidStations, function() { .. }
	    // then check for each start/aid/finish if there are times for this runner ...
	    $.each(aidStations, function() {
		console.log("aidstation name: " + this.name + " - " + this.directions);
		console.log("aidstation  @km: " + this.totalDistance.toFixed(1));
		console.log("aidstation  Δkm: " + this.legDistance.toFixed(1));
		
		if ('START'  === this.name) { return true; }
		if ('FINISH' === this.name) {
			//...
		    return true;
		}
		// ...
		return true;
	    });


	    // fixme: not sorted! ... if vp3 data for some reason was entered before vp2 (eg. entering data after the run)
	    $.each(results, function(aidId, times) {
		console.log(aidId + ": " + times);
		pause = "n/a";

		if (results[aidId]) {
		    console.log('fillStarterTable: ' + aidId + ' in valid:  ' + results[aidId].intime_valid);
		    console.log('fillStarterTable: ' + aidId + ' in time:   ' + results[aidId].intime);
		    console.log('fillStarterTable: ' + aidId + ' out valid: ' + results[aidId].outtime_valid);
		    console.log('fillStarterTable: ' + aidId + ' out time:  ' + results[aidId].outtime);

		    intime  = (true === results[aidId].intime_valid)  ? results[aidId].intime  : "n/a";
		    outtime = (true === results[aidId].outtime_valid) ? results[aidId].outtime : "n/a";

		    if ((true === results[aidId].outtime_valid) &&
			(true === results[aidId].intime_valid)) {
			pause = hhmmSubstract(intime, outtime);
			console.log('fillStarterTable: ' + aidId + ' pause:     ' + pause);
			//console.log(moment.duration(moment(results[aidId].outtime).subtract(moment.duration(results[aidId].intime))));
			//console.log(moment(results[aidId].intime));
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
			    console.log('last out: ' + results[prevAid.name].outtime);
			    console.log('this  in: ' + results[aidId].intime);
			    lasttime = hhmmSubstract(results[prevAid.name].outtime, results[aidId].intime);
			    totaltime = hhmmSubstract(results["START"].outtime, results[aidId].intime);
			}
		    }
		    // calc pace ...
		    // P1: avg. pace between aid stations
		    var lastDist = aidStations.find(x => x.name === aidId).legDistance;
		    var totalDist = aidStations.find(x => x.name === aidId).totalDistance;
		    console.log("lasttime=" + lasttime + ", totaltime=" + totaltime);
		    console.log("lastDist=" + lastDist + ", totalDist=" + totalDist);
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
	tableHeader += '<th>P<sub>1</sub></th>';
	tableHeader += '<th>P<sub>2</sub></th>';
	tableHeader += '</tr>';

	$('#resultstable table thead').html(tableHeader);
	$('#resultstable table caption').html(tableCaption);
	$('#resultstable table tbody').html(tableContent);
    });

}

//function fillResultTableX(docTitle, thetime) {

        // th(class="sorttable_numeric") Start #
        // th(class="sorttable_numeric") Place
        // th Name
        // th Lastname
	// th Start
        // th(class="sorttable_nosort") In  (hh:mm)
        // th(class="sorttable_nosort") Out (hh:mm)
        // th(class="sorttable_nosort") Pause (min)
        // th(class="sorttable_nosort") Pace
        // th(class="sorttable_nosort") Avg Pace
   // <tr>
   //  <th>#</th>

   //  <th class="vp" colspan="7" id="vp1">VP1 Atdorf,            @mi 17.5,  Δ 17.5</th>
   //  <th class="vp" colspan="7" id="vp2">VP2 Nufringen,         @mi 32.7,  Δ 15.22</th>
   //  <th class="vp" colspan="7" id="vp3">VP3 Entringen,         @mi 46.7,  Δ 13.98</th>
   //  <th class="vp" colspan="7" id="vp4">VP4 Tü Rittweg,   @mi 59.7,  Δ 12.99</th>
   //  <th class="vp" colspan="7" id="vp5">VP5 Anders,            @mi 69.9,  Δ 10.25</th>
   //  <th class="vp" colspan="7" id="vp6">VP6 Steinbrennerhaus,  @mi 83.5,  Δ 13.55</th>
   //  <th class="vp" colspan="7" id="vp7">VP7 Teufelsbruch,      @mi 96.8,  Δ 13.36</th>
   //  <th class="vp" colspan="5" id="vp8">Ziel Dettenhausen,     @mi 103.5, Δ 6.71</th>

   //  <th class="total">Total</th>
   //  <th>Urkunde</th>
   // </tr></thead>
