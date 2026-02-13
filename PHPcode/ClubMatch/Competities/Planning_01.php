<?php
//© Hans Eekels, versie 03-12-2025
//Dagdeel planning maken: kies leden en # partijen
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();

//var_dump($_POST) geeft:
//array(3) { ["user_code"]=> string(10) "1002_CRJ@#" ["comp_nr"]=> string(1) "1" ["periode_keuze"]=> string(1) "1" }

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

if (count($_POST) != 3) {
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

//verder
//haal spelers op
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//spelers
	$sql = "SELECT * FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$teller++;
		$Sp_nr = $resultaat['spc_nummer'];
		$Spelers[$teller]['spc_naam'] = fun_ledennaam($Sp_nr, $Org_nr, $Path);
		$Spelers[$teller]['spc_nummer'] = $Sp_nr;
	}
	$Aantal_spelers = $teller;

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

sort($Spelers);	//key_start = 0

//toon pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Planning op dagdeel</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body,
		td,
		th {
			font-family: Verdana;
			font-size: 16px;
			color: #000;
		}

		body {
			background-color: #000;
			margin-top: 0px;
			margin-right: auto;
			margin-bottom: 0px;
			margin-left: auto;
			width: 700px;
		}

		.mooie-knop {
			width: 110px;
			height: 28px;
			font-size: 11px;
			background-color: #000000;
			color: white;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			text-align: center;
			line-height: 28px;
		}

		.mooie-knop:hover {
			background-color: #0056b3;
		}

		.klein {
			font-size: 10px;
			color: #FFF;
		}

		.wit {
			color: #FFF;
		}

		.grootwit {
			font-size: 24px;
			color: #FFF;
		}

		h3 {
			font-size: 24px;
		}

		input.large {
			width: 20px;
			height: 20px;
		}

		input.larger {
			width: 30px;
			height: 30px;
		}

		.button:hover {
			border-color: #FFF;
		}

		div.scroll {
			background-color: #FFF;
			width: 695px;
			height: 400px;
			overflow: auto;
		}
	</style>
</head>

<body>
	<form name="keuze" method="post" action="Planning_02.php">
		<table width="700" bgcolor="#FFFFFF" border="1">
			<tr>
				<td colspan="2" align="center" bgcolor="#006600" class="grootwit"><strong>Kies spelers voor dag-planning</strong></td>
			</tr>
			<tr>
				<td colspan="2" align="center" bgcolor="#006600" class="grootwit"><strong><?php print("$Org_naam"); ?></strong></td>
			</tr>
			<tr>
				<td colspan="2" align="center" bgcolor="#006600" class="grootwit"><strong><?php print("$Comp_naam, periode $Periode_keuze"); ?></strong></td>
			</tr>
			<tr>
				<td width="243" align="center" bgcolor="#FFFFFF">
					<button type="button" class="mooie-knop" onClick="selectAll(true)">Selecteer alle</button>&nbsp;
					<button type="button" class="mooie-knop" onClick="selectAll(false)">Deselecteer alle</button>
				</td>
				<td width="441" align="left" bgcolor="#FFFFFF"><strong>Naam speler</strong></td>
			</tr>
			<?php
			if ($Aantal_spelers > 1) {
			?>
				<tr>
					<td colspan="2">
						<div class="scroll">
							<table width="680" border="1">
								<?php
								for ($a = 0; $a < $Aantal_spelers; $a++) {
									$Naam = $Spelers[$a]['spc_naam'];
									$Sp_num = $Spelers[$a]['spc_nummer'];
								?>
									<tr>
										<td width="240" align="center"><input type="checkbox" class="large" name="<?php print("$Sp_num"); ?>" value="<?php print("$Sp_num"); ?>"></td>
										<td align="left" bgcolor="#FFFFFF"><?php print("$Naam"); ?></td>
									</tr>
								<?php
								}
								?>
							</table>
						</div>
					</td>
				</tr>
				<tr>
					<td height="5" colspan="2" bgcolor="#CCCCCC"> </td>
				</tr>
				<tr>
					<td>Kies aantal partijen</td>
					<td>
						<input type="radio" id="1" name="ronden" value="1" checked>
						  <label for="1">1 partij</label>&nbsp;&nbsp;
						  <input type="radio" id="2" name="ronden" value="2">
						  <label for="2">2 partijen</label>
					</td>
				</tr>
				<tr>
					<td height="50" colspan="2" align="center">
						<input type="submit" style="width:150px; height:40px; background-color:#000; color:#FFF;" class="submit-button" value="Maak planning"
							title="Maak planning" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
					</td>
				</tr>
			<?php
			} else {
			?>
				<tr>
					<td colspan="2" align="center" bgcolor="#FFFFFF"><strong>Geen spelers beschikbaar</strong></td>
				</tr>
			<?php
			}
			?>
		</table>
	</form>
	<form name="cancel" method="post" action="Matrix.php">
		<table width="700" border="0">
			<tr>
				<td width="350" align="center" height="45" bgcolor="#006600">
					<input type="submit" style="width:150px; height:40px; background-color:#CCC; color:#000;" class="submit-button" value="Cancel"
						title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
				</td>
				<td align="center" bgcolor="#006600">
					<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:24px; font-weight:bold;"
						name="help4" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_planning.php','Help','width=720,height=570,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
				</td>
			</tr>
		</table>
	</form>
	<script>
		function selectAll(aan) {
			document.querySelectorAll('input[type="checkbox"].large').forEach(cb => cb.checked = aan);
		}
	</script>
</body>

</html>