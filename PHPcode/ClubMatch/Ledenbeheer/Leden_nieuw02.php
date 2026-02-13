<?php
//© Hans Eekels, versie 02-12-2025
//Nieuw lid opslaan
//NB: bij invoer moy al opgevangen als getal
//alleen naam escapen
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(9) { 
["Voornaam"]=> string(4) "Hans" 
["Tv"]=> string(0) "" 
["Achternaam"]=> string(6) "Eekels" 
["Moy_lib"]=> string(5) "1.500" 
["Moy_band"]=> string(5) "0.000" 
["Moy_3bandkl"]=> string(5) "0.000" 
["Moy_3bandgr"]=> string(5) "0.000" 
["Moy_kader"]=> string(5) "0.000" 
["user_code"]=> string(10) "1002_CRJ@#" }
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

//voornaam
if (!isset($_POST['Voornaam'])) {
	$bAkkoord = FALSE;
} else {
	$Naam_hulp_1 = $_POST['Voornaam'];
	$Voornaam =	fun_test_input($Naam_hulp_1);
}

//tv
if (!isset($_POST['Tv'])) {
	$bAkkoord = FALSE;
} else {
	$Naam_hulp_2 = $_POST['Tv'];
	if (strlen($Naam_hulp_2) > 0) {
		$Tv = fun_test_input($Naam_hulp_2);
	} else {
		$Tv = "";
	}
}

//achternaam
if (!isset($_POST['Achternaam'])) {
	$bAkkoord = FALSE;
} else {
	$Naam_hulp_3 = $_POST['Achternaam'];
	$Achternaam = fun_test_input($Naam_hulp_3);
}

//moy_lib
if (!isset($_POST['Moy_lib'])) {
	$bAkkoord = FALSE;
} else {
	$Moy = 	$_POST['Moy_lib'];
	if ($Moy == "" || $Moy == 0) {
		$Moy_lib = '0.000';
	} else {
		$Moy_lib = $_POST['Moy_lib'];
	}
}

//moy_band
if (!isset($_POST['Moy_band'])) {
	$bAkkoord = FALSE;
} else {
	$Moy = 	$_POST['Moy_band'];
	if ($Moy == "" || $Moy == 0) {
		$Moy_band = '0.000';
	} else {
		$Moy_band = $_POST['Moy_band'];
	}
}

//moy 3band kl
if (!isset($_POST['Moy_3bandkl'])) {
	$bAkkoord = FALSE;
} else {
	$Moy = 	$_POST['Moy_3bandkl'];
	if ($Moy == "" || $Moy == 0) {
		$Moy_3bndkl = '0.000';
	} else {
		$Moy_3bndkl = $_POST['Moy_3bandkl'];
	}
}

//moy 3bnd gr
if (!isset($_POST['Moy_3bandgr'])) {
	$bAkkoord = FALSE;
} else {
	$Moy = 	$_POST['Moy_3bandgr'];
	if ($Moy == "" || $Moy == 0) {
		$Moy_3bndgr = '0.000';
	} else {
		$Moy_3bndgr = $_POST['Moy_3bandgr'];
	}
}

//moy kader
if (!isset($_POST['Moy_kader'])) {
	$bAkkoord = FALSE;
} else {
	$Moy = 	$_POST['Moy_kader'];
	if ($Moy == "" || $Moy == 0) {
		$Moy_kader = '0.000';
	} else {
		$Moy_kader = $_POST['Moy_kader'];
	}
}

if (count($_POST) != 9) {
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
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//Vrij nummer opzoeken
	$sql = "SELECT spa_nummer FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' ORDER BY spa_nummer DESC limit 1";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Nummer_speler = 1;
	} else {
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nummer = $resultaat['spa_nummer'];
		}

		$Nummer_speler = $Nummer + 1;
	}

	//invoeren: insert of negeer
	$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_nummer = '$Nummer_speler' AND spa_org = '$Org_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		//insert
		$sql = "INSERT INTO bj_spelers_algemeen 
			(spa_nummer, spa_vnaam, spa_tv, spa_anaam, spa_org, spa_moy_lib, spa_moy_band, spa_moy_3bkl, spa_moy_3bgr, spa_moy_kad) 
			VALUES 
			('$Nummer_speler', '$Voornaam', '$Tv', '$Achternaam', '$Org_nr', '$Moy_lib', '$Moy_band', '$Moy_3bndkl', '$Moy_3bndgr', '$Moy_kader')";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
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
			<td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
			<td align="center" valign="middle" bgcolor="#003300">
				<h1>ClubMatch</h1>
			</td>
		</tr>
		<tr>
			<td align="center" colspan="2">
				<h1>Nieuw lid opgeslagen</h1>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
					Nieuw lid is opgeslagen en kan aan een competitie gekoppeld worden.<br><br>
					U kunt kiezen om nog een lid in te voeren of terug te keren naar het Startscherm.
				</div>
			</td>
		</tr>
		<tr>
			<td height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="Leden_nieuw01.php">
					<input type="submit" class="submit-button" value="Nog een lid invoeren" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
						title="Naar invoer nieuw lid" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</form>
			</td>
			<td height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="../ClubMatch_start.php">
					<input type="submit" class="submit-button" value="Naar Startscherm" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
						title="Naar Startscherm" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="40" align="center" bgcolor="#003300">&nbsp;</td>
			<td align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>