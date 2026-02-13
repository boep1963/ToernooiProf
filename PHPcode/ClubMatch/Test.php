<?php
//test database clubmatch

require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';

try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //test
  $sql = "SELECT * FROM bj_bediening WHERE org_nummer = '1000' AND tafel_nr = 10";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }
  
  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $Tafel_nr = $resultaat['tafel_nr'];
    }
	
 //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

echo $Tafel_nr;

?>