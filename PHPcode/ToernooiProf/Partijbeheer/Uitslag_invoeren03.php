<?php
//© Hans Eekels, versie 16-12-2025
//Uitslag opslaan
//Car_sys
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");

/*
array(13) { 
["user_code"]=> string(10) "1000_KYZ@#" ["t_nummer"]=> string(1) "3" ["poule_nr"]=> string(1) "1" 
["car_1_gem"]=> string(2) "30" ["car_2_gem"]=> string(2) "25" 
["brt"]=> string(2) "17" 
["hs_1"]=> string(1) "3" ["hs_2"]=> string(1) "2" 
["speler_1"]=> string(1) "1" ["speler_2"]=> string(1) "2" 
["punten_1"]=> string(2) "12" ["punten_2"]=> string(1) "8" 
["uitslag_code"]=> string(3) "1_1" }
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

if (!isset($_POST['speler_1'])) {
	$bAkkoord = FALSE;
} else {
	$Sp_nummer_1 = $_POST['speler_1'];
	if (filter_var($Sp_nummer_1, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['speler_2'])) {
	$bAkkoord = FALSE;
} else {
	$Sp_nummer_2 = $_POST['speler_2'];
	if (filter_var($Sp_nummer_2, FILTER_VALIDATE_INT) == FALSE) {
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

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = $_POST['poule_nr'];
	if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['car_1_gem'])) {
	$bAkkoord = FALSE;
} else {
	$Car_1_gem = $_POST['car_1_gem'];
	if (filter_var($Car_1_gem, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['car_2_gem'])) {
	$bAkkoord = FALSE;
} else {
	$Car_2_gem = $_POST['car_2_gem'];
	if (filter_var($Car_2_gem, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}


if (!isset($_POST['brt'])) {
	$bAkkoord = FALSE;
} else {
	$Brt = $_POST['brt'];
}

if (!isset($_POST['hs_1'])) {
	$bAkkoord = FALSE;
} else {
	$Hs_1 = $_POST['hs_1'];
	if ($Hs_1 > 0) {
		if (filter_var($Hs_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['hs_2'])) {
	$bAkkoord = FALSE;
} else {
	$Hs_2 = $_POST['hs_2'];
	if ($Hs_2 > 0) {
		if (filter_var($Hs_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['punten_1'])) {
	$bAkkoord = FALSE;
} else {
	$Punten_1 = $_POST['punten_1'];
	if ($Punten_1 > 0) {
		if (filter_var($Punten_1, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['punten_2'])) {
	$bAkkoord = FALSE;
} else {
	$Punten_2 = $_POST['punten_2'];
	if ($Punten_2 > 0) {
		if (filter_var($Punten_2, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['uitslag_code'])) {
	$bAkkoord = FALSE;
} else {
	$Uitslag_code = $_POST['uitslag_code'];
}

if (count($_REQUEST) != 13) {
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
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);

//verder opslaan is update record in tp_uitslagen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//opslaan
	$sql = "UPDATE tp_uitslagen SET sp1_car_gem = '$Car_1_gem', sp2_car_gem = '$Car_2_gem', brt = '$Brt', sp1_hs = '$Hs_1', sp2_hs = '$Hs_2', sp1_punt = '$Punten_1', sp2_punt = '$Punten_2', gespeeld = '1'
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$Uitslag_code'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//Melding
$error_message = "Uitslag opgeslagen.<br>U keert terug naar de pagina Planning";
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Uitslag opgeslagen</title>
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
				<h1>Melding</h1>
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
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
				<form name="akkoord" method="post" action="Planning.php">
					<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
						title="Naar planning" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>