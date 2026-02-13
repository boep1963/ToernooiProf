<?php
//© Hans Eekels, versie 02-12-2025
//Stand obv %Punten of Punten en per periode of totaal
//p_moy toegevoegd
//selectie afgestemd op wat getoond wordt (dus pnt of % punt en stand periode of stand totaal)
//Vast aantal brt toegevoegd
//fun_punten aangepast
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Datum = Date("d-m-Y");

$Spelers = array();
$Uitslagen = array();
$Stand = array();
$wrv = array();	//bepaalt via fun_punten wie gewonnen (1), verloren(0) of remise(3) heeft gespeeld; daarna nodig voor P_moy
/*
Mogelijkheden bij terugkeer:
stand periode (1) en obv punten
	array(5) { ["stand"]=> string(5) "Enkel" ["periode"]=> string(1) "1" ["punten"]=> string(6) "Punten" 
stand periode (1) en obv % punten
	array(5) { ["stand"]=> string(5) "Enkel" ["periode"]=> string(1) "1" ["punten"]=> string(10) "Per_punten" 
stand totaal en obv punten
	array(5) { ["stand"]=> string(6) "Totaal" ["periode"]=> string(1) "1" ["punten"]=> string(6) "Punten" 
stand totaal en obv % punten
	array(5) { ["stand"]=> string(6) "Totaal" ["periode"]=> string(1) "1" ["punten"]=> string(10) "Per_punten" 

var_dump($_POST) geeft als basis:
array(2) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }
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

if (!isset($_POST['comp_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Comp_nr = $_POST['comp_nr'];
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
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

if (isset($_POST['stand'])) {
	if ($_POST['stand'] == "Enkel") {
		$bTotaal_stand = FALSE;		//dus periode telt
	} else {
		$bTotaal_stand = TRUE;
	}
} else {
	//bij eerste keer
	$bTotaal_stand = FALSE;
}

if (isset($_POST['punten'])) {
	if ($_POST['punten'] == "Punten") {
		$bPer_punten = FALSE;
	} else {
		$bPer_punten = TRUE;
	}
} else {
	//bij eerste keer
	$bPer_punten = FALSE;
}

//periode
if (isset($_POST['periode'])) {
	//tweede keer geladen
	$Periode_keuze = $_POST['periode'];
	$Aantal_perioden = fun_periode($Comp_nr, $Org_nr, $Path);
} else {
	//eerste keer geladen
	$Periode_keuze = fun_periode($Comp_nr, $Org_nr, $Path);
	$Aantal_perioden = $Periode_keuze;
}

//uitslagen ophalen
if ($bTotaal_stand == TRUE) {
	//totaalstand, ongeacht periode; nog wel bepalen punten of per_punten
	//Uitslagen
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//nu uitslagen
		$sql = "SELECT * FROM bj_uitslagen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

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

				$Sp_1 = $resultaat['sp_1_nr'];
				$data_uitslag[$teller][1] = $Sp_1;		//nummer
				$Car_1_gem = $resultaat['sp_1_cargem'];
				$Car_1_tem = $resultaat['sp_1_cartem'];
				$data_uitslag[$teller][2] = $Car_1_gem;	//car gemaakt
				$Brt = $resultaat['brt'];
				$data_uitslag[$teller][3] = $Brt;			//beurten
				$data_uitslag[$teller][4] = $resultaat['sp_1_punt'];	//punten
				$data_uitslag[$teller][5] = $resultaat['sp_1_hs'];		//hs
				$data_uitslag[$teller][6] = $Car_1_tem;	//car te maken
				//speler 2
				$teller++;
				$Sp_2 = $resultaat['sp_2_nr'];
				$data_uitslag[$teller][1] = $Sp_2;		//nummer
				$Car_2_gem = $resultaat['sp_2_cargem'];
				$Car_2_tem = $resultaat['sp_2_cartem'];
				$data_uitslag[$teller][2] = $Car_2_gem;	//car gemaakt
				$data_uitslag[$teller][3] = $resultaat['brt'];			//beurten
				$data_uitslag[$teller][4] = $resultaat['sp_2_punt'];	//punten
				$data_uitslag[$teller][5] = $resultaat['sp_2_hs'];		//hs
				$data_uitslag[$teller][6] = $Car_2_tem;	//car te maken

				$wrv = fun_punten($Org_nr, $Comp_nr, $Periode_keuze, $Sp_1, $Car_1_gem, $Sp_2, $Car_2_gem, $Brt, $Path);
				$data_uitslag[$teller - 1][7] = $wrv[3];
				$data_uitslag[$teller][7] = $wrv[4];
			}
			$Aantal_uitslagen = $teller;
		}

		if ($Aantal_uitslagen > 0) {
			//spelers
			$sql = "SELECT * FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			if (mysqli_num_rows($res) == 0) {
				$Aantal_spelers = 0;
			} else {
				$teller = 0;
				while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
					$teller++;
					$Sp_nr = $resultaat['spc_nummer'];
					$Spelers[$teller][1] = $Sp_nr;
					$Spelers[$teller][2] = fun_spelersnaam_competitie($Sp_nr, $Org_nr, $Comp_nr, 1, 1, $Path);
				}
				$Aantal_spelers = $teller;
			}
		}
		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}
} else {
	//periodestand, dus periode telt; nog bepalen punten of per_punten
	//Uitslagen
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//nu uitslagen
		$sql = "SELECT * FROM bj_uitslagen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze'";

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
				$Sp_1 = $resultaat['sp_1_nr'];
				$data_uitslag[$teller][1] = $Sp_1;	//nummer
				$Car_1_gem = $resultaat['sp_1_cargem'];
				$Car_1_tem = $resultaat['sp_1_cartem'];
				$data_uitslag[$teller][2] = $Car_1_gem;	//car gemaakt
				$Brt = $resultaat['brt'];
				$data_uitslag[$teller][3] = $Brt;		//beurten
				$data_uitslag[$teller][4] = $resultaat['sp_1_punt'];	//punten
				$data_uitslag[$teller][5] = $resultaat['sp_1_hs'];		//hs
				$data_uitslag[$teller][6] = $Car_1_tem;	//car te maken
				//speler 2
				$teller++;
				$Sp_2 = $resultaat['sp_2_nr'];
				$data_uitslag[$teller][1] = $Sp_2;		//nummer
				$Car_2_gem = $resultaat['sp_2_cargem'];
				$Car_2_tem = $resultaat['sp_2_cartem'];
				$data_uitslag[$teller][2] = $Car_2_gem;	//car gemaakt
				$data_uitslag[$teller][3] = $resultaat['brt'];			//beurten
				$data_uitslag[$teller][4] = $resultaat['sp_2_punt'];	//punten
				$data_uitslag[$teller][5] = $resultaat['sp_2_hs'];		//hs
				$data_uitslag[$teller][6] = $Car_2_tem;	//car te maken

				$wrv = fun_punten($Org_nr, $Comp_nr, $Periode_keuze, $Sp_1, $Car_1_gem, $Sp_2, $Car_2_gem, $Brt, $Path);
				$data_uitslag[$teller - 1][7] = $wrv[3];
				$data_uitslag[$teller][7] = $wrv[4];
			}
			$Aantal_uitslagen = $teller;
		}

		if ($Aantal_uitslagen > 0) {
			//spelers
			$sql = "SELECT * FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			if (mysqli_num_rows($res) == 0) {
				$Aantal_spelers = 0;
			} else {
				$teller = 0;
				while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
					$teller++;
					$Sp_nr = $resultaat['spc_nummer'];
					$Spelers[$teller][1] = $Sp_nr;
					$Spelers[$teller][2] = fun_spelersnaam_competitie($Sp_nr, $Org_nr, $Comp_nr, $Periode_keuze, 1, $Path);
				}
				$Aantal_spelers = $teller;
			}
		}
		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}
}	//end if periode-stand

//array $Stand opstellen: keuze punten of per_punten
//bepaal max aantal punten: 2, 10 of 12
$Max_punten = fun_puntenmax($Org_nr, $Comp_nr, $Path);

if ($Aantal_uitslagen > 0) {
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Volg_nr = $Spelers[$a][1];
		$Naam = $Spelers[$a][2];

		$Car_gem = 0;
		$Car_tem = 0;
		$Brt = 0;
		$Pnt = 0;
		$Hs = 0;
		$Part = 0;
		$P_moy = 0;

		for ($b = 1; $b < $Aantal_uitslagen + 1; $b++) {
			if ($data_uitslag[$b][1] == $Volg_nr) {
				$Part++;
				$Car_gem = $Car_gem + $data_uitslag[$b][2];
				$Car_tem = $Car_tem + $data_uitslag[$b][6];
				$Brt = $Brt + $data_uitslag[$b][3];
				//moy
				//fout verbeterd
				/*
					if ($Brt > 0)
					{
						$Moy = $Car_gem / $Brt;
					}
					else
					{
						$Moy = 0;
					}
					*/
				if ($data_uitslag[$b][3] > 0) {
					$Moy = $data_uitslag[$b][2] / $data_uitslag[$b][3];
				} else {
					$Moy = 0;
				}

				//p_moy
				$WRV = $data_uitslag[$b][7];
				if ($WRV == 1 && $Moy > $P_moy) {
					$P_moy = $Moy;
				}

				$Pnt = $Pnt + $data_uitslag[$b][4];
				//hs
				if ($data_uitslag[$b][5] > $Hs) {
					$Hs = $data_uitslag[$b][5];
				}
			}
		}

		//Stand vullen
		//Punten of Per_punten
		if ($bPer_punten == TRUE) {
			$Max = $Part * $Max_punten;
			$Gehaald = $Pnt;
			if ($Part == 0) {
				$MP = 0;
			} else {
				$MP = number_format(($Gehaald / $Max) * 100, 2);
			}

			$Stand[$a]['mp'] = $MP;
		} else {
			$Stand[$a]['mp'] = $Pnt;
		}

		//%car
		if ($Brt != 0) {
			$Stand[$a]['car_per'] = number_format($Car_gem / $Car_tem * 100, 3);
		} else {
			$Stand[$a]['car_per'] = number_format(0, 3);
		}

		//hs
		$Stand[$a]['hs'] = $Hs;

		//Moy
		if ($Brt > 0) {
			$Moy_gehaald = $Car_gem / $Brt;
			$Stand[$a]['moy'] = number_format($Moy_gehaald, 3);
		} else {
			$Stand[$a]['moy'] = number_format(0, 3);
		}

		//P_moy
		$Stand[$a]['p_moy'] = number_format($P_moy, 3);

		//rest
		$Stand[$a]['naam'] = $Naam;
		$Stand[$a]['part'] = $Part;
		$Stand[$a]['car'] = $Car_gem;
		$Stand[$a]['brt'] = $Brt;
	}

	//nu sorteren, eerst op meeste MP en dan op hoogste %car dan op moy
	rsort($Stand);	//key vanaf 0 !!

}	//end if #spelers >0

$Naam_hulp = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
if ($bTotaal_stand == FALSE) {
	$Competitie_naam = $Naam_hulp . " [Periode: " . $Periode_keuze . "]";
} else {
	$Competitie_naam = $Naam_hulp . " [Totaal_stand]";
}

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Stand</title>
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
			width: 790px;
			height: 420px;
			overflow: auto;
		}
	</style>
	<script type="text/javascript">
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
	<table width="800" border="0" bgcolor="#FFFFFF">
		<tr>
			<td width="264" height="77" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
			<td colspan="2" align="center" valign="middle" bgcolor="#009900" class="kop">
				ClubMatch Online
			</td>
		</tr>
		<tr>
			<td height="20" colspan="3" align="left" bgcolor="#009900">
				<div class="scroll">
					<div id="printableArea">
						<table width="750" bgcolor="#FFFFFF" border="1">
							<tr>
								<td colspan="10" align="center" class="zwart">
									<h2><?php print("$Org_naam Stand per $Datum"); ?></h2>
								</td>
							</tr>
							<tr>
								<td colspan="10" align="center" class="zwart"><strong><?php print("$Competitie_naam"); ?></strong></td>
							</tr>
							<tr>
								<td width="40" align="center" class="zwart"><strong>Pos</strong></td>
								<td width="190" class="zwart"><strong>Naam</strong></td>
								<?php
								if ($bPer_punten == TRUE) {
								?>
									<td width="70" align="center" class="zwart"><strong>% Punten</strong></td>
								<?php
								} else {
								?>
									<td width="70" align="center" class="zwart"><strong>Punten</strong></td>
								<?php
								}
								?>
								<td width="55" align="center" class="zwart"><strong>Part</strong></td>
								<td width="55" align="center" class="zwart"><strong>Car</strong></td>
								<td width="55" align="center" class="zwart"><strong>Brt</strong></td>
								<td width="55" align="center" class="zwart"><strong>HS</strong></td>
								<td width="60" align="right" class="zwart"><strong>Moy</strong></td>
								<td width="60" align="right" class="zwart"><strong>P_moy</strong></td>
								<td align="right" class="zwart"><strong>% Car</strong></td>
							</tr>
							<?php
							if ($Aantal_uitslagen == 0) {
							?>
								<tr>
									<td colspan="10" align="center" class="zwart"><strong>Nog geen uitslagen ingevoerd !</strong></td>
								</tr>
								<?php
							} else {
								for ($a = 0; $a < $Aantal_spelers; $a++) {
									$Pos = $a + 1;
									$Naam = $Stand[$a]['naam'];
									$MP = $Stand[$a]['mp'];
									$Partijen = $Stand[$a]['part'];
									$Car = $Stand[$a]['car'];
									$Brt = $Stand[$a]['brt'];
									$Hs = $Stand[$a]['hs'];
									$Moy = $Stand[$a]['moy'];
									$P_moy = $Stand[$a]['p_moy'];
									$Car_per = $Stand[$a]['car_per'];
								?>
									<tr>
										<td align="center" class="zwart"><?php print("$Pos"); ?></td>
										<td align="left" class="zwart"><?php print("$Naam"); ?></td>
										<td align="center" class="zwart"><?php print("$MP"); ?></td>
										<td align="center" class="zwart"><?php print("$Partijen"); ?></td>
										<td align="center" class="zwart"><?php print("$Car"); ?></td>
										<td align="center" class="zwart"><?php print("$Brt"); ?></td>
										<td align="center" class="zwart"><?php print("$Hs"); ?></td>
										<td align="right" class="zwart"><?php print("$Moy"); ?></td>
										<td align="right" class="zwart"><?php print("$P_moy"); ?></td>
										<td align="right" class="zwart"><?php print("$Car_per"); ?></td>
									</tr>
							<?php
								}
							}
							?>
						</table>
					</div>
				</div>
		</tr>
		<form name="beheer" method="post" action="Stand.php">
			<tr>
				<td height="30" align="center" bgcolor="#006600" class="grootwit">Kies periode of totaal</td>
				<td align="center" bgcolor="#006600" class="grootwit">Kies Punten of % Punten</td>
				<td align="center" bgcolor="#006600" class="grootwit">Stand vernieuwen</td>
			</tr>
			<tr>
				<td height="46" align="center" valign="middle" bgcolor="#009900" class="grootwit">
					<?php
					if ($bTotaal_stand == FALSE) {
					?>
						<input type="radio" id="Enkel" name="stand" checked value="Enkel"> Periode
					<?php
					} else {
					?>
						<input type="radio" id="Enkel" name="stand" value="Enkel"> Periode
					<?php
					}
					?>
					<select name="periode">
						<?php
						for ($a = 1; $a < $Aantal_perioden + 1; $a++) {
							$Per_naam = "Periode_" . $a;
							if ($a == $Periode_keuze) {
						?>
								<option value="<?php print("$a"); ?>" selected><?php print("$Per_naam"); ?></option>
							<?php
							} else {
							?>
								<option value="<?php print("$a"); ?>"><?php print("$Per_naam"); ?></option>
						<?php
							}
						}
						?>
					</select>
					<?php
					if ($bTotaal_stand == TRUE) {
					?>
						<input type="radio" id="Totaal" name="stand" checked value="Totaal"> Totaal
					<?php
					} else {
					?>
						<input type="radio" id="Totaal" name="stand" value="Totaal"> Totaal
					<?php
					}
					?>
				</td>
				<td align="center" valign="middle" bgcolor="#009900" class="grootwit">
					<?php
					if ($bPer_punten == TRUE) {
					?>
						<input type="radio" id="Punten" name="punten" value="Punten">Punten&nbsp;&nbsp;
						<input type="radio" id="Per_punten" name="punten" checked value="Per_punten">% Punten
					<?php
					} else {
					?>
						<input type="radio" id="Punten" name="punten" checked value="Punten">Punten&nbsp;&nbsp;
						<input type="radio" id="Per_punten" name="punten" value="Per_punten">% Punten
					<?php
					}
					?>
				</td>
				<td align="center" valign="middle" bgcolor="#009900">
					<input type="submit" class="submit-button" style="width:150px; height:40px; background-color:#000; color:#FFF;"
						value="Vernieuw Stand" title="Toon totaal-stand" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</td>
			</tr>
		</form>
		<tr>
			<td height="40" align="center" valign="middle" bgcolor="#009900">
				<form name="terug" method="post" action="Competitie_beheer.php">
					<input type="submit" style="width:150px; height:35px;" class="submit-button" value="Terug naar beheer"
						title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</form>
			</td>
			<td align="center" bgcolor="#009900">
				<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#000; color:#FFF;"
					onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
			</td>
			<td align="center" bgcolor="#009900">
				<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:24px; font-weight:bold;"
					name="help4" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
					onClick="window.open('../Help/Help_stand.php','Help','width=410,height=330,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
			</td>
		</tr>
	</table>
</body>

</html>