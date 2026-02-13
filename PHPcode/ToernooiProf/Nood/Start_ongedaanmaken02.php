<?php
//© Hans Eekels, versie 16-12-2025
//Start toernooi of ronde terugdraaien
//Car_sys toegevoegd
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');
/*
var_dump($_POST) geeft:
array(2) { ["user_code"]=> string(10) "1000_KYZ@#" ["t_nummer"]=> string(1) "3" }
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

if (count($_REQUEST) != 2) {
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
$Vorige_ronde = $Huidige_ronde - 1;		//kan 0 zijn
if ($Vorige_ronde == 0) {
	$Gestart = 0;
} else {
	$Gestart = 1;
}
/*
Verder:
1)	delete alle uitslagen en hulp uitslagen in $Huidige_ronde
2)	zet volgnummers op 0 in tp_poules met ronde_nr = $Huidige_ronde
3)	tp_data zet t_ronde op ronde-1 en t_gestart op 0 als vorige_ronde =0
4)	ga terug naar Spelers_Beheer als $Vorige_ronde  == 0 en anders terug naar Toernooi_Beheer
*/

try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//delete uitslagen
	$sql = "DELETE FROM tp_uitslagen WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//delete  hulp uitslagen
	$sql = "DELETE FROM tp_uitslag_hulp WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//delete  hulp uitslagen
	$sql = "DELETE FROM tp_uitslag_hulp_tablet WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
	
	//zet volgnummers in tp_poules op 0
	$sql = "UPDATE tp_poules SET sp_volgnr = '0' WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND ronde_nr = '$Huidige_ronde'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	//zet in tp_data t_ronde = $Vorige_ronde en t_gestart = $Gestart
	$sql = "UPDATE tp_data SET t_gestart = '$Gestart', t_ronde = '$Vorige_ronde' WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

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
if ($Huidige_ronde == 1) {
	$error_message = "Start toernooi ongedaan gemaakt<br>U keert terug naar de pagina Beheer spelers";
} else {
	$error_message = "Start nieuwe ronde ongedaan gemaakt<br>U keert terug naar de pagina Beheer toernooi";
}

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Melding</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			width: 500px;
		}

		.button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<table width="500" border="0">
		<tr>
			<td width="150" height="77" align="center" valign="middle" bgcolor="#006600"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /</td>
			<td width="340" align="center" valign="middle" bgcolor="#006600">
				<h1>Melding</h1>
			</td>
		</tr>
		<tr>
			<td height="100" colspan="2" bgcolor="#006600" class="grootwit">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px;">
					<?php print("$error_message"); ?>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
				<?php
				if ($Huidige_ronde == 1) {
				?>
					<form name="akkoord" method="post" action="../Spelers_Beheer.php">
						<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
							title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					</form>
				<?php
				} else {
				?>
					<form name="akkoord" method="post" action="../Toernooi_Beheer.php">
						<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
							title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					</form>
				<?php
				}
				?>
			</td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>