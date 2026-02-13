<?php
//© Hans Eekels, versie 13-11-2025
//Tablet_bediening
//Toegevoegd: prevent $_Post bij geen verbinding
require_once('../../../../../data/connectie_clubmatch.php');
$Path = '../../../../../data/connectie_clubmatch.php';
require_once('../../../ClubMatch/PHP/Functies_biljarten.php');

/*
var_dump($_POST) geeft:
array(4) { 
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "1" 
["u_code"]=> string(9) "2_010_001" }
*/

$Hulp_dis = array();

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

//check
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
	//periode is eerste cijfer
	$Periode = intval(substr($U_code, 0, 1));
}

//check
if ($bAkkoord == FALSE) {
	//terug naar start
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
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
$Max_beurten = fun_maxbeurten($Org_nr, $Comp_nr, $Path);	//kan 0 zijn
$Hulp_dis = fun_nummoydis($Comp_nr, $Org_nr, $Path);
$Discipline = $Hulp_dis['dis_nummer'];
if ($Discipline == 3 || $Discipline == 4) {
	$En_nog = 3;
} else {
	$En_nog = 5;
}

//haal data op bj_tafel en bj_uitslag_hulp_tablet
//bij geen records is 1e beurt
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM bj_tafel WHERE  org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code' AND tafel_nr = '$Tafel_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0)		//eerste keer
	{
		$sql = "INSERT INTO bj_tafel (org_nummer, comp_nr, u_code, tafel_nr, status) VALUES ('$Org_nr', '$Comp_nr', '$U_code', '$Tafel_nr', '1')";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}
	}

	$sql = "SELECT * FROM bj_uitslag_hulp_tablet
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0)		//niet eerste keer
	{
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Beurten = $resultaat['brt'];
			$Car_A_gem = $resultaat['car_A_gem'];
			$SerieA = $resultaat['serie_A'];
			$Car_B_gem = $resultaat['car_B_gem'];
			$SerieB = $resultaat['serie_B'];
			$Hs_A = $resultaat['hs_A'];
			$Hs_B = $resultaat['hs_B'];
			$Alert = $resultaat['alert'];
			$Turn = $resultaat['turn'];
		}
	} else		//in bj_uitslag_hulp geen record ! Dat betekent de eerste keer
	{
		$Beurten = 0;
		$Car_A_gem = 0;
		$SerieA = 0;
		$Car_B_gem = 0;
		$SerieB = 0;
		$Hs_A = 0;
		$Hs_B = 0;
		$Turn = 1;	//speler A aan de beurt
	}

	//gegevens spelers uit bj_partijen met code
	$sql = "SELECT * FROM bj_partijen
	WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode' AND uitslag_code = '$U_code'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Sp_nummer_1 = $resultaat['nummer_A'];	//voor naam en avatar
		$Sp_A_car = $resultaat['cartem_A'];
		$Sp_A_naam = substr(fun_spelersnaam_competitie($Sp_nummer_1, $Org_nr, $Comp_nr, $Periode, 1, $Path), 0, 19) . " (" . $Sp_A_car . ")";

		$Sp_nummer_2 = $resultaat['nummer_B'];	//voor naam en avatar
		$Sp_B_car = $resultaat['cartem_B'];
		$Sp_B_naam = substr(fun_spelersnaam_competitie($Sp_nummer_2, $Org_nr, $Comp_nr, $Periode, 1, $Path), 0, 19) . " (" . $Sp_B_car . ")";
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//
if ($Turn == 1) {
	$RestA = $Sp_A_car - $Car_A_gem - $SerieA;
	if ($RestA <= $En_nog) {
		$bToonRestA = TRUE;
	} else {
		$bToonRestA = FALSE;
	}
	$RestB = 0;
	$bToonRestB = FALSE;
}

if ($Turn == 2) {
	$RestB = $Sp_B_car - $Car_B_gem - $SerieB;
	if ($RestB <= $En_nog) {
		$bToonRestB = TRUE;
	} else {
		$bToonRestB = FALSE;
	}
	$RestA = 0;
	$bToonRestA = FALSE;
}

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
	<?php
	if ($Gebruiker_nr == 1024) {
		echo '<link rel="stylesheet" href="Media_1024.css">';
	} else {
		echo '<link rel="stylesheet" href="Media.css">';
	}
	?>
	<title>Scoreborden</title>
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
	<form name="bediening" id="wedstrijdForm" method="post" action="Tablet_opvang.php">
		<table style="width:100%;" border="0" bgcolor="#003300">
			<tr>
				<td height="40" align="center" style="width:13%;"></td>
				<td align="center" style="width:14%;"></td>
				<td align="center" style="width:13%;"></td>
				<td align="center" style="width:10%;"></td>
				<td align="center" style="width:10%;"></td>
				<td align="center" style="width:13%;"></td>
				<td align="center" style="width:14%;"></td>
				<td align="center" style="width:13%;"></td>
			</tr>
			<tr>
				<td colspan="3" align="center">
					<?php
					if ($Turn == 1) {
					?>
						<div style="color:#FFF;">
							<h1>
								<?php print("$Sp_A_naam"); ?></h1>
						</div>
					<?php
					} else {
					?>
						<div style="color:#CCC;">
							<h1>
								<?php print("$Sp_A_naam"); ?></h1>
						</div>
					<?php
					}
					?>
				</td>
				<td colspan="2" align="center">
					<input type="submit" class="cancel-button" name="cancel" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
				</td>
				<td colspan="3" align="center">
					<?php
					if ($Turn == 2) {
					?>
						<div style="color:#FFF;">
							<h1>
								<?php print("$Sp_B_naam"); ?></h1>
						</div>
					<?php
					} else {
					?>
						<div style="color:#CCC;">
							<h1>
								<?php print("$Sp_B_naam"); ?></h1>
						</div>
					<?php
					}
					?>
				</td>
			</tr>
			<tr>
				<td colspan="3" align="center">
					<div id="car_A">
						<?php print("$Car_A_gem"); ?>
					</div>
				</td>
				<td colspan="2" align="center">
					<?php
					if ($Beurten == 0 && $Car_A_gem == 0 && $Car_B_gem == 0 && $SerieA == 0 && $SerieB == 0) {
					?>
						<input type="submit" class="wissel-button" name="switch" value="wissel spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<?php
					} else {
						print(" ");
					}
					?>
				</td>
				<td colspan="2" align="center">
					<div id="car_B">
						<?php print("$Car_B_gem"); ?>
					</div>
				</td>
				<td align="center">&nbsp;</td>
			</tr>

			<tr>
				<td align="center">
					<?php
					if ($bToonRestA == TRUE) {
						print("En nog:");
					}
					?>
				</td>
				<td colspan="2">&nbsp;</td>
				<td colspan="2" align="center">
					<?php
					if ($Alert > 0) {
						print("LAATSTE BEURT !");
					} else {
						if ($Max_beurten > 0) {
							print("Max $Max_beurten beurten");
						} else {
							print("Geen beurten-limiet");
						}
					}
					?>
				</td>
				<td colspan="2">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
					<input type="hidden" name="u_code" value="<?php print("$U_code"); ?>">
					<input type="hidden" name="periode" value="<?php print("$Periode"); ?>">
					<input type="hidden" name="car_A_tem" value="<?php print("$Sp_A_car"); ?>">
					<input type="hidden" name="car_B_tem" value="<?php print("$Sp_B_car"); ?>">
					<input type="hidden" name="turn" value="<?php print("$Turn"); ?>">
				</td>
				<td align="center">
					<?php
					if ($bToonRestB == TRUE) {
						print("En nog:");
					}
					?>
				</td>
			</tr>
			<tr>
				<td align="center">
					<?php
					if ($bToonRestA == TRUE) {
					?>
						<div id="ennog5A">
							<?php print("$RestA"); ?>
						</div>
					<?php
					}
					?>
				</td>
				<td colspan="2" align="center">
					<div id="serieA">
						<?php
						if ($Turn == 1) {
							print("$SerieA");
						} else {
							print("0");
						}
						?>
					</div>
				</td>
				<td colspan="2" rowspan="2" align="center" valign="top">
					<div id="brt">
						<?php print("$Beurten"); ?>
					</div>
				</td>
				<td colspan="2" align="center">
					<div id="serieB">
						<?php
						if ($Turn == 2) {
							print("$SerieB");
						} else {
							print("0");
						}
						?>
					</div>
				</td>
				<td align="center">
					<?php
					if ($bToonRestB == TRUE) {
					?>
						<div id="ennog5B">
							<?php print("$RestB"); ?>
						</div>
					<?php
					}
					?>
				</td>
			</tr>
			<tr>
				<td height="25" align="center">&nbsp;</td>
				<td colspan="2" align="center" valign="top">Huidige serie</td>
				<td colspan="2" align="center" valign="top">Huidige serie</td>
				<td align="center">&nbsp;</td>
			</tr>
			<tr>
				<td height="50" colspan="6">&nbsp;</td>
			</tr>
			<tr>
				<?php
				if ($Turn == 1) {
				?>
					<td rowspan="2" align="center">
						<?php
						if ($SerieA > 0) {
						?>
							<button type="submit" class="tel-button" title="min 1" name="min_1A" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">- 1</button>
						<?php
						} else {
							print(" ");
						}
						?>
					</td>
					<td rowspan="3" align="center">
						<button type="submit" class="invoer-button" name="invoerA" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">Invoer</button>
					</td>
					<td rowspan="2" align="center">
						<?php
						if ($SerieA + $Car_A_gem < $Sp_A_car) {
						?>
							<button type="submit" class="tel-button" title="plus 1" name="plus_1A" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">+ 1</button>
						<?php
						} else {
							print(" ");
						}
						?>
					</td>

					<td height="20" align="center" valign="baseline">
						<?php
						if ($Beurten > 0 && $Turn == 1 && $SerieA == 0) {
							print("Klaar");
						}
						?>
					</td>
					<td align="center" valign="baseline">
						<?php
						if ($Beurten > 0) {
							print("Herstel");
						}
						?>
					</td>
					<td rowspan="2" align="center">&nbsp;</td>
					<td rowspan="2" align="center"><img src="slot.jpg" class="slot-afbeelding"></td>
					<td rowspan="2" align="center">&nbsp;</td>
				<?php
				} else {
				?>
					<td rowspan="2" align="center">&nbsp;</td>
					<td rowspan="2" align="center"><img src="slot.jpg" class="slot-afbeelding"></td>
					<td rowspan="2" align="center">&nbsp;</td>

					<td height="20" align="center" valign="baseline">Klaar</td>
					<td align="center" valign="baseline">Herstel</td>

					<td rowspan="2" align="center">
						<?php
						if ($SerieB > 0) {
						?>
							<button type="submit" class="tel-button" title="min 1" name="min_1B" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">- 1</button>
						<?php
						} else {
							print(" ");
						}
						?>
					</td>
					<td rowspan="3" align="center">
						<button type="submit" class="invoer-button" name="invoerB" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">Invoer</button>
					</td>
					<td rowspan="2" align="center">
						<?php
						if ($SerieB + $Car_B_gem < $Sp_B_car) {
						?>
							<button type="submit" class="tel-button" title="plus 1" name="plus_1B" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">+ 1</button>
						<?php
						} else {
							print(" ");
						}
						?>
					</td>
				<?php
				}
				?>
			</tr>
			<tr>
				<td align="center">
					<?php
					if ($Beurten > 0 && $Turn == 1 && $SerieA == 0) {
					?>
						<button type="submit" name="gereed" class="afbeelding-button" title="Klaar">
							<img src="klaar.jpg" alt="Klaar">
						</button>
					<?php
					}
					?>
				</td>
				<td align="center">
					<?php
					if ($Beurten > 0) {
					?>
						<button type="submit" name="herstel" class="afbeelding-button" title="Herstel">
							<img src="herstel.jpg" alt="Herstel">
						</button>
					<?php
					}
					?>
				</td>
			</tr>
		</table>
	</form>
<script>
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("wedstrijdForm").addEventListener("submit", function(event) {
        if (!navigator.onLine) {
            event.preventDefault(); // Voorkom het verzenden van het formulier
            alert("Geen verbinding! Herstel de wifi-verbinding of probeer het later nog eens.");
        }
    });
});
</script>
</body>

</html>