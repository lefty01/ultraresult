

// DOM Ready =============================================================
$(document).ready(function() {

    // fill table
    fillStarterTable(document.title);

    //showAidstations();

    // load/store buttons - FIXME really need?
    //$('#btnLoad').on('click', storeAidTime);


});


function fillStarterTable(docTitle) {

    var aidId = $("aid").attr("id");
    //alert("aid id: " + aidId);
    
    var tableContent = '';
    var runnerNum = 1;

    $.getJSON('/runners', function(data) {
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + runnerNum + '</td>';
            tableContent += '<td>' + this.firstname + ' ' + this.lastname + '</td>';
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
