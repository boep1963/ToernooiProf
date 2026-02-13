<?php
//© Hans Eekels, 22-06-2025
//Gebruik scoreborden ToernooiProf
//3 componenten:
//	slideshow advertenties/mededelingen
//	Naar competitie:
//		*	Caroussel standen
//		*	Gebruik scoreborden
//headers
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('../ToernooiProf/PHP/Functies_toernooi.php');

$Copy = Date("Y");
$Toernooien = array();

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1000_KYZ@#" }

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
			$Logo_naam = "../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
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
		<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
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
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<form name="cancel" method="post" action="../Start.php">
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

//toernooien opvragen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//spelers
	$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' ORDER BY tp_id DESC";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Aantal_toernooien = 0;
	} else {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Toernooien[$teller]['t_nummer'] = $resultaat['t_nummer'];
			$Toernooien[$teller]['t_naam'] = $resultaat['t_naam'];
			$Toernooien[$teller]['t_datum'] = $resultaat['t_datum'];
		}
		$Aantal_toernooien = $teller;
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Gebruik scoreborden</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../ToernooiProf/PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			width: 1800px;
		}

		.button:hover {
			border-color: #FFF;
		}

		h1 {
			font-size: 48px;
		}
	</style>
</head>

<body>
	<form name="tafels" method="post" action="Kies_optie.php">
		<table width="1800" border="0">
			<tr>
				<td width="500" height="105" bgcolor="#FF6600">
					<img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" />
				</td>
				<td align="center" bgcolor="#FF6600">
					<h1><?php print("$Gebruiker_naam"); ?></h1>
				</td>
			</tr>
			<tr>
				<td height="80" align="left" valign="middle" bgcolor="#FF6600">
					<table width="500">
						<tr>
							<td width="240" align="center">
								<a href="../Hulp/Handleiding_scorebord_toernooiprof.pdf" target="_blank">
									<input type="button" name="Handleiding" style="width:230px; height:60px; background-color:#FC0; color:#000; font-size:18px;" value="Handleiding Downloaden"
										onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
								</a>
							</td>
							<td class="grootwit">Voor de wedstrijdleider
							</td>
						</tr>
						<tr>
							<td align="center">
								<a href="Hulp/Handleiding_tel.pdf" target="_blank">
									<input type="button" name="Handleiding" style="width:230px; height:60px; background-color:#FC0; color:#000; font-size:18px;" value="Handleiding Downloaden"
										onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
								</a>
							</td>
							<td class="grootwit">Voor de schrijvers
							</td>
						</tr>
					</table>
				</td>
				<td align="center" valign="middle" bgcolor="#FF6600">
					<h1>Gebruik scoreborden bij ToernooiProf Online</h1>
				</td>
			</tr>
			<tr>
				<td height="50" align="left" valign="middle" bgcolor="#003300">
					<h1>&nbsp;Kies toernooi:</h1>
				</td>
				<td align="left" valign="middle" bgcolor="#003300" style="font-size:36px">
					<?php
					if ($Aantal_toernooien == 0) {
						print("Geen toernooi om te openen !");
					} else {
					?>
						<select name="toernooi_nr" style="font-size:48px">
							<?php
							for ($a = 1; $a < $Aantal_toernooien + 1; $a++) {
								$Num = $Toernooien[$a]['t_nummer'];
								$Nm = $Toernooien[$a]['t_naam'];
								$Dt = $Toernooien[$a]['t_datum'];
								$Naam = $Nm . " (" . $Dt . ")";
							?>
								<option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
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
				<td height="80" colspan="2" align="center" valign="middle" bgcolor="#FF6600">&nbsp;</td>
			</tr>
			<tr>
				<td height="100" align="center" valign="middle" bgcolor="#FF6600">
					<input type="button" onClick="location='../Start.php'" style="width:200px; height:80px; background-color:#666; color:#FFF; font-size:48px; font-weight:bold" value="Cancel"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
				</td>
				<td align="center" valign="middle" bgcolor="#FF6600">
					<input type="submit" style="width:200px; height:100px; background-color:#000; color:#FFF; font-size:48px; font-weight:bold" value="Kies"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
</body>

</html>