<?php
//© Hans Eekels, versie 02-12-2025
//Kies lid om te verwijderen
//Alleen leden tonen die aan geen enkele competitie zijn gekoppeld
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

$Leden = array();			//alle leden
$Leden_tonen = array();	//alleen leden die niet zijn gekoppeld

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

//Leden opvragen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//spelers
	$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' ORDER BY spa_anaam";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Aantal_leden = 0;
	} else {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Leden[$teller]['nummer'] = $resultaat['spa_nummer'];
			$Vn = $resultaat['spa_vnaam'];
			$Tv = $resultaat['spa_tv'];
			$An = $resultaat['spa_anaam'];

			if (strlen($Tv) == 0) {
				$Leden[$teller]['naam'] = $Vn . " " . $An;
			} else {
				$Leden[$teller]['naam'] = $Vn . " " . $Tv . " " . $An;
			}
		}
		$Aantal_leden = $teller;
	}

	if ($Aantal_leden > 0) {
		//zoek in bj_spelers_comp
		$teller = 0;
		for ($a = 1; $a < $Aantal_leden + 1; $a++) {
			$Nr = $Leden[$a]['nummer'];
			$sql = "SELECT spc_nummer FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_nummer = '$Nr'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
				throw new Exception(mysqli_error($dbh));
			}

			//nu alleen naar $Spelers_tonen als rows = 0
			if (mysqli_num_rows($res) == 0) {
				$teller++;
				$Leden_tonen[$teller]['nummer'] = $Leden[$a]['nummer'];
				$Leden_tonen[$teller]['naam'] = $Leden[$a]['naam'];
			}
		}

		$Aantal_leden_tonen = $teller;
	} else {
		$Aantal_leden_tonen = 0;
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
	<title>Lid verwijderen</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 600px;
		}

		.button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<form name="speler" method="post" action="Lid_verwijderen02.php">
		<table width="600" border="0">
			<tr>
				<td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
				<td width="420" align="center" valign="middle" bgcolor="#009900" class="kop">
					ClubMatch Online<br>
					<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
				</td>
			</tr>
			<tr>
				<td colspan="2" align="center" bgcolor="#009900" class="grootwit">
					<div style="margin:10px;">
						<h1>Lid verwijderen</h1>
						Let op: U kunt een lid alleen verwijderen als dit lid aan geen enkele competitie is gekoppeld !<br>
						(In onderstaande lijst staan dan ook alleen maar leden die aan geen enkele competitie als speler zijn gekoppeld)
						<br><br>
						Kies gewenst lid in onderstaande lijst om te verwijderen:
					</div>
				</td>
			</tr>
			<tr>
				<td colspan="2" height="60" align="center" bgcolor="#009900" class="grootwit">
					<?php
					if ($Aantal_leden_tonen == 0) {
						print("Geen leden om te verwijderen");
					} else {
					?>
						<select name="leden" style="font-size:16px;">
							<?php
							for ($a = 1; $a < $Aantal_leden_tonen + 1; $a++) {
								$Num = $Leden_tonen[$a]['nummer'];
								$Naam = $Leden_tonen[$a]['naam'];
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
				<td height="40" colspan="2" align="center" bgcolor="#009900">
					<input type="submit" class="submit-button" value="Kies" style="width:150px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
						title="Gegevens opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="../ClubMatch_start.php">
		<table width="600">
			<tr>
				<td width="200" height="30" align="center" bgcolor="#009900">
					<input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
						title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="10">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
				<td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>