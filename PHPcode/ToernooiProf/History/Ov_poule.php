<?php
//© Hans Eekels, versie 22-06-2025
//Overzicht poules
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');
/*
var_dump($_POST) geeft:
array(4) { ["user_code"]=> string(10) "1001_CHR@#" ["t_nummer"]=> string(1) "1" ["ronde_nr"]=> string(1) "2" ["poule_nr"]=> string(1) "2" }
*/

$Spelers = array();
$Copy = Date("Y");

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

if (count($_REQUEST) != 4) {
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

//spelers ophalen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_poules 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND poule_nr = '$Poule_nr' AND ronde_nr = '$Ronde_nr'";

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
			$Sp_nummer = $resultaat['sp_nummer'];
			$Spelers[$teller]['sp_naam'] = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Path);
			$Spelers[$teller]['sp_moy'] = fun_moyspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde_nr, $Path);
			$Spelers[$teller]['sp_car'] = fun_carspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Ronde_nr, $Path);
		}
		$Aantal_spelers = $teller;
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

sort($Spelers);	//keystart = 0

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Overzicht poule</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			width: 600px;
			background-color: #FFF;
		}

		.button:hover {
			border-color: #000;
		}

		div.scroll {
			background-color: #FFF;
			width: 590px;
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
		<table width="600" border="0">
			<tr>
				<td width="170" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo" /></td>
				<td colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
					<h1>ToernooiProf Online</h1>
				</td>
			</tr>
			<tr>
				<td colspan="3" align="left" bgcolor="#009900" class="groot">
					<div class="scroll">
						<div id="printableArea">
							<table width="570" border="1">
								<tr>
									<td colspan="3" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart"><strong><?php print("$Toernooi_naam"); ?></strong></td>
								</tr>
								<tr>
									<td colspan="3" align="center" class="grootzwart"><strong>Overzicht Spelers in poule <?php print("$Poule_nr"); ?> in ronde <?php print("$Ronde_nr"); ?></strong></td>
								</tr>
								<tr>
									<td width="350" align="left" class="grootzwart"><strong>Naam</strong></td>
									<td width="105" align="center" class="grootzwart"><strong>Moy</strong></td>
									<td width="105" align="center" class="grootzwart"><strong>Car</strong></td>
								</tr>
								<?php
								if ($Aantal_spelers > 0) {
									for ($a = 0; $a < $Aantal_spelers; $a++) {
										$Naam_p = $Spelers[$a]['sp_naam'];
										$Car_p = $Spelers[$a]['sp_car'];
										$Moy_p = $Spelers[$a]['sp_moy'];
								?>
										<tr>
											<td align="left" class="grootzwart"><?php print("$Naam_p"); ?></td>
											<td align="center" class="grootzwart"><?php print("$Moy_p"); ?></td>
											<td align="center" class="grootzwart"><?php print("$Car_p"); ?></td>
										</tr>
									<?php
									}	//end for per speler
									?>
									<tr>
										<td colspan="3" align="center" class="grootzwart"><strong>Aantal spelers:&nbsp;<?php print("$Aantal_spelers"); ?></strong></td>
									<tr>
									<?php
								} else {
									?>
									<tr>
										<td colspan="3" align="center" class="grootzwart"><strong>Nog geen spelers ingevoerd !</strong></td>
									<tr>
									<?php
								}
									?>
							</table>
						</div>
					</div>
				</td>
			</tr>
			<tr>
				<td height="45" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Terug naar beheer spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
				</td>
				<td width="216" align="center" bgcolor="#006600">
					<input type="button" style="width:150px; height:40px; background-color:#FFF; color:#000;"
						onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
				<td bgcolor="#006600" width="197" align="right">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>