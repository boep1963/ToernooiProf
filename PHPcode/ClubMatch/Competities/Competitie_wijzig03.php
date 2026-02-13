<?php
//© Hans Eekels, versie 03-12-2025
//Gewijzigde Competitie opslaan
//Bij wijzigen punten-sys ALLE uitslagen aanpassen !
//alle invoer escapen
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Uitslagen = array();

/*
var_dump($_POST) geeft:
array(5) { 
["Naam"]=> string(23) "Senioren Dinsdag-middag" 
["Datum"]=> string(12) "Seizoen 2025" 
["Sorteren"] => 1 of 2
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" }
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

if (!isset($_POST['Naam'])) {
	$bAkkoord = FALSE;
} else {
	$Naam_hulp_1 = $_POST['Naam'];
	$Naam =	fun_test_input($Naam_hulp_1);
}

if (!isset($_POST['Datum'])) {
	$bAkkoord = FALSE;
} else {
	$Naam_hulp_2 = $_POST['Datum'];
	$Datum = fun_test_input($Naam_hulp_2);
}

//Sorteren naam
if (!isset($_POST['Sorteren'])) {
	$bAkkoord = FALSE;
} else {
	$Sorteren = intval($_POST['Sorteren']);
}

if (isset($_POST['comp_nr'])) {
	$Comp_nr = $_POST['comp_nr'];
	if ($Comp_nr > 0) {
		if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
			$bAkkoord = FALSE;
		}
	} else {
		$bAkkoord = FALSE;
	}
} else {
	$bAkkoord = FALSE;
}

if (count($_POST) != 5) {
	$bAkkoord = FALSE;
}

//check
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

	//Updaten competitie
	$sql = "UPDATE bj_competities SET comp_naam = '$Naam', comp_datum = '$Datum', sorteren = '$Sorteren'
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

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
				<h1>Gewijzigde competitie opgeslagen</h1>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
					Wijzigingen van de competitie zijn opgeslagen.<br><br>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="partijen" method="post" action="../ClubMatch_start.php">
					<input type="submit" class="submit-button" value="Naar Startscherm" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
						title="Naar Startscherm" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>