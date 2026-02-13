<?php
//© Hans Eekels, versie 03-12-2025
//Moyennes doorkoppelen naar Leden
//Kop aangepast
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");
//Logo refresh
$Copy = Date("Y");
$Spelers = array();
$Uitslagen = array();

//var_dump($_POST) geeft: array(2) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }

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

if (count($_POST) != 2) {
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

$Periode = fun_periode($Comp_nr, $Org_nr, $Path);

//verder
//zoek spelers en bepaal gespeeld moyenne per periode; tenslotte eind-moy obv alle gespeelde perioden
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
		$Spelers[$teller]['moy_start'] = $resultaat['spc_moyenne_1'];
	}
	$Aantal_spelers = $teller;

	//uitslag-array op 0 voor alle spelers
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_num = $Spelers[$a]['spc_nummer'];
		//per periode 1-5 en totaal (is 6)
		for ($b = 1; $b < 7; $b++) {
			$Uitslagen[$Sp_num][$b]['car'] = 0;
			$Uitslagen[$Sp_num][$b]['brt'] = 0;
			$Uitslagen[$Sp_num][$b]['moy'] = 0;
		}
	}

	//uitslagen voor eindmoy
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_nummer = $Spelers[$a]['spc_nummer'];

		//nu uitslagen
		$sql = "SELECT * FROM bj_uitslagen 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (sp_1_nr = '$Sp_nummer' OR sp_2_nr = '$Sp_nummer') AND gespeeld = '1'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$periode = $resultaat['periode'];
				$Sp_test = $resultaat['sp_1_nr'];
				if ($Sp_test == $Sp_nummer) {
					$Uitslagen[$Sp_nummer][$periode]['car'] = $Uitslagen[$Sp_nummer][$periode]['car'] + $resultaat['sp_1_cargem'];
				} else {
					$Uitslagen[$Sp_nummer][$periode]['car'] = $Uitslagen[$Sp_nummer][$periode]['car'] + $resultaat['sp_2_cargem'];
				}
				$Uitslagen[$Sp_nummer][$periode]['brt'] = $Uitslagen[$Sp_nummer][$periode]['brt'] + $resultaat['brt'];
			}
		}	//end if rec=o
	}	//end for per speler

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//bereken moy per periode en totaal
for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
	$Sp_num = $Spelers[$a]['spc_nummer'];
	for ($b = 1; $b < 6; $b++) {
		$Car = $Uitslagen[$Sp_num][$b]['car'];
		$Brt = $Uitslagen[$Sp_num][$b]['brt'];
		if ($Brt > 0) {
			$Uitslagen[$Sp_num][$b]['moy'] = number_format($Car / $Brt, 3);
		} else {
			$Uitslagen[$Sp_num][$b]['moy'] = '0.000';
		}
	}
	//nu totaal
	$Car_tot = 0;
	$Brt_tot = 0;
	for ($c = 1; $c < 6; $c++) {
		$Car_tot = $Car_tot + $Uitslagen[$Sp_num][$c]['car'];
		$Brt_tot = $Brt_tot + $Uitslagen[$Sp_num][$c]['brt'];
	}
	if ($Brt_tot > 0) {
		$Uitslagen[$Sp_num][6]['moy'] = number_format($Car_tot / $Brt_tot, 3);
	} else {
		$Uitslagen[$Sp_num][6]['moy'] = '0.000';
	}
}
//sorteren op naam
sort($Spelers);		//keystart = 0 !
//var_dump($Spelers);

//toon pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Beheersscherm</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body,
		td,
		th {
			font-family: Verdana;
			font-size: 12px;
			color: #000;
		}

		body {
			background-color: #FFF;
			margin-top: 0px;
			margin-right: auto;
			margin-bottom: 0px;
			margin-left: auto;
			width: 1000px;
		}

		.klein {
			font-size: 10px;
			color: #FFF;
		}

		.wit {
			color: #FFF;
		}

		.grootwit {
			font-size: 16px;
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
			width: 990px;
			height: 350px;
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

		function selecteerKolom(nr) {
			// Reset alle kolommen naar wit
			document.querySelectorAll('.kolom').forEach(td => {
				td.style.backgroundColor = 'white';
			});

			// Zet geselecteerde kolom op lichtgrijs
			document.querySelectorAll('.kolom-' + nr).forEach(td => {
				td.style.backgroundColor = '#f0f0f0';
			});
		}
	</script>
</head>

<body>
	<form name="periode" method="post" action="Doorkoppelen02.php">
		<table width="1000" border="0">
			<tr>
				<td height="5" width="170" bgcolor="#FFFFFF">&nbsp;</td>
				<td width="820" bgcolor="#FFFFFF">&nbsp;</td>
			</tr>
			<tr>
				<td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
				<td align="center" valign="middle" bgcolor="#009900" class="kop">
					ClubMatch Online<br>
					<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
				</td>
			</tr>
			<tr>
				<td colspan="2" align="center" bgcolor="#009900" class="grootwit">
					<h2>Gekozen moyennes per speler doorkoppelen naar de leden</h2>
				</td>
			</tr>
			<tr>
				<td height="30" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
					<strong>Huidige periode <?php print("$Periode"); ?></strong>
				</td>
			</tr>
			<tr>
				<td align="left" colspan="2">
					<div class="scroll">
						<div id="printableArea">
							<table width="975" border="1">
								<tr>
									<td width="40" height="10" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="255" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="90" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="90" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="90" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="90" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="90" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="90" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="90" bgcolor="#FFFFFF">&nbsp;</td>
								</tr>
								<tr>
									<td colspan="3" rowspan="2" align="center">U ziet per speler in de kolommen Periode de behaalde moyennes in die periode.
										De kolom Totaal geeft het totaal behaalde moyenne in alle perioden. Ter info is in de eerste kolom het start-moyenne van de speler vermeld.</td>
									<td colspan="6" align="center" bgcolor="#CCCCCC"><strong>Kies met een klik de kolom met moyennes die gebruikt moeten worden:</strong></td>
								</tr>
								<tr>
									<td class="kolom kolom-1" width="90" align="center"><input type="radio" id="periode" name="periode" value="1" onClick="selecteerKolom(1)"><br>Periode 1</td>
									<?php
									if ($Periode > 1) {
									?>
										<td class="kolom kolom-2" width="90" align="center"><input type="radio" id="periode" name="periode" value="2" onClick="selecteerKolom(2)"><br>Periode 2</td>
									<?php
									} else {
									?>
										<td width="90" align="center">Niet gespeeld<br>Periode 2</td>
									<?php
									}
									if ($Periode > 2) {
									?>
										<td class="kolom kolom-3" width="90" align="center"><input type="radio" id="periode" name="periode" value="3" onClick="selecteerKolom(3)"><br>Periode 3</td>
									<?php
									} else {
									?>
										<td width="90" align="center">Niet gespeeld<br>Periode 3</td>
									<?php
									}
									if ($Periode > 3) {
									?>
										<td class="kolom kolom-4" width="90" align="center"><input type="radio" id="periode" name="periode" value="4" onClick="selecteerKolom(4)"><br>Periode 4</td>
									<?php
									} else {
									?>
										<td width="63" align="center">Niet gespeeld<br>Periode 4</td>
									<?php
									}
									if ($Periode > 4) {
									?>
										<td class="kolom kolom-5" width="59" align="center"><input type="radio" id="periode" name="periode" value="5" onClick="selecteerKolom(5)"><br>Periode 5</td>
									<?php
									} else {
									?>
										<td width="58" align="center">Niet gespeeld<br>Periode 5</td>
									<?php
									}
									?>
									<td width="49" align="center" bgcolor="#f0f0f0" class="kolom kolom-6">
										<input type="radio" id="periode" name="periode" checked value="6" onClick="selecteerKolom(6)"><br>Totaal
									</td>
								</tr>
								<tr>
									<td align="center"><strong>Kies</strong></td>
									<td><strong>Speler</strong></td>
									<td align="center" bgcolor="#FFFF66">Start-moy</td>
									<td class="kolom kolom-1" align="center">Eind-moy</td>
									<td class="kolom kolom-2" align="center">Eind-moy</td>
									<td class="kolom kolom-3" align="center">Eind-moy</td>
									<td class="kolom kolom-4" align="center">Eind-moy</td>
									<td class="kolom kolom-5" align="center">Eind-moy</td>
									<td class="kolom kolom-6" align="center" bgcolor="#f0f0f0">Tot-moy</td>
								</tr>
								<?php
								for ($a = 0; $a < $Aantal_spelers; $a++) {
									$Sp_num = $Spelers[$a]['spc_nummer'];
									$Naam = $Spelers[$a]['spc_naam'];
									$Moy_start = $Spelers[$a]['moy_start'];
									$Moy_1 = $Uitslagen[$Sp_num][1]['moy'];
									$Moy_2 = $Uitslagen[$Sp_num][2]['moy'];
									$Moy_3 = $Uitslagen[$Sp_num][3]['moy'];
									$Moy_4 = $Uitslagen[$Sp_num][4]['moy'];
									$Moy_5 = $Uitslagen[$Sp_num][5]['moy'];
									$Moy_6 = $Uitslagen[$Sp_num][6]['moy'];

								?>
									<tr>
										<td align="center" class="zwart">
											<input type="checkbox" class="large" id="<?php print("$Sp_num"); ?>" name="<?php print("$Sp_num"); ?>" value="<?php print("$Sp_num"); ?>">
										</td>
										<td><?php print("$Naam"); ?></td>
										<td align="center" bgcolor="#FFFF66"><?php print("$Moy_start"); ?></td>
										<td align="center" class="kolom kolom-1"><?php print("$Moy_1"); ?></td>
										<td align="center" class="kolom kolom-2"><?php print("$Moy_2"); ?></td>
										<td align="center" class="kolom kolom-3"><?php print("$Moy_3"); ?></td>
										<td align="center" class="kolom kolom-4"><?php print("$Moy_4"); ?></td>
										<td align="center" class="kolom kolom-5"><?php print("$Moy_5"); ?></td>
										<td align="center" bgcolor="#f0f0f0" class="kolom kolom-6"><?php print("$Moy_6"); ?></td>
									</tr>
								<?php
								}
								?>
							</table>
						</div>
					</div>
				</td>
			</tr>
			<tr>
				<td height="30" colspan="2" align="center" valign="middle" bgcolor="#006600" class="wit">
					Met een klik op Akkoord worden de moyennes (als vermeld in de aangevinkte kolom)
					bij de aangevinkte spelers verwerkt in het Ledenbestand.
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Verwerken" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="Competitie_beheer.php">
		<table width="1000" border="0">
			<tr>
				<td width="250" align="center" height="45" bgcolor="#006600">
					<input type="submit" style="width:150px; height:40px; background-color:#CCC; color:#000;" class="submit-button" value="Cancel"
						title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</td>
				<td width="250" align="center" bgcolor="#006600">
					<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#000; color:#FFF;"
						onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
				<td width="250" align="center" bgcolor="#006600">
					<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:24px; font-weight:bold;"
						name="help4" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_doorkoppelen.php','Help','width=730,height=500,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
				</td>
				<td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>