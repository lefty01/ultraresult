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
    //console.log('click target: ' + target);
    console.log('aidId: ' + aidId);
    
    if (target.is('.makeNonEditable')) {
        e.preventDefault(); // cancel the event flow
        var setId = target.data('setid');
        res = setId.split("_"); // t[in|out]_set_NN
        inout = res[0]; // tin|tout
        startnum = res[2];
        
        var time = $("input#" + inout + "_" + startnum).val();
	var date = $("input#" + (inout === 'tin' ? 'tdin' : 'tdout') + "_" + startnum).val();
	console.log('date: ' + date);
	console.log('time: ' + time);
	var dateObj = input2dateObj(date, time);

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

    }
    else if (target.is('.makeEditable')) {
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
    else if (target.is('.dnfOrReset')) {
        e.preventDefault(); // cancel the event flow
        var setId = target.data('setid');
        res = setId.split("_"); // tin_[dnf|reset]_NN
        dnf_reset = res[1]; // dnf|reset
        startnum  = res[2];

	console.log('dnf_reset: ' + dnf_reset);
	console.log('startnum:  ' + startnum);
	if (dnf_reset === 'reset')
	    resetResultsClick(startnum);
	if (dnf_reset === 'dnf')
	    setDNFClick(startnum);
    }
});


function input2dateObj(date, time) {
    return new Date(date + " " + time);
}

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
    var d_YY = d.getFullYear();

    if (d_MM < 10) d_MM = "0" + d_MM;
    if (d_DD < 10) d_DD = "0" + d_DD;

    return d_YY + "-" + d_MM + "-" + d_DD;
}
// d = "4.10.2018, 22:55:23"
function json2timeStr(d) {
    var d1 = new Date(d); //.toLocaleString('de-DE');
    return date2timeStr(d1);
}
function json2dateStr(d) {
    var d1 = new Date(d);
    return date2dateStr(d1);
}


// the ButtonClick functions to lock/unlock the input fields
// background changed to red if locked/ green if editable
// can save in or out times, set this time as valid and lock input field,
// click on edit to invalidate and change value again
function saveTimeClick(data) {
    var setId   = data.setId;
    var setRoId = data.setRoId;
    var aid     = data.aid;
    var setIdDate = "td" + setId.slice(1, 10);
    $("#"+setId).prop("readonly", "readonly");
    $("#"+setId).css("background-color", "#FF2F2F59");
    $("#"+setIdDate).prop("readonly", "readonly");
    $("#"+setIdDate).css("background-color", "#FF2F2F59");
    $("#"+setRoId).val("1"); // lock (make read-only)


    // store time in database ...
    // mark the time as valid, edit will invalidate the time again
    var aidstation = {
	'startnum'   : data.startnum,
	'inout'      : data.inout,
	'time_valid' : true,
	'aid'        : data.aid,
        'time'       : data.time,
	'date'       : data.date
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

// FIXME: consider changing to current date/time if edit is clicked!?
function editTimeClick(data) {
    var editId   = data.editId;   // eg. tout_7, tin_1
    var editRoId = data.editRoId; //     toutro_7
    var aid      = data.aid;
    //alert("edit button click: editRoId=" + editRoId);

    // get Id for date tout_1 -> tdout_1
    var editIdDate = "td" + editId.slice(1, 10);

    $("#"+editId).prop("readonly", false);
    $("#"+editId).css("background-color", "#99FFCC");
    $("#"+editIdDate).prop("readonly", false);
    $("#"+editIdDate).css("background-color", "#99FFCC");
    $("#"+editRoId).val("0"); // unlock

    var aidstation = {
	'startnum'   : data.startnum,
	'inout'      : data.inout,
	'time_valid' : false,
	'time'       : data.time, //FIXME??? here
	//'time'       : data.time.toJSON(),
	'date'       : data.date,
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

function resetResultsClick(startnum) {
    var valid = /^\d{1,3}$/.test(startnum);
    if (! valid) {
	return false; // fixme handle error
    }

    console.log("trying to reset results for runner: " + startnum);

    $.ajax({
        type: 'PUT',
        dataType: 'JSON',
	data: {},
        url: '/runners/resetresult/' + startnum
    }).done(function(response) {
        // Check for a successful (blank) response
        if (response.msg === '') {
	    console.log("reset runner OK!");
	    alert('OK!');
        }
        else {
            alert('Error: ' + response.msg);
        }
    });
}

function setDNFClick(startnum) {
    var valid = /^\d{1,3}$/.test(startnum);
    if (! valid) {
	return false; // fixme handle error
    }

    console.log("trying to set DNF for runner: " + startnum);

    $.ajax({
        type: 'PUT',
        dataType: 'JSON',
	data: {},
        url: '/runners/setdnf/' + startnum
    }).done(function(response) {
        // Check for a successful (blank) response
        if (response.msg === '') {
	    console.log("DNF for runner OK!");
	    alert('OK!');
        }
        else {
            alert('Error: ' + response.msg);
        }
    });
}

// theDate is Date() object
function fillStarterTable(docTitle, theDate) {
    var aidId = $("aid").attr("id");
    var matchVP = /^(VP)\d\d?$/i;
    var matchStart = /^START$/i;
    var matchFinish = /^FINISH$/i;
    var matchDNF = /^DNF$/i;
    var isAidstation = matchVP.test(aidId);
    var isStart = matchStart.test(aidId);
    var isFinish = matchFinish.test(aidId);
    var isDnf = matchDNF.test(aidId);
    var tableContent = '';
    var runnerNum = 1;

    $.getJSON('/runners', function(data) {
        $.each(data, function() {
	    // initially fill date/time with current date/time via theDate obj,
	    // will be overwritten below if we have stored data
	    var intime  = date2timeStr(theDate);
	    var outtime = date2timeStr(theDate);
	    var indate  = date2dateStr(theDate);// eg. "2018-10-13"
	    var outdate = date2dateStr(theDate);
	    var inro    = "0";
	    var outro   = "0";
	    var inreadonly  = "";
	    var outreadonly = "";
	    var inStyle  = ""; //' style="background-color: #99FFCC" ';
	    var outStyle = ""; //' style="background-color: #99FFCC" ';
	    //var roStyle = ' style="background-color: #99FFCC" ';
	    var roStyle = "";

	    // check the results field if we have valid times for this runner/aid
	    // if valid time is available set input field and mark as readonly
	    var results = this.results;
	    if (typeof results !== 'undefined' && results && results[aidId]) {
		// if time's valid make input read-only (and todo: change color)
		if (true == results[aidId].intime_valid) {
// FIXME: json-string-date to Date(): //intime = json2timeStr(results[aidId].intime) / indate = ...
		    // intime = json2timeStr(results[aidId].intime);
		    // indate = json2dateStr(results[aidId].intime);
		    intime = results[aidId].intime;
		    indate = results[aidId].indate;
		    inro = "1";
		    inreadonly = "readonly";
		    inStyle = ' style="background-color: #FF2F2F59" ';
		}
		else
		    inStyle = ' style="background-color: #99FFCC" ';
		if (true === results[aidId].outtime_valid) {
		    outtime = results[aidId].outtime; // FIXME: outtimeObj = new Date(results[aidId].outtime);
		    outdate = results[aidId].outdate;
		    outro = "1";
		    outreadonly = "readonly";
		    outStyle = ' style="background-color: #FF2F2F59" ';
		}
		else
		    outStyle = ' style="background-color: #99FFCC" ';
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' in valid:  ' + results[aidId].intime_valid);
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' in time:   ' + results[aidId].intime);
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' out valid: ' + results[aidId].outtime_valid);
		console.log('fillStarterTable (runner=' + this.startnum + '): ' + aidId + ' out time:  ' + results[aidId].outtime);
	    }
	    
            tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
            tableContent += '<td>' + this.firstname + '</td>';
            tableContent += '<td>' + this.lastname  + '</td>';

	    // FIXME: below maxlength/size is hardcoded to 10 to match date format of yyyy-mm-dd
	    if (! isStart && ! isDnf) {
		tableContent += '<td align="center"><input id="tdin_' + this.startnum + '" class="tdinput" type="date" value="'
		    + indate + '" ' + inreadonly + inStyle + '/></td>';

		tableContent += '<td align="center"><input id="tin_' + this.startnum
                    + '" class="tinput" type="time" value="' + intime + '" ' + inreadonly + inStyle + '>'
                    + '<input type="hidden" id="tinro_' + this.startnum + '" value="' + inro + '"></td>';
		// FIXME: data- does not require set or edit info since we have the class already
		tableContent += '<td><button data-setid="tin_set_' + this.startnum + '"'
                    + ' class="makeNonEditable">Save</button></td>';
		tableContent += '<td><button data-editid="tin_edit_' + this.startnum + '"'
                    + ' class="makeEditable">Edit</button></td>';
	    }
            if (! isFinish && ! isDnf) {
		tableContent += '<td align="center"><input id="tdout_' + this.startnum + '" class="tdinput" type="date" value="'
		    + outdate + '" ' + outreadonly + outStyle + '/></td>';

                tableContent += '<td align="center"><input id="tout_' + this.startnum
                    + '" class="tinput" type="time" value="' + outtime + '"' + outreadonly + outStyle + '>'
                    + '<input type="hidden" id="toutro_' + this.startnum + '" value="' + outro + '"></td>';

                tableContent += '<td><button data-setid="tout_set_' + this.startnum + '"'
                    + ' class="makeNonEditable">Save</button></td>';
                tableContent += '<td><button data-editid="tout_edit_' + this.startnum + '"'
                    + ' class="makeEditable">Edit</button></td>';
            }
	    if (isDnf) {
		tableContent += '<td align="center"><input id="tdin_' + this.startnum + '" class="tdinput" type="date" value="'
		    + indate + '" ' + inreadonly + outStyle + '/></td>';

		tableContent += '<td align="center"><input id="tin_' + this.startnum
                    + '" class="tinput" type="time" value="' + intime + '" ' + inreadonly + outStyle + '>'
                    + '<input type="hidden" id="tinro_' + this.startnum + '" value="' + inro + '"></td>';
		tableContent += '<td><button data-setid="tin_dnf_' + this.startnum + '"'
                    + ' class="dnfOrReset">DNF</button></td>';
		tableContent += '<td><button data-setid="tin_reset_' + this.startnum + '"'
                    + ' class="dnfOrReset">RESET</button></td>';
	    }

            tableContent += '</tr>';
            runnerNum++;
        });

        // Inject the whole content string into our existing HTML table
        $('#starterList table tbody').html(tableContent);

    });
}

