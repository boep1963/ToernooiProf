<?php
//© Hans Eekels, versie 04-12-2025
//Uitslag opslaan en uit voorzorg: zelfde partij en scorebord-records verwijderen
//Speeldatum toegevoegd
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(14) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" ["periode_keuze"]=> string(1) "1" 
["speeldatum"]
["speler_A"]=> string(1) "4" ["speler_B"]=> string(1) "7" 
["car_A_tem"]=> string(2) "30" ["car_B_tem"]=> string(2) "39" ["car_A_gem"]=> string(2) "30" ["car_B_gem"]=> string(2) "35" 
["brt"]=> string(2) "34" 
["hs_A"]=> string(1) "3" ["hs_B"]=> string(2) "12" 
["punt_A"]=> string(2) "12" ["punt_B"]=> string(1) "8" }
*/

$Copy = Date("Y");

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

if (!isset($_POST['speeldatum'])) {
  $bAkkoord = FALSE;
} else {
  $Speeldatum = $_POST['speeldatum'];
}

if (!isset($_POST['speler_A'])) {
	$bAkkoord = FALSE;
} else {
	$Speler_A = intval($_POST['speler_A']);
	if ($Speler_A > 0) {
		if (filter_var($Speler_A, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['speler_B'])) {
	$bAkkoord = FALSE;
} else {
	$Speler_B = intval($_POST['speler_B']);
	if ($Speler_B > 0) {
		if (filter_var($Speler_B, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['car_A_tem'])) {
	$bAkkoord = FALSE;
} else {
	$Car_1_tem = intval($_POST['car_A_tem']);
	if ($Car_1_tem > 0) {
		if (filter_var($Car_1_tem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['car_B_tem'])) {
	$bAkkoord = FALSE;
} else {
	$Car_2_tem = intval($_POST['car_B_tem']);
	if ($Car_2_tem > 0) {
		if (filter_var($Car_2_tem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}


if (!isset($_POST['car_A_gem'])) {
	$bAkkoord = FALSE;
} else {
	$Car_1_gem = intval($_POST['car_A_gem']);
	if ($Car_1_gem > 0) {
		if (filter_var($Car_1_gem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['car_B_gem'])) {
	$bAkkoord = FALSE;
} else {
	$Car_2_gem = intval($_POST['car_B_gem']);
	if ($Car_2_gem > 0) {
		if (filter_var($Car_2_gem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['hs_A'])) {
	$bAkkoord = FALSE;
} else {
	$Hs_1 = intval($_POST['hs_A']);
	if ($Hs_1 > 0) {
		if (filter_var($Hs_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['hs_B'])) {
	$bAkkoord = FALSE;
} else {
	$Hs_2 = intval($_POST['hs_B']);
	if ($Hs_2 > 0) {
		if (filter_var($Hs_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['brt'])) {
	$bAkkoord = FALSE;
} else {
	$Brt = intval($_POST['brt']);
	if ($Brt > 0) {
		if (filter_var($Brt, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['punt_A'])) {
	$bAkkoord = FALSE;
} else {
	$Punt_1 = intval($_POST['punt_A']);
	if ($Punt_1 > 0) {
		if (filter_var($Punt_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['punt_B'])) {
	$bAkkoord = FALSE;
} else {
	$Punt_2 = intval($_POST['punt_B']);
	if ($Punt_2 > 0) {
		if (filter_var($Punt_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['periode_keuze'])) {
	$bAkkoord = FALSE;
} else {
	$Periode_keuze = intval($_POST['periode_keuze']);
	if ($Periode_keuze > 0) {
		if (filter_var($Periode_keuze, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
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

//bepaal uitslagcode is periode-spnr1-spnr2
if (strlen($Speler_A) == 1) {
	$A = "00" . $Speler_A;
}
if (strlen($Speler_A) == 2) {
	$A = "0" . $Speler_A;
}
if (strlen($Speler_B) == 1) {
	$B = "00" . $Speler_B;
}
if (strlen($Speler_B) == 2) {
	$B = "0" . $Speler_B;
}

$Uitslag_code = $Periode_keuze . "_" . $A . "_" . $B;
//ook uitslagcode 2 voor delete
//Uitleg: partij kan begonnen zijn op scorebord met code A-B, doch spelers gewisseld en dan code B-A en toen afgebroken;
//Dus beide Uitslag_codes kunnen gebruikt zijn en beide worden gebruikt om records partijen en scoreborden te verwijderen
$Uitslag_code_2 = $Periode_keuze . "_" . $B . "_" . $A;

//eerst uitslag opslaan
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//check op dubbele uitslag
	$sql = "SELECT * FROM bj_uitslagen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND uitslag_code = '$Uitslag_code'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		//Opslaan
		$sql = "INSERT INTO bj_uitslagen 
			(org_nummer, comp_nr, uitslag_code, periode, speeldatum, sp_1_nr, sp_1_cartem, sp_1_cargem, sp_1_hs, sp_1_punt, brt, sp_2_nr, sp_2_cartem, sp_2_cargem, sp_2_hs, sp_2_punt, gespeeld)
			VALUES
			('$Org_nr', '$Comp_nr', '$Uitslag_code', '$Periode_keuze', '$Speeldatum', '$Speler_A', '$Car_1_tem', '$Car_1_gem', '$Hs_1', '$Punt_1', '$Brt', '$Speler_B', '$Car_2_tem', '$Car_2_gem', '$Hs_2', '$Punt_2', '1')";
	}

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//nu eventueel record in partijen en in uitslag_hulp verwijderen
	$sql = "DELETE FROM bj_partijen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	$sql = "DELETE FROM bj_uitslag_hulp
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	$sql = "DELETE FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

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
				<h1>Uitslag opgeslagen</h1>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
					Uitslag is opgeslagen.<br><br>U keert terug naar de pagina Invoer uitslag.
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="Uitslag_invoeren.php">
					<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
						title="Naar uitslagen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
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