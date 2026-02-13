<?php
//© Hans Eekels, versie 22-06-2025
//bepaal keuze stand of poule-indeling en stuur dan door
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');
/*
var_dump($_POST) geeft:
array(5) { ["poule_nr"]=> string(1) "1" ["overzicht"]=> string(1) "1" ["user_code"]=> string(10) "1001_CHR@#" ["t_nummer"]=> string(1) "1" ["ronde_nr"]=> string(1) "1" }
array(5) { ["poule_nr"]=> string(1) "2" ["overzicht"]=> string(1) "2" ["user_code"]=> string(10) "1001_CHR@#" ["t_nummer"]=> string(1) "1" ["ronde_nr"]=> string(1) "2" }

overzicht 1 = stand, 2=poule-indeling
*/
//check
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

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = $_POST['poule_nr'];
	if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
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

if (!isset($_POST['overzicht'])) {
	$bAkkoord = FALSE;
} else {
	$Overzicht = $_POST['overzicht'];	//1=stand, 2=ov poule
	if (filter_var($Overzicht, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (count($_REQUEST) != 5) {
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

//pagina kiezen obv $Overzicht
if ($Overzicht == 1)	//naar stand
{
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
		<form method="post" action="Stand.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="t_nummer" value="<?php echo $Toernooi_nr; ?>">
			<input type="hidden" name="ronde_nr" value="<?php echo $Ronde_nr; ?>">
			<input type="hidden" name="poule_nr" value="<?php echo $Poule_nr; ?>">
		</form>
	</body>

	</html>
<?php
} else	//naar poule-indeling
{
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
		<form method="post" action="Ov_poule.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="t_nummer" value="<?php echo $Toernooi_nr; ?>">
			<input type="hidden" name="ronde_nr" value="<?php echo $Ronde_nr; ?>">
			<input type="hidden" name="poule_nr" value="<?php echo $Poule_nr; ?>">
		</form>
	</body>

	</html>
<?php
}
?>