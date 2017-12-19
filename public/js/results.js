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

function fillResultTable() {
    var tableContent = "";
    var tableHeader = '';
    var aidStations = [];

    tableHeader += '<tr>';
    tableHeader += '<th class="sortable_numeric">#</th>';
    tableHeader += '<th class="sortable_numeric">Rang</th>';
    tableHeader += '<th class="name">Name</th>';
    tableHeader += '<th class="starttime">Start</th>';

    // fill the table header with aidstation info
    $.getJSON('/aid', function(data) {
        $.each(data, function() {
	    //console.log("aid data: " + this.name);
	    aidStations.push(this);

	    if ('START' === this.name) { return true; }
	    if ('FINISH' === this.name) {
		// colspan number of cells in finish coloumn: in, last pace, avg. pace, last time
		tableHeader += '<th colspan="4">' + this.name + ' ' + this.directions + 
		    ', @' + this.totalDistance + ',  &Delta; ' + this.legDistance + '</th>';
		return true;
	    }
	    // for vp: colspan= in, out, pause, last pace, avg. pace, last time, total time
	    tableHeader += '<th colspan="7" id="' + this.name + '">' + this.name + ' '
		+ this.directions + ', @km ' + this.totalDistance + ',  &Delta; ' + this.legDistance + '</th>';
	});
    });


    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    var intime = "n/a";
	    var outtime = "n/a";
	    // todo ...
	    var pause = "n/a";
	    var lastpace = "n/a";
	    var avgpace = "n/a";
	    var lasttime = "n/a";
	    var totaltime = "n/a";
	    var place = 'n/a';

	    tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
	    tableContent += '<td>' + place + '</td>'; // place
	    tableContent += '<td>' + this.firstname + ' ' + this.lastname + '</td>';


	    // check the results field if we have valid times for this runner/aid
	    var results = this.results;
	    // for each aidstation ... aka $each(this.results, function() { ... }) -> aidstations that are stored with runner!
	    // todo/fixme: interate over ALL aidstations $.each(aidStations, function() { .. }
	    // then check for each start/aid/finish if there are times for this runner ...
	    $.each(aidStations, function() {
		console.log("aidstation name: " + this.name + " - " + this.directions);
		console.log("aidstation  @km: " + this.totalDistance);
		console.log("aidstation  Δkm: " + this.legDistance);
		
		if ('START'  === this.name) { return true; }
		if ('FINISH' === this.name) {
			//...
		    return true;
		}
		// ...

	    });


	    
	    $.each(results, function(aidId, times) {
		console.log(aidId + ": " + times);

		if (results[aidId]) {
		    console.log('fillStarterTable: ' + aidId + ' in valid:  ' + results[aidId].intime_valid);
		    console.log('fillStarterTable: ' + aidId + ' in time:   ' + results[aidId].intime);
		    console.log('fillStarterTable: ' + aidId + ' out valid: ' + results[aidId].outtime_valid);
		    console.log('fillStarterTable: ' + aidId + ' out time:  ' + results[aidId].outtime);

		    intime  = ("true" === results[aidId].intime_valid)  ? results[aidId].intime  : "n/a";
		    outtime = ("true" === results[aidId].outtime_valid) ? results[aidId].outtime : "n/a";
		    
		    // if ("true" === results[aidId].intime_valid) {
		    // 	intime = results[aidId].intime;
		    // }
		    // if ("true" === results[aidId].outtime_valid) {
		    // 	outtime = results[aidId].outtime;
		    // }
		}
		if ("START" === aidId) {
		    tableContent += '<td>' + outtime  + '</td>';
		    return true;
		}
		if ("FINISH" === aidId) {
		    tableContent += '<td>' + intime   + '</td>';
		    tableContent += '<td>' + lastpace + '</td>';
		    tableContent += '<td>' + avgpace  + '</td>';
		    tableContent += '<td>' + lasttime + '</td>';
		    return true;
		}
		tableContent += '<td>' + intime    + '</td>';
		tableContent += '<td>' + outtime   + '</td>';
		tableContent += '<td>' + pause     + '</td>';
		tableContent += '<td>' + lastpace  + '</td>';
		tableContent += '<td>' + avgpace   + '</td>';
		tableContent += '<td>' + lasttime  + '</td>';
		tableContent += '<td>' + totaltime + '</td>';
	    });

	    
            // tableContent += '<td align="center">' + intime  + '</td>';
            // tableContent += '<td align="center">' + outtime + '</td>';
            // tableContent += '<td align="center">' + pause   + '</td>';
            // tableContent += '<td align="center">' + pace    + '</td>';
            // tableContent += '<td align="center">' + avgpace + '</td>';

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
	    tableHeader += '<th>P<sub>1</sub></th>';
	    tableHeader += '<th>P<sub>2</sub></th>';
	    tableHeader += '<th>T<sub>1</sub></th>';
	    tableHeader += '<th>T<sub>2</sub></th>';
	});
	tableHeader += '<th>IN</th>';
	tableHeader += '<th>P<sub>1</sub></th>';
	tableHeader += '<th>P<sub>2</sub></th>';
	tableHeader += '<th>T<sub>1</sub></th>';
	tableHeader += '<th></th>';
	tableHeader += '</tr>';


	$('#resultstable table thead').html(tableHeader);
	$('#resultstable table tbody').html(tableContent);
    });

}


    // <caption>T<sub>1</sub>(hh:mm): Zeit zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub> , &nbsp;
    //      T<sub>2</sub>(hh:mm): Zeit zwischen Start und VP<sub>n<sub>Tin</sub></sub> , &nbsp;
    //      P<sub>1</sub>(mm:ss/km): &#216; Pace zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub> , &nbsp;
    // 	   P<sub>2</sub>(mm:ss/km): &#216; Pace zwischen Start und VP<sub>n<sub>Tin</sub></sub></caption>

	    

            // tableContent += '<td align="center">' + intime  + '</td>';
            // tableContent += '<td align="center">' + outtime + '</td>';
            // tableContent += '<td align="center">' + pause   + '</td>';
            // tableContent += '<td align="center">' + pace    + '</td>';
            // tableContent += '<td align="center">' + avgpace + '</td>';


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
