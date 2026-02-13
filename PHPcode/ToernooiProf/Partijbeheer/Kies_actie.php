<?php
//© Hans Eekels, versie 16-12-2025
//Vang planning op
//Car_sys
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");
$Tafels = array();

/*
var_dump($_POST) geeft altijd:
	["user_code"]=> string(10) "1000_KYZ@#"
	["t_nummer"]=> string(1) "1" 
	["poule_nr"]=> string(1) "1" 

Daarnaast ook altijd de status van alle tafelnummers bij de partijen,
	dus bij 6 partijen wordt er 6 x een tafelnummer doorgegeven,
	["Tafel_1_1"]=> string(1) "0" 
	["Tafel_1_2"]=> string(1) "0" 
	["Tafel_2_1"]=> string(1) "0" 
	["Tafel_2_2"]=> string(1) "0" 
	["Tafel_3_1"]=> string(1) "0" 
	["Tafel_3_2"]=> string(1) "5"
De getallen achter Tafel ($key_var) is partij-ronde en koppel; dat is ook de uitslagcode in de partijen
De $value_var is het tafel-nummer, waarbij 0=alle tafels

Tussen de tafels door kunnen er 4 verschillende acties zijn doorgegeven:

1)	Koppel partij aan tafelnr:
	["Knop_3_2"]=> string(9) "Koppel" }		//ook hier de partij-code in de $key_var en de actie in de $value_var, namelijk Koppel

2)	Ontkoppel partij van tafelnr:
	["Knop_3_2"]=> string(9) "Ontkoppel" }		//ook hier de partij-code in de $key_var en de actie in de $value_var, namelijk Ontkoppel
	of
	["Knop_2_2"]=> string(4) "Nood" 
	
3)	Uitslag invoeren:
	["Invoer"]=> string(5) "i_3_2" 		//i=invoeren en dan partijcode: partijronde_koppelnr. NB: opdracht komt een keer voor en staat tussen de tafelnummers

4)	Uitslag wijzigen:
	["Wijzig"]=> string(5) "w_1_2" 		//w=wijzigen en dan partijcode: partijronde_koppelnr. NB: opdracht komt een keer voor en staat tussen de tafelnummers

NB: Naast de $key_var's "Tafel" die alle tafels doorgeven,
komt er maar één actie door, dus of $key_var met "Koppel", of met "Ontkoppel", of met "Invoer" of met "Wijzig"
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

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = $_POST['poule_nr'];
	if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
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
$teller = 0;

foreach ($_POST as $key_var => $value_var) {
	if ($key_var == "Invoer") {
		//string(5) "i_3_2" 
		$Hulp = $value_var;
		$Code_hulp = explode("_", $Hulp);
		$Keuze = 1;						//invoer uitslag
		$Ronde = $Code_hulp[1];			//3
		$Koppel = $Code_hulp[2];		//2
		$Uitslag_code = $Ronde . "_" . $Koppel;		//3_2
	}

	if ($key_var == "Wijzig") {
		//string(5) "w_9_4" 
		$Hulp = $value_var;
		$Code_hulp = explode("_", $Hulp);
		$Keuze = 2;						//wijzig uitslag
		$Ronde = $Code_hulp[1];			//9
		$Koppel = $Code_hulp[2];		//4
		$Uitslag_code = $Ronde . "_" . $Koppel;		//9_4
	}

	if (substr($key_var, 0, 5) == "Tafel") {
		//["Tafel_1_1"] = 5
		$Hulp = $key_var;
		$Code_hulp = explode("_", $Hulp);
		$Ronde = $Code_hulp[1];			//9
		$Koppel = $Code_hulp[2];		//4
		$Hulp_code = $Ronde . "_" . $Koppel;		//9_4
		$teller++;
		$Tafels[$teller]['uitslag_code'] = $Hulp_code;
		$Tafels[$teller]['tafel_nr'] = $value_var;
	}

	if (substr($key_var, 0, 4) == "Knop") {
		//["Knop_3_2"]
		$Hulp = $key_var;
		$Code_hulp = explode("_", $Hulp);
		$Ronde = $Code_hulp[1];			//9
		$Koppel = $Code_hulp[2];		//4
		$Uitslag_code = $Ronde . "_" . $Koppel;		//9_4
		if ($value_var == "Koppel") {
			$Keuze = 3;
		} else	//ontkoppel of nood
		{
			$Keuze = 4;
		}
	}
}	//end foreach

$Aantal_tafels = $teller;		//NB: dit zijn alle partijen waarachter een tafelnummer staat (0 of 1-8)

if ($Keuze == 1) {
	//naar uitslag invoeren; is altijd in $Huidige_ronde
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
		<form method="post" action="Uitslag_invoeren01.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="t_nummer" value="<?php echo $Toernooi_nr; ?>">
			<input type="hidden" name="uitslag_code" value="<?php echo $Uitslag_code; ?>">
			<input type="hidden" name="poule_nr" value="<?php echo $Poule_nr; ?>">
		</form>
	</body>

	</html>
<?php
}

if ($Keuze == 2) {
	//naar uitslag wijzigen, altijd in $Huidige ronde
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
		<form method="post" action="Uitslag_wijzigen01.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="t_nummer" value="<?php echo $Toernooi_nr; ?>">
			<input type="hidden" name="uitslag_code" value="<?php echo $Uitslag_code; ?>">
			<input type="hidden" name="poule_nr" value="<?php echo $Poule_nr; ?>">
		</form>
	</body>

	</html>
<?php
}

if ($Keuze == 3 || $Keuze == 4) {
	//kbij $Keuze == 3 koppelen en bij $Keuze == 4 ontkoppelen
	//Ook tafel nummer meenemen met zelfde uitslag_code
	for ($a = 1; $a < $Aantal_tafels + 1; $a++) {
		if ($Tafels[$a]['uitslag_code'] == $Uitslag_code) {
			$Tafel_keuze = $Tafels[$a]['tafel_nr'];
			break;
		}
	}

	//naar Koppelen.php
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
		<form method="post" action="Koppelen.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="t_nummer" value="<?php echo $Toernooi_nr; ?>">
			<input type="hidden" name="poule_nr" value="<?php echo $Poule_nr; ?>">
			<input type="hidden" name="uitslag_code" value="<?php echo $Uitslag_code; ?>">
			<input type="hidden" name="tafel_nr" value="<?php echo $Tafel_keuze; ?>">
			<input type="hidden" name="keuze" value="<?php echo $Keuze; ?>">
		</form>
	</body>

	</html>
<?php
}
?>