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

// prev php code snippet to calc with string times hh:mm eg. substract
// // subtract t1 - t2
// // return string hh:mm
// function hhmmSubtract($t1, $t2) {
//   $in  = explode(':', $t1);
//   $out = explode(':', $t2);

//   if ($in[0] < $out[0]) $in[0] += 24;
//   $total[0] = $in[0] - $out[0];

//   if ($in[1] < $out[1]) {
//     $in[1]    += 60;
//     $total[0] -= 1;
//   }
//   $total[1] = $in[1] - $out[1];

//   return sprintf("%02d:%02d", $total[0], $total[1]);
// }


function hhmmSubstract(t1, t2) {
    var int = t1.split(':');
    var out = t2.split(':');

    if (int[0] > out[0]) {
	out[0] = out[0] + 24;
    }
    var minsdiff = parseInt(out[0], 10) * 60 + parseInt(out[1], 10) -
	           parseInt(int[0], 10) * 60 - parseInt(int[1], 10);

    var result = String(100 + Math.floor(minsdiff / 60)).substr(1) + ':' +
                 String(100 + minsdiff % 60).substr(1);
    return result;
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

    // <caption>T<sub>1</sub>(hh:mm): Zeit zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub> , &nbsp;
    //      T<sub>2</sub>(hh:mm): Zeit zwischen Start und VP<sub>n<sub>Tin</sub></sub> , &nbsp;
    //      P<sub>1</sub>(mm:ss/km): &#216; Pace zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub> , &nbsp;
    // 	   P<sub>2</sub>(mm:ss/km): &#216; Pace zwischen Start und VP<sub>n<sub>Tin</sub></sub></caption>

    
    // fill the table header with aidstation info
    $.getJSON('/aid', function(data) {
        $.each(data, function() {
	    //console.log("aid data: " + this.name);
	    aidStations.push(this);

	    if ('START' === this.name) { return true; }
	    if ('FINISH' === this.name) {
		// colspan number of cells in finish coloumn: in, last pace, avg. pace, last time
		tableHeader += '<th colspan="4">' + this.name + ' ' + this.directions +
		    ', @' + this.totalDistance.toFixed(0) + ',  &Delta; ' + this.legDistance.toFixed(0) + '</th>';
		return true;
	    }
	    tableHeader += '<th colspan="7" id="' + this.name + '">' + this.name + ' '
		+ this.directions + ', @km ' + this.totalDistance.toFixed(0) + ',  &Delta; ' + this.legDistance.toFixed(0) + '</th>';
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


	    
	    $.each(results, function(aidId, times) {
		console.log(aidId + ": " + times);

		if (results[aidId]) {
		    console.log('fillStarterTable: ' + aidId + ' in valid:  ' + results[aidId].intime_valid);
		    console.log('fillStarterTable: ' + aidId + ' in time:   ' + results[aidId].intime);
		    console.log('fillStarterTable: ' + aidId + ' out valid: ' + results[aidId].outtime_valid);
		    console.log('fillStarterTable: ' + aidId + ' out time:  ' + results[aidId].outtime);

		    intime  = (true === results[aidId].intime_valid)  ? results[aidId].intime  : "n/a";
		    outtime = (true === results[aidId].outtime_valid) ? results[aidId].outtime : "n/a";

		    pause = hhmmSubstract(intime, outtime);
		    console.log('fillStarterTable: ' + aidId + ' pause:     ' + pause);

		    if (("true" === results[aidId].outtime_valid) &&
			("true" === results[aidId].intime_valid)) {
                       //outtime = results[aidId].outtime;
                    //   pause = results[aidId].outtime - results[aidId].intime;
                       //console.log(results[aidId].outtime + " - " + results[aidId].intime);
                       //console.log(moment.duration(moment(results[aidId].outtime).subtract(moment.duration(results[aidId].intime))));
                       //pause = 
                       //console.log(moment(results[aidId].intime));
                    }

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
		tableContent += '<td>' + totaltime + '</td>';
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
