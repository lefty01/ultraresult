

// DOM Ready =============================================================
$(document).ready(function() {


    window.onload = function() {
	    date();
    },
    setInterval(function() { date(); }, 10000);

    if (document.title === "aidstation not found") {
        alert("aidstation not found: " + $("aid").attr("id"));
    } else {
        // fill table and make it sortable
        fillStarterTable(document.title);
        var tableObj = document.getElementById('starterList');
        sorttable.makeSortable(tableObj);
    }

    //showAidstations();

    // load/store buttons - FIXME really need?
    //$('#btnLoad').on('click', storeAidTime);
});


$(document).on('click', function (e) {
    var target = $(e.target);
    var aidId = $("aid").attr("id");

    if (target.is('.makeNonEditable')) {
        e.preventDefault(); // cancel the event flow
        var setId = target.data('setid');
        var res = setId.split("_"); // t[in|out]_set_NN
	    var isIn = res[0] === "tin" ? true : false;
        var startnum = res[2];
        var inout = {
            'startnum' : startnum,
            'aid'      : aidId,
            'setId'    : res[0] + "_" + res[2],
            'setRoId'  : res[0] + "ro_"  + res[2] // tinro_1
        };

        //alert("save time for no: " + startnum + " isIn=" + isIn + " @ aid=" + aidId);
        saveTimeClick(inout);

    } else if (target.is('.makeEditable')) {
        e.preventDefault();
        var editId = target.data('editid');
        var res = editId.split("_"); // t[in|out]_set_NN
        var startnum = res[2];
        var inout = {
            'startnum' : startnum,
            'aid'      : aidId,
            'editId'    : res[0] + "_" + res[2],
            'editRoId'  : res[0] + "ro_"  + res[2] // toutro_1
        };

        editTimeClick(inout);
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
}


// the ButtonClick functions to lock/unlock the input fields
// background changed to red if locked/ green if editable
// in case of save we submit data if in and out times are both locked
function saveTimeClick(data) {
	var setId = data.setId;
    var setRoId = data.setRoId;
    //alert("set button click: setId=" + setId);

	$("#"+setId).prop("readonly", "readonly");
	$("#"+setId).css("background-color", "#CC6666");
	$("#"+setRoId).val("1"); // lock (make read-only)


    // store time in database ...
    // mark the time as valid, edit will invalidate the time again
}

function editTimeClick(data) {
	var editId = data.editId;
    var editRoId = data.editRoId;
    //alert("edit button click: editId=" + editId);

	$("#"+editId).prop("readonly", false);
	$("#"+editId).css("background-color", "#99FFCC");
	$("#"+editRoId).val("0"); // unlock
}


function fillStarterTable(docTitle) {

    var aidId = $("aid").attr("id");
    //alert("aid id: " + aidId);
    var match = /^(VP)\d$/i;
    var isAidstation = match.test(aidId);
    
    var tableContent = '';
    var runnerNum = 1;

    // FIXME: get aidstation times from database,
    // check some time valid flag and load into tinput and then lock the field (tinro_NN="1")

    $.getJSON('/runners', function(data) {
        $.each(data, function() {
            tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
            tableContent += '<td>' + this.firstname + '</td>';
            tableContent += '<td>' + this.lastname  + '</td>';

            tableContent += '<td align="center"><input id="tin_' + this.startnum
                + '" class="tinput" type="text" maxlength="5" size="5">'
                + '<input type="hidden" id="tinro_' + this.startnum + '" value="0"></td>';
            // FIXME: data- does not require set or edit info since we have the class already
            tableContent += '<td><button data-setid="tin_set_' + this.startnum + '"'
                + ' class="makeNonEditable">Save</button></td>';
            tableContent += '<td><button data-editid="tin_edit_' + this.startnum + '"'
                + ' class="makeEditable">Edit</button></td>';

            if (isAidstation) {
                tableContent += '<td align="center"><input id="tout_' + this.startnum
                    + '" class="tinput" type="text" maxlength="5" size="5">'
                    + '<input type="hidden" id="toutro_' + this.startnum + '" value="0"></td>';

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

function showAidstations() {

    $.getJSON( '/aid/', function(data) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function() {

        });
    });
}

//    $.getJSON( '/aid/' + aidId, function(data) {
