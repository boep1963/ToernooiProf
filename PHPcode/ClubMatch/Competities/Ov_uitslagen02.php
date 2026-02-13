<?php
//© Hans Eekels, versie 07-12-2025
//Ov uitslagen per periode
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

//["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" 
//["startdatum"]=> string(10) "2025-09-15" 
//["einddatum"]=> string(10) "2025-09-30" 

$Copy = Date("Y");

$Uitslagen = array();

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

if (!isset($_POST['startdatum'])) {
  $bAkkoord = FALSE;
} else {
  $Start_datum = $_POST['startdatum'];
}

if (!isset($_POST['einddatum'])) {
  $bAkkoord = FALSE;
} else {
  $Eind_datum = $_POST['einddatum'];
}

if (count($_POST) != 4) {
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
//initialiseren
$Aantal_uitslagen = 0;

//Uitslagen
try
{
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh)
	{
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//nu uitslagen
	$sql = "SELECT * FROM bj_uitslagen 
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND speeldatum >= '$Start_datum' AND speeldatum <= '$Eind_datum' AND gespeeld = '1' 
	ORDER BY speeldatum DESC";

	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0)
	{
		$Aantal_uitslagen = 0;
	}
	else
	{
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
		{
			$teller++;
			$Uitslagen[$teller]['periode'] = $resultaat['periode'];
			$Periode = $Uitslagen[$teller]['periode'];
			$hulp_d = $resultaat['speeldatum'];
			$Uitslagen[$teller]['speeldatum'] = fun_wisseldatum($hulp_d);
			//speler 1
				$hulp_1 = $resultaat['sp_1_nr'];
			$Uitslagen[$teller]['naam_1'] = fun_spelersnaam_competitie($hulp_1, $Org_nr, $Comp_nr, $Periode, 1, $Path);
			$Uitslagen[$teller]['car_gem_1'] = $resultaat['sp_1_cargem'];	//car gemaakt
			$Uitslagen[$teller]['brt'] = $resultaat['brt'];			//beurten
			if ($Uitslagen[$teller]['brt'] > 0)
			{
				$Uitslagen[$teller]['moy_1'] = number_format($Uitslagen[$teller]['car_gem_1'] / $Uitslagen[$teller]['brt'], 3);
			}
			else
			{
				$Uitslagen[$teller]['moy_1'] = '0.000';
			}

			$Uitslagen[$teller]['hs_1'] = $resultaat['sp_1_hs'];		//hs
			$Uitslagen[$teller]['pnt_1'] = $resultaat['sp_1_punt'];	//punten

			//speler 2
				$hulp_2 = $resultaat['sp_2_nr'];
			$Uitslagen[$teller]['naam_2'] = fun_spelersnaam_competitie($hulp_2, $Org_nr, $Comp_nr, $Periode, 1, $Path); //incl car
			$Uitslagen[$teller]['car_gem_2'] = $resultaat['sp_2_cargem'];	//car gemaakt
			if ($Uitslagen[$teller]['brt'] > 0)
			{
				$Uitslagen[$teller]['moy_2'] = number_format($Uitslagen[$teller]['car_gem_2'] / $Uitslagen[$teller]['brt'], 3);
			}
			else
			{
				$Uitslagen[$teller]['moy_2'] = '0.000';
			}
			$Uitslagen[$teller]['hs_2'] = $resultaat['sp_2_hs'];		//hs
			$Uitslagen[$teller]['pnt_2'] = $resultaat['sp_2_punt'];
		}

		$Aantal_uitslagen = $teller;
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
	<title>Overzicht uitslagen</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 1200px;
			background-color: #FFF;
		}

		.button:hover {
			border-color: #FFF;
		}

		div.scroll {
			background-color: #FFF;
			width: 1195px;
			height: 400px;
			overflow: auto;
		}
	</style>
	<script>
		function printDiv(divName) {
			const content = document.getElementById(divName).innerHTML;
			const printWindow = window.open('', '', 'width=1100,height=600');

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
	<table width="1200" border="0" bgcolor="#FFFFFF">
		<tr>
			<td width="172" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
			<td width="1019" align="center" valign="middle" bgcolor="#009900" class="kop">
				ClubMatch Online<br>
				<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
			</td>
		</tr>
		<tr>
			<td height="20" colspan="2" align="left" bgcolor="#009900">
				<div class="scroll">
					<div id="printableArea">
						<table width="1175" bgcolor="#FFFFFF" border="1">
							<tr>
								<td colspan="15" align="center" class="zwart"><strong><?php print("$Comp_naam"); ?></strong></td>
							</tr>
                            <tr>
								<td colspan="15" align="center" class="zwart">
									<h2>Overzicht uitslagen van <?php print("$Start_datum"); ?> tot en met  <?php print("$Eind_datum"); ?></h2>
								</td>
							</tr>
							<tr>
                                <td width="90" align="left" class="zwart"><strong>Datum</strong></td>
                                <td width="40" align="center" class="zwart"><strong>Periode</strong></td>
                                <td width="200" align="left" class="zwart"><strong>Naam</strong></td>
                                <td width="40" align="center" class="zwart"><strong>Car</strong></td>
                                <td width="40" align="center" class="zwart"><strong>Brt</strong></td>
                                <td width="50" align="right" class="zwart"><strong>Moy</strong></td>
                                <td width="40" align="center" class="zwart"><strong>HS</strong></td>
                                <td width="40" align="center" class="zwart"><strong>Punten</strong></td>
                                <td width="40" align="left" class="zwart"><strong>Tegen</strong></td>
                                <td width="200" align="left" class="zwart"><strong>Naam</strong></td>
                                <td width="40" align="center" class="zwart"><strong>Car</strong></td>
                                <td width="40" align="center" class="zwart"><strong>Brt</strong></td>
                                <td width="50" align="right" class="zwart"><strong>Moy</strong></td>
                                <td width="40" align="center" class="zwart"><strong>HS</strong></td>
                                <td width="40" align="center" class="zwart"><strong>Punten</strong></td>
                            </tr>
							<?php
							if ($Aantal_uitslagen == 0)
							{
								?>
                                <tr>
                                	<td colspan="15" class="grootzwart">Geen uitslagen om te tonen !</td>
                                </tr>
                                <?php
							}
							else
							{
								for ($a = 1; $a < $Aantal_uitslagen + 1; $a++)
								{
									//data
									$Datum = $Uitslagen[$a]['speeldatum'];
									$Periode = $Uitslagen[$a]['periode'];;
									$Naam_1 = $Uitslagen[$a]['naam_1'];
									$Car_1 = $Uitslagen[$a]['car_gem_1'];
									$Brt = $Uitslagen[$a]['brt'];
									$Moy_1 = $Uitslagen[$a]['moy_1'];
									$Hs_1 = $Uitslagen[$a]['hs_1'];
									$Punten_1 = $Uitslagen[$a]['pnt_1'];
									
									$Naam_2 = $Uitslagen[$a]['naam_2'];
									$Car_2 = $Uitslagen[$a]['car_gem_2'];
									$Moy_2 = $Uitslagen[$a]['moy_2'];
									$Hs_2 = $Uitslagen[$a]['hs_2'];
									$Punten_2 = $Uitslagen[$a]['pnt_2'];
									
									?>
									<tr>
										<td align="left" class="zwart"><?php print("$Datum"); ?></td>
										<td align="left" class="zwart"><?php print("$Periode"); ?></td>
										<td align="left" class="zwart"><?php print("$Naam_1"); ?></td>
										<td align="center" class="zwart"><?php print("$Car_1"); ?></td>
										<td align="center" class="zwart"><?php print("$Brt"); ?></td>
										<td align="right" class="zwart"><?php print("$Moy_1"); ?></td>
										<td align="center" class="zwart"><?php print("$Hs_1"); ?></td>
										<td align="center" class="zwart"><?php print("$Punten_1"); ?></td>
										<td align="left" class="zwart">-</td>
										<td align="left" class="zwart"><?php print("$Naam_2"); ?></td>
										<td align="center" class="zwart"><?php print("$Car_2"); ?></td>
										<td align="center" class="zwart"><?php print("$Brt"); ?></td>
										<td align="right" class="zwart"><?php print("$Moy_2"); ?></td>
										<td align="center" class="zwart"><?php print("$Hs_2"); ?></td>
										<td align="center" class="zwart"><?php print("$Punten_2"); ?></td>
									</tr>
									<?php
								}	//end for per uitslag
							}	//end if #uitslagen > 0
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