<?php
//© Hans Eekels, versie 02-12-2025
//Speler koppelen
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

$Spelers_all = array();			//alle spelers
$Spelers_gekoppeld = array();	//al gekoppelde spelers
$Spelers_vrij = array();		//alleen spelers die te koppelen zijn, dus excl. spelers die al gekoppeld zijn aan deze competitie

/*
var_dump($_POST) geeft:
array(2) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }
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

if (!isset($_POST['comp_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Comp_nr = $_POST['comp_nr'];
	$Comp_naam = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
	if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (count($_POST) != 2) {
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

//verder
//initialiseren
$Aantal_spelers_all = 0;			//alle spelers uit bj_spelers_algemeen
$Aantal_spelers_gekoppeld = 0; 		//alle reeds gekoppelde spelers uit bj_spelers_comp met spc_competitie is $Comp_nr
$Aantal_spelers_vrij = 0;			//spelers die te koppelen zijn

//spelers opvragen met moy in discipline
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//discipline
	$sql = "SELECT discipline FROM bj_competities WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Discipline = $resultaat['discipline'];
	}

	switch ($Discipline) {
		case 1:
			//spelers
			$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' AND spa_moy_lib > 0 ORDER BY spa_anaam";
			break;
		case 2:
			//spelers
			$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' AND spa_moy_band > 0 ORDER BY spa_anaam";
			break;
		case 3:
			//spelers
			$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' AND spa_moy_3bkl > 0 ORDER BY spa_anaam";
			break;
		case 4:
			//spelers
			$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' AND spa_moy_3bgr > 0 ORDER BY spa_anaam";
			break;
		case 5:
			//spelers
			$sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' AND spa_moy_kad > 0 ORDER BY spa_anaam";
			break;
	}

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Aantal_spelers_all = 0;
	} else {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Spelers_all[$teller]['spa_nummer'] = $resultaat['spa_nummer'];
			$Vn = $resultaat['spa_vnaam'];
			$Tv = $resultaat['spa_tv'];
			$An = $resultaat['spa_anaam'];
			if (strlen($Tv) == 0) {
				$Spelers_all[$teller]['spa_naam'] = $Vn . " " . $An;
			} else {
				$Spelers_all[$teller]['spa_naam'] = $Vn . " " . $Tv . " " . $An;
			}
		}

		//free result set
		mysqli_free_result($res);

		$Aantal_spelers_all = $teller;
	}

	//nu alleen spelers die nog niet gekoppeld zijn
	if ($Aantal_spelers_all == 0) {
		//geen spelers, dan ook niets te koppelen
		$Aantal_spelers_vrij = 0;
	} else {
		//haal reeds gekoppelde spelers op
		$sql = "SELECT * FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) == 0) {
			$Aantal_spelers_gekoppeld = 0;
		} else {
			//reeds gekoppelde spelers naar $Spelers_gekoppeld (alleen nr nodig)
			$teller = 0;
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$teller++;
				$Spelers_gekoppeld[$teller]['spc_nummer'] = $resultaat['spc_nummer'];
			}

			//free result set
			mysqli_free_result($res);

			$Aantal_spelers_gekoppeld = $teller;
		}

		//nu spelers_all verminderen met spelers_gekoppeld en die naar spelers_vrij
		if ($Aantal_spelers_gekoppeld == 0) {
			//alle spelers_all naar spelers_vrij
			$Spelers_vrij = $Spelers_all;
			$Aantal_spelers_vrij = $Aantal_spelers_all;
		} else {
			//spelers_gekoppeld uit spelers_all en dan naar	spelers_vrij
			$teller_kan = 0;

			for ($a = 1; $a < $Aantal_spelers_all + 1; $a++) {
				$Sp_nr = $Spelers_all[$a]['spa_nummer'];

				$bKan = TRUE;
				for ($b = 1; $b < $Aantal_spelers_gekoppeld + 1; $b++) {
					if ($Spelers_gekoppeld[$b]['spc_nummer'] == $Sp_nr) {
						$bKan = FALSE;
						break;
					}
				}

				if ($bKan == TRUE) {
					$teller_kan++;
					$Spelers_vrij[$teller_kan]['spa_nummer'] = $Spelers_all[$a]['spa_nummer'];
					$Spelers_vrij[$teller_kan]['spa_naam'] = $Spelers_all[$a]['spa_naam'];
				}
			}	//end for 

			$Aantal_spelers_vrij = $teller_kan;
		}	//end if er zijn al gekoppelde spelers
	}	//end if er zijn spelers om te koppelen

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//kiezen
if ($Aantal_spelers_vrij == 0) {
	$error_message = "Er zijn geen spelers beschikbaar om aan deze competitie te koppelen!<br>
	In het startscherm kunt u nieuwe spelers aanmaken.";
	//pagina met melding
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Foutmelding</title>
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
				<td width="340" align="center" valign="middle" bgcolor="#003300">
					<h1>Foutmelding !</h1>
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center">
					<div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
						<?php print("$error_message"); ?>
					</div>
				</td>
			</tr>
			<tr>
				<td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
					<form name="partijen" method="post" action="Competitie_beheer.php">
						<input type="submit" class="submit-button" value="Terug naar beheer" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
							title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</form>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?></td>
			</tr>
		</table>
    <script>
	var logoPath = '<?php echo $Logo_naam; ?>';
	window.onload = function() {
		verversLogo(logoPath);
		
		function verversLogo(pad) {
		var logo = document.getElementById('logoAfbeelding');
		var basisSrc = pad.split('?')[0];
		var timestamp = new Date().getTime();
		var nieuweSrc = basisSrc + '?' + timestamp;
		logo.src = nieuweSrc;
		}
	};
	</script>
	</body>

	</html>
	<?php
	exit;
} else {
	//pagina om spelers te koppelen uit lijst
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Speler koppelen</title>
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
		<form name="speler" method="post" action="Speler_koppelen02.php">
			<table width="600" border="0">
				<tr>
					<td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
					<td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
						ClubMatch Online<br>
						<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
					</td>
				</tr>
				<tr>
					<td colspan="2" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Comp_naam"); ?></strong></td>
				</tr>
				<tr>
					<td height="40" colspan="2" align="center" bgcolor="#009900" class="grootwit">
						<h2>Spelers koppelen</h2>
						Vink spelers aan in de lijst om te koppelen:<br>&nbsp;
					</td>
				</tr>
				<tr>
					<td height="40" width="170" align="left" valign="top" bgcolor="#009900" class="grootwit"><strong>Beschikbare<br>spelers:</strong></td>
					<td align="left" bgcolor="#009900" class="grootwit">
						<?php
						for ($a = 1; $a < $Aantal_spelers_vrij + 1; $a++) {
							$Nr = $Spelers_vrij[$a]['spa_nummer'];
							$Nm = $Spelers_vrij[$a]['spa_naam'];
						?>
							<input type="checkbox" name="<?php print("$Nr"); ?>" value="<?php print("$Nr"); ?>"><?php print("$Nm"); ?><br>
						<?php
						}
						?>
					</td>
				</tr>
				<tr>
					<td height="40" align="center" valign="middle" bgcolor="#009900">&nbsp;</td>
					<td align="center" bgcolor="#009900">
						<input type="submit" class="submit-button" value="Kies" style="width:120px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
							title="Gegevens opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</td>
				</tr>
			</table>
		</form>
		<form name="cancel" method="post" action="Competitie_beheer.php">
			<table width="600" border="0">
				<tr>
					<td width="170" height="30" align="center" bgcolor="#009900">
						<input type="submit" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;" title="Terug" value="Cancel"
							onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
						<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					</td>
					<td align="right" bgcolor="#009900" class="klein">&copy;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
				</tr>
			</table>
		</form>
	</body>

	</html>
<?php
}
?>