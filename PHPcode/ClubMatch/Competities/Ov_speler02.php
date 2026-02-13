<?php
//© Hans Eekels, versie 04-12-2025
//Ov speler uitgebreid
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

//array(3) { ["speler"]=> string(1) "1" ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }

$Copy = Date("Y");
$Datum = Date("d-m-Y");

$data_uitslag = array();
$data_resultaat = array();

$bAkkoord = TRUE;
$error_message = "";

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

if (!isset($_POST['speler'])) {
	$bAkkoord = FALSE;
} else {
	$Speler = intval($_POST['speler']);
	if ($Speler > 0) {
		if (filter_var($Speler, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
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
$Periode = fun_periode($Comp_nr, $Org_nr, $Path);	//huidige periode
$Speler_naam = fun_spelersnaam_competitie($Speler, $Org_nr, $Comp_nr, $Periode, 1, $Path);
//initialiseren
$Aantal_uitslagen = 0;

//Uitslagen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//nu uitslagen
	$sql = "SELECT * FROM bj_uitslagen 
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (sp_1_nr = '$Speler' OR sp_2_nr = '$Speler') AND gespeeld = '1' 
	ORDER BY periode, uitslag_id";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Aantal_uitslagen = 0;
	} else {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Nr_hulp = $resultaat['sp_1_nr'];

			if ($Nr_hulp == $Speler) {
				//data van sp_1_nr
				$data_uitslag[$teller]['periode'] = $resultaat['periode'];
				$data_uitslag[$teller]['car_gem'] = $resultaat['sp_1_cargem'];	//car gemaakt
				$data_uitslag[$teller]['car_tem'] = $resultaat['sp_1_cartem'];	//car gemaakt
				$data_uitslag[$teller]['brt'] = $resultaat['brt'];			//beurten
				if ($data_uitslag[$teller]['brt'] > 0) {
					$data_uitslag[$teller]['moy'] = number_format($data_uitslag[$teller]['car_gem'] / $data_uitslag[$teller]['brt'], 3);
				} else {
					$data_uitslag[$teller]['moy'] = '0.000';
				}

				$data_uitslag[$teller]['hs'] = $resultaat['sp_1_hs'];		//hs
				$data_uitslag[$teller]['pnt'] = $resultaat['sp_1_punt'];	//punten

				//tegenstander
				$hulp = $resultaat['sp_2_nr'];
				$data_uitslag[$teller]['tegenstander'] = fun_spelersnaam_competitie($hulp, $Org_nr, $Comp_nr, $Periode, 2, $Path); //incl car
			} else {
				//data van sp_2_nr
				$data_uitslag[$teller]['periode'] = $resultaat['periode'];
				$data_uitslag[$teller]['car_gem'] = $resultaat['sp_2_cargem'];	//car gemaakt
				$data_uitslag[$teller]['car_tem'] = $resultaat['sp_2_cartem'];	//car gemaakt
				$data_uitslag[$teller]['brt'] = $resultaat['brt'];			//beurten
				if ($data_uitslag[$teller]['brt'] > 0) {
					$data_uitslag[$teller]['moy'] = number_format($data_uitslag[$teller]['car_gem'] / $data_uitslag[$teller]['brt'], 3);
				} else {
					$data_uitslag[$teller]['moy'] = '0.000';
				}
				$data_uitslag[$teller]['hs'] = $resultaat['sp_2_hs'];		//hs
				$data_uitslag[$teller]['pnt'] = $resultaat['sp_2_punt'];
				//tegenstander
				$hulp = $resultaat['sp_1_nr'];
				$data_uitslag[$teller]['tegenstander'] = fun_spelersnaam_competitie($hulp, $Org_nr, $Comp_nr, $Periode, 2, $Path); //incl car
			}
		}

		$Aantal_uitslagen = $teller;
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//Nu per periode car, brt en moy bepalen, onthouden per periode
//var_dump($data_uitslag);
//array(1) { [1]=> array(2) { ["car"]=> int(84) ["brt"]=> int(92) } }

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Overzicht speler</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 900px;
			background-color: #FFF;
		}

		.button:hover {
			border-color: #FFF;
		}

		div.scroll {
			background-color: #FFF;
			width: 895px;
			height: 400px;
			overflow: auto;
		}
	</style>
	<script>
		function printDiv(divName) {
			const content = document.getElementById(divName).innerHTML;
			const printWindow = window.open('', '', 'width=800,height=600');

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
						img { max-width: 100%; height: auto; }
					</style>
				</head>
				<body>
					${content}
				</body>
			</html>
		`);
			printWindow.document.close();

			// Wacht tot alles geladen is, dan pas printen
			printWindow.onload = function() {
				printWindow.focus();
				printWindow.print();
				printWindow.close();
			};
		}
	</script>
</head>

<body>
	<table width="900" border="0" bgcolor="#FFFFFF">
		<tr>
			<td width="210" height="105" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo"></td>
			<td align="center" valign="middle" bgcolor="#009900" class="kop">
				ClubMatch Online<br>
				<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
			</td>
		</tr>
		<tr>
			<td height="20" colspan="2" align="left" bgcolor="#009900">
				<div class="scroll">
					<div id="printableArea">
						<table width="875" bgcolor="#FFFFFF" border="1">
							<tr>
								<td colspan="8" align="center" class="zwart">
									<h2>Overzicht <?php print("$Speler_naam"); ?> per <?php print("$Datum"); ?></h2>
								</td>
							</tr>
							<tr>
								<td colspan="8" align="center" class="zwart"><strong><?php print("$Comp_naam"); ?></strong></td>
							</tr>

							<?php
							if ($Aantal_uitslagen == 0) {
							?>
								<tr>
									<td colspan="8" align="center" class="grootzwart"><strong>Nog geen uitslagen ingevoerd !</strong></td>
								</tr>
								<?php
							} else {
								$teller = 1;	//nr uitslag
								$Car_tot = 0;
								$Brt_tot = 0;
								$Moy_tot = 0;
								$Hs_tot = 0;
								$Pnt_tot = 0;

								for ($a = 1; $a < $Periode + 1; $a++)	//per periode tot eind laatste periode
								{
									if ($a > 1 && $teller > $Aantal_uitslagen) {
										break;
									}

									$Car_sub = 0;
									$Brt_sub = 0;
									$Moy_sub = 0;
									$Hs_sub = 0;
									$Pnt_sub = 0;
								?>
									<tr>
										<td width="100" align="center" class="grootzwart"><strong>Periode</strong></td>
										<td width="80" align="center" class="grootzwart"><strong>Car</strong></td>
										<td width="80" align="center" class="grootzwart"><strong>Brt</strong></td>
										<td width="100" align="right" class="grootzwart"><strong>Moy</strong></td>
										<td width="80" align="center" class="grootzwart"><strong>HS</strong></td>
										<td width="80" align="center" class="grootzwart"><strong>Punten</strong></td>
										<td width="20" align="center">&nbsp;</td>
										<td align="left" class="grootzwart"><strong>Tegenstander</strong></td>
									</tr>
									<?php
									while ($data_uitslag[$teller]['periode'] == $a) {
										//gegevens
										$Car = $data_uitslag[$teller]['car_gem'];
										$Car_sub = $Car_sub + $Car;
										$Brt = $data_uitslag[$teller]['brt'];
										$Brt_sub = $Brt_sub + $Brt;
										$Moy = $data_uitslag[$teller]['moy'];
										$Hs = $data_uitslag[$teller]['hs'];
										if ($Hs > $Hs_sub) {
											$Hs_sub = $Hs;
										}
										$Pnt = $data_uitslag[$teller]['pnt'];
										$Pnt_sub = $Pnt_sub + $Pnt;
										$Tegenstander = $data_uitslag[$teller]['tegenstander'];
									?>
										<tr>
											<td align="center" class="grootzwart"><?php print("$a"); ?></td>
											<td align="center" class="grootzwart"><?php print("$Car"); ?></td>
											<td align="center" class="grootzwart"><?php print("$Brt"); ?></td>
											<td align="right" class="grootzwart"><?php print("$Moy"); ?></td>
											<td align="center" class="grootzwart"><?php print("$Hs"); ?></td>
											<td align="center" class="grootzwart"><?php print("$Pnt"); ?></td>
											<td align="center">&nbsp;</td>
											<td align="left" class="grootzwart"><?php print("$Tegenstander"); ?></td>
										</tr>
									<?php
										$teller++;
									}	//end while

									//nu subtotaal
									if ($Brt_sub > 0) {
										$Moy_sub = number_format($Car_sub / $Brt_sub, 3);
									} else {
										$Moy_sub = '0.000';
									}

									?>
									<tr>
										<td align="center" class="grootzwart"><strong>Sub_tot</strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Car_sub"); ?></strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Brt_sub"); ?></strong></td>
										<td align="right" class="grootzwart"><strong><?php print("$Moy_sub"); ?></strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Hs_sub"); ?></strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Pnt_sub"); ?></strong></td>
										<td align="right" class="grootzwart">&nbsp;</td>
										<td align="right" class="grootzwart">&nbsp;</td>
									</tr>
									<?php
									//totaal
									if ($Periode > 1) {
										$Car_tot = $Car_tot + $Car_sub;
										$Brt_tot = $Brt_tot + $Brt_sub;
										if ($Brt_tot > 0) {
											$Moy_tot = number_format($Car_tot / $Brt_tot, 3);
										} else {
											$Moy_tot = '0.000';
										}

										if ($Hs_sub > $Hs_tot) {
											$Hs_tot = $Hs_sub;
										}
										$Pnt_tot = $Pnt_tot + $Pnt_sub;
									}
								}	//end for

								//Nu totaal alle perioden als #perioden > 1 
								if ($Periode > 1) {
									?>
									<tr>
										<td colspan="8" height="10">&nbsp;</td>
									</tr>
									<tr>
										<td align="center" class="grootzwart"><strong>Totaal</strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Car_tot"); ?></strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Brt_tot"); ?></strong></td>
										<td align="right" class="grootzwart"><strong><?php print("$Moy_tot"); ?></strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Hs_tot"); ?></strong></td>
										<td align="center" class="grootzwart"><strong><?php print("$Pnt_tot"); ?></strong></td>
										<td align="right" class="grootzwart">&nbsp;</td>
										<td align="right" class="grootzwart">&nbsp;</td>
									</tr>
							<?php
								}
							}	//end if uitslagen >0
							?>
						</table>
					</div>
				</div>
		</tr>
		<tr>
			<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900">
				<input type="button" class="submit-button" style="width:100px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
					onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
			</td>
		</tr>
		<tr>
			<td height="40" align="center" bgcolor="#009900">
				<form name="terug" method="post" action="Competitie_beheer.php">
					<input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;" title="Terug" value="Cancel"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</form>
			</td>
			<td align="right" bgcolor="#009900" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>