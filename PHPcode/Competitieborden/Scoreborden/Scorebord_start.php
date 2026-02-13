<?php
/*
Hans Eekels 02-09-2025
//Scorebord met Speler_pic, melding "en-nog-5", herstelfunctie, beurtenlimiet, niet-uit
Cancel weer met knop
-1 niet bij start
=========================================================================================================================================
Scorebord
Via $_POST altijd 3 gegevens: comp_nr, user_code en u_code
Die worden doorgegeven bij de start of komen vanuit Scorebord_opvang
Rest gegevens halen uit bj_uitslag_hulp en als die leeg is, dan start-data op 0

Bij focus/beurt bij A: spelernaam licht, andere donker, controle-vakA enabeld, vakB disabled, serieMaxA aanpassen (Cartem-Cargem) en $Turn = 1
Bij focus/beurt bij B: spelernaam licht, andere donker, controle-vakB enabeld, vakA disabled, serieMaxB aanpassen (Cartem-Cargem) en $Turn = 2
==========================================================================================================================================
*/
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../../ClubMatch/PHP/Functies_biljarten.php");

$Hulp_dis = array();
$Copy = Date("Y");
/*
var_dump($_POST) geeft vanuit Toon_tafel.php en vanuit Scorebord_opvang.php
array(3) { 
["user_code"]=> string(10) "1002_CRJ@#" 
["comp_nr"]=> string(1) "1" 
["u_code"]=> string(9) "2_004_013" }
*/

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
			$Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_" . $Org_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_standaard.jpg";
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
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ClubMatch</title>
		<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
		<meta name="Description" content="ClubMatch" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../ClubMatch/PHP/script_competitie.js" defer></script>
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
$Max_beurten = fun_maxbeurten($Org_nr, $Comp_nr, $Path);	//kan 0 zijn
$Hulp_dis = fun_nummoydis($Comp_nr, $Org_nr, $Path);
$Discipline = $Hulp_dis['dis_nummer'];
if ($Discipline == 3 || $Discipline == 4) {
	$En_nog = 3;	//getest wordt op <= $En_nog
} else {
	$En_nog = 5;
}

//haal data op, bij geen record is 1e beurt
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM bj_uitslag_hulp 
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
			$Car_B_gem = $resultaat['car_B_gem'];
			$Hs_A = $resultaat['hs_A'];
			$Hs_B = $resultaat['hs_B'];
			$Alert = $resultaat['alert'];
			$Turn = $resultaat['turn'];
			if ($Turn == 2)		//in de db staat 2 opgeslagen, dus werken met 1
			{
				$Turn = 1;
			} else {
				$Turn = 2;
			}
		}
	} else		//in bj_uitslag_hulp geen record ! Dat betekent de eerste keer
	{
		$Beurten = 0;
		$Car_A_gem = 0;
		$Car_B_gem = 0;
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

//bewerken
$SerieA = 0;
$SerieB = 0;

$RestA = $Sp_A_car - $Car_A_gem;
$RestB = $Sp_B_car - $Car_B_gem;

//standaard fotos
$Hulp_A = "Avatars/Avatar_" . $Org_nr . "_" . $Sp_nummer_1 . ".jpg";
if (file_exists($Hulp_A)) {
	$Avatar_A = $Hulp_A;
} else {
	$Avatar_A = "Avatars/Avatar_000000.jpg";
}

$Hulp_B = "Avatars/Avatar_" .  $Org_nr . "_" . $Sp_nummer_2 . ".jpg";
if (file_exists($Hulp_B)) {
	$Avatar_B = $Hulp_B;
} else {
	$Avatar_B = "Avatars/Avatar_000000.jpg";
}

?>
<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8" />
	<title>Scorebord</title>
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />

	<!-- Externe JavaScript -->
	<script src="script.js" defer></script>

	<!-- PHP-waarden beschikbaar maken in JS -->
	<script>
		const maxScoreA = <?php echo json_encode($RestA); ?>;
		const maxScoreB = <?php echo json_encode($RestB); ?>;
	</script>

	<!-- CSS in eigen blok -->
	<style>
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
			margin: 0 auto;
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
		}

		.submit-button:hover {
			border-color: #FFF;
		}

		#example1,
		#ennog5A,
		#ennog5B {
			border: 2px solid white;
			border-radius: 100px;
		}
	</style>

	<!-- Interacties en toetscombinatie -->
	<script>
		function mouseIn(event) {
			const image = event.srcElement;
			image.border = '2';
			image.style.borderColor = "#FFF";
		}

		function mouseOut(event) {
			const image = event.srcElement;
			image.border = '0';
		}

		function mouseInBut(event) {
			const button = event.target || event.srcElement;
			button.style.borderColor = "#FFF";
		}

		function mouseOutBut(event) {
			const button = event.target || event.srcElement;
			button.style.borderColor = "transparent";
		}
	</script>
</head>

<body onContextMenu="return false">
	<form name="verwerken" id="verwerken" method="post" action="Scorebord_opvang.php">
		<table width="1860" border="0">
			<tr>
				<td height="10" width="125"><img src="../Figuren/Balk.jpg" width="125" height="10"></td>
				<td width="123"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="157"><img src="../Figuren/Balk.jpg" width="157" height="10"></td>
				<td width="123"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="197"><img src="../Figuren/Balk.jpg" width="197" height="10"></td>
				<td width="180"><img src="../Figuren/Balk.jpg" width="180" height="10"></td>
				<td width="180"><img src="../Figuren/Balk.jpg" width="180" height="10"></td>
				<td width="197"><img src="../Figuren/Balk.jpg" width="197" height="10"></td>
				<td width="123"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="157"><img src="../Figuren/Balk.jpg" width="157" height="10"></td>
				<td width="123"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="125"><img src="../Figuren/Balk.jpg" width="125" height="10"></td>
			</tr>
			<?php
			if ($Turn == 1) {
			?>
				<tr>
					<td height="100" colspan="6" align="left" valign="middle" bgcolor="#003300">
						<div style="margin-left:10px; color:#FFF;">
							<h1><?php print("$Sp_A_naam"); ?></h1>
						</div>
					</td>
					<td colspan="6" align="right" valign="middle" bgcolor="#003300">
						<div style="margin-right:10px; color:#CCC;">
							<h1><?php print("$Sp_B_naam"); ?></h1>
						</div>
					</td>
				</tr>
			<?php
			} else {
			?>
				<tr>
					<td height="100" colspan="6" align="left" valign="middle" bgcolor="#003300">
						<div style="margin-left:10px; color:#CCC;">
							<h1><?php print("$Sp_A_naam"); ?></h1>
						</div>
					</td>
					<td colspan="6" align="right" valign="middle" bgcolor="#003300">
						<div style="margin-right:10px; color:#FFF;">
							<h1><?php print("$Sp_B_naam"); ?></h1>
						</div>
					</td>
				</tr>
			<?php
			}
			?>
			<tr>
				<td colspan="2" rowspan="3" align="center" valign="top">
					<div style="width:200px; height:200px;">
						<img src="<?php print("$Avatar_A"); ?>" id="example1" width="200" height="200" alt="Speler">
					</div>
				</td>
				<td width="160" height="65">&nbsp;</td>
				<td colspan="2" rowspan="4" align="center" valign="middle">
					<input type="text" name="Car_A" id="Car_A" value="<?php print("$Car_A_gem"); ?>" data-max=<?php echo $Sp_A_car ?> height="260" size="2"
						style="width:320px; font:Arial; font-size:250px; font-weight:bold; background-color:#F00; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
				<td colspan="2" rowspan="2" align="center" valign="top">
					<?php
					if ($Beurten == 0 && $Car_A_gem == 0 && $Car_B_gem == 0) {
					?>
						<input type="submit" class="submit-button" name="switch" value="Wissel spelers"
							style="width:260px; height:100px; background-color:#0C0; color:#FFF; font-size:36px;" title="Wissel spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<?php
					} else {
						print(" ");
					}
					?>
				</td>
				<td colspan="2" rowspan="4" align="center" valign="middle">
					<input type="text" name="Car_B" id="Car_B" value="<?php print("$Car_B_gem"); ?>" data-max=<?php echo $Sp_B_car ?> height="260" size="2"
						style="width:320px; font:Arial; font-size:250px; font-weight:bold; background-color:#F00; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
				<td width="161">&nbsp;</td>
				<td colspan="2" rowspan="3" align="center" valign="top">
					<div style="width:200px; height:200px;">
						<img src="<?php print("$Avatar_B"); ?>" id="example1" width="200" height="200" alt="Speler">
					</div>
				</td>
			</tr>
			<tr>
				<td width="160" height="65">&nbsp;</td>
				<td width="161">&nbsp;</td>
			</tr>
			<tr>
				<td width="160" height="65">&nbsp;</td>
				<td colspan="2" align="center" valign="middle">
					<input type="submit" class="submit-button" name="cancel" value="Cancel" title="Terug naar keuze tafel" style="width:150px; height:50px; background-color:#999; color:#FFF; font-size:24px;"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
				</td>
				<td width="161">&nbsp;</td>
			</tr>
			<tr>
				<td colspan="2" rowspan="4" align="center" valign="top">
					<?php
					if ($RestA <= $En_nog) {
					?>
						<div id="rest_A" style="display:block; width:200px; height:200px;">
						<?php
					} else {
						?>
							<div id="rest_A" style="display:none; width:200px; height:200px;">
							<?php
						}
							?>
							<h2>En nog:</h2>
							<input type="text" name="ennog5A" id="ennog5A" value="<?php print("$RestA"); ?>" size="2"
								style="width:200px; height: 200px; font:Arial; font-size:96px; font-weight:bold; background-color:#FFD700; border:none; 
                                color:#F00; text-align:center; vertical-align:middle;" readonly>
							</div>
				</td>
				<td width="160" height="65">&nbsp;</td>
				<td colspan="2" align="center" valign="middle">
					<?php
					if ($Max_beurten == 0) {
						if ($Car_A_gem == $Sp_A_car) {
					?>
							<h2>Laatste beurt !</h2>
						<?php
						} else {
						?>
							<h2>Beurten</h2>
						<?php
						}
					} else {
						if ($Beurten == $Max_beurten || ($Beurten == $Max_beurten - 1 && $Turn == 1) || ($Car_A_gem == $Sp_A_car)) {
						?>
							<h2>Laatste beurt !</h2>
						<?php
						} else {
						?>
							<h2>Max&nbsp;<?php print("$Max_beurten"); ?> beurten</h2>
					<?php
						}
					}
					?>
				</td>
				<td width="161">&nbsp;</td>
				<td colspan="2" rowspan="4" align="center" valign="top">
					<?php
					if ($RestB <= $En_nog) {
					?>
						<div id="rest_B" style="display:block; width:200px; height:200px;">
						<?php
					} else {
						?>
							<div id="rest_B" style="display:none; width:200px; height:200px;">
							<?php
						}
							?>
							<h2>En nog:</h2>
							<input type="text" name="ennog5B" id="ennog5B" value="<?php print("$RestB"); ?>" size="2" style="width:200px; height:200px; font:Arial; font-size:96px; 
                            font-weight:bold; background-color:#FFD700; border:none; color:#F00; text-align:center; vertical-align:middle;" readonly>
							</div>
				</td>
			</tr>
			<tr>
				<td width="160" height="65">&nbsp;</td>
				<td width="126">&nbsp;</td>
				<td width="200">&nbsp;</td>
				<td colspan="2" rowspan="4" align="center" valign="middle">
					<input type="text" name="beurten" id="beurten" height="260" size="2" value="<?php print("$Beurten"); ?>"
						style="width:350px; font:Arial; font-size:250px; font-weight:bold; background-color:#F00; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
				<td width="200">&nbsp;</td>
				<td width="120">&nbsp;</td>
				<td width="161">&nbsp;</td>
			</tr>
			<tr>
				<td width="160" rowspan="2" align="center" valign="middle" bgcolor="#333333">
					<input type="text" name="scoreA" id="scoreA" value="<?php print("$SerieA"); ?>" data-max=<?php echo $RestA ?> height="140" size="2"
						style="width:160px; font:Arial; font-size:125px; font-weight:bold; background-color:#333; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
				<td width="126" height="65">&nbsp;</td>
				<td width="200" rowspan="2" align="center" valign="middle">
					<input type="text" name="hs_A" value="<?php print("$Hs_A"); ?>" height="140" size="2"
						style="width:160px; font:Arial; font-size:125px; font-weight:bold; background-color:#030; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
				<td width="200" rowspan="2" align="center" valign="middle">
					<input type="text" name="hs_B" value="<?php print("$Hs_B"); ?>" height="140" size="2"
						style="width:160px; font:Arial; font-size:125px; font-weight:bold; background-color:#030; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
				<td width="120">&nbsp;</td>
				<td width="161" rowspan="2" align="center" valign="middle" bgcolor="#333333">
					<input type="text" name="scoreB" id="scoreB" value="<?php print("$SerieB"); ?>" data-max=<?php echo $RestB ?> height="140" size="2"
						style="width:160px; font:Arial; font-size:125px; font-weight:bold; background-color:#333; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
			</tr>
			<tr>
				<td width="126" height="65">&nbsp;</td>
				<td width="120">&nbsp;</td>
			</tr>
			<tr>
				<td height="65" width="130">&nbsp;</td>
				<td align="center" valign="top" bgcolor="#003300">&nbsp;</td>
				<td align="center" valign="top" bgcolor="#333333">
					<h3>Huidige serie</h3>
				</td>
				<td align="center" valign="top" bgcolor="#003300">&nbsp;</td>
				<td width="200" align="center" valign="top">
					<h2>HS</h2>
				</td>
				<td width="200" align="center" valign="top">
					<h2>HS</h2>
				</td>
				<td align="center" valign="top" bgcolor="#003300">&nbsp;</td>
				<td align="center" valign="top" bgcolor="#333333">
					<h3>Huidige serie</h3>
				</td>
				<td align="center" valign="top" bgcolor="#003300">&nbsp;</td>
				<td width="137">&nbsp;</td>
			</tr>
			<tr>
				<td height="15" width="130">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="u_code" value="<?php print("$U_code"); ?>">
					<input type="hidden" name="periode" value="<?php print("$Periode"); ?>">
					<input type="hidden" name="car_A_tem" value="<?php print("$Sp_A_car"); ?>">
					<input type="hidden" name="car_B_tem" value="<?php print("$Sp_B_car"); ?>">
					<input type="hidden" name="turn" value="<?php print("$Turn"); ?>">
				</td>
				<td colspan="3" align="center" valign="top">&nbsp;</td>
				<td width="200">&nbsp;</td>
				<td width="183">&nbsp;</td>
				<td colspan="3" align="center" valign="top">&nbsp;</td>
				<td width="161">&nbsp;</td>
			</tr>
			<tr>
				<td width="130" height="160" bgcolor="#333333">&nbsp;</td>
				<td width="125" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Turn == 1) {
					?>
						<img src="Min_een.JPG" draggable="false" id="decreaseScoreA" width="118" height="120" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
					<?php
					} else {
						print(" ");
					}
					?>
				</td>
				<td width="160" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Turn == 1) {
					?>
						<input type="submit" class="submit-button" name="invoerA" value="INVOER" style="width:154px; height:154px; background-color:#000; color:#FFF; font-size:36px;"
							onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<?php
					} else {
					?>
						<img src="Slot.jpg" width="160" height="160">
					<?php
					}
					?>
				</td>
				<td width="126" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Turn == 1) {
					?>
						<img src="Plus_een.JPG" draggable="false" id="increaseScoreA" width="118" height="120" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
					<?php
					} else {
						print(" ");
					}
					?>
				</td>
				<td width="200" align="center" valign="bottom" bgcolor="#333333">&nbsp;

				</td>
				<td width="183" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Beurten > 0 && $Turn == 1) {
					?>
						<input type="submit" class="submit-button" name="gereed" title="AFSLUITEN" value="KLAAR"
							style="width:175px; height:120px; background-image:url(klaar.png); background-color:#FFF; color:#FFF; font-size:1px;"
							onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<?php
					} else {
						print(" ");
					}
					?>
				</td>
				<td width="183" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Beurten > 0) {
					?>
						<input type="submit" class="submit-button" name="herstel" title="HERSTEL" value="HERSTEL"
							style="width:175px; height:120px; background-image:url(herstel.png); background-color:#FFF; color:#FFF; font-size:1px;"
							onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<?php
					} else {
						print(" ");
					}
					?>
				</td>
				<td width="200" align="center" valign="bottom" bgcolor="#333333">&nbsp;</td>
				<td width="120" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Turn == 2) {
					?>
						<img src="Min_een.JPG" draggable="false" id="decreaseScoreB" width="118" height="120" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
					<?php
					} else {
					?>
						&nbsp;
					<?php
					}
					?>
				</td>
				<td width="161" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Turn == 2) {
					?>
						<input type="submit" class="submit-button" name="invoerB" value="INVOER" style="width:154px; height:154px; background-color:#000; color:#FFF; font-size:36px;"
							onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<?php
					} else {
					?>
						<img src="Slot.jpg" width="160" height="160">
					<?php
					}
					?>
				</td>
				<td width="125" align="center" valign="middle" bgcolor="#333333">
					<?php
					if ($Turn == 2) {
					?>
						<img src="Plus_een.JPG" draggable="false" id="increaseScoreB" width="118" height="120" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
					<?php
					} else {
					?>
						&nbsp;
					<?php
					}
					?>
				</td>
				<td width="137" bgcolor="#333333">&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>