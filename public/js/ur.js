
// DOM Ready =============================================================
$(document).ready(function() {

    var now = date();
    
    // window.onload = function() {
    // 	date();
    // }
    //setInterval(function() { date(); }, 10000);
    //setInterval(date, 5000);

    if (document.title === "aidstation not found") {
        alert("aidstation not found: " + $("aid").attr("id"));
    } else {
        // fill table and make it sortable
        fillStarterTable(document.title, now);
	//var tableObj = document.getElementById('starterList');
	var tableObj = document.getElementById('startlist-table');
        sorttable.makeSortable(tableObj);
    }

    //showAidstations();

    // load/store buttons - FIXME really need?
    //$('#btnLoad').on('click', storeAidTime);

    
    //$("div.tinput").html(now);
    //alert(now);

});


$(document).on('click', function (e) {
    var target = $(e.target);
    var aidId = $("aid").attr("id");

    if (target.is('.makeNonEditable')) {
        e.preventDefault(); // cancel the event flow
        var setId = target.data('setid');
        var res = setId.split("_"); // t[in|out]_set_NN
        var inout = res[0];
        var startnum = res[2];
	//var isIn = res[0] === "tin" ? true : false;
        
        var time = $("input#" + inout + "_" + startnum).val();
        
        var data = {
            'startnum' : startnum,
            'aid'      : aidId,
            'inout'    : inout, // tin or tout
            'setId'    : inout + "_" + startnum,
            'setRoId'  : inout + "ro_"  + startnum, // eg. tinro_1
            'time'     : time
        };

        //alert("save time for no: " + startnum + " inout=" + inout + 
	//      " @ aid=" + aidId + " time=" + time);
        saveTimeClick(data);

    } else if (target.is('.makeEditable')) {
        e.preventDefault();
        var editId = target.data('editid');
        var res = editId.split("_"); // t[in|out]_edit_NN
	var inout = res[0];
        var startnum = res[2];
        var data = {
            'startnum' : startnum,
            'aid'      : aidId,
	    'inout'    : inout,
            'editId'   : res[0] + "_" + res[2],
            'editRoId' : res[0] + "ro_"  + res[2],
	    'time'     : time
        };

        editTimeClick(data);
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

    //$("div.tinput").html(now);

    $("input.tinput").each(function(index) {
	// index: 0 .. last element
	if (! $(this).prop("readonly")) {
	    $(this).val(now);
	}
    });
    //setTimeout(date, 15000);
    return now;
}


// the ButtonClick functions to lock/unlock the input fields
// background changed to red if locked/ green if editable
// can save in or out times, set this time as valid and lock input field,
// click on edit to invalidate and change value again
function saveTimeClick(data) {
    var setId = data.setId;
    var setRoId = data.setRoId;
    var aid = data.aid;
    
    $("#"+setId).prop("readonly", "readonly");
    $("#"+setId).css("background-color", "#CC6666");
    $("#"+setRoId).val("1"); // lock (make read-only)

    // if ( "1" === $("#"+setRoId)) {
    // 	console.log("read-only already ... do not save again!");
    // }

    // store time in database ...
    // mark the time as valid, edit will invalidate the time again
    var aidstation = {
	'inout'      : data.inout,
	'time_valid' : true,
	'aid'        : data.aid,
        'time'       : data.time
    };

    $.ajax({
        type: 'PUT',
        dataType: 'JSON',
        data: aidstation,
        url: '/runners/update/' + data.startnum
    }).done(function( response ) {
        // Check for a successful (blank) response
        if (response.msg === '') {
	    console.log("update runner OK!");
        }
        else {
            alert('Error: ' + response.msg);
        }
	// do somthing like update the table
        // update();
    });
}

function editTimeClick(data) {
    var editId = data.editId;
    var editRoId = data.editRoId;
    var aid = data.aid;
    //alert("edit button click: editId=" + editId);

    $("#"+editId).prop("readonly", false);
    $("#"+editId).css("background-color", "#99FFCC");
    $("#"+editRoId).val("0"); // unlock

    var aidstation = {
	'inout'      : data.inout,
	'time_valid' : false,
	'time'       : data.time,
	'aid'        : data.aid
    };

    $.ajax({
        type: 'PUT',
        dataType: 'JSON',
        data: aidstation,
        url: '/runners/update/' + data.startnum
    }).done(function( response ) {
        // Check for a successful (blank) response
        if (response.msg === '') {
	    console.log("update runner OK!");
        }
        else {
            alert('Error: ' + response.msg);
        }
	// do somthing like update the table
        // update();
    });
}


function fillStarterTable(docTitle, thetime) {
    var aidId = $("aid").attr("id");
    var matchVP = /^(VP)\d\d?$/i;
    var matchStart = /^START$/i;
    var matchFinish = /^FINISH$/i;
    var isAidstation = matchVP.test(aidId);
    var isStart = matchStart.test(aidId);
    var isFinish = matchFinish.test(aidId);
    var tableContent = '';
    var runnerNum = 1;

    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    var intime = thetime;
	    var outtime = thetime;
	    var inro = "0";
	    var outro = "0";
	    var inreadonly = "";
	    var outreadonly = "";

	    // check the results field if we have valid times for this runner/aid
	    // if valid time is available set input field and mark as readonly
	    var results = this.results;
	    if (results[aidId]) {
		// if time's valid make input read-only (and todo: change color)
		if ("true" === results[aidId].intime_valid) {
		    intime = results[aidId].intime;
		    inro = "1";
		    inreadonly = "readonly";
		}
		if ("true" === results[aidId].outtime_valid) {
		    outtime = results[aidId].outtime;
		    outro = "1";
		    outreadonly = "readonly";
		}
		console.log('fillStarterTable: ' + aidId + ' in valid:  ' + results[aidId].intime_valid);
		console.log('fillStarterTable: ' + aidId + ' in time:   ' + results[aidId].intime);
		console.log('fillStarterTable: ' + aidId + ' out valid: ' + results[aidId].outtime_valid);
		console.log('fillStarterTable: ' + aidId + ' out time:  ' + results[aidId].outtime);
	    }
	    
            tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
            tableContent += '<td>' + this.firstname + '</td>';
            tableContent += '<td>' + this.lastname  + '</td>';

	    if (! isStart) {
		tableContent += '<td align="center"><input id="tin_' + this.startnum
                    + '" class="tinput" type="text" maxlength="5" size="5" value="' + intime + '" '+ inreadonly+'>'
                    + '<input type="hidden" id="tinro_' + this.startnum + '" value="' + inro + '"></td>';
		// FIXME: data- does not require set or edit info since we have the class already
		tableContent += '<td><button data-setid="tin_set_' + this.startnum + '"'
                    + ' class="makeNonEditable">Save</button></td>';
		tableContent += '<td><button data-editid="tin_edit_' + this.startnum + '"'
                    + ' class="makeEditable">Edit</button></td>';
	    }
            if (! isFinish) {
                tableContent += '<td align="center"><input id="tout_' + this.startnum
                    + '" class="tinput" type="text" maxlength="5" size="5" value="' + outtime + '"'+outreadonly+'>'
                    + '<input type="hidden" id="toutro_' + this.startnum + '" value="' + outro + '"></td>';

                tableContent += '<td><button data-setid="tout_set_' + this.startnum + '"'
                    + ' class="makeNonEditable">Save</button></td>';
                tableContent += '<td><button data-editid="tout_edit_' + this.startnum + '"'
                    + ' class="makeEditable">Edit</button></td>';
            }

            tableContent += '</tr>';
            runnerNum++;
        });

        // Inject the whole content string into our existing HTML table
        $('#starterList table tbody').html(tableContent);

	// FIXME:  most likely we need to do this after table is fully shown ...
	//         so we could save the runner Ids that have valid times in database
	//         to some list then iterate over the list here ...
	// $("#"+setId).prop("readonly", "readonly");
	// $("#"+setId).css("background-color", "#CC6666");
	// $("#"+setRoId).val("1"); // lock (make read-only)

    });
}

function showAidstations() {

    $.getJSON( '/aid/', function(data) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function() {

        });
    });
}

//    $.getJSON( '/aid/' + aidId, function(data) {
