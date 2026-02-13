<?php
//© Hans Eekels, versie 15-12-2025
//Nieuwe ronde aanmaken starten
//eerst wat tests
//data goedzetten
//volgnummers toekennen aan spelers in poules
//roosters maken om vervolgens "lege" uitslagen op te slaan; dat geeft gelijk de planning
//Car_sys
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Spelers = array();
$Roosters = array();

$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(2) { ["user_code"]=> string(10) "1001_CHR@#" ["t_nummer"]=> string(1) "1" }
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

if (count($_REQUEST) != 2) {
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
$error_message = "";
$bAkkoord = TRUE;

$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Nieuwe_ronde = $Huidige_ronde + 1;

$Aantal_poules = fun_aantalpoules($Gebruiker_nr, $Toernooi_nr, $Nieuwe_ronde, $Path);

if ($Aantal_poules == 0) {
	$error_message = "U moet minimaal 1 poule met minimaal 2 spelers aanmaken in de nieuwe ronde !<br><br>";
	$bAkkoord = FALSE;
} else {
	for ($a = 1; $a < $Aantal_poules + 1; $a++) {
		$Aantal_spelers = fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Nieuwe_ronde, $a, $Path);
		if ($Aantal_spelers < 2) {
			$error_message .= "Poule nr $a bestaat niet of heeft minder dan 2 spelers. Pas uw indeling aan!<br><br>";
			$bAkkoord = FALSE;
		}
	}
}

if ($bAkkoord == FALSE) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Fouten in poule-indelingen !</title>
		<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
		<meta name="Description" content="Toernooiprogramma" />
		<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../PHP/script_toernooi.js" defer></script>
		<style type="text/css">
			body {
				width: 500px;
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
				<td height="100" colspan="2" bgcolor="#006600" class="grootwit">
					<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px;">
						<?php print("$error_message"); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
					<form name="terug" method="post" action="Ronde_nieuw01.php">
						<input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
							title="Terug naar aanmaak nieuwe ronde" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					</form>
				</td>
			</tr>
			<tr>
				<td height="30" colspan="2" align="right" bgcolor="#006600" class="klein">&copy; SpecialSoftware <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
//t_data aanpassen, roosters/uitslagen opslaan, volgnummers toekennen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//rooster maken per poule
	for ($Poule_teller = 1; $Poule_teller < $Aantal_poules + 1; $Poule_teller++) {
		$Aantal_spelers = fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Nieuwe_ronde, $Poule_teller, $Path);

		//haal spelers in poule op
		$sql = "SELECT * FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND poule_nr = '$Poule_teller' AND ronde_nr = '$Nieuwe_ronde'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$Volg_nr = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Volg_nr++;
			$Sp_hulp = $resultaat['sp_nummer'];
			$Spelers[$Volg_nr]['sp_nummer'] = $Sp_hulp;
			$Spelers[$Volg_nr]['sp_volgnr'] = $Volg_nr;									//NB: nog niet opgeslagen
			//$Moy = $resultaat['sp_moy'];
			$Spelers[$Volg_nr]['car_tem'] = $resultaat['sp_car'];
		}

		//update volgnr in poules
		for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
			$Volg_nr_hulp = $Spelers[$a]['sp_volgnr'];
			$Sp_nummer_hulp = $Spelers[$a]['sp_nummer'];
			$sql = "UPDATE tp_poules SET sp_volgnr = '$Volg_nr_hulp' 
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Sp_nummer_hulp' AND poule_nr = '$Poule_teller' AND ronde_nr = '$Nieuwe_ronde'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		}


		//even of oneven
		if ($Aantal_spelers % 2 == 0) {
			//even aantal spelers
			$Rooster = fun_even($Aantal_spelers);

			//bij 6 spelers: 5 ronden met in elke ronde 3 koppels (geen rustspeler)
			//array(5) { 
			//[1]=> array(3) { 
			//	[1]=> array(2) { [1]=> int(1) [2]=> int(2) } 
			//	[2]=> array(2) { [1]=> int(3) [2]=> int(4) } 
			//	[3]=> array(2) { [1]=> int(6) [2]=> int(5) }
			//[2] enz t/m [5]

			//rooster opslaan in uitslagen
			$Aantal_ronden = $Aantal_spelers - 1;
			$Aantal_koppels = $Aantal_spelers / 2;
		} else {
			//oneven aantal spelers
			$Rooster = fun_oneven($Aantal_spelers);

			//bij 7 spelers: 7 ronden met in elke ronde 3 koppels en een rustspeler
			//array(7) { 
			//[1]=> array(4) { 
			//	[1]=> array(2) { [1]=> int(1) [2]=> int(2) } 
			//	[2]=> array(2) { [1]=> int(3) [2]=> int(4) } 
			//	[3]=> array(2) { [1]=> int(6) [2]=> int(5) } 
			//	[4]=> array(2) { [1]=> int(-1) [2]=> int(7) }
			//[2] enz t/m [7]

			//rooster opslaan in uitslagen
			$Aantal_ronden = $Aantal_spelers;
			$Aantal_koppels = ($Aantal_spelers - 1) / 2;		//let op: laatste koppel met sp1 = -1 en sp2 = rustspeler niet opslaan in uitslagen
		}

		for ($Rn = 1; $Rn < $Aantal_ronden + 1; $Rn++) {
			for ($Kn = 1; $Kn < $Aantal_koppels + 1; $Kn++) {
				$sp1_vnr = $Rooster[$Rn][$Kn][1];
				$sp1_nr = $Spelers[$sp1_vnr]['sp_nummer'];
				$sp1_car = $Spelers[$sp1_vnr]['car_tem'];

				$sp2_vnr = $Rooster[$Rn][$Kn][2];
				$sp2_nr = $Spelers[$sp2_vnr]['sp_nummer'];
				$sp2_car = $Spelers[$sp2_vnr]['car_tem'];

				$P_code = $Rn . "_" .  $Kn;

				//opslaan of overslaan
				$sql = "SELECT * FROM tp_uitslagen 
				WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_teller' AND t_ronde = '$Nieuwe_ronde' AND sp_partcode = '$P_code' ";
				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}

				if (mysqli_num_rows($res) == 0) {
					//opslaan
					$sql = "INSERT INTO tp_uitslagen 
					(gebruiker_nr, t_nummer, sp_nummer_1, sp_volgnummer_1, sp_nummer_2, sp_volgnummer_2, sp_poule, t_ronde, p_ronde, koppel, sp_partcode, 
					sp1_car_tem, sp2_car_tem, sp1_car_gem, sp2_car_gem, brt, sp1_hs, sp2_hs, sp1_punt, sp2_punt, gespeeld)
					VALUES 
					('$Gebruiker_nr', '$Toernooi_nr', '$sp1_nr', '$sp1_vnr', '$sp2_nr', '$sp2_vnr', '$Poule_teller', '$Nieuwe_ronde', '$Rn', '$Kn', '$P_code', 
					'$sp1_car', '$sp2_car', '0', '0', '0', '0', '0', '0', '0', '0')";

					$res = mysqli_query($dbh, $sql);
					if (!$res) {
						throw new Exception(mysqli_error($dbh));
					}
				}
			}	//end for per koppel
		}	//end for aantal speelronden

		unset($Spelers);
		unset($Rooster);
	}	//end for per poule

	//data
	$sql = "UPDATE tp_data SET t_ronde = '$Nieuwe_ronde' WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//verder
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);

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
			width: 600px;
		}

		.button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<table width="600" border="0">
		<tr>
			<td width="108" height="85" align="left" valign="middle" bgcolor="#006600"><img src="../Figuren/Startvlag.jpg" width="108" height="105" alt="Logo" /></td>
			<td width="482" align="center" valign="middle" bgcolor="#006600">
				<h1>Nieuwe ronde aangemaakt !</h1>
			</td>
		</tr>
		<tr>
			<td height="100" colspan="2" align="center" bgcolor="#006600" class="grootwit">Ronde <?php print("$Nieuwe_ronde"); ?> is aangemaakt voor Toernooi <?php print("$Toernooi_naam"); ?> !<br><br>
				U komt in het Toernooi Beheersscherm waar u alle acties kunt kiezen die u ondersteunen bij de organisatie van uw toernooi in ronde <?php print("$Nieuwe_ronde"); ?>.<br><br>
			</td>
		</tr>
		<tr>
			<td height="100" colspan="2" align="center" valign="middle" bgcolor="#009900">
				<form name="start" method="post" action="../Toernooi_Beheer.php">
					<input type="submit" class="submit-button" value="Naar Toernooibeheer" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
						title="Naar beheer toernooi" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="25" colspan="2" align="right" bgcolor="#006600">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>