<?php
//© Hans Eekels, versie 30-08-2025
//Tablet_opvang
/*
Er wordt steeds per beurt een record aangemaakt, waarin de data van speler A en B opgeslagen worden.
Acties:
	Invoer serie A+1:
	-	bij record aanwezig: in dat record serie A + 1
	-	bij geen record aanwezig: eerste record met brt = 1; invoer serie en turn = 1
	Invoer A:
	-	bij record aanwezig: bepaal car_gem, turn = 2
	-	bij geen record aanwezig: eerste record met brt = 1; serie A = 0, car_gem = 0, turn = 2

	Invoer serie B+1:
	-	serie B + 1
	Invoer B:
	-	na verwerking serie B in huidig record, dan nieuw record met brt = brt + 1 en serie A = 0 en turn = 1

	Invoer serie A-1:	(kan alleen als er al een serie A is, dus ook al een record met turn=1)
	-	serie A - 1
	Invoer serie B-1:
	-	serie B - 1
	
	Herstel: laatste invoer-actie verwijderen (NB: een car - of + kan met de knoppen)
	-	turn = 1 in laatste record, dus alleen series A ingevoerd,
		dus laatste record verwijderen en in vorig record afsluiten B herstellen, dus serie aftrekken van car_gem en serie op 0 met turn 2
	-	turn = 2 in laatste record, dan alleen series B ingevoerd,
		dus in laatste record serie B op 0, afsluiten A herstellen, dus serie aftrekken van car_gem en serie op 0 en turn = 1
		
	Afsluiten: (kan alleen als turn = 1 en serie A == 0)
	
	Cancel: partij blijft, hulprecords delete, terug naar Kies tafel
*/

require_once('../../../../../data/connectie_clubmatch.php');
$Path = '../../../../../data/connectie_clubmatch.php';
require_once('../../../ClubMatch/PHP/Functies_biljarten.php');

/*
var_dump($_POST) geeft:
//altijd
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "1" 
["u_code"]=> string(9) "2_010_001" 
["periode"]=> string(1) "2"
["turn"]=> string(1) "1"
["car_A_tem"]=> string(2) "48" 
["car_B_tem"]=> string(2) "59" 

//extra's
["cancel"]=> string(6) "Cancel"
["switch"]=> string(14) "wissel spelers"
//A of B
["min_1A"]=> string(2) "-1"
["invoerA"]=> string(6) "INVOER" }
["plus_1A"]=> string(2) "+1"

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
		if (fun_bestaatorg($Code, $Path) == FALSE) {
			$bAkkoord = FALSE;
		} else {
			$Org_nr = substr($Code, 0, 4);
			$Org_naam = fun_orgnaam($Org_nr, $Path);
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

if (!isset($_POST['periode'])) {
	$bAkkoord = FALSE;
} else {
	$Periode = $_POST['periode'];
	if (filter_var($Periode, FILTER_VALIDATE_INT) == FALSE) {
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
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
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
$Max_beurten = fun_maxbeurten($Org_nr, $Comp_nr, $Path);	//kan 0 zijn
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
	//kan alleen bij start en geen record in bj_uitslag_hulp (is al getest)
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//data ophalen partijen
		$sql = "SELECT * FROM bj_partijen
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND periode = '$Periode'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nr1_oud = $resultaat['nummer_A'];
			$Nm1_oud = $resultaat['naam_A'];
			$Car1_oud = $resultaat['cartem_A'];

			$Nr2_oud = $resultaat['nummer_B'];
			$Nm2_oud = $resultaat['naam_B'];
			$Car2_oud = $resultaat['cartem_B'];
		}
		$Code_nieuw = fun_invertcode($U_code);

		//omwisselen
		$sql = "UPDATE bj_partijen 
			SET nummer_A = '$Nr2_oud', naam_A = '$Nm2_oud', cartem_A = '$Car2_oud', nummer_B = '$Nr1_oud', naam_B = '$Nm1_oud', cartem_B = '$Car1_oud', uitslag_code = '$Code_nieuw'
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode' AND uitslag_code = '$U_code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//omwisselen code in bj_tafel
		$sql = "UPDATE bj_tafel SET u_code = '$Code_nieuw' WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code'";

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
			<input type="hidden" name="u_code" value="<?php print("$Code_nieuw"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
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
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit bestaand record
			$Brt = $resultaat['brt'];
		}

		//verlaag serieA
		$sql = "UPDATE bj_uitslag_hulp_tablet SET serie_A = serie_A - 1
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
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
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' and tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

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
			$sql = "UPDATE bj_uitslag_hulp_tablet SET car_A_gem = '$Car_nieuwA', hs_A = '$Hs_A', turn = '2', alert = '$Alert'
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		} else {
			//nieuw record eerste keer
			$sql = "INSERT INTO bj_uitslag_hulp_tablet 
			(org_nummer, comp_nr, uitslag_code, tafel_nr, car_A_tem, car_A_gem, serie_A, hs_A, brt, car_B_tem, car_B_gem, serie_B, hs_B, turn, alert) 
			VALUES 
			('$Org_nr', '$Comp_nr', '$U_code', '$Tafel_nr', '$Car_A_tem', '0', '0', '0', '1', '$Car_B_tem', '0', '0', '0', '2', '0')";

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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
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
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

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
			$sql = "UPDATE bj_uitslag_hulp_tablet SET serie_A = serie_A +1
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		} else		//in bj_uitslag_hulp_tablet geen record ! Dat betekent de eerste keer
		{
			//nieuw record met serieA = 1
			$sql = "INSERT INTO bj_uitslag_hulp_tablet 
			(org_nummer, comp_nr, uitslag_code, tafel_nr, car_A_tem, car_A_gem, serie_A, hs_A, brt, car_B_tem, car_B_gem, serie_B, hs_B, turn, alert) 
			VALUES 
			('$Org_nr', '$Comp_nr', '$U_code', '$Tafel_nr', '$Car_A_tem', '0', '1', '0', '1', '$Car_B_tem', '0', '0', '0', '1', '0')";

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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 4) {
	//huidige serie B - 1
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit bestaand record
			$Brt = $resultaat['brt'];
		}

		//verlaag serieB
		$sql = "UPDATE bj_uitslag_hulp_tablet SET serie_B = serie_B - 1
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
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
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' and tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

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
		$sql = "UPDATE bj_uitslag_hulp_tablet SET car_B_gem = '$Car_nieuwB', hs_B = '$Hs_B', alert = '$Alert'
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt_huidig'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if ($Alert == 0) {
			//nieuw record
			$sql = "INSERT INTO bj_uitslag_hulp_tablet
			(org_nummer, comp_nr, uitslag_code, tafel_nr, car_A_tem, car_A_gem, serie_A, hs_A, brt, car_B_tem, car_B_gem, serie_B, hs_B, turn, alert)
			VALUES
			('$Org_nr', '$Comp_nr', '$U_code', '$Tafel_nr', '$Car_A_tem', '$Car_A_gem', '0', '$Hs_A', '$Brt_nieuw', '$Car_B_tem', '$Car_nieuwB', '0', '$Hs_B', '1', '$Alert')";

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
				<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
				<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
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
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			//data uit bestaand record
			$Brt = $resultaat['brt'];
		}

		//verhoog serieB
		$sql = "UPDATE bj_uitslag_hulp_tablet SET serie_B = serie_B +1
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 7) {
	/*herstel
	draai de input-actie terug van A of B (dus niet de series, die kunnen met -1 hersteld worden.
	
	Dit betekent bij gebruik knop herstel:
	* oproepen laatste record.
	* bij turn = 1: Dan is de invoer van A nog niet gebeurd en moeten we terug naar een schone invoer voor B in de vorige beurt !
		-	record delete met brt=brt
		-	update vorig record met brt=brt-1 (if brt > 1) bij B: gem_B = gem_B - serieB, serieB = 0; turn blijft 2
	
	* bij turn = 2:
	Dan is bij A net ingevoerd en bij B nog niet, dus terug in zelfde beurt naar schone invoer A en serie B op 0
		-	bij record brt=brt
		-	update bij A: car_gem - serieA huidige beurt; Bij B serie B op 0, turn naar 1
	Alert kon 1 zijn, maar wordt door aanpassing score A weer 0
	
	Alert = 2: NB partij is dan afgesloten. Als getoonde uitslag niet akkoord is, dan wordt herstel van de records daar geregeld en dus niet via opvang en herstel !
	*/

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "SELECT * FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

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
			$sql = "DELETE FROM bj_uitslag_hulp_tablet
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			$Beurt_vorig = $Brt - 1;
			$Beurt_vorig_vorig = $Brt - 2;

			if ($Beurt_vorig_vorig > 0) {
				$sql = "SELECT hs_B FROM bj_uitslag_hulp_tablet
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Beurt_vorig_vorig'";

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
				$sql = "SELECT * FROM bj_uitslag_hulp_tablet
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Beurt_vorig'";

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
				$sql = "UPDATE bj_uitslag_hulp_tablet SET car_B_gem = '$CarB_nieuw', serie_B = '0', hs_B = '$Hs_B_nieuw', turn = '2', alert = '0'
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Beurt_vorig'";

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
			//eerst hs_A ophalen uit vorige beurt
			$Beurt_vorig = $Brt - 1;
			if ($Beurt_vorig > 0) {
				$sql = "SELECT hs_A FROM bj_uitslag_hulp_tablet
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Beurt_vorig'";

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

			$sql = "SELECT * FROM bj_uitslag_hulp_tablet
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

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
			$sql = "UPDATE bj_uitslag_hulp_tablet SET car_A_gem = '$CarA_nieuw', serie_A = '0', hs_A = '$Hs_A_nieuw', serie_B = '0', turn = '1', alert = '0'
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";

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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 8) {
	//cancel
	//verwijderen records bj_uitslag_hulp_tablet en bj_tafel
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "DELETE FROM bj_uitslag_hulp_tablet 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		$sql = "DELETE FROM bj_tafel 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code' AND tafel_nr = '$Tafel_nr'";
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
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
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
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "UPDATE bj_tafel SET status = '2' WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code' AND tafel_nr = '$Tafel_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//bij voortijdig afsluiten ($Verwijzing == 9) laatste record deleten
		if ($Verwijzing == 9) {
			$sql = "SELECT * FROM bj_uitslag_hulp_tablet
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				//data uit bestaand record
				$Brt = $resultaat['brt'];
			}

			$sql = "DELETE FROM bj_uitslag_hulp_tablet 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr' AND brt = '$Brt'";
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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}
?>