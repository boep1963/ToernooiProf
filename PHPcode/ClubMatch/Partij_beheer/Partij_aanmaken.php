<?php
//© Hans Eekels, versie 02-12-2025
//Partij aanmaken of verwijderen nav keuze in aanmaak_matrix
//bij verwijderen ook bj_partijen, bj_tafel, bj_uitslag_hulp en bj_uitslag_hulp_tablet deleten
//Refresh Logo
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");
$Copy = Date("Y");

$Tafels = array();

/*
var_dump($_POST) geeft:
array(7) { 
["tafel_1"]=> string(1) "1" ["tafel_2"]=> string(1) "2" ["tafel_4"]=> string(1) "4"		//geen tafel_3, en bij 8 tafels geen tafels 5,6,7,8 NIET aangevinkt

["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" 
["periode_keuze"]=> string(1) "1" 
["Aan_1_2"]=> string(0) "" }
*/

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

if (!isset($_POST['comp_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Comp_nr = $_POST['comp_nr'];
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['periode_keuze'])) {
	$bAkkoord = FALSE;
} else {
	$Periode = $_POST['periode_keuze'];
	if ($Periode > 0) {
		if (filter_var($Periode, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
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

//["Aan_21_24"]=> string(0) ""	//aanmaken partij met spelers 21 en 24
//["Uit_21_24"]=> string(0) ""	//verwijderen partij met spelers 21 en 24
//spelernummers tussen 1 en 999

$Aantal_tafels = fun_aantaltafels($Code, $Path);
//initialiseren
for ($x = 1; $x < $Aantal_tafels + 1; $x++) {
	$Tafels[$x]['tafel_nr'] = $x;
	$Tafels[$x]['keuze'] = 0;		//wordt 1 bij gekozen en dus doorgegeven in $_POST
}

foreach ($_POST as $key => $value) {
	$Hulp_1 = $key;
	//partij-code bij aanmaak partij
	if (substr($Hulp_1, 0, 3) == "Aan" || substr($Hulp_1, 0, 3) == "Uit") {
		if (substr($Hulp_1, 0, 3) == "Aan") {
			$bAanmaken = TRUE;
		}
		if (substr($Hulp_1, 0, 3) == "Uit") {
			$bAanmaken = FALSE;
		}
		//nu spelers
		$Lengte = strlen($Hulp_1);
		$Pos_1 = strpos($Hulp_1, "_", 0);
		$Pos_2 = strrpos($Hulp_1, "_", 0);
		//speler 1 tussen 1e en 2e streepje
		$Nr_1 = substr($Hulp_1, $Pos_1 + 1, $Pos_2 - $Pos_1 - 1);
		//speler 2 na 2e streepje tot eind string
		$Nr_2 = substr($Hulp_1, $Pos_2 + 1, $Lengte - $Pos_2 - 1);
		//voorloopnullen weg
		if (substr($Nr_1, 0, 1) == "0") {
			$L_1 = strlen($Nr_1);
			$Nr_1 = substr($Nr_1, 1, $L_1 - 1);
			if (substr($Nr_1, 0, 1) == "0") {
				$L_1 = strlen($Nr_1);
				$Nr_1 = substr($Nr_1, 1, $L_1 - 1);
			}
		}

		if (substr($Nr_2, 0, 1) == "0") {
			$L_1 = strlen($Nr_2);
			$Nr_2 = substr($Nr_2, 1, $L_1 - 1);
			if (substr($Nr_2, 0, 1) == "0") {
				$L_1 = strlen($Nr_2);
				$Nr_2 = substr($Nr_2, 1, $L_1 - 1);
			}
		}
	}

	//tafel_2
	if (substr($Hulp_1, 0, 6) == "tafel_") {
		$Nr_taf = $value;
		$Tafels[$Nr_taf]['keuze'] = 1;
	}
}

/*
var_dump($Tafels) geeft:
array(8) { [1]=> array(2) { ["tafel_nr"]=> int(1) ["keuze"]=> int(1) } [2]=> array(2) { ["tafel_nr"]=> int(2) ["keuze"]=> int(1) } [3]=> array(2) { ["tafel_nr"]=> int(3) ["keuze"]=> int(0) } [4]=> array(2) { ["tafel_nr"]=> int(4) ["keuze"]=> int(0) } [5]=> array(2) { ["tafel_nr"]=> int(5) ["keuze"]=> int(0) } [6]=> array(2) { ["tafel_nr"]=> int(6) ["keuze"]=> int(1) } [7]=> array(2) { ["tafel_nr"]=> int(7) ["keuze"]=> int(0) } [8]=> array(2) { ["tafel_nr"]=> int(8) ["keuze"]=> int(0) } }
*/
$Tafel_nr = fun_string_tafels($Tafels, $Aantal_tafels);		//string 12 1 en 0 om op te slaan als sting
/*
print("$Tafel_nr") geeft: 
100000100000
dan tafels 1 en 7 op 1 dus aangevinkt
*/

//verder
//namen en car te maken spelers
$Naam_1 = fun_spelersnaam_competitie($Nr_1, $Org_nr, $Comp_nr, $Periode, 2, $Path);
$Cartem_1 = fun_temakencar($Nr_1, $Org_nr, $Comp_nr, $Periode, $Path);
$Naam_2 = fun_spelersnaam_competitie($Nr_2, $Org_nr, $Comp_nr, $Periode, 2, $Path);
$Cartem_2 = fun_temakencar($Nr_2, $Org_nr, $Comp_nr, $Periode, $Path);

//uitslag_code is periode_nr1_nr2 met voorloopnullen
if (strlen($Nr_1) == 1) {
	$A = "00" . $Nr_1;
}
if (strlen($Nr_1) == 2) {
	$A = "0" . $Nr_1;
}
if (strlen($Nr_1) == 3) {
	$A = $Nr_1;
}

if (strlen($Nr_2) == 1) {
	$B = "00" . $Nr_2;
}
if (strlen($Nr_2) == 2) {
	$B = "0" . $Nr_2;
}
if (strlen($Nr_2) == 3) {
	$B = $Nr_2;
}

$Code_hulp = $Periode . "_" . $A . "_" . $B;
$Uitslag_code = str_replace(" ", "", $Code_hulp);	//deze code gebruiken om aan te maken
//omdat de verwijderknop zowel staat op positie 1-4 als op positie 4-1, moet bij verwijderen beide codes gebruikt worden
$Code_hulp_2 = $Periode . "_" . $B . "_" . $A;
$Uitslag_code_2 = str_replace(" ", "", $Code_hulp_2);	//deze code ook gebruiken ook om te deleten

//opslaan of verwijderen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	if ($bAanmaken == TRUE) {
		//insert
		$sql = "INSERT INTO bj_partijen (org_nummer, comp_nr, nummer_A, naam_A, cartem_A, tafel, nummer_B, naam_B, cartem_B, periode, uitslag_code, gespeeld)
		VALUES ('$Org_nr', '$Comp_nr', '$Nr_1', '$Naam_1', '$Cartem_1', '$Tafel_nr', '$Nr_2', '$Naam_2', '$Cartem_2', '$Periode', '$Uitslag_code', '0')";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
	} else {
		//delete partij
		$sql = "DELETE FROM bj_partijen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//delete bj_tafel
		$sql = "DELETE FROM bj_tafel WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (u_code = '$Uitslag_code' OR u_code = '$Uitslag_code_2')";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//delete bj_uitslag_hulp
		$sql = "DELETE FROM bj_uitslag_hulp WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//delete bj_uitslag_hulp_tablet
		$sql = "DELETE FROM bj_uitslag_hulp_tablet WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}
//melding
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Partij verwerkt</title>
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<style type="text/css">
		body,
		td,
		th {
			font-family: Verdana;
			font-size: 16px;
			color: #FFF;
		}

		.klein {
			font-family: Verdana;
			font-size: 10px;
			color: #FFF;
		}

		h1 {
			font-size: 36px;
		}

		h2 {
			font-size: 16px;
		}

		body {
			background-color: #000;
			margin-top: 100px;
			margin-right: auto;
			margin-bottom: 0px;
			margin-left: auto;
			width: 500px;
		}

		.submit-button {
			border: 2px solid transparent;
			cursor: pointer;
		}

		.submit-button:hover {
			border-color: #FFF;
		}
	</style>
	<script type="text/javascript">
		function mouseInBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "#FFF";
		}

		function mouseOutBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "transparent";
		}
	</script>
</head>

<body>
	<table width="500" border="0">
		<tr>
			<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
			<td width="340" align="center" valign="middle" bgcolor="#003300">
				<h2>Partij verwerkt</h2>
			</td>
		</tr>
		<tr>
			<td height="100" colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px;">
					<?php
					if ($bAanmaken == TRUE) {
						print("Partij tussen $Naam_1 en $Naam_2 is opgeslagen.<br>U keert terug naar de matrix partij invoeren.");
					} else {
						print("Partij tussen $Naam_1 en $Naam_2 is verwijderd.<br>U keert terug naar de matrix partij invoeren.");
					}
					?>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="Invoer_matrix.php">
					<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
						title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="periode_keuze" value="<?php print("$Periode"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>