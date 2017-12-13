<?php

$runner  = array();
$vp_info = array();

$vp_info[0]['delta'] = 0;
$vp_info[0]['total'] = 0;
$vp_info[1]['delta'] = 17.5;
$vp_info[1]['total'] = 17.5;
$vp_info[2]['delta'] = 15.22;
$vp_info[2]['total'] = 32.7;
$vp_info[3]['delta'] = 13.98;
$vp_info[3]['total'] = 46.7;
$vp_info[4]['delta'] = 12.99;
$vp_info[4]['total'] = 59.7;
$vp_info[5]['delta'] = 10.25;
$vp_info[5]['total'] = 69.9;
$vp_info[6]['delta'] = 13.55;
$vp_info[6]['total'] = 83.5;
$vp_info[7]['delta'] = 13.36;
$vp_info[7]['total'] = 96.8;
$vp_info[8]['delta'] = 6.71;
$vp_info[8]['total'] = 103.5;


$runner[1][0]['out'] = "08:00";
$runner[2][0]['out'] = "08:00";
$runner[3][0]['out'] = "08:00";
$runner[4][0]['out'] = "08:00";
$runner[5][0]['out'] = "08:00";
$runner[6][0]['out'] = "08:00";
$runner[7][0]['out'] = "08:00";
$runner[8][0]['out'] = "08:00";
$runner[9][0]['out'] = "08:00";
$runner[10][0]['out'] = "08:00";
$runner[11][0]['out'] = "08:00";
$runner[12][0]['out'] = "08:00";
$runner[13][0]['out'] = "08:00";
$runner[14][0]['out'] = "08:00";
$runner[15][0]['out'] = "08:00";
$runner[16][0]['out'] = "08:00";
$runner[17][0]['out'] = "08:00";
$runner[18][0]['out'] = "08:00";
$runner[19][0]['out'] = "08:00";
$runner[20][0]['out'] = "08:00";
$runner[21][0]['out'] = "08:00";
$runner[22][0]['out'] = "08:00";
$runner[23][0]['out'] = "08:00";
$runner[24][0]['out'] = "08:00";
$runner[25][0]['out'] = "08:00";
$runner[26][0]['out'] = "08:00";
$runner[27][0]['out'] = "08:00";
$runner[28][0]['out'] = "08:00";
$runner[29][0]['out'] = "08:00";
$runner[30][0]['out'] = "08:00";


function time2str($t) {
  return sprintf("%02d:%02d", (int)($t / 60), $t % 60);
}

// subtract t1 - t2
// return string hh:mm
function hhmmSubtract($t1, $t2) {
  $in  = explode(':', $t1);
  $out = explode(':', $t2);

  if ($in[0] < $out[0]) $in[0] += 24;
  $total[0] = $in[0] - $out[0];

  if ($in[1] < $out[1]) {
    $in[1]    += 60;
    $total[0] -= 1;
  }
  $total[1] = $in[1] - $out[1];

  return sprintf("%02d:%02d", $total[0], $total[1]);
}

function getPauseMin($t1, $t2) {
  $pause = explode(':', hhmmSubtract($t1, $t2));

  $min = $pause[0] * 60 + $pause[1];

  return $min;
}

function hhmmAddDay($t1) {
  $in  = explode(':', $t1);
  $in[0] += 24;
  return sprintf("%02d:%02d", $in[0], $in[1]);
}

// return true if t1 is greater than or equal t2
function hhmmIsGreater($t1, $t2) {
  $in  = explode(':', $t1);
  $out = explode(':', $t2);

  if ($in[0] > $out[0]) return true;
  if (($in[0] == $out[0]) && ($in[1] >= $out[1])) return true;
  return false;
}

// calc pace from t(hh:mm) and distance d(km)
// return pace in mm:ss/km
function getPace($t, $d) {
  $in  = explode(':', $t);
  $sec = $in[0] * 60 * 60 + $in[1] * 60;
  $pace = $sec / $d;

  return sprintf("%02d:%02d", (int)($pace / 60), $pace % 60);
}


function readVpResults() {
  global $runner;

    for ($vp=1; $vp<=8; $vp++) {
      $file = "vp" . $vp . ".result";
      if (file_exists($file)) {
	$FH = fopen($file, 'r'); // locking! file open error (does not exist!)

	//echo "data for VP{$vp}<br>\n";

	// for each line ... well we only have one line!!!
	while(!feof($FH)) {
	  $vpData = fgets($FH);

	  // check whether line can contain valid data
	  if (!preg_match('/^(\d+,(([0-2][0-9]:[0-5][0-9],)+(\d,\d;)*)*)+$/', $vpData)) {
	    //echo "data in vp result file not valid or file empty!<br>\n";
	    //echo "vpData: $vpData<br>\n";

	  }
	  else {

	    $vpRunners = explode(';', $vpData);
	    $total_runners = count($vpRunners)-1;

	    // for this vp assign in/out times for each runner...
	    foreach ($vpRunners as $inOuts) {
	      
	      if (!preg_match('/^\d+,([0-2][0-9]:[0-5][0-9],)+\d,\d$/', $inOuts)) {
		echo "invalid data for runner: $inOuts<br>\n";
	      }
	      else {
		//echo "runner: $inOuts<br>\n";
		//list($runnerId, $runnerIn, $runnerOut)  = explode(',', $inOuts, 4);
		list($runnerId, $runnerIn, $runnerOut, $savedIn, $savedOut) = explode(',', $inOuts, 6);

		// -> only use times if they have been saved aka, saveIn=1 and saveOut=1 !!!
		
		//echo "runner {$runnerId}, in={$runnerIn} saved={$savedIn}, out={$runnerOut} saved={$savedOut}<br>\n";

		$runner[$runnerId][$vp]['pause']  = "n/a";
		$runner[$runnerId][$vp]['time1']  = "n/a";
		$runner[$runnerId][$vp]['time2']  = "n/a";
		$runner[$runnerId][$vp]['pace1']  = "n/a";
		$runner[$runnerId][$vp]['pace2']  = "n/a";
		$runner[$runnerId]['pos'] = "0";

		if (1 == $savedIn) {
		  $runner[$runnerId][$vp]['in']  = $runnerIn;
		}
		else {
		  $runner[$runnerId][$vp]['in']  = "n/a";
		}
		if (1 == $savedOut) {
		  $runner[$runnerId][$vp]['out'] = $runnerOut;
		}
		else {
		  $runner[$runnerId][$vp]['out'] = "n/a";
		}
	      }

	    }
	  }
	}
	fclose($FH);
      }
      else {
	echo "No data file for vp ".$vp." available yet!";
      }
      echo "<br>\n";
    }

}


function calcTimePace() {
  global $runner;
  global $vp_info;

  echo "calcTimePace()<br>\n";
  echo "count runner: " . count($runner) . "<br>\n";  


  foreach ($runner as $key => $val) {
    //echo "runner $key was at " . count($runner[$key]) . " number of aid stations";

    foreach ($runner[$key] as $k2 => $v2) {
      if (0 == $k2) { // start
	$runner[$key]['time2_prev'] = "00:00";
      }
      else { // vp1..vp7,vp8=finish
	//echo "\n**** VP$k2 " . $vp_info[$k2]['delta'] . " / " . $vp_info[$k2]['total'] . "****\n";
	$tstart = isset($runner[$key][0]['out'])     ? $runner[$key][0]['out']     : "n/a";
	$tin    = isset($runner[$key][$k2]['in'])    ? $runner[$key][$k2]['in']    : "n/a";
	$tout1  = isset($runner[$key][$k2-1]['out']) ? $runner[$key][$k2-1]['out'] : "n/a";
	$tout2  = isset($runner[$key][$k2]['out'])   ? $runner[$key][$k2]['out']   : "n/a";
	
    	//echo "runner $key: VP".($k2-1)." OUT: $tout1  -  VP$k2 IN: $tin  -  VP$k2 OUT: $tout2<br>\n";

	if ($tin == "n/a" || $tout2 == "n/a") {
	  echo "runner $key: VP".($k2-1)." OUT: $tout1  -  VP$k2 IN: $tin  -  VP$k2 OUT: $tout2 -CONT. next runner-<br>\n";
	  //continue; // only continue vp loop
	  break;
	}


	// T1:
	//echo "t1 vp".($k2-1)."-vp$k2:   " . time2str(($time_tin - $time_tout1) / 60) . " (hh:mm)<br>\n";
	$runner[$key][$k2]['time1'] = hhmmSubtract($tin, $tout1);
  
	// T2:
	//echo "t2 start-vp$k2: " . time2str($t_start_vp_sec / 60) . " (hh:mm)<br>\n";
	if (hhmmIsGreater($runner[$key]['time2_prev'], hhmmSubtract($tin, $tstart))) {
	  $runner[$key][$k2]['time2'] = hhmmSubtract($tin, $tstart);
	  $runner[$key][$k2]['time2'] = hhmmAddDay($runner[$key][$k2]['time2']);
	}
	else {
	  $runner[$key][$k2]['time2'] = hhmmSubtract($tin, $tstart);
	}
	$runner[$key]['time2_prev'] = $runner[$key][$k2]['time2'];
	$runner[$key]['total_time'] = $runner[$key][$k2]['time2'];


	// P1: avg. vp-vp
	//echo "pace 1:      " . time2str((int)$pace1) . " (mm:ss/km)<br>\n";
	$runner[$key][$k2]['pace1'] = getPace($runner[$key][$k2]['time1'], $vp_info[$k2]['delta'] * 1.61);

	// P2: avg start-vp
	//echo "pace 2:      " . time2str((int)$pace2) . " (mm:ss/km)<br>\n";
	$runner[$key][$k2]['pace2'] = getPace($runner[$key][$k2]['time2'], $vp_info[$k2]['total'] * 1.61);

	
	// Pause
	if ("n/a" != $tout2)  {
	  $runner[$key][$k2]['pause'] = getPauseMin($tout2, $tin);
	  //echo "t pause vp$k2: " . ($time_tout2 - $time_tin) / 60 . " min.<br>\n";
	  $runner[$key]['total_pause'] += $runner[$key][$k2]['pause'];
	}
	else {
	  $runner[$key][$k2]['pause'] = "n/a";
	  //echo "t pause vp$k2: n/a<br><br>\n\n";
	}
      }
    }
  }
}


?>
