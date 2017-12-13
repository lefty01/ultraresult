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
    var runnerNum = 1;


    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    var intime = "n/a";
	    var outtime = "n/a";
	    // todo ...
	    var pause = "00";
	    var pace = "6:00";
	    var avgpace = "6:30";

	    // check the results field if we have valid times for this runner/aid
	    var results = this.results;
	    // for each aidstation ... aka $each(this.results, function() { ... })
	    $.each(results, function(aidId, times) {
		console.log(aidId + ": " + times);

		if (results[aidId]) {
		    console.log('fillStarterTable: ' + aidId + ' valid: ' + results[aidId].intime_valid);
		    console.log('fillStarterTable: ' + aidId + ' time:  ' + results[aidId].intime);
		    // if time's valid make input read-only and change color
		    if ("true" === results[aidId].intime_valid) {
			intime = results[aidId].intime;
		    }
		    if ("true" === results[aidId].outtime_valid) {
			outtime = results[aidId].outtime;
		    }
		}

		
	    });

	    
            tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
	    tableContent += '<td>' + this.startnum  + '</td>'; // place
	    tableContent += '<td>' + this.firstname + '</td>';
            tableContent += '<td>' + this.lastname  + '</td>';

            tableContent += '<td align="center">' + intime  + '</td>';
            tableContent += '<td align="center">' + outtime + '</td>';
            tableContent += '<td align="center">' + pause   + '</td>';
            tableContent += '<td align="center">' + pace    + '</td>';
            tableContent += '<td align="center">' + avgpace + '</td>';

            tableContent += '</tr>';
            runnerNum++;
        });

        // Inject the whole content string into our existing HTML table
        $('#resultstable table tbody').html(tableContent);


    });
}
