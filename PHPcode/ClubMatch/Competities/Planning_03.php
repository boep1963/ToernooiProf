<?php
//© Hans Eekels, versie 03-12-2025
//Dagdeel planning maken: kies leden en # partijen
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

/*
var_dump($_POST) geeft:

array(17) { 
	["Part_01"]=> string(9) "2_020_019" 								//uitslag_code voor partij 1
		["01_tafel_01"]=> string(1) "1" ["01_tafel_06"]=> string(1) "6" 	//gekozen tafels (1 en 6) bij partij 1
	["Part_02"]=> string(9) "2_002_004" 								//uitslagcode partij 2
		["02_tafel_02"]=> string(1) "2" 									//gekozen tafel (2) bij partij 2
		
		["03_tafel_10"]=> string(2) "10"									//wees-tafel (bij vergissing aangevinkt, maar niet de bijbehorende partij aangevinkt =>overslaan !
	
	["Part_04"]=> string(9) "2_005_004" 								//uitslagcode partij 4
		["04_tafel_03"]=> string(1) "3" 									//gekozen tafel (3) bij partij 4
	["Part_05"]=> string(9) "2_009_002" 								//uitslagcode partij 5
		["05_tafel_01"]=> string(1) "1" ["05_tafel_02"]=> string(1) "2" ["05_tafel_03"]=> string(1) "3" ["05_tafel_04"]=> string(1) "4" //gekozen tafels (1, 2, 3, 4) bij partij 4
	
	NB: als er geen tafels zijn gekozen bij een partij, dan alle tafels als geselecteerd beschouwen (zie hierna)
	
	["user_code"]=> string(10) "1089_LRW@#" 
	["comp_nr"]=> string(1) "1" 
	["periode_keuze"]=> string(1) "2" 
	["str_var"]=> string(280) "YTozOntpOjE7YTo........." }
*/

$Copy = Date("Y");
$Tafels = array();
$Tafels_hulp = array();
$Partijen = array();

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
	$Comp_naam = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['periode_keuze'])) {
	$bAkkoord = FALSE;
} else {
	$Periode_keuze = $_POST['periode_keuze'];
	if (filter_var($Periode_keuze, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

//partijen doorgegeven ?
if (isset($_POST['str_var'])) {
	$str_var = $_POST['str_var'];
	$Partijen_def = unserialize(base64_decode($str_var));
} else {
	$bAkkoord = FALSE;
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

//rest opvang $_POST
$Aantal_tafels = fun_aantaltafels($Code, $Path);

$teller = 0;	//aantal doorgegeven partijen
foreach ($_POST as $key_var => $value_var) {
	if (substr($key_var, 0, 5) == "Part_") {
		$Part_nr = intval(substr($key_var, 5, 2));	//nodig voor tafels

		$teller++;
		$Partijen[$teller]['partij_nummer'] = $Part_nr;
		$Partijen[$teller]['uitslag_code'] = $value_var;
		$Periode = substr($value_var, 0, 1);
		$Partijen[$teller]['periode'] = $Periode;
		$Nr_1 = intval(substr($value_var, 2, 3));
		$Partijen[$teller]['nr_sp1'] = $Nr_1;
		$Nr_2 = intval(substr($value_var, 6, 3));
		$Partijen[$teller]['nr_sp2'] = $Nr_2;
		$Naam_1 = fun_spelersnaam_competitie($Nr_1, $Org_nr, $Comp_nr, $Periode, 2, $Path);
		$Partijen[$teller]['naam_sp1'] = $Naam_1;
		$Cartem_1 = fun_temakencar($Nr_1, $Org_nr, $Comp_nr, $Periode, $Path);
		$Partijen[$teller]['cartem_sp1'] = $Cartem_1;
		$Naam_2 = fun_spelersnaam_competitie($Nr_2, $Org_nr, $Comp_nr, $Periode, 2, $Path);
		$Partijen[$teller]['naam_sp2'] = $Naam_2;
		$Cartem_2 = fun_temakencar($Nr_2, $Org_nr, $Comp_nr, $Periode, $Path);
		$Partijen[$teller]['cartem_sp2'] = $Cartem_2;
	}	//end if $key_var = Part_
}	//end foreach

$Aantal_partijen = $teller;

if ($Aantal_partijen == 0) {
	$error_message = "U heeft geen enkele partij geselecteerd !<br>U keer terug naar de planning.";
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Geen Partijen geselecteerd</title>
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
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h2>Fout melding</h2>
				</td>
			</tr>
			<tr>
				<td height="100" colspan="2">
					<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px;">
						<?php
						print("$error_message");
						?>
					</div>
				</td>
			</tr>
			<tr>
				<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
					<form name="partijen" method="post" action="Planning_02.php">
						<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
							title="Naar planing" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
						<input type="hidden" id="str_var" name="str_var" value="<?php print base64_encode(serialize($Partijen_def)); ?>" />
					</form>
				</td>
			</tr>
			<tr>
				<td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

$teller_taf = 0;
foreach ($_POST as $key_var => $value_var) {
	if (substr($key_var, 2, 7) == "_tafel_") {
		$teller_taf++;
		$Part_nr_taf = intval(substr($key_var, 0, 2));
		$Taf_nr = $value_var;

		$Tafels_hulp[$teller_taf]['partij_nr'] = $Part_nr_taf;
		$Tafels_hulp[$teller_taf]['taf_nr'] = $Taf_nr;
	}
}

//aantal doorgegevens tafels
$Aantal_tafels_doorgegeven = $teller_taf;

//nu per partij de tafels opzoeken, taf_string maken en partij opslaan
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	for ($a = 1; $a < $Aantal_partijen + 1; $a++) {
		$Part_nr = $Partijen[$a]['partij_nummer'];
		//tafels initialiseren
		for ($x = 1; $x < $Aantal_tafels + 1; $x++) {
			$Tafels[$x]['keuze'] = 0;
		}
		//zoek bijbehorende tafels, indien geen, dan allemaal
		$taf_teller = 0;
		for ($b = 1; $b < $Aantal_tafels_doorgegeven + 1; $b++) {
			if ($Tafels_hulp[$b]['partij_nr'] == $Part_nr) {
				$taf_teller++;
				$Taf_nr = $Tafels_hulp[$b]['taf_nr'];
				$Tafels[$Taf_nr]['keuze'] = 1;
			}
		}	//end for per # doorgegeven tafels

		if ($teller == 0) {
			for ($x = 1; $x < $Aantal_tafels + 1; $x++) {
				$Tafels[$x]['keuze'] = 1;	//bij 0 tafels doorgegeven: alle tafels op 1
			}

			$Taf_string = fun_string_tafels($Tafels, $Aantal_tafels);
		} else {
			$Taf_string = fun_string_tafels($Tafels, $Aantal_tafels);
		}

		$Nr_1 = $Partijen[$a]['nr_sp1'];
		$Naam_1 = $Partijen[$a]['naam_sp1'];
		$Cartem_1 = $Partijen[$a]['cartem_sp1'];
		$Nr_2 = $Partijen[$a]['nr_sp2'];
		$Naam_2 = $Partijen[$a]['naam_sp2'];
		$Cartem_2 = $Partijen[$a]['cartem_sp2'];
		$Uitslag_code = $Partijen[$a]['uitslag_code'];

		$sql = "SELECT * FROM bj_partijen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND uitslag_code = '$Uitslag_code'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
		if (mysqli_num_rows($res) == 0) {
			//insert
			$sql = "INSERT INTO bj_partijen (org_nummer, comp_nr, nummer_A, naam_A, cartem_A, tafel, nummer_B, naam_B, cartem_B, periode, uitslag_code, gespeeld)
			VALUES ('$Org_nr', '$Comp_nr', '$Nr_1', '$Naam_1', '$Cartem_1', '$Taf_string', '$Nr_2', '$Naam_2', '$Cartem_2', '$Periode_keuze', '$Uitslag_code', '0')";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		}
	}	//end for per partij

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
	<title>Partijen verwerkt</title>
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
					print("Geselecteerde partijen opgeslagen en in de wachtrij gezet.<br>U keert terug naar de dag-planning.");
					?>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="Planning_02.php">
					<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
						title="Naar planning" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
					<input type="hidden" id="str_var" name="str_var" value="<?php print base64_encode(serialize($Partijen_def)); ?>" />
				</form>
			</td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>