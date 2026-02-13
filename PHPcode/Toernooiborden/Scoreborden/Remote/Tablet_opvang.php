<?php
//© Hans Eekels, versie 30-08-2025
//Tablet_opvang
require_once('../../../../../data/connectie_toernooiprof.php');
$Path = '../../../../../data/connectie_toernooiprof.php';
require_once('../../../ToernooiProf/PHP/Functies_toernooi.php');

/*
standaard
["user_code"]=> string(10) "1024_AHS@#" 
["toernooi_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "4" 
["u_code"]=> string(3) "4_1" 
["poule_nr"]=> string(1) "1" 
["car_A_tem"]=> string(2) "15" 
["car_B_tem"]=> string(2) "15" 
["turn"]=> string(1) "1" 

extra's
["plus_1A"]=> string(0) ""
["invoerA"]=> string(0) ""
["min_1A"]=> string(0) ""

["plus_1B"]=> string(0) ""
["invoerB"]=> string(0) ""
["min_1B"]=> string(0) ""

["cancel"]=> string(6) "Cancel"
["switch"]=> string(14) "wissel spelers"
["gereed"]=> string(5) "KLAAR" }
["herstel"]=> string(7) "HERSTEL" }
*/

$Verwijzing = array();

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de inlogpagina.";

//check
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
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = $_POST['toernooi_nr'];
	$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (!isset($_POST['tafel_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Tafel_nr = $_POST['tafel_nr'];
	if ($Tafel_nr > 0) {
		if (filter_var($Tafel_nr, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

if (!isset($_POST['u_code'])) {
	$bAkkoord = FALSE;
} else {
	$Code_hulp = $_POST['u_code'];
	$U_code = str_replace(" ", "", $Code_hulp);
}

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = $_POST['poule_nr'];
	if ($Poule_nr_nr > 0) {
		if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

//check
if ($bAkkoord == FALSE) {
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ToernooiProf</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ToernooiProf" />
		<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
		<style type="text/css">
			body {
				width: 500px;
				background-color: #000;
				margin-top: 100px;
				margin-left: auto;
				margin-right: auto;
				font-family: Verdana, Geneva, sans-serif;
				font-size: 16px;
				color: #FFF;
			}

			h1 {
				font-size: 18px;
				color: #FFF;
			}

			.button:hover {
				border-color: #FFF;
			}
		</style>
		<script>
			function mouseInBut(event) {
				var button = event.target || event.srcElement;
				button.style.borderColor = "#F00";
			}

			function mouseOutBut(event) {
				var button = event.target || event.srcElement;
				button.style.borderColor = "transparent";
			}
		</script>
	</head>

	<body>
		<table width="500" border="0">
			<tr>
				<td align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print($error_message); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" align="center" valign="middle" bgcolor="#003300">
					<form name="cancel" method="post" action="Tablet_inloggen.php">
						<input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Terug naar inloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					</form>
				</td>
			</tr>
			<tr>
				<td height="20" align="right" bgcolor="#003300">&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
$Car_A_tem = intval($_POST['car_A_tem']);
$Car_B_tem = intval($_POST['car_B_tem']);

$Max_beurten = fun_maxbeurten($Gebruiker_nr, $Toernooi_nr, $Path);	//kan 0 zijn
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);

$Alert = 0;

if (isset($_POST['min_1A'])) {
	$Turn = 1;
	$Verwijzing = 1;
}
if (isset($_POST['invoerA'])) {
	$Turn = 1;		//beurt was van speler A; na verwerking doorgeven $Turn = 2;
	$Verwijzing = 2;
}
if (isset($_POST['plus_1A'])) {
	$Turn = 1;
	$Verwijzing = 3;
}

if (isset($_POST['min_1B'])) {
	$Turn = 2;
	$Verwijzing = 4;
}
if (isset($_POST['invoerB'])) {
	$Turn = 2;		//beurt was van speler B; na verwerking doorgeven $Turn = 1;
	$Verwijzing = 5;
}
if (isset($_POST['plus_1B'])) {
	$Turn = 2;
	$Verwijzing = 6;
}

if (isset($_POST['herstel'])) {
	$Verwijzing = 7;
	$Turn = $_POST['turn'];		//kan zowel vanuit focus A als focus B
}
if (isset($_POST['cancel'])) {
	$Verwijzing = 8;		//afbreken, naar kies tafel
}
if (isset($_POST['gereed'])) {
	$Verwijzing = 9;		//gereed melden (na verloop tijd bv, partij hoeft niet uit te zijn; kan alleen bij turn = 1 en nog geen serie ingevoerd)
	$Alert = 2;
}

if (isset($_POST['switch'])) {
	//spelers wisselen in partijen
	//kan alleen bij start en geen record in tp_uitslag_hulp
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//data ophalen partijen
		$sql = "SELECT * FROM tp_uitslagen
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$U_code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nr1_oud = $resultaat['sp_nummer_1'];
			$VolgNr1_oud = $resultaat['sp_volgnummer_1'];
			$Car1_oud = $resultaat['sp1_car_tem'];

			$Nr2_oud = $resultaat['sp_nummer_2'];
			$VolgNr2_oud = $resultaat['sp_volgnummer_2'];
			$Car2_oud = $resultaat['sp2_car_tem'];
		}

		//omwisselen
		$sql = "UPDATE tp_uitslagen SET
			sp_nummer_1 = '$Nr2_oud', sp_volgnummer_1 = '$VolgNr2_oud', sp1_car_tem = '$Car2_oud', 
			sp_nummer_2 = '$Nr1_oud', sp_volgnummer_2 = '$VolgNr1_oud', sp2_car_tem = '$Car1_oud'
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$U_code'";

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
		<form method="post" action="Tablet_bediening.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}	//end if switch

if ($Verwijzing == 1) {
	//serieA min 1
	//check op < 0 al gebeurd
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp_tablet
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit bestaand record
			$Brt = $resultaat['brt'];
		}

		//verlaag serieA
		$sql = "UPDATE tp_uitslag_hulp_tablet SET serie_A = serie_A - 1
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

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
		<form method="post" action="Tablet_bediening.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 2) {
	//input A: car aanpassen
	//check op laatste beurt; check op bestaan record
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp_tablet
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//check op start met serieA = 0;
		if (mysqli_num_rows($res) > 0)		//niet eerste keer
		{
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Brt = $resultaat['brt'];
				$Serie_hulp = $resultaat['serie_A'];
				$Car_hulp = $resultaat['car_A_gem'];
				$Car_nieuwA = $Car_hulp + $Serie_hulp;
				if ($Car_nieuwA == $Car_A_tem) {
					$Alert = 1;
				}
				if ($Max_beurten > 0 && $Brt == $Max_beurten) {
					$Alert = 1;
				}

				$Hs_A = $resultaat['hs_A'];
				if ($Hs_A < $Serie_hulp) {
					$Hs_A = $Serie_hulp;
				}
			}

			//update record met turn = 2
			$sql = "UPDATE tp_uitslag_hulp_tablet SET car_A_gem = '$Car_nieuwA', hs_A = '$Hs_A', turn = '2', alert = '$Alert'
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		} else {
			//nieuw record eerste keer
			$sql = "INSERT INTO tp_uitslag_hulp_tablet 
			(gebruiker_nr, t_nummer, t_ronde, poule_nr, uitslag_code, tafel_nr, car_A_tem, car_A_gem, serie_A, hs_A, brt, car_B_tem, car_B_gem, serie_B, hs_B, turn, alert) 
			VALUES 
			('$Gebruiker_nr', '$Toernooi_nr', '$Huidige_ronde', '$Poule_nr', '$U_code', '$Tafel_nr', '$Car_A_tem', '0', '0', '0', '1', '$Car_B_tem', '0', '0', '0', '2', '0')";

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
		<form method="post" action="Tablet_bediening.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 3) {
	//huidige serie A + 1
	//check records, bij laatste serieA + 1 en bij 0 records aanmaken
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp_tablet
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0)		//niet eerste keer
		{
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				//data uit bestaand record
				$Brt = $resultaat['brt'];
			}

			//verhoog serieA
			$sql = "UPDATE tp_uitslag_hulp_tablet SET serie_A = serie_A +1
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		} else		//in tp_uitslag_hulp geen record ! Dat betekent de eerste keer
		{
			//nieuw record met serieA = 1
			$sql = "INSERT INTO tp_uitslag_hulp_tablet 
			(gebruiker_nr, t_nummer, t_ronde, poule_nr, uitslag_code, tafel_nr, car_A_tem, car_A_gem, serie_A, hs_A, brt, car_B_tem, car_B_gem, serie_B, hs_B, turn, alert) 
			VALUES 
			('$Gebruiker_nr', '$Toernooi_nr', '$Huidige_ronde', '$Poule_nr', '$U_code', '$Tafel_nr', '$Car_A_tem', '0', '1', '0', '1', '$Car_B_tem', '0', '0', '0', '1', '0')";

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
		<form method="post" action="Tablet_bediening.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 4) {
	//huidige serie B - 1
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp_tablet
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit bestaand record
			$Brt = $resultaat['brt'];
		}

		//verlaag serieB
		$sql = "UPDATE tp_uitslag_hulp_tablet SET serie_B = serie_B - 1
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

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
		<form method="post" action="Tablet_bediening.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
	<?php
	exit;
}

if ($Verwijzing == 5) {
	//input B: aanpassen car, volgende beurt als partij niet uit is !
	//check op laatste beurt of uit
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp_tablet
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//voor eventueel nieuw record
			$Car_A_tem = $resultaat['car_A_tem'];
			$Car_A_gem  = $resultaat['car_A_gem'];
			$Hs_A  = $resultaat['hs_A'];

			//voor resultaat B
			$Brt_huidig = $resultaat['brt'];
			$Brt_nieuw = $Brt_huidig + 1;
			$Alert = $resultaat['alert'];
			$Car_hulp = $resultaat['car_B_gem'];
			$Serie_hulp = $resultaat['serie_B'];
			$Car_nieuwB = $Car_hulp + $Serie_hulp;

			if ($Alert == 1)	//A is al uit
			{
				$Alert = 2;		//partij afsluiten
			}

			if ($Car_nieuwB == $Car_B_tem)	//B uit
			{
				$Alert = 2;
			}
			if ($Max_beurten > 0 && $Brt_huidig == $Max_beurten) {
				$Alert = 2;
			}

			$Hs_B = $resultaat['hs_B'];
			if ($Hs_B < $Serie_hulp) {
				$Hs_B = $Serie_hulp;
			}
		}

		//update record
		$sql = "UPDATE tp_uitslag_hulp_tablet SET car_B_gem = '$Car_nieuwB', hs_B = '$Hs_B', alert = '$Alert'
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt_huidig'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if ($Alert == 0) {
			//nieuw record
			$sql = "INSERT INTO tp_uitslag_hulp_tablet
			(gebruiker_nr, t_nummer, t_ronde, poule_nr, uitslag_code, tafel_nr, car_A_tem, car_A_gem, serie_A, hs_A, brt, car_B_tem, car_B_gem, serie_B, hs_B, turn, alert)
			VALUES
			('$Gebruiker_nr', '$Toernooi_nr', '$Huidige_ronde', '$Poule_nr', '$U_code', '$Tafel_nr', '$Car_A_tem', '$Car_A_gem', '0', '$Hs_A', '$Brt_nieuw', '$Car_B_tem', '$Car_nieuwB', '0', '$Hs_B', '1', '$Alert')";

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

	if ($Alert < 2) {
		//terug naar bediening, anders door naar gereed
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
			<form method="post" action="Tablet_bediening.php">
				<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
				<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
				<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
				<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
			</form>
		</body>

		</html>
	<?php
		exit;
	}	//end if $Alert < 2
}

if ($Verwijzing == 6) {
	//huidige serie B + 1
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp_tablet
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit bestaand record
			$Brt = $resultaat['brt'];
		}

		//verhoog serieB
		$sql = "UPDATE tp_uitslag_hulp_tablet SET serie_B = serie_B +1
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

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
		<form method="post" action="Tablet_bediening.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 7) {
	/*herstel
	draai de input-actie terug van A of B (dus niet de series, die kunnen met -1 hersteld worden.
	
	Dit betekent voor de knop herstel:
	* oproepen laatste record.
	* bij turn = 1: Dan is de invoer van A nog niet gebeurd en moeten we terug naar een schone invoer voor B in de vorige beurt !
		-	record delete met brt=brt
		-	update vorig record (if brt > 1) bij B: gem_B = gem_B - serieB, serieB = 0; turn blijft 2 met brt = brt-1
	
	* bij turn = 2:
	Dan is bij A net ingevoerd en bij B nog niet, dus terug in zelfde beurt naar schone invoer A en serie B op 0
		-	bij record brt=brt
		-	update bij A: car_gem uit vorige beurt, serieA huidige beurt = 0; Bij B serie B op 0, turn naar 1
	Alert kon 1 zijn, maar wordt door aanpassing score A weer 0
	
	Alert = 2: NB partij is dan afgesloten. Als getoonde uitslag niet akkoord is, dan wordt herstel van de records daar geregeld en dus niet via opvang en herstel !
	*/

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM tp_uitslag_hulp_tablet
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit bestaand record
			$Brt = $resultaat['brt'];
			$Turn_hulp = $resultaat['turn'];
		}

		if ($Turn_hulp == 1) {
			//delete laatste record
			$sql = "DELETE FROM tp_uitslag_hulp_tablet
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			$Beurt_vorig = $Brt - 1;
			$Beurt_vorig_vorig = $Brt - 2;

			if ($Beurt_vorig_vorig > 0) {
				$sql = "SELECT hs_B FROM tp_uitslag_hulp_tablet
				WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND brt = '$Beurt_vorig_vorig'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}

				while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
					$Hs_B_nieuw = $resultaat['hs_B'];
				}
			} else {
				$Hs_B_nieuw = 0;
			}

			//update B in vorige beurt
			if ($Beurt_vorig > 0) {
				$sql = "SELECT * FROM tp_uitslag_hulp_tablet
				WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Beurt_vorig'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}

				while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
					//data uit bestaand record
					$CarB_gem_hulp = $resultaat['car_B_gem'];
					$SerieB_hulp = $resultaat['serie_B'];
					$CarB_nieuw = $CarB_gem_hulp - $SerieB_hulp;
				}

				//updaten
				$sql = "UPDATE tp_uitslag_hulp_tablet SET car_B_gem = '$CarB_nieuw', serie_B = '0', hs_B = '$Hs_B_nieuw', turn = '2', alert = '0'
				WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Beurt_vorig'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}
			}
		}

		if ($Turn_hulp == 2) {
			/*
			Dan is bij A net ingevoerd en bij B nog niet, dus terug in zelfde beurt naar schone invoer A en serie B op 0
				-	bij record brt=brt
				-	update bij A: car_gem uit vorige beurt, serieA huidige beurt = 0; Bij B serie B op 0, turn naar 1
			*/
			//eerst hs_A ophalen ui vorige beurt
			$Beurt_vorig = $Brt - 1;
			if ($Beurt_vorig > 0) {
				$sql = "SELECT hs_A FROM tp_uitslag_hulp_tablet
				WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Beurt_vorig'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}

				while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
					$Hs_A_nieuw = $resultaat['hs_A'];
				}
			} else {
				$Hs_A_nieuw = 0;
			}

			$sql = "SELECT * FROM tp_uitslag_hulp_tablet
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				//data uit bestaand record
				$CarA_gem_hulp = $resultaat['car_A_gem'];
				$SerieA_hulp = $resultaat['serie_A'];
				$CarA_nieuw = $CarA_gem_hulp - $SerieA_hulp;
			}

			//updaten
			$sql = "UPDATE tp_uitslag_hulp_tablet SET car_A_gem = '$CarA_nieuw', serie_A = '0', hs_A = '$Hs_A_nieuw', serie_B = '0', turn = '1', alert = '0'
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		}	//$Turn_hulp = 2

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
		<form method="post" action="Tablet_bediening.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 8) {
	//cancel
	//verwijderen records tp_uitslag_hulp_tablet en tp_tafel
	//
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "DELETE FROM tp_uitslag_hulp_tablet 
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$sql = "DELETE FROM tp_tafel 
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde'  AND uitslag_code = '$U_code' AND poule_nr = '$Poule_nr' AND tafel_nr = '$Tafel_nr'";
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
		<form method="post" action="Tablet_keuze_tafel.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 9 || $Alert == 2) {
	//gereed
	//status aanpassen
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "UPDATE tp_tafel SET status = '2' 
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//bij voortijdig afsluiten ($Verwijzing == 9) laatste record deleten
		if ($Verwijzing == 9) {
			$sql = "SELECT * FROM tp_uitslag_hulp_tablet
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				//data uit bestaand record
				$Brt = $resultaat['brt'];
			}

			$sql = "DELETE FROM tp_uitslag_hulp_tablet 
			WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' 
			AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";
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
		<form method="post" action="Tablet_resultaat.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}
?>