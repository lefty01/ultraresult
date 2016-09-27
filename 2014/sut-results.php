<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-15">
<script type="text/javascript" src="jquery-1.11.0.js"></script>
<script type="text/javascript" src="sorttable.js"></script>
<!-- <script type="text/javascript" src="http://code.jquery.com/jquery-1.11.0.js"></script> -->

<style>
th.vp, td.vp {

}
th.name, td.name {
    width: 200px;
}

th.time, td.time {
    width: 75px;
    text-align: center;
}
th.pause, td.pause {
    width: 30px;
}

tr.rwo_odd {
    background-color: #99EEEE;
}
tr.rwo_even {
    background-color: #99EEEE;
}

</style>

<title>2. SUT 100 - 2014 (vorl&auml;ufige) Ergebnisse</title>
</head>
<body>
<h1>2. SUT 100 - 2014 (vorl&auml;ufige) Ergebnisse</h1>

<?php

// error handler function
function display_error($errno, $errstr, $errfile, $errline) {

  //function display_error($errno, $errstr) {
  //echo "ERROR: $errstr\n";
  echo "ERROR: $errno: $errstr, $errfile:$errline\n";
  die();
}

error_reporting(E_ALL);
set_error_handler("display_error");

require "sut-results-lib.php";

// read vpN.result files and assign data to $runners array
readVpResults();

// calc times and paces and assign to runners ...
calcTimePace();

?>

<hr><br>

<table width="4000px" id="results" border="1" class="sortable">
  <caption>T<sub>1</sub>(hh:mm): Zeit zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub> , &nbsp;
           T<sub>2</sub>(hh:mm): Zeit zwischen Start und VP<sub>n<sub>Tin</sub></sub> , &nbsp;
           P<sub>1</sub>(mm:ss/km): &#216; Pace zwischen VP<sub>n-1<sub>Tout</sub></sub> und  VP<sub>n<sub>Tin</sub></sub> , &nbsp;
	   P<sub>1</sub>(mm:ss/km): &#216; Pace zwischen Start und VP<sub>n<sub>Tin</sub></sub></caption>
  <tr>
    <th>#</th>
    <th>Platz</th>
    <th class="name">Name</th>
    <th class="vp" colspan="7" id="vp1">VP1 Atdorf,            @mi 17.5,  &Delta; 17.5</th>
    <th class="vp" colspan="7" id="vp2">VP2 Nufringen,         @mi 32.7,  &Delta; 15.22</th>
    <th class="vp" colspan="7" id="vp3">VP3 Entringen,         @mi 46.7,  &Delta; 13.98</th>
    <th class="vp" colspan="7" id="vp4">VP4 T&uuml; Rittweg,   @mi 59.7,  &Delta; 12.99</th>
    <th class="vp" colspan="7" id="vp5">VP5 Anders,            @mi 69.9,  &Delta; 10.25</th>
    <th class="vp" colspan="7" id="vp6">VP6 Steinbrennerhaus,  @mi 83.5,  &Delta; 13.55</th>
    <th class="vp" colspan="7" id="vp7">VP7 Teufelsbruch,      @mi 96.8,  &Delta; 13.36</th>
    <th class="vp" colspan="5" id="vp8">Ziel Dettenhausen,     @mi 103.5, &Delta; 6.71</th>
    <th class="total">Total Pause</th>
    <th class="total">Total Time</th>
  </tr>
  <tr>
    <th></th>
    <th></th>
    <th></th>
    <th class="time"  headers="vp1">IN</th>
    <th class="time " headers="vp1">OUT</th>
    <th class="pause" headers="vp1">Pause (min)</th>
    <th class="" headers="vp1">T<sub>1</sub></th>
    <th class="" headers="vp1">T<sub>2</sub></th>
    <th class="" headers="vp1">P<sub>1</sub></th>
    <th class="" headers="vp1">P<sub>2</sub></th>

    <th class="time"  headers="vp2">IN</th>
    <th class="time " headers="vp2">OUT</th>
    <th class="pause" headers="vp2">Pause (min)</th>
    <th class="" headers="vp2">T<sub>1</sub></th>
    <th class="" headers="vp2">T<sub>2</sub></th>
    <th class="" headers="vp2">P<sub>1</sub></th>
    <th class="" headers="vp2">P<sub>2</sub></th>

    <th class="time"  headers="vp3">IN</th>
    <th class="time " headers="vp3">OUT</th>
    <th class="pause" headers="vp3">Pause (min)</th>
    <th class="" headers="vp3">T<sub>1</sub></th>
    <th class="" headers="vp3">T<sub>2</sub></th>
    <th class="" headers="vp3">P<sub>1</sub></th>
    <th class="" headers="vp3">P<sub>2</sub></th>

    <th class="time"  headers="vp4">IN</th>
    <th class="time " headers="vp4">OUT</th>
    <th class="pause" headers="vp4">Pause (min)</th>
    <th class="" headers="vp4">T<sub>1</sub></th>
    <th class="" headers="vp4">T<sub>2</sub></th>
    <th class="" headers="vp4">P<sub>1</sub></th>
    <th class="" headers="vp4">P<sub>2</sub></th>

    <th class="time"  headers="vp5">IN</th>
    <th class="time " headers="vp5">OUT</th>
    <th class="pause" headers="vp5">Pause (min)</th>
    <th class="" headers="vp5">T<sub>1</sub></th>
    <th class="" headers="vp5">T<sub>2</sub></th>
    <th class="" headers="vp5">P<sub>1</sub></th>
    <th class="" headers="vp5">P<sub>2</sub></th>

    <th class="time"  headers="vp6">IN</th>
    <th class="time " headers="vp6">OUT</th>
    <th class="pause" headers="vp6">Pause (min)</th>
    <th class="" headers="vp6">T<sub>1</sub></th>
    <th class="" headers="vp6">T<sub>2</sub></th>
    <th class="" headers="vp6">P<sub>1</sub></th>
    <th class="" headers="vp6">P<sub>2</sub></th>

    <th class="time"  headers="vp7">IN</th>
    <th class="time " headers="vp7">OUT</th>
    <th class="pause" headers="vp7">Pause (min)</th>
    <th class="" headers="vp7">T<sub>1</sub></th>
    <th class="" headers="vp7">T<sub>2</sub></th>
    <th class="" headers="vp7">P<sub>1</sub></th>
    <th class="" headers="vp7">P<sub>2</sub></th>

    <th class="time"  headers="vp8">IN</th>
    <th class="" headers="vp7">T<sub>1</sub></th>
    <th class="" headers="vp7">T<sub>2</sub></th>
    <th class="" headers="vp7">P<sub>1</sub></th>
    <th class="" headers="vp7">P<sub>2</sub></th>

    <th></th>
  </tr>


<?php include("sut-results-runners.php"); ?>

</table>


<hr>
<address>Andreas Loeffler</address>
<!-- hhmts start -->Last modified: Wed Mar 26 21:37:05 CET 2014 <!-- hhmts end -->
</body> </html>
