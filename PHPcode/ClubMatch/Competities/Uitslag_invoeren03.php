<?php
//© Hans Eekels, versie 07-12-2025
//Uitslag invoeren stap 3 controle
//Vast aantal brt toegevoegd
//fun_punten aangepast
//Kop aangepast
//Datum partij
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(11) {
["speeldatum"]=> string(10) "2025-09-15" 
["car_1"]=> string(2) "30" ["car_2"]=> string(2) "35" ["brt"]=> string(2) "34" 
["speler_A"]=> string(1) "4" ["speler_B"]=> string(1) "7" 
["periode_keuze"]=> string(1) "1" 
["hs_1"]=> string(1) "3" ["hs_2"]=> string(2) "12" 
["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" }
*/

$Copy = Date("Y");

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

if (!isset($_POST['speeldatum'])) {
  $bAkkoord = FALSE;
} else {
  $Speeldatum = $_POST['speeldatum'];
}

if (isset($_POST['car_1'])) {
	$Car_1 = intval($_POST['car_1']);
	if ($Car_1 > 0) {
		if (filter_var($Car_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['car_2'])) {
	$Car_2 = intval($_POST['car_2']);
	if ($Car_2 > 0) {
		if (filter_var($Car_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['hs_1'])) {
	$Hs_1 = intval($_POST['hs_1']);
	if ($Hs_1 > 0) {
		if (filter_var($Hs_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['hs_2'])) {
	$Hs_2 = intval($_POST['hs_2']);
	if ($Hs_2 > 0) {
		if (filter_var($Hs_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (isset($_POST['brt'])) {
	$Brt = intval($_POST['brt']);
	if ($Brt > 0) {
		if (filter_var($Brt, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
} else {
	$bAkkoord = FALSE;
}

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

if (!isset($_POST['speler_A'])) {
	$bAkkoord = FALSE;
} else {
	$Speler_A = intval($_POST['speler_A']);
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
	$Speler_B = intval($_POST['speler_B']);
	if ($Speler_B > 0) {
		if (filter_var($Speler_B, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
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

//Beurten
$Brt_sys = fun_vastaantalbeurten($Org_nr, $Comp_nr, $Path);
if ($Brt_sys == 0) {
  $bVastAantalBeurten = FALSE;
} else {
  $bVastAantalBeurten = TRUE;
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

//test doorgegeven data
//dan terug met history-back

//haal te maken car op
$Car_1_temaken = fun_temakencar($Speler_A, $Org_nr, $Comp_nr, $Periode_keuze, $Path);
$Car_2_temaken = fun_temakencar($Speler_B, $Org_nr, $Comp_nr, $Periode_keuze, $Path);

$bAkkoord = TRUE;
$error_message = "";

if ($bVastAantalBeurten == FALSE) {
	//car gemaakt <= car te maken
	if ($Car_1 > $Car_1_temaken) {
		$bAkkoord = FALSE;
		$error_message .= "Aantal caramboles speler 1 is meer dan die speler moet maken !<br>";
	}
	if ($Car_2 > $Car_2_temaken) {
		$bAkkoord = FALSE;
		$error_message .= "Aantal caramboles speler 2 is meer dan die speler moet maken !<br>";
	}
}

if ($Brt < 1) {
	$bAkkoord = FALSE;
	$error_message .= "Aantal beurten moet minimaal 1 zijn !<br>";
}

if ($Hs_1 * $Brt < $Car_1) {
	$bAkkoord = FALSE;
	$error_message .= "Hoogste serie speler 1 klopt niet !<br>";
}

if ($Hs_2 * $Brt < $Car_2) {
	$bAkkoord = FALSE;
	$error_message .= "Hoogste serie speler 2 klopt niet !<br>";
}
if ($Hs_1 > $Car_1) {
	$bAkkoord = FALSE;
	$error_message .= "Hoogste serie speler 1 klopt niet !<br>";
}

if ($Hs_2 > $Car_2) {
	$bAkkoord = FALSE;
	$error_message .= "Hoogste serie speler 2 klopt niet !<br>";
}

//check
if ($bAkkoord == FALSE) {
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Foutmelding</title>
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
						<?php print("$error_message"); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<input type="button" class="submit-button" style="width:150px; height:30px; font-size:16px;" value="Terug" title="Terug naar invoer"
						onClick="history.go(-1)" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//moyenne en punten uitrekenen
$Moy_1 = number_format($Car_1 / $Brt, 3);
$Moy_2 = number_format($Car_2 / $Brt, 3);

$Punten_hulp = fun_punten($Org_nr, $Comp_nr, $Periode_keuze, $Speler_A, $Car_1, $Speler_B, $Car_2, $Brt, $Path);
$Punten_1 = $Punten_hulp[1];
$Punten_2 = $Punten_hulp[2];

//verder
$Speler_A_naam = fun_spelersnaam_competitie($Speler_A, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);
$Speler_B_naam = fun_spelersnaam_competitie($Speler_B, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);

//pagina invoer
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Uitslag controle</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 600px;
		}

		.button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<form name="uitslag" method="post" action="Uitslag_invoeren04.php">
		<table width="600" border="0">
			<tr>
				<td width="220" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
				<td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
					ClubMatch Online<br>
					<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
				</td>
			</tr>
			<tr>
				<td colspan="4" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Comp_naam"); ?></strong></td>
			</tr>
			<tr>
				<td height="40" colspan="3" align="center" valign="middle" bgcolor="#009900" class="grootwit">
					<strong>Uitslag invoeren: controle&nbsp;&nbsp;(Periode <?php print("$Periode_keuze"); ?>)</strong>
				</td>
			</tr>
            <tr>
            	<td height="40" colspan="3" align="center" valign="middle" bgcolor="#009900" class="grootwit">
					Speeldatum:&nbsp;<?php print("$Speeldatum"); ?>
				</td>
            </tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Speler_A_naam"); ?></strong></td>
				<td align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Speler_B_naam"); ?></strong></td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Car gemaakt:&nbsp;<?php print("$Car_1"); ?></td>
				<td align="center" width="298" bgcolor="#009900" class="grootwit">Car gemaakt:&nbsp;<?php print("$Car_2"); ?></td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Beurten:&nbsp;<?php print("$Brt"); ?> </td>
				<td align="center" bgcolor="#009900">
					<?php
					if ($bVastAantalBeurten == TRUE) {
						print(" (Vast aantal beurten $Brt_sys)");
					}
					?>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">HS:&nbsp;<?php print("$Hs_1"); ?> </td>
				<td align="center" bgcolor="#009900" class="grootwit">HS:&nbsp;<?php print("$Hs_2"); ?></td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Moyenne:&nbsp;<?php print("$Moy_1"); ?></td>
				<td align="center" bgcolor="#009900" class="grootwit">Moyenne:&nbsp;<?php print("$Moy_2"); ?></td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Punten:&nbsp;<?php print("$Punten_1"); ?></td>
				<td align="center" bgcolor="#009900" class="grootwit">Punten:&nbsp;<?php print("$Punten_2"); ?></td>
			</tr>
			<tr>
				<td height="40" colspan="3" align="center" valign="middle" bgcolor="#009900">
					<input type="submit" class="submit-button" value="Opslaan" style="width:150px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
						title="Naar opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
                    <input type="hidden" name="speeldatum" value="<?php print("$Speeldatum"); ?>">
					<input type="hidden" name="speler_A" value="<?php print("$Speler_A"); ?>">
					<input type="hidden" name="speler_B" value="<?php print("$Speler_B"); ?>">
					<input type="hidden" name="car_A_tem" value="<?php print("$Car_1_temaken"); ?>">
					<input type="hidden" name="car_B_tem" value="<?php print("$Car_2_temaken"); ?>">
					<input type="hidden" name="car_A_gem" value="<?php print("$Car_1"); ?>">
					<input type="hidden" name="car_B_gem" value="<?php print("$Car_2"); ?>">
					<input type="hidden" name="brt" value="<?php print("$Brt"); ?>">
					<input type="hidden" name="hs_A" value="<?php print("$Hs_1"); ?>">
					<input type="hidden" name="hs_B" value="<?php print("$Hs_2"); ?>">
					<input type="hidden" name="punt_A" value="<?php print("$Punten_1"); ?>">
					<input type="hidden" name="punt_B" value="<?php print("$Punten_2"); ?>">
				</td>
			</tr>
		</table>
	</form>
	<table width="600" border="0">
		<tr>
			<td width="297" height="40" align="left" bgcolor="#009900">&nbsp;
				<input type="button" class="submit-button" style="width:150px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
					value="Terug" title="Terug naar invoer" onClick="history.go(-1)" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
			</td>
			<td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>