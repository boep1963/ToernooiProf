<?php
//© Hans Eekels, versie 25-12-2025
//periodeovergang; moy aanpassen van aangevinkte spelers
//en data competitie goedzetten
//Logo refresh
//aangepast aan vrije invoer nieuw moy bij periode-overgang
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();
$Uitslagen = array();
/*
var_dump($_POST) geeft:
array(24) { 
[10]=> string(2) "10" 	["Moy_speler_10"]=> string(5) "0.200" ["Car_speler_10"]=> string(1) "7" 	//aangevinkte speler
						["Moy_speler_2"]=> string(5) "1.074" ["Car_speler_2"]=> string(2) "32" 
[1]=> string(1) "1" 	["Moy_speler_1"]=> string(5) "2.000" ["Car_speler_1"]=> string(2) "60" 		//aangevinkte speler
						["Moy_speler_8"]=> string(5) "1.705" ["Car_speler_8"]=> string(2) "51" 
						["Moy_speler_3"]=> string(5) "0.433" ["Car_speler_3"]=> string(2) "13" 
						["Moy_speler_7"]=> string(5) "2.000" ["Car_speler_7"]=> string(2) "50" 
						["Moy_speler_5"]=> string(5) "0.654" ["Car_speler_5"]=> string(2) "20" 
						["Moy_speler_9"]=> string(5) "0.636" ["Car_speler_9"]=> string(2) "19" 
						["Moy_speler_6"]=> string(5) "4.636" ["Car_speler_6"]=> string(3) "139" 
						["Moy_speler_4"]=> string(5) "0.846" ["Car_speler_4"]=> string(2) "25" 

["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1078_FLG@#" }
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

//periode
$Periode_oud = fun_periode($Comp_nr, $Org_nr, $Path);
$Periode_nieuw = $Periode_oud + 1;

//ophalen spelernummers die aangevinkt zijn
//[10]=> string(2) "10" 	["Moy_speler_10"]=> string(5) "0.000" ["Car_speler_10"]=> string(1) "7" 	//aangevinkte speler

$teller = 0;
foreach ($_POST as $key_var => $value_var) {
	if ($key_var != "comp_nr") {
		if ($key_var != "user_code") {
			if (substr($key_var, 0, 10) != "Moy_speler") {
				if (substr($key_var, 0, 10) != "Car_speler") {
					if (intval($key_var) > 0) {
						$teller++;
						
						$Nr_hulp = intval($value_var);
						$Spelers[$teller]['spc_nummer'] = $Nr_hulp;
						$Nm_moy = "Moy_speler_" . $Nr_hulp;
						$Nm_car = "Car_speler_" . $Nr_hulp;
						$Spelers[$teller]['spc_moy'] = $_POST[$Nm_moy];
						$Spelers[$teller]['spc_car'] = $_POST[$Nm_car];
					}
				}
			}
		}
	}
}

$Aantal_spelers = $teller;

if ($Aantal_spelers > 0)	//toegevoegd 01-03-2025
{
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//bepaal discipline
		$sql = "SELECT discipline FROM bj_competities WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Discipline = $resultaat['discipline'];
		}
		
		//moy aanpassen voor nieuwe periode ?
		if ($Periode_oud < 5) {
			for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
				$Spc_nummer = $Spelers[$a]['spc_nummer'];
				$Spc_moy = $Spelers[$a]['spc_moy'];
				$Spc_car = $Spelers[$a]['spc_car'];
				//updaten
				switch ($Periode_nieuw) {
					case 2:
						$sql = "UPDATE bj_spelers_comp SET spc_moyenne_2 = '$Spc_moy', spc_car_2 = '$Spc_car'  
						WHERE spc_nummer = '$Spc_nummer' AND spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";
						$res = mysqli_query($dbh, $sql);
						if (!$res) {
							throw new Exception(mysqli_error($dbh));
						}
						break;
					case 3:
						$sql = "UPDATE bj_spelers_comp SET spc_moyenne_3 = '$Spc_moy', spc_car_3 = '$Spc_car'  
						WHERE spc_nummer = '$Spc_nummer' AND spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";
						$res = mysqli_query($dbh, $sql);
						if (!$res) {
							throw new Exception(mysqli_error($dbh));
						}
						break;
					case 4:
						$sql = "UPDATE bj_spelers_comp SET spc_moyenne_4 = '$Spc_moy', spc_car_4 = '$Spc_car'  
						WHERE spc_nummer = '$Spc_nummer' AND spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";
						$res = mysqli_query($dbh, $sql);
						if (!$res) {
							throw new Exception(mysqli_error($dbh));
						}
						break;
					case 5:
						$sql = "UPDATE bj_spelers_comp SET spc_moyenne_5 = '$Spc_moy', spc_car_5 = '$Spc_car'  
						WHERE spc_nummer = '$Spc_nummer' AND spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";
						$res = mysqli_query($dbh, $sql);
						if (!$res) {
							throw new Exception(mysqli_error($dbh));
						}
						break;
				}	//end switch
			}	//end for per speler
		}	//if periode_oud < 5

		//periode aanpassen
		$sql = "UPDATE bj_competities SET periode = '$Periode_nieuw' WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}
}	//end if aantal aangevinkte spelers > 0

if ($Periode_oud < 5) {
	try {
		$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
		if (!$dbh) {
			throw new Exception(mysqli_connect_error());
		}
		mysqli_set_charset($dbh, "utf8");

		//data aanpassen
		$sql = "UPDATE bj_competities SET periode = '$Periode_nieuw' WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}
}

//melding
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
			<?php
			if ($periode_oud == 5) {
			?>
				<td align="center" colspan="2">
					<h1>Competitie afgesloten in periode 5</h1>
				</td>
			<?php
			} else {
			?>
				<td align="center" colspan="2">
					<h1>Periode overgang verwerkt</h1>
				</td>
			<?php
			}
			?>
		</tr>
		<tr>
			<td colspan="2">
				<div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
					U heeft een nieuwe periode&nbsp;<?php print("$Periode_nieuw"); ?>&nbsp;aangemaakt.<br>
					Daarbij worden de behaalde moyennes van de aangevinkte speler het startmoyenne van die spelers in de nieuwe periode.<br>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
				<form name="akkoord" method="post" action="Competitie_beheer.php">
					<input type="submit" class="submit-button" value="Naar Beheer" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
						title="Naar Beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</form>
			</td>
		</tr>
		<tr>
			<td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
		</tr>
	</table>
</body>

</html>