<?php
//© Hans Eekels, versie 03-12-2025
//Kies Bestaande competitie om te wijzigen
//Kop gewijzigd
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

$Competities = array();

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

if (count($_POST) != 1) {
	$bAkkoord = FALSE;
}

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

//competities opvragen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//spelers
	$sql = "SELECT * FROM bj_competities WHERE org_nummer = '$Org_nr' ORDER BY comp_nr DESC";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Aantal_competities = 0;
	} else {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Competities[$teller]['nummer'] = $resultaat['comp_nr'];
			$Competities[$teller]['naam'] = $resultaat['comp_naam'];
			$Competities[$teller]['datum'] = $resultaat['comp_datum'];
			$Dis = $resultaat['discipline'];
			$Competities[$teller]['discipline'] = fun_naamdiscipline($Dis);
		}
		$Aantal_competities = $teller;
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
	<title>Kies competitie</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 700px;
		}

		.button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<form name="competitie" method="post" action="Competitie_wijzig02.php">
		<table width="800" border="0">
			<tr>
				<td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
				<td colspan="2" align="center" valign="middle" bgcolor="#009900" class="kop">
					ClubMatch Online<br>
					<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
				</td>
			</tr>
			<tr>
				<td colspan="3" align="center" valign="middle" bgcolor="#009900">
					<h2>Kies competitie om te wijzigen</h2>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" bgcolor="#009900" class="grootwit">
					Kies een competitie in onderstaande lijst om te wijzigen:</td>
			</tr>
			<tr>
				<td colspan="2" height="50" align="center" bgcolor="#009900" class="grootwit">
					<?php
					if ($Aantal_competities == 0) {
						print("Geen competitie om te openen !");
					} else {
					?>
						<select name="comp_nr" style="font-size:18px;">
							<?php
							for ($a = 1; $a < $Aantal_competities + 1; $a++) {
								$Num = $Competities[$a]['nummer'];
								$Nm = $Competities[$a]['naam'];
								$Dt = $Competities[$a]['datum'];
								$Dp = $Competities[$a]['discipline'];
								$Naam = $Nm . " (" . $Dt . ") [" . $Dp . "]";

							?>
								<option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
							<?php
							}
							?>
						</select>
					<?php
					}
					?>
				</td>
			</tr>
			<tr>
				<td colspan="2" height="45" align="center" valign="middle" bgcolor="#009900">
					<input type="submit" class="submit-button" value="Kies" style="width:170px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Gegevens opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="../ClubMatch_start.php">
		<table width="800">
			<tr>
				<td width="170" height="40" align="center" bgcolor="#009900">
					<input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
						title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="9">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
				<td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>