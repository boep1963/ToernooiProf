<?php
//© Hans Eekels, versie 10-11-2025
//Tablet_resultaat
require_once('../../../../../data/connectie_clubmatch.php');
$Path = '../../../../../data/connectie_clubmatch.php';
require_once('../../../ClubMatch/PHP/Functies_biljarten.php');

$Punten = array();
/*
var_dump($_POST) geeft:
array(4) { 
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "1" 
["u_code"]=> string(9) "2_010_001" }
*/

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

if (!isset($_POST['u_code'])) {
	$bAkkoord = FALSE;
} else {
	$Code_hulp = $_POST['u_code'];
	$U_code = str_replace(" ", "", $Code_hulp);
	//periode is eerste cijfer
	$Periode = intval(substr($U_code, 0, 1));
}

//check
if ($bAkkoord == FALSE) {
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
		<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
		<style type="text/css">
			body {
				width: 500px;
				background-color: #000;
				margin-top: 100px;
				margin-left: auto;
				margin-right: auto;
				font-family: Verdana, Geneva, sans-serif;
				font-size: 16px;
				color: #FFF;
			}

			h1 {
				font-size: 18px;
				color: #FFF;
			}

			.button:hover {
				border-color: #FFF;
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

	<body>
		<table width="500" border="0">
			<tr>
				<td align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print($error_message); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" align="center" valign="middle" bgcolor="#003300">
					<form name="cancel" method="post" action="Tablet_inloggen.php">
						<input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Terug naar inloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					</form>
				</td>
			</tr>
			<tr>
				<td height="20" align="right" bgcolor="#003300">&nbsp;</td>
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

	//namen spelers
	$sql = "SELECT * FROM bj_partijen
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode' AND uitslag_code = '$U_code'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Sp1 = $resultaat['nummer_A'];
		$Sp_A_naam = fun_spelersnaam_competitie($Sp1, $Org_nr, $Comp_nr, $Periode, 1, $Path);

		$Sp2 = $resultaat['nummer_B'];
		$Sp_B_naam = fun_spelersnaam_competitie($Sp2, $Org_nr, $Comp_nr, $Periode, 1, $Path);
	}

	//rest
	$sql = "SELECT * FROM bj_uitslag_hulp_tablet 
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code'  ORDER BY brt DESC limit 1";

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
$Punten = fun_punten($Org_nr, $Comp_nr, $Periode, $Sp1, $Car_A_gem, $Sp2, $Car_B_gem, $Beurten, $Path);

$Sp_A_punten = $Punten[1];
$Sp_B_punten = $Punten[2];

//pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
	<?php
	if ($Gebruiker_nr == 1024) {
		echo '<link rel="stylesheet" href="Media_1024.css">';
	} else {
		echo '<link rel="stylesheet" href="Media.css">';
	}
	?>
	<title>Uitslag</title>
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

<body>
	<table style="width:100%;" border="0" bgcolor="#000000">
		<tr>
			<td height="10" align="center" style="width:50%;"></td>
			<td align="center" style="width:10%;"></td>
			<td align="center" style="width:10%;"></td>
			<td align="center" style="width:10%;"></td>
			<td align="center" style="width:10%;"></td>
			<td align="center" style="width:10%;"></td>
		</tr>
		<tr>
			<td align="center" colspan="6">
				<h1>Eind uitslag</h1>
			</td>
		</tr>

		<tr>
			<td align="center" bgcolor="#999999">
				<h1>Naam</h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1>Car</h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1>Brt</h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1>Moy</h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1>HS</h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1>Pnt</h1>
			</td>
		</tr>
		<tr>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Sp_A_naam"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Car_A_gem"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Beurten"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Moy_A"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Hs_A"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Sp_A_punten"); ?></h1>
			</td>
		</tr>
		<tr>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Sp_B_naam"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Car_B_gem"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Beurten"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Moy_B"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Hs_B"); ?></h1>
			</td>
			<td align="center" bgcolor="#999999">
				<h1><?php print("$Sp_B_punten"); ?></h1>
			</td>
		</tr>
		<tr>
			<td align="center" bgcolor="#000000">
				<form name="akkoord" method="post" action="Tablet_opslaan.php">
					<input type="submit" class="cancel-button" style="background-color:#060;" value="Akkoord" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
					<input type="hidden" name="car_A_gem" value="<?php print("$Car_A_gem"); ?>">
					<input type="hidden" name="hs_A" value="<?php print("$Hs_A"); ?>">
					<input type="hidden" name="punten_A" value="<?php print("$Sp_A_punten"); ?>">
					<input type="hidden" name="brt" value="<?php print("$Beurten"); ?>">
					<input type="hidden" name="car_B_gem" value="<?php print("$Car_B_gem"); ?>">
					<input type="hidden" name="hs_B" value="<?php print("$Hs_B"); ?>">
					<input type="hidden" name="punten_B" value="<?php print("$Sp_B_punten"); ?>">
				</form>
			</td>
			<td colspan="5" align="center" bgcolor="#000000">
				<form name="cancel" method="post" action="Tablet_terug.php">
					<input type="submit" class="cancel-button" style="background-color:#F00;" value="Niet Akkoord" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
					<input type="hidden" name="car_A_tem" value="<?php print("$Sp_A_car"); ?>">
					<input type="hidden" name="car_B_tem" value="<?php print("$Sp_B_car"); ?>">
				</form>
			</td>
		</tr>
	</table>
</body>

</html>