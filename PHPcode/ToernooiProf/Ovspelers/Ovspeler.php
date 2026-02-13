<?php
//© Hans Eekels, versie versie 15-12-2025
//Overzicht speler
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Uitslagen = array();

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(3) { ["speler_nr"]=> string(1) "3" ["user_code"]=> string(10) "1001_CHR@#" ["t_nummer"]=> string(1) "1" }
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

if (!isset($_POST['speler_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Speler_nr = $_POST['speler_nr'];
	if (filter_var($Speler_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (count($_REQUEST) != 3) {
	$bAkkoord = FALSE;
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
$Naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Speler_nr, $Path);

//voor totaal
$Car_tot = 0;
$Beurten_tot = 0;
$Moy_tot = 0;		//op einde uitrekenen
$Punten_tot = 0;
$Hs_tot = 0;

//uitslagen ophalen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_uitslagen 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND (sp_nummer_1 = '$Speler_nr' OR sp_nummer_2 = '$Speler_nr')  AND gespeeld = '1' ORDER BY t_ronde, p_ronde";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$bKan = FALSE;
		$Aantal_uitslagen = 0;
	} else {
		$bKan = TRUE;
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Uitslagen[$teller]['t_ronde'] = $resultaat['t_ronde'];
			$Uitslagen[$teller]['sp_poule'] = $resultaat['sp_poule'];
			$Uitslagen[$teller]['p_ronde'] = $resultaat['p_ronde'];
			$Uitslagen[$teller]['brt'] = $resultaat['brt'];
			$Beurten_tot = $Beurten_tot + $Uitslagen[$teller]['brt'];
			if ($resultaat['sp_nummer_1'] == $Speler_nr) {
				//alles van speler 1 en tegenstander is nr 2
				$Uitslagen[$teller]['car_tem'] = $resultaat['sp1_car_tem'];
				$Uitslagen[$teller]['car_gem'] = $resultaat['sp1_car_gem'];
				$Car_tot = $Car_tot + $Uitslagen[$teller]['car_gem'];
				if ($Uitslagen[$teller]['brt'] > 0) {
					$Uitslagen[$teller]['moy'] = number_format($Uitslagen[$teller]['car_gem'] / $Uitslagen[$teller]['brt'], 3);
				} else {
					$Uitslagen[$teller]['moy'] = '0.000';
				}

				$Uitslagen[$teller]['hs'] = $resultaat['sp1_hs'];
				if ($Uitslagen[$teller]['hs'] > $Hs_tot) {
					$Hs_tot = $Uitslagen[$teller]['hs'];
				}

				$Uitslagen[$teller]['punt'] = $resultaat['sp1_punt'];
				$Punten_tot = $Punten_tot + $Uitslagen[$teller]['punt'];
				$Uitslagen[$teller]['per_car'] = number_format(($Uitslagen[$teller]['car_gem'] / $Uitslagen[$teller]['car_tem']) * 100, 3);
				$Sp_2 = $resultaat['sp_nummer_2'];
				$Uitslagen[$teller]['naam_2'] = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_2, $Path);
			} else {
				//alles van speler 2 en tegenstander is nr 1
				$Uitslagen[$teller]['car_tem'] = $resultaat['sp2_car_tem'];
				$Uitslagen[$teller]['car_gem'] = $resultaat['sp2_car_gem'];
				$Car_tot = $Car_tot + $Uitslagen[$teller]['car_gem'];
				if ($Uitslagen[$teller]['brt'] > 0) {
					$Uitslagen[$teller]['moy'] = number_format($Uitslagen[$teller]['car_gem'] / $Uitslagen[$teller]['brt'], 3);
				} else {
					$Uitslagen[$teller]['moy'] = '0.000';
				}
				$Uitslagen[$teller]['hs'] = $resultaat['sp2_hs'];
				if ($Uitslagen[$teller]['hs'] > $Hs_tot) {
					$Hs_tot = $Uitslagen[$teller]['hs'];
				}

				$Uitslagen[$teller]['punt'] = $resultaat['sp2_punt'];
				$Punten_tot = $Punten_tot + $Uitslagen[$teller]['punt'];
				$Uitslagen[$teller]['per_car'] = number_format(($Uitslagen[$teller]['car_gem'] / $Uitslagen[$teller]['car_tem']) * 100, 3);
				$Sp_2 = $resultaat['sp_nummer_1'];
				$Uitslagen[$teller]['naam_2'] = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_2, $Path);
			}
		}	//end while
		$Aantal_uitslagen = $teller;
		if ($Beurten_tot > 0) {
			$Moy_tot = number_format($Car_tot / $Beurten_tot, 3);
		} else {
			$Moy_tot = '0.000';
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
	<title>Overzicht speler</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			width: 900px;
			background-color: #FFF;
		}

		.button:hover {
			border-color: #000;
		}

		div.scroll {
			background-color: #FFF;
			width: 890px;
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
	<form name="nieuw" method="post" action="../Toernooi_Beheer.php">
		<table width="900" border="0">
			<tr>
				<td width="210" height="105" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
				<td align="center" valign="middle" bgcolor="#006600" class="grootwit">
					<h1>ToernooiProf Online</h1>
					<strong><?php print("$Gebruiker_naam"); ?></strong>
				</td>
			</tr>
			<tr>
				<td colspan="2" align="center" valign="middle" bgcolor="#006600">
					<h1>Overzicht <?php print("$Naam"); ?></h1>
				</td>
			</tr>
			<tr>
				<td colspan="2" align="left" bgcolor="#009900" class="groot">
					<div class="scroll">
						<div id="printableArea">
							<table width="870" border="1">
								<tr>
									<td height="30" colspan="8" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart"><strong><?php print("$Toernooi_naam"); ?></strong></td>
								</tr>
								<tr>
									<td height="30" colspan="8" align="center" bgcolor="#FFFFFF" class="grootzwart"><strong>Overzicht <?php print("$Naam"); ?></strong></td>
								</tr>
								<?php
								if ($Aantal_uitslagen > 0) {
									//initieren
									$teller = 1;
									$Ronde = 1;

									while ($teller < $Aantal_uitslagen + 1) {
										$T_ronde = $Uitslagen[$teller]['t_ronde'];
										$Poule_nr = $Uitslagen[$teller]['sp_poule'];

								?>
										<tr>
											<td colspan="3" align="left" bgcolor="#FFFFFF" class="grootzwart"><strong>Ronde <?php print("$T_ronde"); ?></strong></td>
											<td colspan="5" align="left" bgcolor="#FFFFFF" class="grootzwart"><strong>Poule <?php print("$Poule_nr"); ?></strong></td>
										</tr>
										<tr>
											<td width="61" align="center" bgcolor="#FFFFFF" class="grootzwart">Partij</td>
											<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart">Car</td>
											<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart">Brt</td>
											<td width="100" align="center" bgcolor="#FFFFFF" class="grootzwart">Moyenne</td>
											<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart">Punten</td>
											<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart">HS</td>
											<td width="100" align="center" bgcolor="#FFFFFF" class="grootzwart">% Car</td>
											<td width="317" bgcolor="#FFFFFF" class="grootzwart">Tegenstander</td>
										</tr>

										<?php
										$Partij_nummer = 0;
										while ($T_ronde == $Ronde) {
											$Partij_nummer++;
											$Car = $Uitslagen[$teller]['car_gem'];
											$Brt = $Uitslagen[$teller]['brt'];
											$Moy = $Uitslagen[$teller]['moy'];
											$Punten = $Uitslagen[$teller]['punt'];
											$HS = $Uitslagen[$teller]['hs'];
											$Per_car = $Uitslagen[$teller]['per_car'];
											$Naam_2 = $Uitslagen[$teller]['naam_2'];
										?>
											<tr>
												<td width="61" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Partij_nummer"); ?></td>
												<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Car"); ?></td>
												<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Brt"); ?></td>
												<td width="100" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Moy"); ?></td>
												<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Punten"); ?></td>
												<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$HS"); ?></td>
												<td width="100" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Per_car"); ?></td>
												<td width="317" align="left" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Naam_2"); ?></td>
											</tr>
									<?php

											if ($teller < $Aantal_uitslagen) {
												if ($Uitslagen[$teller + 1]['t_ronde'] > $T_ronde) {
													$Ronde = $Uitslagen[$teller + 1]['t_ronde'];
												}
												$teller++;
											} else {
												$teller++;
												break;
											}
										}	//end while ronde = $T_ronde
									}	//end while $teller < $Aantal_uitslagen + 1
									//nu totaal
									?>
									<tr>
										<td colspan="6" align="left" bgcolor="#FFFFFF" class="grootzwart"><strong>Totaal</strong></td>
										<td colspan="2" bgcolor="#FFFFFF">&nbsp;</td>
									</tr>
									<tr>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">Partijen</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">Car</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">Brt</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">Moyenne</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">Punten</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">HS</td>
										<td colspan="2" align="center" bgcolor="#FFFFFF" class="grootzwart">&nbsp;</td>
									</tr>
									<tr>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Aantal_uitslagen"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Car_tot"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Beurten_tot"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Moy_tot"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Punten_tot"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Hs_tot"); ?></td>
										<td colspan="2" align="center" bgcolor="#FFFFFF" class="grootzwart">&nbsp;</td>
									</tr>
								<?php
								} else {
									//geen uitslagen
								?>
									<tr>
										<td colspan="8" align="center" bgcolor="#FFFFFF" class="grootzwart">
											<strong>Geen uitslagen gevonden !</strong>
										</td>
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
	</form>
	<form name="cancel" method="post" action="../Toernooi_Beheer.php">
		<table width="900">
			<tr>
				<td width="300" height="45" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Terug naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
				</td>
				<td align="center" bgcolor="#006600">
					<input type="button" style="width:150px; height:40px; background-color:#FFF; color:#000;"
						onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
				<td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>