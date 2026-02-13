<?php
//&copy; Hans Eekels, versie 04-05-2025
//Reactie aanpassen; opslaan

require_once('../../data/connectie.php');	//gebruik $dbnaam1
require_once('../Functies/Functies.php');

/*
var_dump($_POST) geeft:
array(2) { 
["reactie"]=> string(212) " Op 3 mei 2025 de 100ste gebruiker verwelkomd van mijn online biljartprogramma's. 
	En dat terwijl overal het seizoen wordt beëindigd. Op naar de 200 bij de start van het nieuwe seizoen in september 2025 ! " 
["nummer"]=> string(1) "1" }
*/
$Nummer = $_POST['nummer'];

//aanpassen
try
{
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if(!$dbh)
	{
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh,"utf8");
	
	//escapen
	$Reactie_hulp_1 = mysqli_real_escape_string($dbh,$_POST['reactie']);
	$Reactie_hulp_2 = htmlspecialchars($Reactie_hulp_1, ENT_QUOTES);
	$Tekst = filter_var($Reactie_hulp_2, FILTER_SANITIZE_STRING);
	
	$sql = "UPDATE eekels_reacties SET tekst = '$Tekst' WHERE nummer = '$Nummer'";
	
	$res = mysqli_query($dbh,$sql);
	if (!$res)
	{
		throw new Exception(mysqli_connect_error());
	}

	//close connection
	mysqli_close($dbh);
}
catch(Exception $e)
{
	echo $e->getMessage();
}

?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Reactie aangepast</title>
<meta name="Keywords" content="Biljarten, Teams, OnderOns" />
<meta name="description" content="Start" />
<link rel="shortcut icon" href="../Figuren/car_icon.ico" type="image/x-icon" />
<link href="../Stijlen/Stijlen_algemeen.css" rel="stylesheet" type="text/css" />
<style type="text/css">
body {
	width:500px;
	margin-top: 100px;
}
input[type=submit] {
  	height:28px;
   	width:100px;
}
input[type=button] {
   	height: 28px;
   	width: 100px;
}
</style>
</head>
<body>
<form name="data" method="post" action="../Dashboard/Start_db.php" >
<table width="500" border="1">
  	<tr>
  		<td height="40" align="center" bgcolor="#000000" class="groot"><strong>Reactie aangepast</strong></td>
	</tr>
    <tr>
        <td align="center">Terug naar Dashboard</td>
    </tr>
    <tr>
  		<td align="center">
        	<input type="submit" value="Akkoord">
        </td>
    </tr>
</table>
</form>
</body>
</html>