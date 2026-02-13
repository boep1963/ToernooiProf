<?php
//© Hans Eekels, versie 25-12-2025
//Competitie opslaan
//alle invoer escapen
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

/*
var_dump($_POST) geeft:
array(12) { 
["Naam"]=> string(6) "testen" 
["Datum"]=> string(8) "oktovber" 
["Discipline"]=> string(1) "1" 

["Punten"]=> string(1) "1" 
	["keuze"]=> string(2) "Ja" 			//Niet gekozen bij sys 2 en 3, bij sys 1 wel gekozen, dan ook extra bij Winst (standaard), bij Nee geen Remise en Verlies
	["Remise"]=> string(6) "Remise" 	//of niet gekozen
	["Verlies"]=> string(7) "Verlies" 	//of niet gekozen

["Moyform"]=> string(1) "4" 
["Mincar"]=> string(1) "3" 
["Maxbrt"]=> string(1) "0" 
["Vastbrt"]=> string(1) "0" 
["Sorteren"] => string(1) "1"		//1=op voornaam, 2= 0- achternaam
["user_code"]=> string(10) "1089_LRW@#" }
*/

$Copy = Date("Y");

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

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
			$Logo_naam = "../Beheer/uploads/Logo_" . $Org_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

//check
if (!isset($_POST['Naam'])) {
	$bAkkoord = FALSE;
} else {
	$Naam_hulp_1 = $_POST['Naam'];
	$Naam =	fun_test_input($Naam_hulp_1);
}

if (!isset($_POST['Datum'])) {
	$bAkkoord = FALSE;
} else {
	$Naam_hulp_2 = $_POST['Datum'];
	$Datum = fun_test_input($Naam_hulp_2);
}

if (!isset($_POST['Discipline'])) {
	$bAkkoord = FALSE;
} else {
	$Discipline = $_POST['Discipline'];
	if ($Discipline > 0) {
		if (filter_var($Discipline, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
}

/*
punten_sys
	["Punten"]=> string(1) "1" 			//1, 2 of 3
	["keuze"]=> string(2) "Ja" 			//Niet gekozen bij sys 2 en 3, bij sys 1 wel gekozen, dan ook extra bij Winst (standaard), bij Nee geen Remise en Verlies
	["Remise"]=> string(6) "Remise" 	//of niet gekozen
	["Verlies"]=> string(7) "Verlies" 	//of niet gekozen
*/
if (!isset($_POST['Punten'])) {
	$bAkkoord = FALSE;
} else {
	$Punten_hulp = intval($_POST['Punten']);
	$Punten = intval(10000 * $Punten_hulp);

	if ($Punten_hulp == 1) {
		if ($_POST['keuze'] == "Ja") {
			$Punten = intval(11100);
			if (isset($_POST['Remise'])) {
				$Punten = intval($Punten + 10);
			}
			if (isset($_POST['Verlies'])) {
				$Punten = intval($Punten + 1);
			}
		}
	}
}

//moyform
if (!isset($_POST['Moyform'])) {
	$bAkkoord = FALSE;
} else {
	$Moy_form = $_POST['Moyform'];
	if ($Moy_form > 0) {
		if (filter_var($Moy_form, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['Mincar'])) {
	$bAkkoord = FALSE;
} else {
	$Min_car = intval($_POST['Mincar']);
	if (filter_var($Min_car, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}
//Max beurten
if (!isset($_POST['Maxbrt'])) {
	$bAkkoord = FALSE;
} else {
	$Max_brt = intval($_POST['Maxbrt']);
	if ($Max_brt > 0) {
		if (filter_var($Max_brt, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}
//Vast aantal beurten
if (!isset($_POST['Vastbrt'])) {
	$Vast_brt = 0;
} else {
	$Vast_brt = intval($_POST['Vastbrt']);
	if ($Vast_brt > 0) {
		$Max_brt = 0;
	}
}

//Sorteren naam
if (!isset($_POST['Sorteren'])) {
	$bAkkoord = FALSE;
} else {
	$Sorteren = intval($_POST['Sorteren']);
}

if ($bAkkoord == FALSE) {
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";

	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../PHP/script_competitie.js" defer></script>
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
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//Vrij nummer opzoeken
	$sql = "SELECT comp_nr FROM bj_competities WHERE org_nummer = '$Org_nr' ORDER BY comp_nr DESC limit 1";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Nummer_competitie = 1;
	} else {
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nummer = $resultaat['comp_nr'];
		}

		$Nummer_competitie = $Nummer + 1;
	}

	//invoeren
	$sql = "INSERT INTO bj_competities (org_nummer, comp_nr, comp_naam, comp_datum, discipline, periode, punten_sys, moy_form, min_car, max_beurten, vast_beurten, sorteren) 
			VALUES ('$Org_nr', '$Nummer_competitie', '$Naam', '$Datum', '$Discipline', '1', '$Punten', '$Moy_form', '$Min_car', '$Max_brt', '$Vast_brt', '$Sorteren')";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
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
	<title>ClubMatch</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
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
			<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
			<td align="center" valign="middle" bgcolor="#003300">
				<h1>ClubMatch</h1>
			</td>
		</tr>
		<tr>
			<td align="center" colspan="2">
				<h1>Nieuwe competitie opgeslagen</h1>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
					Nieuwe competitie is opgeslagen en kan nu met de knop "Kies bestaande competitie" in het Startscherm geopend worden.<br><br>
					U moet bij de start van die competitie beginnen met het koppelen van leden aan die competitie.
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="../ClubMatch_start.php">
					<input type="submit" class="submit-button" value="Naar Startscherm" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
						title="Naar Startscherm" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>