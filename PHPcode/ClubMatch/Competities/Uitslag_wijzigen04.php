<?php
//© Hans Eekels, versie 04-12-2025
//Gewijzigde Uitslag opslaan en uit voorzorg: zelfde partij en scorebord-records verwijderen
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(15) { 
["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" 
["uitslag_code"]=> string(9) "1_002_001" 
["periode_keuze"]=> string(1) "1" 
["speeldatum"]
["speler_A"]=> string(1) "2" 
["speler_B"]=> string(1) "1" 
["car_A_tem"]=> string(2) "30" 
["car_B_tem"]=> string(2) "48" 
["car_A_gem"]=> string(2) "30" 
["car_B_gem"]=> string(2) "47" 
["brt"]=> string(2) "22" 
["hs_A"]=> string(1) "4" 
["hs_B"]=> string(2) "13" 
["punt_A"]=> string(1) "2" 
["punt_B"]=> string(1) "0" }
*/

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
	$Speler_A = $_POST['speler_A'];
	if ($Speler_A > 0) {
		if (filter_var($Speler_A, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['speler_B'])) {
	$bAkkoord = FALSE;
} else {
	$Speler_B = $_POST['speler_B'];
	if ($Speler_B > 0) {
		if (filter_var($Speler_B, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
}

if (isset($_POST['car_A_tem'])) {
	$Car_1_tem = $_POST['car_A_tem'];
	if ($Car_1_tem > 0) {
		if (filter_var($Car_1_tem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (isset($_POST['car_B_tem'])) {
	$Car_2_tem = $_POST['car_B_tem'];
	if ($Car_2_tem > 0) {
		if (filter_var($Car_2_tem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (isset($_POST['car_A_gem'])) {
	$Car_1_gem = $_POST['car_A_gem'];
	if ($Car_1_gem > 0) {
		if (filter_var($Car_1_gem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (isset($_POST['car_B_gem'])) {
	$Car_2_gem = $_POST['car_B_gem'];
	if ($Car_2_gem > 0) {
		if (filter_var($Car_2_gem, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (isset($_POST['hs_A'])) {
	$Hs_1 = $_POST['hs_A'];
	if ($Hs_1 > 0) {
		if (filter_var($Hs_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (isset($_POST['hs_B'])) {
	$Hs_2 = $_POST['hs_B'];
	if ($Hs_2 > 0) {
		if (filter_var($Hs_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (isset($_POST['brt'])) {
	$Brt = $_POST['brt'];
	if ($Brt > 0) {
		if (filter_var($Brt, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
}

if (isset($_POST['punt_A'])) {
	$Punt_1 = $_POST['punt_A'];
	if ($Punt_1 > 0) {
		if (filter_var($Punt_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (isset($_POST['punt_B'])) {
	$Punt_2 = $_POST['punt_B'];
	if ($Punt_2 > 0) {
		if (filter_var($Punt_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['uitslag_code'])) {
	$bAkkoord = FALSE;
} else {
	$Uitslag_code = $_POST['uitslag_code'];
	$Uitslag_code_2 = fun_invertcode($Uitslag_code);
}

if (!isset($_POST['periode_keuze'])) {
	$bAkkoord = FALSE;
} else {
	$Periode_keuze = $_POST['periode_keuze'];
}

//check
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

//updaten
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//Update
	$sql = "UPDATE bj_uitslagen 
		SET speeldatum = '$Speeldatum', sp_1_cargem = '$Car_1_gem', sp_1_hs = '$Hs_1', sp_1_punt = '$Punt_1', brt = '$Brt', sp_2_cargem = '$Car_2_gem', sp_2_hs = '$Hs_2', sp_2_punt = '$Punt_2'  
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

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
				<h1>Gewijzigde uitslag opgeslagen</h1>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
					Gewijzigde uitslag is opgeslagen.<br><br>U keert terug naar de pagina Beheer.
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="Competitie_beheer.php">
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