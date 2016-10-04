

// DOM Ready =============================================================
$(document).ready(function() {

    // show aid stations
    //showAidstations();

});

function showAidstations() {

    $.getJSON( '/aid/', function(data) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function() {

        });
    });
}



function genStartList(event) {
    event.preventDefault();
    var tableContent = '';
    var runnerNum = 1;

    //confirm("Startliste anzeige?");
    // jQuery AJAX call for JSON
    //  $.getJSON( '/runners/userlist', function(data) {
    $.getJSON( '/runners/starterlist', function(data) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + runnerNum + '</td>';
            tableContent += '<td><a href="http://statistik.d-u-v.org/getresultperson.php?runner=' + this.duvid + '" >'
                + this.firstname + ' ' + this.lastname + '</a></td>';
	        tableContent += '<td>' + this.nationality + '</td>';
            tableContent += '<td>' + this.residence + '</td>';
	        tableContent += '<td>' + this.club + '</td>';
	        tableContent += '<td>' + this.catger + '</td>';
            tableContent += '</tr>';
            runnerNum++;
        });

        // Inject the whole content string into our existing HTML table
        $('#starterList table tbody').html(tableContent);

    });
}


//    $.getJSON( '/aid/' + aidId, function(data) {
