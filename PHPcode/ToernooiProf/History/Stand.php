<?php
//© Hans Eekels, versie 22-06-2025
//Stand per poule in Historie
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');
/*
var_dump($_POST) geeft altijd:
array(4) { ["user_code"]=> string(10) "1001_CHR@#" ["t_nummer"]=> string(1) "1" ["ronde_nr"]=> string(1) "2" ["poule_nr"]=> string(1) "2" }
en na keuze stand ook ["keuze_stand"]=> string(1) "2" 	1=normaal, 2=percentage punten
*/

$Uitslagen = array();
$Copy = Date("Y");

/*
var_dump($_POST) geeft:
["keuze_stand"]=> string(1) "2" 	1=normaal, 2=percentage punten
["t_nummer"]=> string(1) "1" 		altijd toernooinummer
["poule_nr"]=> string(1) "1" 		altijd poule_nr
["ronde_nr"]=> string(1) "2"		altijd ronde_nr

*/
$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

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
			$Logo_naam = "../Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['t_nummer'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = $_POST['t_nummer'];
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['ronde_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Ronde_nr = $_POST['ronde_nr'];
	if (filter_var($Ronde_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = $_POST['poule_nr'];
	if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (isset($_POST['keuze_stand'])) {
	$Keuze_stand = $_POST['keuze_stand'];
} else {
	$Keuze_stand = 1;
}

if ($bAkkoord == FALSE) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Toernooi programma</title>
		<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
		<meta name="Description" content="Toernooiprogramma" />
		<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../PHP/script_toernooi.js" defer></script>
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
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
					<form name="partijen" method="post" action="../../Start.php">
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
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
$Aantal_spelers = fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Ronde_nr, $Poule_nr, $Path);
$Punten_sys = fun_puntensysteem($Gebruiker_nr, $Toernooi_nr, $Path);

//initieren
for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
	$Sp_nummer = fun_spelersnummer($Gebruiker_nr, $Toernooi_nr, $Poule_nr, $Ronde_nr, $a, $Path);
	$Sp_naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Path);

	$Uitslagen[$a]['punten'] = 0;			//op sorteren, nl punten of % punten
	$Uitslagen[$a]['per_car'] = 0;			//op sorteren, later toekennen
	$Uitslagen[$a]['hs'] = 0;				//op sorteren
	$Uitslagen[$a]['moy'] = 0;				//op sorteren
	$Uitslagen[$a]['naam'] = $Sp_naam;
	$Uitslagen[$a]['sp_nummer'] = $Sp_nummer;
	$Uitslagen[$a]['car_gem'] = 0;
	$Uitslagen[$a]['brt'] = 0;
	$Uitslagen[$a]['partijen'] = 0;
}

//uitslagen ophalen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_uitslagen 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Ronde_nr' AND gespeeld = '1'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$bKan = FALSE;
	} else {
		$bKan = TRUE;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nr_1 = $resultaat['sp_volgnummer_1'];
			$Uitslagen[$Nr_1]['car_gem'] = $Uitslagen[$Nr_1]['car_gem'] + $resultaat['sp1_car_gem'];
			$Uitslagen[$Nr_1]['brt'] = $Uitslagen[$Nr_1]['brt'] + $resultaat['brt'];
			$Hs_1_hulp = $resultaat['sp1_hs'];
			if ($Hs_1_hulp > $Uitslagen[$Nr_1]['hs']) {
				$Uitslagen[$Nr_1]['hs'] = $Hs_1_hulp;
			}
			$Uitslagen[$Nr_1]['punten'] = $Uitslagen[$Nr_1]['punten'] + $resultaat['sp1_punt'];
			$Uitslagen[$Nr_1]['partijen'] = $Uitslagen[$Nr_1]['partijen'] + 1;

			$Nr_2 = $resultaat['sp_volgnummer_2'];
			$Uitslagen[$Nr_2]['car_gem'] = $Uitslagen[$Nr_2]['car_gem'] + $resultaat['sp2_car_gem'];
			$Uitslagen[$Nr_2]['brt'] = $Uitslagen[$Nr_2]['brt'] + $resultaat['brt'];
			$Hs_2_hulp = $resultaat['sp2_hs'];
			if ($Hs_2_hulp > $Uitslagen[$Nr_2]['hs']) {
				$Uitslagen[$Nr_2]['hs'] = $Hs_2_hulp;
			}
			$Uitslagen[$Nr_2]['punten'] = $Uitslagen[$Nr_2]['punten'] + $resultaat['sp2_punt'];
			$Uitslagen[$Nr_2]['partijen'] = $Uitslagen[$Nr_2]['partijen'] + 1;
		}
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//%car toevoegen en dan sorteren
for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
	$Sp_nummer = $Uitslagen[$a]['sp_nummer'];
	$Car_tem_hulp = fun_carspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde_nr, $Path);
	$Nr_partijen = $Uitslagen[$a]['partijen'];
	$Car_tem_tot = $Car_tem_hulp * $Nr_partijen;
	if ($Car_tem_tot > 0) {
		$Uitslagen[$a]['per_car'] = number_format(($Uitslagen[$a]['car_gem'] / $Car_tem_tot) * 100, 3);
	} else {
		$Uitslagen[$a]['per_car'] = '0.000';
	}

	if ($Uitslagen[$a]['brt'] > 0) {
		$Uitslagen[$a]['moy'] = number_format($Uitslagen[$a]['car_gem'] / $Uitslagen[$a]['brt'], 3);
	} else {
		$Uitslagen[$a]['moy'] = '0.000';
	}
}

//nu kijken stand obv punten of stand obv %punten
if ($Keuze_stand == 1) {
	rsort($Uitslagen);		//key-start = 0;
} else {
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Punten = $Uitslagen[$a]['punten'];
		$Partijen = $Uitslagen[$a]['partijen'];
		if ($Punten_sys == 1) {
			$Te_halen = $Partijen * 2;
		}
		if ($Punten_sys == 2) {
			$Te_halen = $Partijen * 10;
		}
		if ($Punten_sys == 3) {
			$Te_halen = $Partijen * 12;
		}

		$Per_punt = number_format($Punten / $Te_halen * 100, 2);
		$Uitslagen[$a]['punten'] = $Per_punt;
	}
	rsort($Uitslagen);		//key-start = 0;
}
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Stand</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			width: 700px;
			background-color: #FFF;
		}

		.button:hover {
			border-color: #000;
		}

		div.scroll {
			background-color: #FFF;
			width: 690px;
			height: 400px;
			overflow: auto;
		}
	</style>
	<script>
		function printDiv(divName) {
			var content = document.getElementById(divName).innerHTML;
			var printWindow = window.open('', '', 'width=800,height=600');
			printWindow.document.write(`
			<html>
				<head>
					<title>Print</title>
					<style>
					body { font-family: Arial, sans-serif; padding: 20px; }
					table { border-collapse: collapse; width: auto; margin: auto; }
					td, th { border: 1px solid #000; padding: 4px; }
					td[align="center"] { text-align: center; }
					td[align="right"]  { text-align: right; }
					td[align="left"]   { text-align: left; }
				</style>
				</head>
				<body>
					${content}
				</body>
			</html>
		`);
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
			printWindow.close();
		}
	</script>
</head>

<body>
	<table width="700" border="0">
		<tr>
			<td width="170" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo" /></td>
			<td width="520" align="center" valign="middle" bgcolor="#006600">
				<h1>Stand poule <?php print("$Poule_nr"); ?></h1>
			</td>
		</tr>
		<tr>
			<td colspan="2" align="left" bgcolor="#009900" class="groot">
				<div class="scroll">
					<div id="printableArea">
						<table width="670" border="1">
							<tr>
								<td colspan="9" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart"><strong><?php print("$Gebruiker_naam"); ?></strong></td>
							</tr>
							<tr>
								<td colspan="9" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart"><strong><?php print("$Toernooi_naam"); ?></strong></td>
							</tr>
							<tr>
								<td colspan="9" align="center" class="grootzwart">
									<?php
									if ($Keuze_stand == 1) {
									?>
										<strong>Stand poule <?php print("$Poule_nr"); ?> in Toernooi-ronde <?php print("$Ronde_nr"); ?> op basis van Punten</strong>
									<?php
									} else {
									?>
										<strong>Stand poule <?php print("$Poule_nr"); ?> in Toernooi-ronde <?php print("$Ronde_nr"); ?> op basis van % Punten</strong>
									<?php
									}
									?>
								</td>
							</tr>
							<tr>
								<td width="40" align="center" class="grootzwart"><strong>Pos</strong></td>
								<td width="229" align="left" class="grootzwart"><strong>Naam</strong></td>
								<?php
								if ($Keuze_stand == 1) {
								?>
									<td width="60" align="center" class="grootzwart"><strong>Punt</strong></td>
								<?php
								} else {
								?>
									<td width="60" align="center" class="grootzwart"><strong>%Punt</strong></td>
								<?php
								}
								?>
								<td width="42" align="center" class="grootzwart"><strong>Part</strong></td>
								<td width="42" align="center" class="grootzwart"><strong>Car</strong></td>
								<td width="42" align="center" class="grootzwart"><strong>Brt</strong></td>
								<td width="55" align="right" class="grootzwart"><strong>Moy</strong></td>
								<td width="42" align="center" class="grootzwart"><strong>HS</strong></td>
								<td width="60" align="right" class="grootzwart"><strong>% Car</strong></td>
							</tr>
							<?php
							if ($bKan == TRUE) {
								for ($a = 0; $a < $Aantal_spelers; $a++) {
									$Pos = $a + 1;
									$Punten = $Uitslagen[$a]['punten'];
									$Per_car = $Uitslagen[$a]['per_car'];
									$Naam = $Uitslagen[$a]['naam'];
									$Car = $Uitslagen[$a]['car_gem'];
									$Brt = $Uitslagen[$a]['brt'];
									$Moy = $Uitslagen[$a]['moy'];
									$Hs = $Uitslagen[$a]['hs'];
									$Partijen = $Uitslagen[$a]['partijen'];
							?>
									<tr>
										<td align="center" class="grootzwart"><?php print("$Pos"); ?></td>
										<td align="left" class="grootzwart"><?php print("$Naam"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Punten"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Partijen"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Car"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Brt"); ?></td>
										<td align="right" class="grootzwart"><?php print("$Moy"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Hs"); ?></td>
										<td align="right" class="grootzwart"><?php print("$Per_car"); ?></td>
									</tr>
								<?php
								}	//end for per speler
							} else {
								?>
								<tr>
									<td colspan="9" align="center" class="grootzwart"><strong>Nog geen uitslagen ingevoerd !</strong></td>
								<tr>
								<?php
							}
								?>
						</table>
					</div>
				</div>
			</td>
		</tr>
	</table>
	<form name="stand02" method="post" action="Stand.php">
		<table width="700">
			<tr>
				<td width="170" height="45" align="center" bgcolor="#006600" class="grootwit">Kies soort stand</td>
				<td height="45" align="left" bgcolor="#006600" class="grootwit">
					<div style="margin-left:20px; margin-right:20px; margin-top:5px; margin-bottom:5px;">
						<input type="radio" name="keuze_stand" value="1" checked>Normaal punten<br>
						<input type="radio" name="keuze_stand" value="2">Percentage punten
					</div>
				</td>
				<td width="284" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Toon stand" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Stand op basis van % punten" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
					<input type="hidden" name="ronde_nr" value="<?php print("$Ronde_nr"); ?>">
				</td>
			</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="../Toernooi_Beheer.php">
		<table width="700">
			<tr>
				<td width="170" height="45" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Terug naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
				</td>
				<td width="230" align="center" bgcolor="#006600">
					<input type="button" style="width:150px; height:40px; background-color:#FFF; color:#000;"
						onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
				<td width="284" align="center" bgcolor="#006600" class="klein">
					<input type="button" value="Help" style="width:165px; height:40px; background-color:#F00; border:none; color:#FFF; font-size:16px;"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_stand2.php','Help','width=770,height=660,scrollbars=no,toolbar=no,location=no'); return false" />
				</td>
			</tr>
		</table>
	</form>
</body>

</html>