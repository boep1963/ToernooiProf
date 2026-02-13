<?php
//© Hans Eekels, versie 23-06-2025
//Toon alle wedstrijden voor gekozen tafel (inclusief de partijen met keuze tafel = 0)
//Toon geen partijen die nu bezig zijn
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../../ToernooiProf/PHP/Functies_toernooi.php');

$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(3) { ["user_code"]=> string(10) "1001_CHR@#" ["toernooi_nr"]=> string(1) "1" ["tafel_nr"]=> string(1) "1" }
*/

$Partijen = array();			//alle aangemaakte partijen excl die bezig zijn

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

//check

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
			$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = $_POST['toernooi_nr'];
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['tafel_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Tafel_nr = $_POST['tafel_nr'];
	if ($Tafel_nr > 0) {
		if (filter_var($Tafel_nr, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (count($_POST) != 3) {
	$bAkkoord = FALSE;
}

//check
if ($bAkkoord == FALSE) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Toernooi programma</title>
		<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
		<meta name="Description" content="Toernooiprogramma" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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

//verder
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);

//aantal wedstrijden ophalen voor tafelnummer en tafnr = 0
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_uitslagen 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND gespeeld = '8' AND (tafel_nr = '$Tafel_nr' OR tafel_nr = '0') ORDER BY sp_poule";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0) {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$SpA = $resultaat['sp_nummer_1'];
			$Partijen[$teller]['naam_A'] = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $SpA, $Path);
			$SpB = $resultaat['sp_nummer_2'];
			$Partijen[$teller]['naam_B'] = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $SpB, $Path);
			$Partijen[$teller]['uitslag_code'] = $resultaat['sp_partcode'];
			$Partijen[$teller]['sp_poule'] = $resultaat['sp_poule'];
		}

		$Aantal_partijen = $teller;
	} else {
		$Aantal_partijen = 0;
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Partij kiezen</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<style type="text/css">
		body,
		td,
		th {
			font-family: Verdana;
			font-size: 16px;
			color: #FFF;
		}

		h1 {
			font-size: 60px;
		}

		h2 {
			font-size: 36px;
		}

		body {
			background-color: #000;
			margin-top: 0px;
			margin-right: auto;
			margin-bottom: 0px;
			margin-left: auto;
			width: 1900px;
		}

		.submit-button {
			border: 5px solid transparent;
			cursor: pointer;
		}

		.submit-button:hover {
			border-color: #F00;
		}
	</style>
	<script>
		function mouseInBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "#F00";
		}

		function mouseOutBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "transparent";
		}
	</script>
</head>

<body onContextMenu="return false">
	<form name="wedstrijden" method="post" action="Scorebord_start.php">
		<table width="1860" border="0">
			<tr>
				<td colspan="5" height="50" align="center" bgcolor="#003300">
					<h1>Kies wedstrijd</h1>
				</td>
			</tr>
			<tr>
				<td width="200" align="center" bgcolor="#003300">
					<img src="Pijl.jpg" width="190" height="190" alt="Kies">
				</td>
				<td width="200" align="center" bgcolor="#003300">
					<h1>Poule</h1>
				</td>
				<td width="710" align="center" bgcolor="#003300">
					<h1>Speler A</h1>
				</td>
				<td width="40" height="30" align="center" bgcolor="#003300">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
				</td>
				<td width="710" align="center" bgcolor="#003300">
					<h1>Speler B</h1>
				</td>
			</tr>
			<?php
			if ($Aantal_partijen == 0) {
			?>
				<tr>
					<td colspan="5" height="40" align="center" valign="middle">
						<h1>Geen partijen beschikbaar</h1>
					</td>
				</tr>
				<?php
			} else {
				for ($a = 1; $a < $Aantal_partijen + 1; $a++) {
					$Naam_A = $Partijen[$a]['naam_A'];
					$Naam_B = $Partijen[$a]['naam_B'];
					$U_code = $Partijen[$a]['uitslag_code'];
					$Poule = $Partijen[$a]['sp_poule'];
					$Naam_but = "Poule_" . $Poule;
				?>
					<tr>
						<td height="106" align="center" valign="middle">
							<input type="submit" class="submit-button" name="<?php print("$Naam_but"); ?>"
								value="<?php print("$U_code"); ?>" style="width:200px; height:100px; background-color:#FF0; color:#FF0;" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						</td>
						<td align="center" valign="middle" bgcolor="#003300">
							<h1><?php print("$Poule"); ?></h1>
						</td>
						<td align="center" valign="middle">
							<h1><?php print("$Naam_A"); ?></h1>
						</td>
						<td align="center" valign="middle">&nbsp;</td>
						<td align="center" valign="middle">
							<h1><?php print("$Naam_B"); ?></h1>
						</td>
					</tr>
			<?php
				}
			}
			?>
		</table>
	</form>
	<form name="cancel" method="post" action="Kies_tafel.php">
		<table width="1860" border="0">
			<tr>
				<td height="90" colspan="4" align="center" bgcolor="#003300">
					<input type="submit" style="width:170px; height:60px; font-size:36px;" value="Cancel" title="Terug naar beheer" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
				</td>
			</tr>
		</table>
	</form>
</body>

</html>