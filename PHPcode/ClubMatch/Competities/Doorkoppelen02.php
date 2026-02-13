<?php
//© Hans Eekels, versie 03-12-2025
//Moyennes doorkoppelen naar Leden
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();
$Uitslagen = array();
$Discipline = array();

/*
var_dump($_POST) geeft:
array(9) { ["periode"]=> string(1) "6" 	//totaalstand, anders 1-5
	[4]=> string(1) "4" 				//spelersnummer 6 stuks 
	[13]=> string(2) "13" 
	[11]=> string(2) "11" 
	[8]=> string(1) "8" 
	[1]=> string(1) "1" 
	[10]=> string(2) "10" 
["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" }

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

if (isset($_POST['comp_nr'])) {
	$Comp_nr = $_POST['comp_nr'];
	if ($Comp_nr > 0) {
		if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['periode'])) {
	$Periode = $_POST['periode'];
	if (filter_var($Periode, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
} else {
	$bAkkoord = FALSE;
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

$teller = 0;
foreach ($_POST as $key_var => $value_var) {
	if ($key_var != "comp_nr") {
		if ($key_var != "user_code") {
			if ($key_var != "periode") {
				$teller++;
				$Spelers[$teller]['spc_nummer'] = intval($value_var);
				$Spelers[$teller]['spc_car'] = 0;	//hierna vullen
				$Spelers[$teller]['spc_brt'] = 0;	//hierna vullen
				$Spelers[$teller]['spc_moy'] = 0;	//hierna vullen
			}
		}
	}
}

$Aantal_spelers = $teller;
$Discipline = fun_nummoydis($Comp_nr, $Org_nr, $Path);

/*
var_dump($Discipline) geeft:
array(2) { ["dis_nummer"]=> string(1) "1" ["kolom_naam"]=> string(11) "spa_moy_lib" }
*/

$DisNr = $Discipline['dis_nummer'];
$Kolom_naam = $Discipline['kolom_naam'];

//verder
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//uitslagen voor eindmoy
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_nummer = $Spelers[$a]['spc_nummer'];

		//nu uitslagen
		if ($Periode < 6) {
			$sql = "SELECT * FROM bj_uitslagen 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (sp_1_nr = '$Sp_nummer' OR sp_2_nr = '$Sp_nummer') AND periode = '$Periode' AND gespeeld = '1'";
		} else {
			$sql = "SELECT * FROM bj_uitslagen 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (sp_1_nr = '$Sp_nummer' OR sp_2_nr = '$Sp_nummer') AND gespeeld = '1'";
		}

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Sp_test = $resultaat['sp_1_nr'];
				if ($Sp_test == $Sp_nummer) {
					$Spelers[$a]['spc_car'] = $Spelers[$a]['spc_car'] + $resultaat['sp_1_cargem'];
				} else {
					$Spelers[$a]['spc_car'] = $Spelers[$a]['spc_car'] + $resultaat['sp_2_cargem'];
				}
				$Spelers[$a]['spc_brt'] = $Spelers[$a]['spc_brt'] + $resultaat['brt'];
			}
		}	//end if rec=o
	}	//end for per speler

	//bereken moy 
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_num = $Spelers[$a]['spc_nummer'];
		$Car_tot = $Spelers[$a]['spc_car'];
		$Brt_tot = $Spelers[$a]['spc_brt'];
		if ($Brt_tot > 0) {
			$Spelers[$a]['spc_moy'] = number_format($Car_tot / $Brt_tot, 3);
		} else {
			$Spelers[$a]['spc_moy'] = '0.000';
		}
	}

	//nu update leden bij moy discipline
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_num = $Spelers[$a]['spc_nummer'];
		$Moy_nieuw = $Spelers[$a]['spc_moy'];

		$sql = "UPDATE bj_spelers_algemeen SET $Kolom_naam = '$Moy_nieuw' WHERE spa_nummer = '$Sp_num' AND spa_org = '$Org_nr'";

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
				<h2>ClubMatch Online</h2>
			</td>
		</tr>
		<tr>
			<td align="center" colspan="2">
				<h2>Moyennes verwerkt</h2>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
					De aangevinkte behaalde moyennes van de aangevinkte spelers zijn doorgevoerd naar het startmoyenne van deze spelers in het ledenbestand.<br>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="Competitie_beheer.php">
					<input type="submit" class="submit-button" value="Naar Beheer" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
						title="NaarBeheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>