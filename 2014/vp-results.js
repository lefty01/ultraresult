// copyright 2014 (c) andreas loeffler <al@exitzero.de>


$(document).ready(function() {
    // all jQuery code goes here

    window.onload = function() {
	date()
    },
    setInterval(function(){date()}, 30000);


    // save/restore ... save done via form submit action
    // restore via http://sut100.de/vp1.data
    $("#loader").click(function(event) {
	//alert(this.name);
	$.get("../vp-results.php",
	      { VP: this.name , access: "load"},
	      function(data) {
		  $('#stage').html(data+"<br>");

		  var lines = data.split(';');
		  var size  = lines.length - 2;
		  

		  // for each line (1, tin, tout) split the times
		  // then set tin_/tout_ input fields with the loaded values
		  for (var i=0; i<size; i++) {
		      var times = lines[i].split(',');
		      var inSetId  = "tin_" + times[0];
		      var outSetId = "tout_" + times[0];
		      var inRoId   = "tinro_"  + times[0];
		      var outRoId  = "toutro_" + times[0];
		      //alert();

		      
		      $("#"+inSetId).val(times[1]);
		      if (1 == times[3]) {
			  $("#"+inSetId).prop("readonly", "readonly");
			  $("#"+inSetId).css("background-color", "#CC6666")
			  $("#"+inRoId).val("1");
		      }
		      
		      $("#"+outSetId).val(times[2]);
		      if (1 == times[4]) {
			  $("#"+outSetId).prop("readonly", "readonly");
			  $("#"+outSetId).css("background-color", "#CC6666")
			  $("#"+outRoId).val("1");
		      }
		      $('#stage').append(lines[i]+"<br>");
		  }
	      },
	      "text"
	     );
    });


    

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


    // bind functions to the Save/Edit buttons
    $("input.makeNonEditable").bind("click", setButtonClick);
    $("input.makeEditable").bind("click",    editButtonClick);


    // the ButtonClick functions to lock/unlock the input fields
    // background changed to red if locked/ green if editable
    // in case of save we submit data if in and out times are both locked
    function setButtonClick() {
	var buttId = this.id;
	var res = buttId.split("_");
	var setId = res[0] + "_" + res[2];

	$("#"+setId).prop("readonly", "readonly");
	$("#"+setId).css("background-color", "#CC6666")

	var setRoId  = res[0] + "ro_"  + res[2]; // tinro_1
	$("#"+setRoId).val("1");

	//var inSetId = "tin_" + res[2];
	//if ((res[0] == "tout") && $("#"+inSetId).prop("readonly")) {
	//    $("form#vp1_form").submit(); // FIXME form name vpX_form
	//}
    }

    function editButtonClick() {
	var buttId = this.id;
	var res = buttId.split("_");
	var editId = res[0] + "_" + res[2];

	$("#"+editId).prop("readonly", false);
	$("#"+editId).css("background-color", "#99FFCC")

	var setRoId  = res[0] + "ro_"  + res[2];
	$("#"+setRoId).val("0");

    }


});

