<?php
//© Hans Eekels, versie 20-08-2025
//ClubMatch voorlopig account aanmaken; email verzenden met return_code
//check op eerdere onbedoelde opslag
//check dubbele e-mail
//aantal tafels toegevoegd en bj_tafels gevuld
//reminder_send toegevoegd

require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('PHP/Functies_biljarten.php');

$Copy = Date("Y");

//data opvragen en escapen
/*
var_dump($_POST) geeft:
array(3) { 
["naam_org"]=> string(14) "ABC Assendelft" 
["naam_wl"]=> string(11) "Hans Eekels" 
["email_wl"]=> string(20) "hanseekels@gmail.com" }
["tafels"]=> string(1) "8" }
*/

$bAkkoord = TRUE;			//wordt FALSE bij verkeerde POST of verkeerde input
$error_message_1 = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";		//melding bij foute POST
$error_message_2 = "";		//melding bij foute invoer

if (isset($_POST['naam_org'])) {
	$hulp_1 = $_POST['naam_org'];
	$Naam_org = htmlspecialchars($hulp_1, ENT_QUOTES);
	if (strlen($Naam_org) < 5 || strlen($Naam_org) > 30) {
		$error_message_2 = "Naam organisatie moet minimaal 5 en maximaal 30 tekens bevatten !<br>U keert terug naar de invoer pagina.<br><br>";
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['naam_wl'])) {
	$hulp_2 = $_POST['naam_wl'];
	$Naam_wl = htmlspecialchars($hulp_2, ENT_QUOTES);
	if (strlen($Naam_wl) < 5 || strlen($Naam_wl) > 30) {
		$error_message_2 .= "Naam wedstrijleider moet minimaal 5 en maximaal 30 tekens bevatten !<br>U keert terug naar de invoer pagina.<br><br>";
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['email_wl'])) {
	$hulp_3 = $_POST['email_wl'];
	$Email_wl = fun_test_input($hulp_3);
	if (strlen($Email_wl) < 5 || strlen($Email_wl) > 50) {
		$error_message_2 .= "Email wedstrijleider moet minimaal 5 en maximaal 50 tekens bevatten !<br>U keert terug naar de invoer pagina.<br><br>";
	}
	if (!filter_var($Email_wl, FILTER_VALIDATE_EMAIL)) {
		$error_message_2 .= "Ingevoerd email-adres voldoet niet aan het formaat van een email-adres !<br>U keert terug naar de invoer pagina.<br><br>";
	}
	//check op bestaande email
	if (fun_bestaatemail($Email_wl, $Path) == TRUE) {
		$error_message_1 = "Met dit email-adres is al een account aangemaakt !<br>
		Als u uw inlog-code kwijt bent, neem dan contact op met hanseekels@gmail.com<br><br>
		U keert terug naar de start pagina.<br><br>";
		$bAkkoord = FALSE;
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['tafels'])) {
	$Aantal_tafels = $_POST['tafels'];
} else {
	$bAkkoord = FALSE;
}

if (count($_POST) != 4) {
	$bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch Online</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch Online" />
		<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
		<link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="PHP/script_competitie.js" defer></script>
		<style type="text/css">
			body {
				width: 500px;
				margin-top: 100px;
			}

			.button:hover {
				border-color: #FFF;
			}
		</style>
	</head>

	<body>
		<table width="500" border="0">
			<tr>
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Beheer/uploads/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print($error_message_1); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<form name="terug" method="post" action="../Start.php">
						<input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					</form>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

if (strlen($error_message_2) > 0) {
	//terug naar invoer voor correctie
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Competitie programma</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch Online" />
		<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
		<link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="PHP/script_competitie.js" defer></script>
		<style type="text/css">
			body {
				width: 500px;
				margin-top: 100px;
			}

			.button:hover {
				border-color: #FFF;
			}
		</style>
	</head>

	<body>
		<table width="500" border="0">
			<tr>
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Beheer/uploads/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print($error_message_2); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<input type="button" value="Terug" title="Terug naar invoer" onClick="history.go(-1)">
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein"></td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
//nummer opvragen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT org_nummer FROM bj_organisaties ORDER BY org_nummer DESC LIMIT 1";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Gebruiker_nr = 1000;
	} else {

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Gebruiker_nr = $resultaat['org_nummer'] + 1;
		}
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//random tekenreeks van 3 letters
$n = 3;
function getRandomString($n)
{
	$characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
	$randomString = '';

	for ($i = 0; $i < $n; $i++) {
		$index = random_int(0, strlen($characters) - 1);
		$randomString .= $characters[$index];
	}

	return $randomString;
}

$hulp = getRandomString($n);
$Code = $Gebruiker_nr . "_" . $hulp . "@#";
$Naam_logo = "Logo_" . $Gebruiker_nr . ".jpg";	//komt pas na uploaden in Beheer/uploads

$return_code = rand(10000, 99999);	//5 cijferige code
$time_start = time();
$code_ontvangen = 0;

$Datum_nu = date('Y-m-d');

//opslaan gegevens tijdelijk
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "INSERT INTO bj_organisaties 
	(org_nummer, org_code, org_naam, org_wl_naam, org_wl_email, org_logo, aantal_tafels, return_code, time_start, code_ontvangen, date_start, date_inlog, nieuwsbrief, reminder_send) 
	VALUES 
	('$Gebruiker_nr', '$Code', '$Naam_org', '$Naam_wl', '$Email_wl', '$Naam_logo', '$Aantal_tafels', '$return_code', '$time_start', '$code_ontvangen', '$Datum_nu', '$Datum_nu', '1', '0')";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//ook tafels opslaan
	for ($a = 1; $a < $Aantal_tafels + 1; $a++) {
		$Taf_nr = $a;
		$sql = "INSERT INTO bj_bediening (org_nummer, tafel_nr, soort) VALUES ('$Gebruiker_nr', '$Taf_nr', '1')";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
	}

	//email zenden naar gebruiker
	$msg = "Uw verificatiecode is: $return_code  Deze code is 15 minuten geldig.";
	$headers = "From: info@specialsoftware.nl";
	// send email
	mail($Email_wl, "Uw verificatiecode", $msg, $headers);

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

// Redirect naar de verificatiepagina
header("Location: ClubMatch_verificatie.php?email=" . urlencode($Email_wl));
exit();
?>