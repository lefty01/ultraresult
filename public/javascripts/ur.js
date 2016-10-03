

// DOM Ready =============================================================
$(document).ready(function() {

    // show aid stations
    showAidstations();

});

function showAidstations() {

    $.getJSON( '/aid/', function(data) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function() {

        });
    });
}


//    $.getJSON( '/aid/' + aidId, function(data) {
