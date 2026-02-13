<?php
//© Hans Eekels, versie 05-06-2025
//Tablet_resultaat opslaan vanuit Tablet_resultaat.php
//opslaan in uitslagen en gespeeld
//gespeeld = 1 in partijen
//status tafel op 0, dus delete
//terug naar toon tafel op tablet

require_once('../../../../../data/connectie_toernooiprof.php');
$Path = '../../../../../data/connectie_toernooiprof.php';
require_once('../../../ToernooiProf/PHP/Functies_toernooi.php');
/*
var_dump($_POST) geeft:
array(12) { 
["u_code"]=> string(4) "4_1 " 
["user_code"]=> string(10) "1024_AHS@#" 
["toernooi_nr"]=> string(1) "1" 
["poule_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "4" 
["car_A_gem"]=> string(2) "15" 
["hs_A"]=> string(1) "4" 
["punten_A"]=> string(2) "12" 
["brt"]=> string(1) "6" 
["car_B_gem"]=> string(2) "11" 
["hs_B"]=> string(1) "3" 
["punten_B"]=> string(1) "7" }
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

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
	if ($Poule_nr > 0) {
		if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	}
}

$Car_A_gem = $_POST['car_A_gem'];
$Hs_A = $_POST['hs_A'];
$Punten_A = $_POST['punten_A'];
$Brt = $_POST['brt'];
$Car_B_gem = $_POST['car_B_gem'];
$Hs_B = $_POST['hs_B'];
$Punten_B = $_POST['punten_B'];

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
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);

try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "Update tp_uitslagen 
	SET sp1_car_gem = '$Car_A_gem', sp2_car_gem = '$Car_B_gem', brt = '$Brt', sp1_hs = '$Hs_A', sp2_hs = '$Hs_B', sp1_punt = '$Punten_A', sp2_punt = '$Punten_B', gespeeld = '1'
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND sp_poule = '$Poule_nr' AND sp_partcode = '$U_code' AND tafel_nr = '$Tafel_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//tp_tafel delete
	$sql = "DELETE FROM tp_tafel 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND uitslag_code = '$U_code' AND poule_nr = '$Poule_nr' AND tafel_nr = '$Tafel_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//tp_uitslag_hulp_tablet delete
	$sql = "DELETE FROM tp_uitslag_hulp_tablet
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' AND tafel_nr = '$Tafel_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//bepaal naam hiddenveld voor tafel: vorm ["tafel_04"]
if ($Tafel_nr < 10) {
	$NmTf = "tafel_" . "0" . $Tafel_nr;
} else {
	$NmTf = "tafel_" . $Tafel_nr;
}

//naar tablet toon tafel
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
	<form method="post" action="Tablet_toon_tafel.php">
		<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
		<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
		<input type="hidden" name="<?php print("$NmTf"); ?>" value="0">
	</form>
</body>

</html>