<?php
//© Hans Eekels, versie 22-06-2025
//Account definitief verwijderen
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1000_KYZ@#" }

$bDelete_logo = TRUE;		//wordt false als er geen eigen logo is

$bAkkoord = TRUE;			//wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";		//melding bij foute POST

if (isset($_POST['user_code'])) {
	$Code = $_POST['user_code'];
	if (strlen($Code) != 10) {
		$bAkkoord = FALSE;
	} else {
		$Gebruiker_naam = fun_testgebruiker($Code, $Path);
		if ($Gebruiker_naam == '9999') {
			$bAkkoord = FALSE;
		} else {
			$Gebruiker_nr = substr($Code, 0, 4);
			//logonaam
			$Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$bDelete_logo = FALSE;
				$Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (count($_POST) != 1) {
	$bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Toernooi programma</title>
		<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
		<meta name="Description" content="Toernooiprogramma" />
		<link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
		<link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="PHP/script_toernooi.js" defer></script>
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
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						&nbsp;<br>
						<?php print($error_message); ?>
						<br>&nbsp;
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<form name="partijen" method="post" action="../Start.php">
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

//verder alles delete
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//account
	$sql = "DELETE FROM tp_gebruikers WHERE gebruiker_nr = '$Gebruiker_nr' AND gebruiker_code = '$Code'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
	//data
	$sql = "DELETE FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
	//spelers
	$sql = "DELETE FROM tp_spelers WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
	//poules
	$sql = "DELETE FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
	//uitslagen
	$sql = "DELETE FROM tp_uitslagen WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
	//uitslagen_hulp
	$sql = "DELETE FROM tp_uitslag_hulp WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//uitslagen hulp_tablet
	$sql = "DELETE FROM tp_uitslag_hulp_tablet WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//tp_tafel
	$sql = "DELETE FROM tp_tafel WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//tp_bediening
	$sql = "DELETE FROM tp_bediening WHERE gebruiker_nr = '$Gebruiker_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//logo
if ($bDelete_logo == TRUE) {
	unlink($Logo_naam);
}

//slides
$directory = "Beheer/slideshow/";

if (is_dir($directory)) {
	if ($dh = opendir($directory)) {
		while (($file = readdir($dh)) !== false) {
			// Controleer of het een bestand is en geen directory
			if (is_file($directory . "/" . $file)) {
				// Haal de extensie van het bestand op
				$extension = pathinfo($file, PATHINFO_EXTENSION);
				// Controleer of de extensie .jpg is
				if ($extension == "jpg" || $extension == "JPG") {
					$Hulp_1 = $file;		//Slide_1000_01 
					if (substr($Hulp_1, 0, 6) == "Slide_") {
						$Hulp_2 = substr($Hulp_1, 6, 4);	//gebr nr
						if (intval($Hulp_2) == $Gebruiker_nr) {
							$Name_delete = $directory . $file;
							unlink($Name_delete);
						}	//end if = gebruiker
					}	//end if Slide_
				}	//end if is jpg
			}	//end if is dir
		}	//end while

		closedir($dh);
	}	//end if open dir
}	//end if dir

//email zenden
$msg = "Account ToernooiProf verwijderd door $Gebruiker_naam met nummer $Gebruiker_nr";
$headers = "From: info@specialsoftware.nl";
// send email
mail("hanseekels@gmail.com", "Account verwijderd", $msg, $headers);

//Melding
$error_message = "Account $Gebruiker_naam definitief verwijderd !<br><br>U keert terug naar de startpagina.";
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Account verwijderd</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
	<link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="PHP/script_toernooi.js" defer></script>
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
			<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
			<td width="340" align="center" valign="middle" bgcolor="#003300">
				<h1>Melding</h1>
			</td>
		</tr>
		<tr>
			<td height="50" colspan="2" align="center">
				<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
					<?php print($error_message); ?>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
				<form name="akkoord" method="post" action="Toernooi_inloggen.php">
					<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
						title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
				</form>
			</td>
		</tr>
		<tr>
			<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>