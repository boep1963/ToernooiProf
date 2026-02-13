<?php
//&copy; Hans Eekels, versie 31-082025
//Newsfeed opslaan na controle
//min lengte naam en tekst is al gecontroleerd, maar hier nog escapen
require_once('../../data/connectie.php');	//gebruik $dbnaam1
require_once('../Functies/Functies.php');

/*
var_dump($_POST) geeft:
array(3) { 
["kop"]=> string(23) "Camping-seizoen gestart" 
["nieuws"]=> string(94) "Het camping-seizoen is weer gestart. De tuin is al op orde en de boot ligt al in het water. " 
["tijd"]=> string(19) "2025-04-18 11:25:12" }
*/

$Tijd = $_POST['tijd'];

//nieuws escapen
try
{
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if(!$dbh)
	{
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh,"utf8");
			
	//escapen
	$Nieuws_hulp_1 = mysqli_real_escape_string($dbh, $_POST['nieuws']);

	// Sta alleen veilige HTML-tags toe, bv. <a>, <b>, <i>, <u>, <br>
	$Nieuws = strip_tags($Nieuws_hulp_1, '<a><b><i><u><br>');
	
	$Kop_hulp_1 = mysqli_real_escape_string($dbh,$_POST['kop']);
	$Kop = htmlspecialchars($Kop_hulp_1, ENT_QUOTES);
	
	$sql = "SELECT * FROM eekels_nieuws ORDER BY nummer";
	
	$res = mysqli_query($dbh,$sql);
	if (!$res)
	{
		throw new Exception(mysqli_connect_error());
	}
	
	if (mysqli_num_rows($res) > 0)
	{
		$Nummer = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
		{
			if ($resultaat['nummer'] > $Nummer)
			{
				$Nummer = $resultaat['nummer'];	
			}
		}
		
		$Nummer = $Nummer + 1;
		
		$Aantal_records = mysqli_num_rows($res);
	}
	else
	{
		$Aantal_records = 0;
		$Nummer = 1;
	}
	
	//opslaan
	$sql = "INSERT INTO eekels_nieuws (nummer, tijd, kop, tekst) VALUES ('$Nummer', '$Tijd', '$Kop', '$Nieuws')";
	
	$res = mysqli_query($dbh,$sql);
	if (!$res)
	{
		throw new Exception(mysqli_connect_error());
	}
	
	//we tonen maximaal 10 berichten, hier oude deleten
	if ($Aantal_records > 10)
	{
		$sql = "DELETE FROM eekels_nieuws WHERE nummer < $Nummer - 10";
	
		$res = mysqli_query($dbh,$sql);
		if (!$res)
		{
			throw new Exception(mysqli_connect_error());
		}
	}
	
	//close connection
	mysqli_close($dbh);
}
catch(Exception $e)
{
	echo $e->getMessage();
}

//terug naar dashbord
header('Location: Start_db.php');

?>