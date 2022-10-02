
// DOM Ready =============================================================
$(document).ready(function() {
    genAidstationList();
});


function genAidstationList() {
    var tableContent = '';
    var aidNum = 1;

    $.getJSON( '/aid', function(data) {
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.name + '</td>';
            tableContent += '<td>' + this.directions + '</td>';
	    tableContent += '<td>' + this.totalDistance + '</td>';
            tableContent += '<td>' + this.legDistance + '</td>';
	    tableContent += '<td>' + this.lat + ', ' + this.lng + '</td>';
	    tableContent += '<td>' + this.height + '</td>';
            tableContent += '</tr>';
            aidNum++;
        });

        // Inject the whole content string into our existing HTML table
        $('#aidstationListTable table tbody').html(tableContent);
    });
}
