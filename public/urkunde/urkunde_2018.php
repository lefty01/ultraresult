
<?php


define('FPDF_FONTPATH','font/');

require_once('fpdf.php');
require_once('fpdi.php');

function checkStartNum($num) {
    if (is_string($num) && !ctype_digit($num)) {
        return false; // contains non digit characters
    }
    if (!is_int((int) $num)) {
        return false; // other non-integer value or exceeds PHP_MAX_INT
    }
    return ($num > 0 && $num <= 99999);
}


$startnum = htmlspecialchars($_GET["startnum"]);
if (!checkStartNum($startnum)) { // validate startnum
    exit(1);
}
try {
    $configJson = file_get_contents("ultraresult.config");
    $config = json_decode($configJson); // json_decode($jsonStr, true), converts json string to associative array
//echo var_dump($config);
}
catch(Exception $e) {
    echo "catched exception\n";
    exit(1);
}
$dbhost = $config->database->host; //'localhost';
$dbname = $config->database->name; //'sutrunners_2018';
$dbport = $config->database->port;
$urkundePdf = $config->urkunde->pdffile; //'urkunde_2018.pdf'; // urkunde pdf input filename from config!

// Connect to test database
$m = new Mongo("mongodb://$dbhost:$dbport");
$db = $m->$dbname;

// select the collection
$collection = $db->runnerlist;

$runner = $collection->findOne(array('startnum' => $startnum),
                               array('firstname' => 1,
                                     'lastname'  => 1,
                                     'catger'    => 1,
                                     'rank_cat'  => 1,
                                     'rank_all'  => 1,
                                     'finish_time'  => 1                               
));
//print_r($runner);
//echo "Hallo {$runner['firstname']} {$runner['lastname']}!";

// validate db input
$firstname = utf8_decode($runner['firstname']);
$lastname  = utf8_decode($runner['lastname']);


//$pdf = new FPDF();
$pdf = new FPDI();

$pdf->AddPage("P", "A4");

// can use inkscape to modify the input PDF
$pageCount = $pdf->setSourceFile($urkundePdf);

$tplIdx = $pdf->importPage(1);
$pdf->useTemplate($tplIdx);


// enable / disable rank (cat/overall) via checkbox? 

$pdf->SetFont('Arial', '', 32);
$pdf->SetXY(83, 102);
$pdf->Write(0, "{$runner['rank_cat']}. {$runner['catger']}");

$pdf->SetFont('Arial', '', 40);
$pdf->SetXY(35, 214);
$pdf->Write(0, "{$firstname} {$lastname}");

$pdf->SetXY(105, 232);
$pdf->Write(0, "{$runner['finish_time']}");


$pdf->Output();

?>
