<?php
//© Hans Eekels, versie 22-06-2025
//Tablet_terug
//terug naar bediening en hier record bj_uitslag_hulp_tablet aanpassen door laatste scores B te verwijderen en turn blijft op 2
require_once('../../../../../data/connectie_clubmatch.php');
$Path = '../../../../../data/connectie_clubmatch.php';
require_once('../../../ClubMatch/PHP/Functies_biljarten.php');

/*
var_dump($_POST) geeft:
array(6) { 
["u_code"]=> string(10) "2_010_001 " 
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "2" 
["car_A_tem"]=> string(2) "48" 
["car_B_tem"]=> string(2) "59" }
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

$Car_A_tem = intval($_POST['car_A_tem']);
$Car_B_tem = intval($_POST['car_B_tem']);

$Max_beurten = fun_maxbeurten($Org_nr, $Comp_nr, $Path);

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

	//uitslag hulp aanpassen
	$sql = "SELECT * FROM bj_uitslag_hulp_tablet
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		//data uit bestaand record
		$Brt = $resultaat['brt'];
		//voor eventuele alert = 1
		$Car_A_gem = $resultaat['car_A_gem'];
		$Car_A_tem = $resultaat['car_A_tem'];

		if ($Car_A_gem == $Car_A_tem || $Brt == $Max_beurten) {
			$Alert = 1;
		} else {
			$Alert = 0;
		}
	}

	//als brt=1 dan alles van B op 0 anders resultaat brt-1 ophalen
	if ($Brt == 1) {
		$Car_gem_B_nieuw = 0;
		$Serie_B_nieuw = 0;
		$Hs_B_nieuw = 0;
	} else {
		//ophalen vorige beurt
		$Beurt_vorig = intval($Brt - 1);
		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Beurt_vorig'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit record brt - 1
			$Car_gem_B_nieuw = $resultaat['car_B_gem'];
			$Hs_B_nieuw = $resultaat['hs_B'];
			$Serie_B_nieuw = 0;
		}
	}

	//updaten in record $Brt
	$sql = "UPDATE bj_uitslag_hulp_tablet SET car_B_gem = '$Car_gem_B_nieuw', serie_B = '$Serie_B_nieuw', hs_B = '$Hs_B_nieuw', turn = '2', alert = '$Alert'
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//status tafel terug naar 1
	$sql = "UPDATE bj_tafel SET status = '1' WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code' AND tafel_nr = '$Tafel_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//nu terug naar bediening
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
	<form method="post" action="Tablet_bediening.php">
		<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
		<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
		<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
		<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>" />
	</form>
</body>

</html>