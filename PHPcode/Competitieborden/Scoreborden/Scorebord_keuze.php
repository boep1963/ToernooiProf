<?php
//© Hans Eekels, versie 04-12-2025
//Vangt keuze op uit Scorebord_eind.php, nl akkoord opslaan of niet akkoord terug naar score
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../../ClubMatch/PHP/Functies_biljarten.php");

$Punten = array();
$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(5) { ["Cancel"]=> string(19) "Niet akkoord: terug" ["u_code"]=> string(9) "2_001_002" ["user_code"]=> string(10) "1002_CRJ@#" ["comp_nr"]=> string(10) "1 " ["periode"]=> string(1) "2" }
//of
//array(5) { ["Akkoord"]=> string(24) "Akkoord: volgende partij" ["u_code"]=> string(9) "2_001_002" ["user_code"]=> string(10) "1002_CRJ@#" ["comp_nr"]=> string(10) "1 " ["periode"]=> string(1) "2" }

//check
$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

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
	$Comp_nr = intval($_POST['comp_nr']);
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['periode'])) {
	$bAkkoord = FALSE;
} else {
	$Periode = intval($_POST['periode']);
	if (filter_var($Periode, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['u_code'])) {
	$bAkkoord = FALSE;
} else {
	$Code_hulp = $_POST['u_code'];
	$U_code = str_replace(" ", "", $Code_hulp);
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
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
if (isset($_POST['Akkoord'])) {
	//Uitslag opslaan
	$Vandaag = Date("Y-m-d");
	
	//Dan partij delete en uitslag_hulp delete
	//dan terug naar partij-keuze
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//haal data op uit tp_uitslag_hulp
		$sql = "SELECT * FROM bj_uitslag_hulp 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code'  ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Car_1_tem = $resultaat['car_A_tem'];
			$Car_2_tem = $resultaat['car_B_tem'];
			$Car_1_gem = $resultaat['car_A_gem'];
			$Car_2_gem = $resultaat['car_B_gem'];
			$Hs_1 = $resultaat['hs_A'];
			$Hs_2 = $resultaat['hs_B'];
			$Brt = $resultaat['brt'];
		}

		//bepaal spelernummer uit $U_code
		$A = substr($U_code, 2, 3);		//007
		$Sp_1 = intval($A);
		$B = substr($U_code, 6, 3);		//012
		$Sp_2 = intval($B);

		//bepaal punten
		$Punten = fun_punten($Org_nr, $Comp_nr, $Periode, $Sp_1, $Car_1_gem, $Sp_2, $Car_2_gem, $Brt, $Path);
		$Punt_1 = $Punten[1];
		$Punt_2 = $Punten[2];

		//uitslag invoeren
		$sql = "INSERT INTO bj_uitslagen 
		(org_nummer, comp_nr, uitslag_code, periode, speeldatum, sp_1_nr, sp_1_cartem, sp_1_cargem, sp_1_hs, sp_1_punt, brt, sp_2_nr, sp_2_cartem, sp_2_cargem, sp_2_hs, sp_2_punt, gespeeld)
		VALUES 
		('$Org_nr', '$Comp_nr', '$U_code', '$Periode', '$Vandaag', '$Sp_1', '$Car_1_tem', '$Car_1_gem', '$Hs_1', '$Punt_1', '$Brt', '$Sp_2', '$Car_2_tem', '$Car_2_gem', '$Hs_2', '$Punt_2', '1')";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//delete partij
		$sql = "DELETE FROM bj_partijen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//delete uitslaghulp
		$sql = "DELETE FROM bj_uitslag_hulp WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$sql = "DELETE FROM bj_uitslag_hulp_tablet WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$sql = "DELETE FROM bj_tafel WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code'";
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
		<meta charset="UTF-8">
		<title>Redirect</title>
		<script type="text/javascript">
			window.onload = function() {
				document.forms[0].submit();
			}
		</script>
	</head>

	<body style="background-color:#333; margin:0;">
		<form method="post" action="Kies_tafel.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
		</form>
	</body>

	</html>
<?php
} else {
	//data speler B van 1 beurt geleden en turn op 1 in dab
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Beurten = $resultaat['brt'];
			$Car_A_gem = $resultaat['car_A_gem'];
			$Car_A_tem = $resultaat['car_A_tem'];
		}

		if ($Beurten > 1) {
			//vorige beurt ophalen
			$Beurten_hulp = $Beurten - 1;
			$sql = "SELECT * FROM bj_uitslag_hulp 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten_hulp'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				//data uit bestaand record
				$Car_B_gem = $resultaat['car_B_gem'];
				$Hs_B = $resultaat['hs_B'];
			}

			$Turn = 1;

			if ($Car_A_gem == $Car_A_tem) {
				$Alert = 1;
			} else {
				$Alert = 0;
			}

			$sql = "UPDATE bj_uitslag_hulp SET car_B_gem = '$Car_B_gem', hs_B = '$Hs_B', turn = '$Turn', alert = '$Alert' 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		} else {
			$Car_B_gem = 0;
			$Hs_B = 0;
			$Turn = 1;

			if ($Car_A_gem == $Car_A_tem) {
				$Alert = 1;
			} else {
				$Alert = 0;
			}

			$sql = "UPDATE bj_uitslag_hulp SET car_B_gem = '$Car_B_gem', hs_B = '$Hs_B', turn = '$Turn', alert = '$Alert' 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

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
		<form method="post" action="Scorebord_start.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?>">
		</form>
	</body>

	</html>
<?php
}
?>