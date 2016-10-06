

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

    if (target.is('.makeNonEditable')) {
        e.preventDefault(); // cancel the event flow
        var setId  = target.data('setid');
        alert("save time: id=" + setId);

    } else if (target.is('.makeEditable')) {
        e.preventDefault();
        var editId = target.data('editid');
        alert("edit time: id=" + editId);
    }
});


/*
 * set current time (hh:mm) in tinput fields
 */
function date() {
	var t_current = new Date();
	var t_hh = t_current.getHours();
	var t_mm = t_current.getMinutes();

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
function saveTimeClick() {
    alert("save Intime button click");
	var buttId = this.id;
	var res = buttId.split("_");
	var setId = res[0] + "_" + res[2];

    alert("set button click: setId=" + setId);

	$("#"+setId).prop("readonly", "readonly");
	$("#"+setId).css("background-color", "#CC6666")

	var setRoId  = res[0] + "ro_"  + res[2]; // tinro_1
	$("#"+setRoId).val("1");

	//var inSetId = "tin_" + res[2];
	//if ((res[0] == "tout") && $("#"+inSetId).prop("readonly")) {
	//    $("form#vp1_form").submit(); // FIXME form name vpX_form
	//}
}

function editTimeClick() {
	var buttId = this.id;
	var res = buttId.split("_");
	var editId = res[0] + "_" + res[2];

    alert("edit button click: editId=" + editId);

	$("#"+editId).prop("readonly", false);
	$("#"+editId).css("background-color", "#99FFCC")

	var setRoId  = res[0] + "ro_"  + res[2];
	$("#"+setRoId).val("0");
}


function fillStarterTable(docTitle) {

    var aidId = $("aid").attr("id");
    //alert("aid id: " + aidId);
    var match = /^(VP)\d$/i;
    var isAidstation = match.test(aidId);
    
    var tableContent = '';
    var runnerNum = 1;

    $.getJSON('/runners', function(data) {
        $.each(data, function() {
            tableContent += '<tr>';
            tableContent += '<td>' + this.startnum  + '</td>';
            tableContent += '<td>' + this.firstname + '</td>';
            tableContent += '<td>' + this.lastname  + '</td>';

            tableContent += '<td align="center"><input id="tin_' + this.startnum
                + '" class="tinput" type="text" maxlength="5" size="5">'
                + '<input type="hidden" id="tinro_' + this.startnum + '" value="0"></td>';

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
