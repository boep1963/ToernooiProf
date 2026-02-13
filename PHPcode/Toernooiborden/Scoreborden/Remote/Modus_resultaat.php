<?php
//© Hans Eekels, versie 05-06-2025
//Modus score
//Toon resultaat partij (keuze akkoord of terug gebeurt op tablet)

require_once('../../../../../data/connectie_toernooiprof.php');
$Path = '../../../../../data/connectie_toernooiprof.php';
require_once('../../../ToernooiProf/PHP/Functies_toernooi.php');

$Punten = array();
/*
var_dump($_POST) geeft altijd:
array(3) { 
["user_code"]=> string(10) "1002_CRJ@#" 
["u_code"]
['poule_nr"]
["toernooi_nr"]
["tafel_nr"]=> string(1) "1"
*/

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
			$Logo_naam = "../../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['u_code'])) {
	$bAkkoord = FALSE;
} else {
	$Code_hulp = $_POST['u_code'];
	$U_code = str_replace(" ", "", $Code_hulp);
}

if (!isset($_POST['toernooi_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = $_POST['toernooi_nr'];
	$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['tafel_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Tafel_nr = $_POST['tafel_nr'];
}

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = $_POST['poule_nr'];
}

//check
if ($bAkkoord == FALSE) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ToernooiProf</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="Toernooi" />
		<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
		<link href="../../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
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
					<form name="cancel" method="post" action="../../../Start.php">
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

$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);

//check status
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_tafel
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND uitslag_code = '$U_code' AND poule_nr = '$Poule_nr' AND tafel_nr = '$Tafel_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0) {
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Status = $resultaat['status'];
		}
	} else {
		$Status = 0;
	}

	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

if ($Status == 0) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta charset="UTF-8">
		<title>Redirect</title>
		<script type="text/javascript">
			window.onload = function() {
				document.forms[0].submit();
			}
		</script>
	</head>

	<body style="background-color:#333; margin:0;">
		<form method="post" action="Modus_wachten.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Status == 1) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta charset="UTF-8">
		<title>Redirect</title>
		<script type="text/javascript">
			window.onload = function() {
				document.forms[0].submit();
			}
		</script>
	</head>

	<body style="background-color:#333; margin:0;">
		<form method="post" action="Modus_partij.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?>">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

//status = 2, dus resultaat tonen en in de loop
//verder
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//namen spelers
	$sql = "SELECT * FROM tp_uitslagen
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$U_code'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Sp1 = $resultaat['sp_nummer_1'];
		$Sp_A_naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp1, $Path);

		$Sp2 = $resultaat['sp_nummer_2'];
		$Sp_B_naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp2, $Path);
	}

	//rest
	$sql = "SELECT * FROM tp_uitslag_hulp_tablet 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' 
	AND tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Beurten = $resultaat['brt'];
		$Car_A_gem = $resultaat["car_A_gem"];
		$Sp_A_car = $resultaat['car_A_tem'];
		$Car_B_gem = $resultaat["car_B_gem"];
		$Sp_B_car = $resultaat['car_B_tem'];
		$Hs_A = $resultaat["hs_A"];
		$Hs_B = $resultaat["hs_B"];
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//resultaat berekenen
if ($Beurten > 0) {
	$Moy_A = number_format(floor($Car_A_gem / $Beurten * 1000) / 1000, 3);
	$Moy_B = number_format(floor($Car_B_gem / $Beurten * 1000) / 1000, 3);
} else {
	$Moy_A = 0;
	$Moy_B = 0;
}
$sp_1_percar = floor($Car_A_gem / $Sp_A_car * 10000) / 100;
$sp_2_percar = floor($Car_B_gem / $Sp_B_car * 10000) / 100;

//punten bepalen
$Punten = fun_punten($Gebruiker_nr, $Toernooi_nr, $Sp_A_car, $Car_A_gem, $Sp_B_car, $Car_B_gem, $Path);
$Sp_A_punten = $Punten[1];
$Sp_B_punten = $Punten[2];

//pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Eind uitslag</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ToernooiProf" />
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
			font-size: 72px;
		}

		h2 {
			font-size: 32px;
		}

		body {
			background-color: #000;
			margin-top: 20px;
			margin-right: auto;
			margin-bottom: 0px;
			margin-left: auto;
			width: 1900px;
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
		function myFunction() {
			location.reload(true);
		}

		setInterval(function() {
			location.reload(true);
		}, 5000); // 300.000 milliseconden = 5 minuten

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

<body onContextMenu="return false">
	<form name="resultaat" method="post" action="Modus_resultaat.php">
		<table width="1900" border="0">
			<tr>
				<td height="35" colspan="6" align="center" valign="middle" bgcolor="#003300">
					<h1>Eind uitslag</h1>
				</td>
			</tr>
			<tr>
				<td width="945" align="left" valign="middle" bgcolor="#666666">
					<h1>Naam</h1>
				</td>
				<td width="198" align="center" valign="middle" bgcolor="#666666">
					<h1>Car</h1>
				</td>
				<td width="194" align="center" valign="middle" bgcolor="#666666">
					<h1>Brt</h1>
				</td>
				<td width="201" align="center" valign="middle" bgcolor="#666666">
					<h1>Moy</h1>
				</td>
				<td width="150" align="center" valign="middle" bgcolor="#666666">
					<h1>HS</h1>
				</td>
				<td width="186" align="center" valign="middle" bgcolor="#666666">
					<h1>Pnt</h1>
				</td>
			</tr>
			<tr>
				<td height="50" align="left" valign="middle" bgcolor="#333333">
					<h1><?php print("$Sp_A_naam"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Car_A_gem"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Beurten"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Moy_A"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Hs_A"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Sp_A_punten"); ?></h1>
				</td>
			</tr>
			<tr>
				<td height="50" align="left" valign="middle" bgcolor="#333333">
					<h1><?php print("$Sp_B_naam"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Car_B_gem"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Beurten"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Moy_B"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Hs_B"); ?></h1>
				</td>
				<td align="center" valign="middle" bgcolor="#333333">
					<h1><?php print("$Sp_B_punten"); ?></h1>
				</td>
			</tr>
		</table>
	</form>
</body>

</html>