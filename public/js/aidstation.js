// aidstation.js
// handle aidstation input save/edit, display runnerlist table for each aid


// DOM Ready =============================================================
$(document).ready(function() {

    var now = new Date();

    if (document.title === "aidstation not found") {
        alert("aidstation not found: " + $("aid").attr("id"));
    } else {
        // fill table and make it sortable
        fillStarterTable(document.title, now);
	var tableObj = document.getElementById('startlist-table');
        sorttable.makeSortable(tableObj);
    }

});


$(document).on('click', function (e) {
    var target = $(e.target);
    var aidId = $("aid").attr("id");
    var res;
    var inout;
    var startnum;
    var data;
    
    if (target.is('.makeNonEditable')) {
        e.preventDefault(); // cancel the event flow
        var setId = target.data('setid');
        res = setId.split("_"); // t[in|out]_set_NN
        inout = res[0]; // tin|tout
        startnum = res[2];
        
        var time = $("input#" + inout + "_" + startnum).val();
	var date = $("input#" + (inout === 'tin' ? 'tdin' : 'tdout') + "_" + startnum).val();
	console.log('date: ' + date);

        data = {
            'startnum' : startnum,
            'aid'      : aidId,
            'inout'    : inout, // tin or tout
            'setId'    : inout + "_" + startnum,
            'setRoId'  : inout + "ro_"  + startnum, // eg. tinro_1
            'time'     : time,
	    'date'     : date
        };

        //alert("save time for no: " + startnum + " inout=" + inout + 
	//      " @ aid=" + aidId + " time=" + time);
        saveTimeClick(data);

    } else if (target.is('.makeEditable')) {
        e.preventDefault();
        var editId = target.data('editid');
        res = editId.split("_"); // t[in|out]_edit_NN
	inout = res[0];
        startnum = res[2];
        data = {
            'startnum' : startnum,
            'aid'      : aidId,
	    'inout'    : inout,
            'editId'   : res[0] + "_" + res[2],
            'editRoId' : res[0] + "ro_"  + res[2],
	    'time'     : time,
	    'date'     : date
        };
        editTimeClick(data);
    }
});




function date2timeStr(d) {
    // validate d object
    // ...
    var d_hh = d.getHours();
    var d_mm = d.getMinutes();
    //var t_day = t_current.getDay(); // 6=saturday, 0=sunday
    if (d_mm < 10) d_mm = "0" + d_mm;
    if (d_hh < 10) d_hh = "0" + d_hh;

    return d_hh + ":" + d_mm;
}
function date2dateStr(d) {
    var d_MM = d.getMonth() + 1;
    var d_DD = d.getDate();
    var d_yy = String(d.getFullYear()).substr(2);

    if (d_MM < 10) d_MM = "0" + d_MM;
    if (d_DD < 10) d_DD = "0" + d_DD;

    return d_MM + "/" + d_DD + "/" + d_yy;
}


// the ButtonClick functions to lock/unlock the input fields
// background changed to red if locked/ green if editable
// can save in or out times, set this time as valid and lock input field,
// click on edit to invalidate and change value again
function saveTimeClick(data) {
    var setId   = data.setId;
    var setRoId = data.setRoId;
    var aid     = data.aid;
    
    $("#"+setId).prop("readonly", "readonly");
    $("#"+setId).css("background-color", "#FF2F2F59");
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
	    console.log("update runner " + data.startnum + " OK!");
        }
        else {
            alert('Error: ' + response.msg);
        }
	// do somthing like update the table
        // update();
    });
}

function editTimeClick(data) {
    var editId   = data.editId;
    var editRoId = data.editRoId;
    var aid      = data.aid;
    //alert("edit button click: editId=" + editId);

    $("#"+editId).prop("readonly", false);
    $("#"+editId).css("background-color", "#99FFCC");
    $("#"+editRoId).val("0"); // unlock

    var aidstation = {
	'inout'      : data.inout,
	'time_valid' : false,
	//'time'       : data.time, FIXME??? here
	'time'       : data.time.toJSON(),
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



// theDate is Date() object
function fillStarterTable(docTitle, theDate) {
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
	    var intime  = date2timeStr(theDate);
	    var outtime = date2timeStr(theDate);
	    var indate  = date2dateStr(theDate);//"10/13/18";
	    var outdate = date2dateStr(theDate);
	    var inro    = "0";
	    var outro   = "0";
	    var inreadonly  = "";
	    var outreadonly = "";
	    var roStyle = "";

	    // check the results field if we have valid times for this runner/aid
	    // if valid time is available set input field and mark as readonly
	    var results = this.results;
	    if (typeof results !== 'undefined' && results && results[aidId]) {
		// if time's valid make input read-only (and todo: change color)
		if (true == results[aidId].intime_valid) {
		    intime = results[aidId].intime; // FIXME: json-string-date to Date(): //intimeObj = new Date(results[aidId].intime);
		    inro = "1";
		    inreadonly = "readonly";
		    roStyle = ' style="background-color: #FF2F2F59" ';
		}
		if (true === results[aidId].outtime_valid) {
		    outtime = results[aidId].outtime; // FIXME: outtimeObj = new Date(results[aidId].outtime);
		    outro = "1";
		    outreadonly = "readonly";
		    roStyle = ' style="background-color: #FF2F2F59" ';
		}
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' in valid:  ' + results[aidId].intime_valid);
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' in time:   ' + results[aidId].intime);
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' out valid: ' + results[aidId].outtime_valid);
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' out time:  ' + results[aidId].outtime);
	    }
	    
            tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
            tableContent += '<td>' + this.firstname + '</td>';
            tableContent += '<td>' + this.lastname  + '</td>';

	    if (! isStart) {
		tableContent += '<td align="center"><input id="tdin_' + this.startnum + '" class="tdinput" type="text" maxlength="8" size="8" value="'
		    + indate + '" ' + inreadonly + roStyle + '/></td>';

		tableContent += '<td align="center"><input id="tin_' + this.startnum
                    + '" class="tinput" type="text" maxlength="5" size="5" value="' + intime + '" ' + inreadonly + roStyle + '>'
                    + '<input type="hidden" id="tinro_' + this.startnum + '" value="' + inro + '"></td>';
		// FIXME: data- does not require set or edit info since we have the class already
		tableContent += '<td><button data-setid="tin_set_' + this.startnum + '"'
                    + ' class="makeNonEditable">Save</button></td>';
		tableContent += '<td><button data-editid="tin_edit_' + this.startnum + '"'
                    + ' class="makeEditable">Edit</button></td>';
	    }
            if (! isFinish) {
		tableContent += '<td align="center"><input id="tdout_' + this.startnum + '" class="tdinput" type="text" maxlength="8" size="8" value="'
		    + outdate + '" ' + outreadonly + roStyle + '/></td>';

                tableContent += '<td align="center"><input id="tout_' + this.startnum
                    + '" class="tinput" type="text" maxlength="5" size="5" value="' + outtime + '"' + outreadonly + roStyle + '>'
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

    });
}

