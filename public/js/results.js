// results.js display leaderboard
// calculate pace and avg. pace, ...



// DOM Ready =============================================================
$(document).ready(function() {

    var now = date();
    
    if (document.title === "results not found") {
        alert("no results found!");
    } else {
        // fill table and make it sortable
        fillResultTable(document.title, now);
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

function fillResultTable(docTitle, thetime) {

    var tableContent = '';
    var tableHeader = '';
    var runnerNum = 1;


    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    var intime = "n/a";
	    var outtime = "n/a";
	    // todo ...
	    var pause = "00";
	    var pace = "6:00";
	    var avgpace = "6:30";
	    var place = 'n/a';


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
		
	    tableHeader += '<tr><th class="sortable_numeric">#</th>';
	    tableHeader += '<th>Platz</th>';
	    tableHeader += '<th class="name">Vor-</th>';
	    tableHeader += '<th class="name">Nachname</th>';
	    tableHeader += '<th class="starttime">Start</th>';
	    tableHeader += '</tr>';

	    tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
	    tableContent += '<td>' + place + '</td>'; // place
	    tableContent += '<td>' + this.firstname + '</td>';
            tableContent += '<td>' + this.lastname  + '</td>';

	    // check the results field if we have valid times for this runner/aid
	    var results = this.results;
	    // for each aidstation ... aka $each(this.results, function() { ... })
	    $.each(results, function(aidId, times) {
		console.log(aidId + ": " + times);

		if (results[aidId]) {
		    //console.log('fillStarterTable: ' + aidId + ' valid: ' + results[aidId].intime_valid);
		    //console.log('fillStarterTable: ' + aidId + ' time:  ' + results[aidId].intime);
		    
		    if ("true" === results[aidId].intime_valid) {
			intime = results[aidId].intime;
		    }
		    if ("true" === results[aidId].outtime_valid) {
			outtime = results[aidId].outtime;
		    }
		}
		if ("Start" === aidId) {
		    tableContent += '<td>' + this.lastname  + '</td>';
		}
		
	    });

	    

            tableContent += '<td align="center">' + intime  + '</td>';
            tableContent += '<td align="center">' + outtime + '</td>';
            tableContent += '<td align="center">' + pause   + '</td>';
            tableContent += '<td align="center">' + pace    + '</td>';
            tableContent += '<td align="center">' + avgpace + '</td>';

            tableContent += '</tr>';
            runnerNum++;
        });

        // Inject the whole content string into our existing HTML table
        $('#resultstable table thead').html(tableHeader);
        $('#resultstable table tbody').html(tableContent);

    });
}
