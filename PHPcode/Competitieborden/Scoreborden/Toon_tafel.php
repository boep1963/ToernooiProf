<?php
//© Hans Eekels, versie 11-07-2025
//Toon alle wedstrijden voor gekozen tafel
//Toon geen partijen die nu bezig zijn
//order by aangepast
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../../ClubMatch/PHP/Functies_biljarten.php");
$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(3) { ["user_code"]=> string(10) "1002_CRJ@#" ["comp_nr"]=> string(1) "1" ["tafel_nr"]=> string(1) "5" }
*/

$Partijen = array();			//alle aangemaakte partijen excl die bezig zijn
$Partijen_hulp = array();		//alle aangemaakte partijen incl die bezig zijn

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

//check
if (isset($_POST['user_code'])) {
	$Code = $_POST['user_code'];
	if (strlen($Code) != 10) {
		$bAkkoord = FALSE;
	} else {
		if (fun_bestaatorg($Code, $Path) == FALSE) {
			$bAkkoord = FALSE;
		} else {
			$Org_nr = substr($Code, 0, 4);
			$Org_naam = fun_orgnaam($Org_nr, $Path);
			$Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_" . $Org_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['comp_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Comp_nr = $_POST['comp_nr'];
	$Comp_naam = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
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
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../ClubMatch/PHP/script_competitie.js" defer></script>
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
					<form name="cancel" method="post" action="../../Start.php">
						<input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					</form>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&nbsp;&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
$Aantal_tafels = fun_aantaltafels($Code, $Path);


//aantal wedstrijden ophalen voor tafelnummer (ook 0 = allemaal)
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM bj_partijen 
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND gespeeld = '0' ORDER BY part_id";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0) {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Tafel_string = $resultaat['tafel'];
			if (fun_tafel_nummers($Tafel_string, $Aantal_tafels, $Tafel_nr, 2) == 1) {
				$teller++;
				$Periode = $resultaat['periode'];
				$SpA = $resultaat['nummer_A'];
				$Partijen_hulp[$teller]['naam_A'] = fun_spelersnaam_competitie($SpA, $Org_nr, $Comp_nr, $Periode, 1, $Path);
				$SpB = $resultaat['nummer_B'];
				$Partijen_hulp[$teller]['naam_B'] = fun_spelersnaam_competitie($SpB, $Org_nr, $Comp_nr, $Periode, 1, $Path);
				$Partijen_hulp[$teller]['uitslag_code'] = $resultaat['uitslag_code'];
			}
		}

		$Aantal_partijen_hulp = $teller;
	} else {
		$Aantal_partijen = 0;
	}

	//nu overslaan partijen die bezig zijn, dus een record hebben in bj_uitslag_hulp
	if ($Aantal_partijen_hulp != 0) {
		$teller = 0;

		for ($a = 1; $a < $Aantal_partijen_hulp + 1; $a++) {
			$Uitslag_code = $Partijen_hulp[$a]['uitslag_code'];

			$sql = "SELECT * FROM bj_uitslag_hulp 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$Uitslag_code'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			if (mysqli_num_rows($res) == 0) {
				$teller++;
				$Partijen[$teller]['naam_A'] = $Partijen_hulp[$a]['naam_A'];
				$Partijen[$teller]['naam_B'] = $Partijen_hulp[$a]['naam_B'];
				$Partijen[$teller]['uitslag_code'] = $Partijen_hulp[$a]['uitslag_code'];
			}
		}	//end for

		$Aantal_partijen = $teller;
	}	//end if

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
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
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
				<td colspan="4" height="50" align="center" bgcolor="#003300">
					<h1>Kies wedstrijd</h1>
				</td>
			</tr>
			<tr>
				<td width="200" align="center" bgcolor="#003300">
					<img src="Pijl.jpg" width="190" height="190" alt="Kies">
				</td>
				<td width="810" align="center" bgcolor="#003300">
					<h1>Speler A</h1>
				</td>
				<td width="40" height="30" align="center" bgcolor="#003300">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</td>
				<td width="810" align="center" bgcolor="#003300">
					<h1>Speler B</h1>
				</td>
			</tr>
			<?php
			if ($Aantal_partijen == 0) {
			?>
				<tr>
					<td colspan="4" height="40" align="center" valign="middle">
						<h1>Geen partijen beschikbaar</h1>
					</td>
				</tr>
				<?php
			} else {
				for ($a = 1; $a < $Aantal_partijen + 1; $a++) {
					$Naam_A = $Partijen[$a]['naam_A'];
					$Naam_B = $Partijen[$a]['naam_B'];
					$U_code = $Partijen[$a]['uitslag_code'];
				?>
					<tr>
						<td height="106" align="center" valign="middle">
							<input type="submit" class="submit-button" name="u_code"
								value="<?php print("$U_code"); ?>" style="width:200px; height:100px; background-color:#FF0; color:#FF0;" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
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
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</td>
			</tr>
		</table>
	</form>
</body>

</html>