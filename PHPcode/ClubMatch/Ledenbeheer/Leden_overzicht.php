<?php
//© Hans Eekels, versie 02-12-2025
//Overzicht leden algemeen
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Datum = Date("d-m-Y");
$Leden = array();

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

if (count($_POST) != 1) {
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

//opvragen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//spelers
	$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' ORDER BY spa_anaam";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Aantal_leden = 0;
	} else {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Leden[$teller]['nummer'] = $resultaat['spa_nummer'];
			$Vn = $resultaat['spa_vnaam'];
			$Tv = $resultaat['spa_tv'];
			$An = $resultaat['spa_anaam'];

			if (strlen($Tv) == 0) {
				$Leden[$teller]['naam'] = $Vn . " " . $An;
			} else {
				$Leden[$teller]['naam'] = $Vn . " " . $Tv . " " . $An;
			}
			$Leden[$teller]['moy_lib'] = $resultaat['spa_moy_lib'];
			$Leden[$teller]['moy_band'] = $resultaat['spa_moy_band'];
			$Leden[$teller]['moy_3bkl'] = $resultaat['spa_moy_3bkl'];
			$Leden[$teller]['moy_3bgr'] = $resultaat['spa_moy_3bgr'];
			$Leden[$teller]['moy_kad'] = $resultaat['spa_moy_kad'];
		}
		$Aantal_leden = $teller;
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
	<title>Overzicht leden</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 800px;
			background-color: #FFF;
		}

		.button:hover {
			border-color: #FFF;
		}

		div.scroll {
			background-color: #FFF;
			width: 780px;
			height: 450px;
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
	<table width="800" border="0">
		<tr>
			<td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
			<td align="center" valign="middle" bgcolor="#009900">
				<h1>ClubMatch Online</h1>
			</td>
		</tr>
		<tr>
			<td height="20" colspan="2" align="left" bgcolor="#009900">
				<div class="scroll">
					<div id="printableArea">
						<table width="760" bgcolor="#FFFFFF" border="1">
							<tr>
								<td colspan="6" align="center" class="zwart">
									<h2><?php print("$Org_naam"); ?></h2>
								</td>
							</tr>
							<tr>
								<td height="40" colspan="6" align="center" class="zwart">
									<h2>Overzicht leden&nbsp;[<?php print("$Datum"); ?>]</h2>
								</td>
							</tr>
							<tr>
								<td width="310" align="left" class="zwart"><strong>Naam</strong></td>
								<td width="82" class="zwart"><strong>Moy_lib</strong></td>
								<td width="82" class="zwart"><strong>Moy_band</strong></td>
								<td width="82" class="zwart"><strong>Moy_3bkl</strong></td>
								<td width="82" class="zwart"><strong>Moy_3bgr</strong></td>
								<td width="82" class="zwart"><strong>Moy_kad</strong></td>
							</tr>
							<?php
							if ($Aantal_leden == 0) {
							?>
								<tr>
									<td class="zwart" colspan="6">Geen leden ingevoerd !</td>
								</tr>
								<?php
							} else {
								for ($a = 1; $a < $Aantal_leden + 1; $a++) {
									$Nm = $Leden[$a]['naam'];
									$M1 = $Leden[$a]['moy_lib'];
									$M2 = $Leden[$a]['moy_band'];
									$M3 = $Leden[$a]['moy_3bkl'];
									$M4 = $Leden[$a]['moy_3bgr'];
									$M5 = $Leden[$a]['moy_kad'];
								?>
									<tr>
										<td align="left" class="zwart"><?php print("$Nm"); ?></td>
										<td align="center" class="zwart"><?php print("$M1"); ?></td>
										<td align="center" class="zwart"><?php print("$M2"); ?></td>
										<td align="center" class="zwart"><?php print("$M3"); ?></td>
										<td align="center" class="zwart"><?php print("$M4"); ?></td>
										<td align="center" class="zwart"><?php print("$M5"); ?></td>
									</tr>
							<?php
								}
							}
							?>
						</table>
					</div>
				</div>
		</tr>
		<tr>
			<td height="45" colspan="2" align="center" valign="middle" bgcolor="#009900">
				<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#000; color:#FFF;"
					onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
			</td>
		</tr>
	</table>
	<form name="cancel" method="post" action="../ClubMatch_start.php">
		<table width="800">
			<tr>
				<td width="200" height="40" align="center" bgcolor="#009900">
					<input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
						title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="10">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
				<td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>