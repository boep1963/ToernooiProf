<?php
//© Hans Eekels, versie 23-06-2025
//Vangt keuze op uit Scorebord_eind.php, nl akkoord opslaan of niet akkoord terug naar score
//gegevens om in te loggen op database
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../../ToernooiProf/PHP/Functies_toernooi.php');

$Punten = array();
$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(4) { ["Akkoord"]=> string(24) "Akkoord: volgende partij" ["u_code"]=> string(4) "1_1 " ["user_code"]=> string(10) "1001_CHR@#" ["toernooi_nr"]=> string(1) "1" ["poule_nr"]=> string(1) "3" }
//	of
//array(4) { ["Cancel"]=> string(19) "Niet akkoord: terug" ["u_code"]=> string(4) "1_1 " ["user_code"]=> string(10) "1001_CHR@#" ["toernooi_nr"]=> string(1) "1" ["poule_nr"]=> string(1) "3" }

//check
$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

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
			$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = intval($_POST['toernooi_nr']);
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = intval($_POST['poule_nr']);
	if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['u_code'])) {
	$bAkkoord = FALSE;
} else {
	$Code_hulp = $_POST['u_code'];
	$U_code = str_replace(" ", "", $Code_hulp);
}


//check
if ($bAkkoord == FALSE) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Toernooi programma</title>
		<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
		<meta name="Description" content="Toernooiprogramma" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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

if (isset($_POST['Akkoord'])) {
	//Uitslag opslaan
	//Dan partij delete en uitslag_hulp delete
	//dan terug naar partij-keuze
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//haal data op uit tp_uitslag_hulp
		$sql = "SELECT * FROM tp_uitslag_hulp 
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code'  ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Car_1_tem = $resultaat['car_A_tem'];
			$Car_2_tem = $resultaat['car_B_tem'];
			$Car_1_gem = $resultaat['car_A_gem'];
			$Car_2_gem = $resultaat['car_B_gem'];
			$Hs_1 = $resultaat['hs_A'];
			$Hs_2 = $resultaat['hs_B'];
			$Brt = $resultaat['brt'];
		}

		//bepaal punten
		$Punten = fun_punten($Gebruiker_nr, $Toernooi_nr, $Car_1_tem, $Car_1_gem, $Car_2_tem, $Car_2_gem, $Path);
		$Punt_1 = $Punten[1];
		$Punt_2 = $Punten[2];

		//update uitslag
		$sql = "UPDATE tp_uitslagen
			SET sp1_car_gem = '$Car_1_gem', sp2_car_gem = '$Car_2_gem', brt = '$Brt', sp1_hs = '$Hs_1', sp2_hs = '$Hs_2', sp1_punt = '$Punt_1', sp2_punt = '$Punt_2', gespeeld = '1'
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$U_code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//delete uitslaghulp
		$sql = "DELETE FROM tp_uitslag_hulp 
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr'  AND uitslag_code = '$U_code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
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
		<meta charset="UTF-8">
		<title>Redirect</title>
		<script type="text/javascript">
			window.onload = function() {
				document.forms[0].submit();
			}
		</script>
	</head>

	<body style="background-color:#333; margin:0;">
		<form method="post" action="Kies_tafel.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="toernooi_nr" value="<?php echo $Toernooi_nr; ?>">
		</form>
	</body>

	</html>
<?php
} else {
	//data speler B van 1 beurt geleden en turn op 1 in dab
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Beurten = $resultaat['brt'];
			$Car_A_gem = $resultaat['car_A_gem'];
			$Car_A_tem = $resultaat['car_A_tem'];
		}

		if ($Beurten > 1) {
			//vorige beurt ophalen
			$Beurten_hulp = $Beurten - 1;
			$sql = "SELECT * FROM tp_uitslag_hulp 
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten_hulp'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				//data uit bestaand record
				$Car_B_gem = $resultaat['car_B_gem'];
				$Hs_B = $resultaat['hs_B'];
			}

			$Turn = 1;

			if ($Car_A_gem == $Car_A_tem) {
				$Alert = 1;
			} else {
				$Alert = 0;
			}

			$sql = "UPDATE tp_uitslag_hulp SET car_B_gem = '$Car_B_gem', hs_B = '$Hs_B', turn = '$Turn', alert = '$Alert' 
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		} else {
			$Car_B_gem = 0;
			$Hs_B = 0;
			$Turn = 1;

			if ($Car_A_gem == $Car_A_tem) {
				$Alert = 1;
			} else {
				$Alert = 0;
			}

			$sql = "UPDATE bj_uitslag_hulp SET car_B_gem = '$Car_B_gem', hs_B = '$Hs_B', turn = '$Turn', alert = '$Alert' 
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

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
		<meta charset="UTF-8">
		<title>Redirect</title>
		<script type="text/javascript">
			window.onload = function() {
				document.forms[0].submit();
			}
		</script>
	</head>

	<body style="background-color:#333; margin:0;">
		<form method="post" action="Scorebord_start.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="toernooi_nr" value="<?php echo $Toernooi_nr; ?>">
			<input type="hidden" name="poule_nr" value="<?php echo $Poule_nr; ?>">
			<input type="hidden" name="u_code" value="<?php echo $U_code; ?>">
		</form>
	</body>

	</html>
<?php
}
?>