<?php
//© Hans Eekels, versie 05-06-2025
//Scorebord modus wachten

require_once('../../../../../data/connectie_toernooiprof.php');
$Path = '../../../../../data/connectie_toernooiprof.php';
require_once('../../../ToernooiProf/PHP/Functies_toernooi.php');

/*
var_dump($_POST) geeft altijd:
array(3) { 
["user_code"]=> string(10) "1002_CRJ@#" 
["toernooi_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "1"
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
			//logonaam
			$Logo_naam = "../../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
			}
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
}

//check
if ($bAkkoord == FALSE) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ToernooiProf</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="Toernooi" />
		<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
		<link href="../../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
				<td width="150" height="77" align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
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
					<form name="cancel" method="post" action="../../../Start.php">
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

$Status = 0;

//check status, levert u_code op
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_tafel
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND tafel_nr = '$Tafel_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0) {
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$U_code = $resultaat['uitslag_code'];
			$Poule_nr = $resultaat['poule_nr'];
			$Status = intval($resultaat['status']);
		}
	} else {
		$Status = 0;
	}
	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

if ($Status == 1) {
	//naar Modus_partij.php
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
		<form method="post" action="Modus_partij.php">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?>">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

if ($Status == 2) {
	//naar Modus_resultaat.php
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
		<form method="post" action="Modus_resultaat.php">
			<input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
			<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

//geen record in bj_tafel, dus status=0 en dus wachten
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Scorebord</title>
	<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
	<style type="text/css">
		body,
		td,
		th {
			font-family: Arial;
			font-size: 12px;
			color: #FFF;
		}

		body {
			width: 1860px;
			background-color: #030;
			margin-top: 10px;
			margin-right: auto;
			margin-bottom: 0px;
			margin-left: auto;
		}

		.Groot {
			font-size: 250px;
			font-weight: bold;
		}

		h1 {
			font-size: 76px;
		}

		h2 {
			font-size: 36px;
		}

		h3 {
			font-size: 24px;
		}

		h4 {
			font-size: 14px;
		}

		h5 {
			font-size: 12px;
		}

		h6 {
			font-size: 10px;
		}

		.submit-button {
			border: 1px solid transparent;
			cursor: pointer;
			width: 200px;
			height: 80px;
			background-color: #333;
			color: #FFF;
			font-size: 36px;
			font-weight: bold;
		}

		.submit-button:hover {
			border-color: #FFF;
		}
	</style>
	<script type="text/javascript">
		function mouseInBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "#FFF";
		}

		function mouseOutBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "transparent";
		}

		function myFunction() {
			location.reload(true);
		}

		setInterval(function() {
			location.reload(true);
		}, 5000); // 300.000 milliseconden = 5 minuten
	</script>
</head>

<body onContextMenu="return false">
	<form name="wachten" method="post" action="Modus_wachten.php">
		<table width="1860" border="0">
			<tr>
				<td height="80" align="center">
					<h1><?php print("$Toernooi_naam"); ?></h1>
				</td>
			</tr>
			<tr>
				<td height="250" align="center">
					<div style="margin:20px; font-size:100px; color:#FFF;">
						Wachten op partij
					</div>
				</td>
			</tr>
			<tr>
				<td height="380" align="center">
					<img src="../../Hulp/slaap.jpg" width="370" height="300" alt="wachten">
				</td>
			</tr>
		</table>
	</form>
	<?php
	if ($Status == 0) {
	?>
		<form name="cancel" method="post" action="../Kies_tafel.php">
			<table width="1860" border="0">
				<tr>
					<td height="90" align="center">
						<input type="submit" class="submit-button" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
					</td>
				</tr>
			</table>
		</form>
	<?php
	}
	?>
</body>

</html>