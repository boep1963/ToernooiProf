<?php
//© Hans Eekels, versie 04-12-2025
//Tablet_resultaat opslaan vanuit Tablet_resultaat.php
//opslaan in uitslagen en gespeeld
//gespeeld = 1 in partijen
//status tafel op 0, dus delete
//terug naar kies tafel op tablet
//speeldatum vandaag toegevoegd
require_once('../../../../../data/connectie_clubmatch.php');
$Path = '../../../../../data/connectie_clubmatch.php';
require_once('../../../ClubMatch/PHP/Functies_biljarten.php');

/*
var_dump($_POST) geeft:
array(11) { 
["u_code"]=> string(10) "2_009_001 " 
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "1" 

["car_A_gem"]=> string(2) "20" 
["hs_A"]=> string(1) "6" 
["punten_A"]=> string(1) "2" 
["brt"]=> string(1) "4" 
["car_B_gem"]=> string(2) "13" 
["hs_B"]=> string(1) "6" 
["punten_B"]=> string(1) "0" }
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
	$Sp_nrA = intval(substr($U_code, 2, 3));
	$Sp_nrB = intval(substr($U_code, 6, 3));
}

$Car_A_gem = $_POST['car_A_gem'];
$Hs_A = $_POST['hs_A'];
$Punten_A = $_POST['punten_A'];
$Brt = $_POST['brt'];
$Car_B_gem = $_POST['car_B_gem'];
$Hs_B = $_POST['hs_B'];
$Punten_B = $_POST['punten_B'];

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
$Vandaag = Date("Y-m-d");
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM bj_partijen
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode' AND uitslag_code = '$U_code'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Car_A_tem = $resultaat['cartem_A'];
		$Sp_nrA_check = $resultaat['nummer_A'];
		$Car_B_tem = $resultaat['cartem_B'];
		$Sp_nrB_check = $resultaat['nummer_B'];
	}

	//invoeren uitslag
	$sql = "INSERT INTO bj_uitslagen 
	(org_nummer, comp_nr, uitslag_code, periode, speeldatum, sp_1_nr, sp_1_cartem, sp_1_cargem, sp_1_hs, sp_1_punt, brt, sp_2_nr, sp_2_cartem, sp_2_cargem, sp_2_hs, sp_2_punt, gespeeld) 
	VALUES 
	('$Org_nr', '$Comp_nr', '$U_code', '$Periode', '$Vandaag', '$Sp_nrA', '$Car_A_tem', '$Car_A_gem', '$Hs_A', '$Punten_A', '$Brt', '$Sp_nrB', '$Car_B_tem', '$Car_B_gem', '$Hs_B', '$Punten_B', '1')";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//overige aanpassingen
	//gespeeld in partijen
	$sql = "DELETE FROM bj_partijen 
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode' AND uitslag_code = '$U_code'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//bj_tafel delete
	$sql = "DELETE FROM bj_tafel WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code' AND tafel_nr = '$Tafel_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//bj_uitslag_hulp_tablet delete
	$sql = "DELETE FROM bj_uitslag_hulp_tablet WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//bepaal naam hiddenveld voor tafel: vorm ["tafel_04"]
if ($Tafel_nr < 10) {
	$NmTf = "tafel_" . "0" . $Tafel_nr;
} else {
	$NmTf = "tafel_" . $Tafel_nr;
}

//naar tablet kies tafel
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
	<form method="post" action="Tablet_toon_tafel.php">
		<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
		<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
		<input type="hidden" name="<?php print("$NmTf"); ?>" value="0">
	</form>
</body>

</html>