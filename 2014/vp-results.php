<?php

// copyright 2014 (c) andreas loeffler <al@exitzero.de>

function display_error($errno, $errstr, $errfile, $errline) {
  echo "ERROR: $errno: $errstr, $errfile:$errline\n";
  die();
}

error_reporting(E_ALL);
set_error_handler("display_error");



function isValidVp($num)
{
  return preg_match('/^[1-8]$/', (string)$num);
}

function isValidTime($time)
{
  if (!preg_match('/^[0-2][0-9]:[0-5][0-9]$/', (string)$time)) {
    return false;
  }
  list($hh, $mm) = explode(':', $time, 3);

  if ((int)$hh > 23) {
    return false;
  }
  if ((int)$mm > 59) {
    return false;
  }
  return true;
}


if (isset($_GET["VP"]) && isset($_GET["access"]) && ($_GET["access"] == "load")) {
  $vp = $_GET["VP"];

  if (!isValidVp($vp)) {
    $vp = 0;
    display_error("Wert fuer VP muss zwischen 1-8 sein!");
  }


  $file = "vp" . $vp . ".result";
  if (file_exists($file)) {
    $FH = fopen($file, 'r'); // locking! file open error (does not exist!)
  
    while(!feof($FH)) {
      //$data = fgets($FH);
      //$times = explode(',', $data, 3);
      //echo "$times[0]: $times[1] - $times[2]<br>\n";
      echo fgets($FH) . ";";
    }
    
    fclose($FH);
  }
  else {
    echo "No data file available!";
  }
}


if (isset($_POST["VP"]) && isset($_POST["access"]) && ($_POST["access"] == "save")) {
  $vp = $_POST['VP'];

  if (!isValidVp($vp)) {
    $vp = 0; // throw error!!!
    display_error("Wert fuer VP muss zwischen 1-8 sein!");
  }


  // open result file for reading (must exist)
  $file = "vp" . $vp . ".result";
  $FH = fopen($file, 'w');
  //$DBG = fopen("/tmp/sutwww.dbg", 'w');
  
  $cnt = 1;
  $line = "";
  foreach($_POST as $k => $v) {
    //fwrite($DBG, "$k - $v\n");

    if (strpos($k, 'tin_') === 0) {
      if (isValidTime($v)) {
	$line = "$cnt,$v,";
      }
      else {
	display_error("input in time: $v is invalid!\n");
      }
    }
    if (strpos($k, 'tinro_') === 0) {
      $tinro = $v;
    }

    if (strpos($k, 'tout_') === 0) {
      if (isValidTime($v)) {
	$line .= "$v,";
      }
      else {
	display_error("input out time: $v is invalid!\n");
      }
    }

    if (strpos($k, 'toutro_') === 0) {
      $line .= "$tinro,$v;";
      fwrite($FH, $line);
      $cnt++;
    }

  }

  fclose($FH);

  echo '<html xmlns="http://www.w3.org/1999/xhtml">';
  echo '<head>';
  echo '<meta http-equiv="content-type" content="text/html; charset=utf-8" />';
  echo '</head>';
  echo '<body>';

  echo "Data von VP".$vp." gesendet! <a href=\"javascript:history.back()\">Zur&uuml;ck</a><br>";

  echo '</body>';
}

?>
