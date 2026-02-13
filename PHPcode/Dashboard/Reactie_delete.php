<?php
//&copy; Hans Eekels, versie 17-04-2025
//Reactie verwijderen, stap 1

//headers
header('X-Content-Type-Options: nosniff');
header("X-XSS-Protection: 1; mode=block");

require_once('../Functies/Functies.php');
require_once('../../data/connectie.php');	//gebruik $dbnaam1

$Reacties = array();

//zoek reacties
try
{
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if(!$dbh)
	{
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh,"utf8");
			
	$sql = "SELECT * FROM eekels_reacties ORDER BY nummer DESC";
	
	$res = mysqli_query($dbh,$sql);
	if (!$res)
	{
		throw new Exception(mysqli_connect_error());
	}
	
	if (mysqli_num_rows($res) > 0)
	{
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
		{
			$teller++;
			$Reacties[$teller]['nummer'] = $resultaat['nummer'];
			$Reacties[$teller]['tijd'] = $resultaat['tijd'];
			$Reacties[$teller]['naam'] = $resultaat['naam'];
			$Reacties[$teller]['tekst'] = $resultaat['tekst'];
		}
		
		mysqli_free_result($res);
		$Aantal_reacties = $teller;
	}
	else
	{
		$Aantal_reacties = 0;
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
<title>Reactie verwijderen</title>
<meta name="Keywords" content="Hans Eekels" />
<meta name="description" content="Portal" />
<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
<link href="../Stijlen/Stijlen_algemeen.css" rel="stylesheet" type="text/css" />
<style type="text/css">
body {
	width: 600px;
	margin-top: 10px;
}
input[type=submit] {
  	height:30px;
   	width:150px;
}
input[type=button] {
   	height: 30px;
   	width: 120px;
}
.anders {
height: 100px;
width: 550px;
font-family: verdana;
font-size: 12pt;
color: black;
}
</style>
</head>
<body>
<form name="reactie" method="post" action="Reactie_delete02.php">
<table width="600" border="0">
  <tr>
    <td height="42" colspan="2" align="center" bgcolor="#333333" class="groot"><strong>Reactie verwijderen</strong></td>
  </tr>
  <tr>
    <td height="26" colspan="2" align="center" valign="middle" bgcolor="#FFFFCC" class="zwart">Kies reactie in de lijst</td>
    </tr>
  <tr>
    <td height="40" colspan="2" align="center" valign="top" bgcolor="#FFFFCC">
    <?php
	if ($Aantal_reacties == 0)
	{
		
		?>
        Geen reacties
        <?php
	}
	else
	{
		?>
		<select name="reacties">
        <?php
		for ($a = 1; $a < $Aantal_reacties + 1; $a++)
		{
			$Nummer = $Reacties[$a]['nummer'];
			$Tijd = $Reacties[$a]['tijd'];
			$Naam = $Reacties[$a]['naam'];
			$Tekst = $Reacties[$a]['tekst'];
			$Tekst = substr($Tekst, 0, 25);
			$Record_naam = "(" . $Nummer . ") [" . $Tijd . "] " . $Naam . ": " . $Tekst;
			
			?>
			<option value="<?php print("$Nummer"); ?>"><?php print("$Record_naam"); ?></option>
			<?php
		}
        ?>
        </select>
        <?php
	}
	?>
    </td>
  </tr>
  <tr>
    <td height="40" colspan="2" align="center" valign="middle" bgcolor="#FFFFCC">
      <input type="submit" value="Kies">
    </td>
  </tr>
  <tr>
    <td width="104" height="40" align="left">
    <input type="button" style="width:100px; background-color:#000; color:#FFF;" onClick="window.location.href='../Dashboard/Start_db.php';" value="Terug" /></td>
    <td width="486" align="center">&nbsp;</td>
  </tr>
  <tr>
    <td height="20" align="left" valign="middle" bgcolor="#333333">&nbsp;</td>
    <td align="left" valign="middle" bgcolor="#333333">&nbsp;</td>
  </tr>
</table>
</form>
</body>
</html>
