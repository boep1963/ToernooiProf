<?php
//© Hans Eekels, versie 30-08-2025
//Vang score op uit Scorebord_start.php, verwerk data en geeft, na opslag, nieuwe data terug aan zelfde pagina Scorebord_start.php
//aangepast: partij blijft bestaan bij Cancel
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../../ClubMatch/PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Verwijzing = array();	//1=naar Scorebord_start.php, 2=herstel naar Scorebord_start.php, 3=Cancel naar Toon_tafel, 4=gereed naar Scorebord_gereed.php

/*
var_dump($_POST);
array(17) { 
["Car_A"]=> string(1) "0" 			//carAgemaakt excl serie nu
["Car_B"]=> string(1) "0" 			//carBgemaakt excl serie nu
["ennog5A"]=> string(2) "59" 		//rest, wordt niet gebruikt, maar berekend
["ennog5B"]=> string(2) "30" 
["beurten"]=> string(1) "0" 
["scoreA"]=> string(1) "1" 			//huidige serie A
["hs_A"]=> string(1) "0" 			//wordt niet gebruikt, maar opgehaald in db
["hs_B"]=> string(1) "0" 			//idem
["scoreB"]=> string(1) "0" 			//huidige serie B

["user_code"]=> string(10) "1001_CHR@#"		//gebruiker
["comp_nr"]=> string(1) "1" 				//competitie-nummer
["u_code"]=> string(3) "2_001_002" 			//uitslagcode  periode_sp1_sp2
["periode"]=> string(1) "2" 				//periode

["car_A_tem"]=> string(2) "60" 
["car_B_tem"]=> string(2) "30" 

["turn"]=> string(1) "1" 			//1 bij focus was bij invoerA en 2 bij focus was bij invoerB

//een van deze 6 mogelijkheden !
["invoerA"]=> string(6) "INVOER" }		//gegevens van speler A; NB bij invoerA is de doorgegeven turn altijd 1
["invoerB"]=> string(6) "INVOER" }		//gegevens van speler B; NB bij invoerB is de doorgegeven turn altijd 2
["cancel"]=> string(6) "Cancel" }		//tussentijds afbreken, partij blijft aangemaakt en terug naar kies tafel
["gereed"] => "KLAAR"
["herstel"]=> string(7) "HERSTEL" }
["switch"]=>  string(14) "Wissel spelers" }
*/

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
			$Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_" . $Org_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_standaard.jpg";
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
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../ClubMatch/PHP/script_competitie.js" defer></script>
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
$Car_A_tem = intval($_POST['car_A_tem']);
$Car_B_tem = intval($_POST['car_B_tem']);
$Car_A = intval($_POST['Car_A']);			//car A gemaakt excl laatste serie
$Car_B = intval($_POST['Car_B']);			//car B gemaakt excl laatste serie
$scoreA = intval($_POST['scoreA']);	//gemaakte serie speler A (kan 0 zijn)
$scoreB = intval($_POST['scoreB']);	//gemaakte serie speler B (kan 0 zijn)
$Car_A_gem = $Car_A + $scoreA;
$Car_B_gem = $Car_B + $scoreB;

$Beurten = intval($_POST['beurten']);

$Max_beurten = fun_maxbeurten($Org_nr, $Comp_nr, $Path);	//kan 0 zijn

$Alert = 0;

if (isset($_POST['invoerA'])) {
	$Turn = 1;		//beurt was van speler A; na verwerking doorgeven $Turn = 2;
	$Verwijzing = 1;
}
if (isset($_POST['invoerB'])) {
	$Turn = 2;		//beurt was van speler B; na verwerking doorgeven $Turn = 1;
	$Verwijzing = 1;
}
if (isset($_POST['herstel'])) {
	$Verwijzing = 2;
	$Turn = $_POST['turn'];		//kan zowel vanuit focus A als focus B
}
if (isset($_POST['cancel'])) {
	$Verwijzing = 3;		//afbreken, naar kies tafel
}
if (isset($_POST['gereed'])) {
	$Verwijzing = 4;		//gereed melden (na verloop tijd bv, partij hoeft niet uit te zijn
	$Alert = 2;
}

if (isset($_POST['switch'])) {
	//spelers wisselen in partijen, dan terug naar Scorebord_start met $U_code
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
			<input type="hidden" name="u_code" value="<?php print("$Code_nieuw"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
		</form>
	</body>

	</html>
	<?php
	exit;
}	//end if switch

if ($Verwijzing == 1) {
	/*
	Als $Turn == 1 dan:
		Nieuw record aanmaken met brt = $Beurten + 1,
		Data verwerken, nieuwe data terug
	Als $Turn == 2 dan:
		Data oproepen huidige $Beurten
		Data verwerken, nieuwe data terug
	*/

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//laatste record ophalen (als die bestaat) en dan gegevens ophalen
		$sql = "SELECT * FROM bj_uitslag_hulp 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) == 0) {
			//geen record, dus dit is de eerste beurt met $Turn = 1.
			//aanmaken record
			if ($Car_A_tem == $scoreA) {
				//A in een beurt uit
				$Alert = 1;
			}
			//rest
			$Brt = 1;
			$Car_A_gem = $scoreA;
			$Car_B_gem = 0;

			//data uitslag_code, car_A_tem=$Car_A_tem, car_A_gem =$Car_A_gem, hs_A=$scoreA, brt=1, car_B_tem=$Car_B_tem, car_B_gem=0, hs_B=0, turn=1, alert=$Alert
			$sql = "INSERT INTO bj_uitslag_hulp (org_nummer, comp_nr, uitslag_code, car_A_tem, car_A_gem, hs_A, brt, car_B_tem, car_B_gem, hs_B, turn, alert) 
				VALUES ('$Org_nr', '$Comp_nr', '$U_code', '$Car_A_tem', '$Car_A_gem', '$scoreA', '$Brt', '$Car_B_tem', '$Car_B_gem', '0', '1', '$Alert')";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}
		} else {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				//data uit bestaand record
				$Hs_A = $resultaat['hs_A'];
				$Hs_B = $resultaat['hs_B'];
				$Alert = $resultaat['alert'];
				//$Car_A_gem = $resultaat['car_A_gem'];
				//$Car_B_gem = $resultaat['car_B_gem'];
			}

			if ($Turn == 1) {
				//nieuw record INSERT
				$Brt = $Beurten + 1;
				if ($Max_beurten > 0 && $Max_beurten == $Beurten) {
					$Alert = 1;
				}

				//$Car_A_gem = $Car_A_gem + $scoreA;
				if ($scoreA > $Hs_A) {
					$Hs_A = $scoreA;
				}
				if ($Car_A_gem == $Car_A_tem) {
					$Alert = 1;
				}

				$sql = "INSERT INTO bj_uitslag_hulp (org_nummer, comp_nr, uitslag_code, car_A_tem, car_A_gem, hs_A, brt, car_B_tem, car_B_gem, hs_B, turn, alert) 
					VALUES ('$Org_nr', '$Comp_nr', '$U_code', '$Car_A_tem', '$Car_A_gem', '$Hs_A', '$Brt', '$Car_B_tem', '$Car_B_gem', '$Hs_B', '1', '$Alert')";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}
			}

			if ($Turn == 2) {
				//bestaand record UPDATE met alleen gegevens met $Beurten als beurten (niet verhogen dus 
				//$Car_B_gem = $Car_B_gem + $scoreB;
				if ($scoreB > $Hs_B) {
					$Hs_B = $scoreB;
				}

				if ($Alert == 1)		//A is klaar, of car_tem gehaald of beurtenlimiet
				{
					$Alert = 2;
				}

				if ($Car_B_gem == $Car_B_tem) {
					$Alert = 2;		//B uit
				}

				if ($Max_beurten > 0 && $Max_beurten == $Beurten) {
					$Alert = 2;		//Voor de zekerheid; is al getetst bij turn=1 en dan alert = 1 en hierboven als alert = 1, dan alert = 2
				}

				$Brt = $Beurten;
				$sql = "UPDATE bj_uitslag_hulp SET car_B_gem = '$Car_B_gem', hs_B = '$Hs_B', turn = '2', alert = '$Alert' 
					WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}
			}
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

	//terug naar pagina als $Alert < 2, anders hierna opvangen bij if alert = 2 en resultaat tonen
	if ($Alert < 2) {
		if ($Turn == 1) {
			$Turn = 2;
		} else {
			$Turn = 1;
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
				<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?> ">
				<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			</form>
		</body>

		</html>
	<?php
		exit;
	}
}	//end if $Verwijzing == 1

if ($Verwijzing == 2)	//herstel
{
	/*
	Herstel (NB: als beurt = 0 dan is Herstel niet mogelijk, knop disabled)
	Na gebruik van de herstelknop, wordt bij terugkeer de situatie getoond direct voorafgaande aan het gebruik van de knop.
	Dat betekent:
	* 	Als er hersteld wordt in turn 1, dus A focus, dan is zojuist de score opgeslagen van speler B.
		Die score vervalt en er wordt ingevuld met car-gem_B en hsB van een beurt eerder en de turn wordt op 1 gezet in de database
		Doorgegeven wordt u_code, carA gemaakt en carB gemaakt, beurten, alert en turn = 2.
		NB: als beurten == 1 dan geen vorig record, dus carBgem en hsB naar 0; dan wordt alleen de turn op 1 gezet in de database en turn=2 doorgegeven
		
		Als er hersteld wordt in turn 2, dus B focus, dan is er zojuiste een nieuw record aangemaakt met scores A, waarbij voor B de scores uit de vorige beurt zijn ingevuld 
		en turn in de database op 1 staat
		Dat record wordt gedeleted. CarAgem vorige beurt wordt doorgegeven en serie huidige beurt komt automatisch weer op 0
		Doorgeven turn = 1 en carAgem en carBgem uit vorige beurt.
		NB: als beurt was 1, dan wordt eerste record verwijderd en alle cargem op 0.
	*/

	//bepaal acties
	if ($Turn == 2)		//is situatie op scherm
	{
		//focus was bij B, data A net aangemaakt in nieuw record, dat record deleten, is laatste beurt
		//verschil tussen beurt 1 of later
		try {
			$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
			if (!$dbh) {
				throw new Exception(mysqli_connect_error());
			}
			mysqli_set_charset($dbh, "utf8");

			if ($Beurten > 1) {
				//vorige beurt ophalen
				$Beurten_hulp = $Beurten - 1;
				$sql = "SELECT * FROM bj_uitslag_hulp 
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten_hulp'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}

				while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
					//data uit bestaand record
					$Alert = $resultaat['alert'];
					$Car_A_gem = $resultaat['car_A_gem'];
					$Car_B_gem = $resultaat['car_B_gem'];
				}
			} else {
				$Alert = 0;
				$Car_A_gem = 0;
				$Car_B_gem = 0;
			}

			//delete record
			$sql = "DELETE FROM bj_uitslag_hulp 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			//doorgeven
			$Turn = 1;
			$Beurten = $Beurten - 1;

			//close connection
			mysqli_close($dbh);
		} catch (Exception $e) {
			echo $e->getMessage();
		}
	} else {
		/*
		$Turn = 1
		Als er hersteld wordt in turn 1, dus A focus, dan is daarvoor de score aangepast bij speler B.
		Die score vervalt en er wordt ingevuld met car-gem_B en hsB van een beurt eerder en de turn wordt op 1 gezet in de database
		Doorgegeven wordt u_code, carA gemeekt en carB gemaakt, beurten, alert en turn = 2.
		NB: als beurten == 1 dan geen record 0 dus alleen carBgem en hsB op 0; dturn op 1 gezet in de database en turn=2 doorgegeven
		*/

		try {
			$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
			if (!$dbh) {
				throw new Exception(mysqli_connect_error());
			}
			mysqli_set_charset($dbh, "utf8");

			$sql = "SELECT brt FROM bj_uitslag_hulp 
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";
			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Beurten = $resultaat['brt'];
			}

			if ($Beurten > 1) {
				//vorige beurt ophalen
				$Beurten_hulp = $Beurten - 1;
				$sql = "SELECT * FROM bj_uitslag_hulp 
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten_hulp'";

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

				$sql = "UPDATE bj_uitslag_hulp SET car_B_gem = '$Car_B_gem', hs_B = '$Hs_B', turn = '$Turn' 
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}
			} else {
				$Car_B_gem = 0;
				$Hs_B = 0;
				$Turn = 1;

				$sql = "UPDATE bj_uitslag_hulp SET car_B_gem = '$Car_B_gem', hs_B = '$Hs_B', turn = '$Turn' 
				WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' AND brt = '$Beurten'";

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
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Verwijzing == 3) {
	//Cancel, afbreken en terug naar Kies tafel
	//Verwijder records
	//bestaat bj_uitslag_hulp, dan al die records verwijderen, terug naar kies tafel
	//bestaat bj_uitslah_hulp niet, dan alleen terug naar kies tafel

	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		$sql = "DELETE FROM bj_uitslag_hulp	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code'";
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
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

//tenslotte
if ($Alert == 2)		//tonen uitslag en daarna afsluiten
{
	//hier gekomen door:
	//	alert=2 in verwerken uitslag
	//	knop KLAAR bij afbreken partij door tijdslimiet
	//naar einduitslag tonen
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
		<form method="post" action="Scorebord_eind.php">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
			<input type="hidden" name="periode" value="<?php print("$Periode"); ?>">
		</form>
	</body>

	</html>
<?php
}
