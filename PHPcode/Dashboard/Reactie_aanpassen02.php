<?php
//&copy; Hans Eekels, versie 17-04-2025
//Reactie aanpassen

//headers
header('X-Content-Type-Options: nosniff');
header("X-XSS-Protection: 1; mode=block");

require_once('../../data/connectie.php');	//gebruik $dbnaam1
require_once('../Functies/Functies.php');

/*
var_dump($_POST) geeft:
array(1) { ["reacties"]=> string(1) "8" }
*/

$Nummer = $_POST['reacties'];

//haal tekst op
try
{
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if(!$dbh)
	{
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh,"utf8");
			
	
	$sql = "SELECT * FROM eekels_reacties WHERE nummer = '$Nummer'";
	
	$res = mysqli_query($dbh,$sql);
	if (!$res)
	{
		throw new Exception(mysqli_connect_error());
	}
	
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
		$Reactie_tekst = $resultaat['tekst'];
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
<title>Reactie aanpassen</title>
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
<form name="data" method="post" action="Reactie_aanpassen03.php" >
<table width="500" border="1">
  	<tr>
  		<td height="40" align="center" bgcolor="#000000" class="groot"><strong>Reactie aanpassen</strong></td>
	</tr>
    <tr>
        <td align="center">
        <textarea  name="reactie" rows="10" cols="100">
		<?php print("$Reactie_tekst"); ?>
		</textarea>
        </td>
    </tr>
    <tr>
  		<td align="center">
        	<input type="submit" value="Opslaan">
            <input type="hidden" name="nummer" value="<?php print("$Nummer"); ?>">
        </td>
    </tr>
</table>
</form>
</body>
</html>