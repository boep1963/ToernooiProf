<?php
/*
Hans Eekels 05-11-2025
Scorebord met Speler_pic, melding "en-nog-5", herstelfunctie, beurtenlimiet, niet-uit
en cancelknop terug
En_nog 3 of 5 toegevoegd
=========================================================================================================================================
Scorebord
Via $_POST altijd 3 gegevens: toernooi_nr, poule_nr en u_code
Die worden doorgegeven bij de start of komen vanuit Scorebord_opvang
Rest gegevens halen uit bj_uitslag_hulp en als die leeg is, dan start-data op 0

Bij focus/beurt bij A: spelernaam licht, andere donker, controle-vakA enabeld, vakB disabled, serieMaxA aanpassen (Cartem-Cargem) en $Turn = 1
Bij focus/beurt bij B: spelernaam licht, andere donker, controle-vakB enabeld, vakA disabled, serieMaxB aanpassen (Cartem-Cargem) en $Turn = 2
==========================================================================================================================================
*/
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../../ToernooiProf/PHP/Functies_toernooi.php');

$Code_hulp = array();
$Copy = Date("Y");
/*
var_dump($_POST) geeft vanuit Toon_tafel.php:
array(3) { ["user_code"]=> string(10) "1001_CHR@#" ["toernooi_nr"]=> string(1) "1" 
["Poule_2"]=> string(3) "1_1" }		de key_var geeft het poule-nummer en de $key_value de uitslagcode

en vanuit Scorebord_opvang.php:
["user_code"]
["toernooi_nr"]
["u_code"]
["poule_nr"]
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
			$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = intval($_POST['toernooi_nr']);
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

foreach ($_POST as $key_var => $value_var) {
	if (substr($key_var, 0, 5) == "Poule")		//eerste keer vanuit Toon_tafel.php en ook vanuit Scorebord_opvang
	{
		$Len = strlen($key_var);
		$Poule_nr = substr($key_var, 6, $Len);
		$U_code = $value_var;
	}

	if (substr($key_var, 0, 6) == "u_code")	//uit Scorebord_opvang.php
	{
		$Code_hulp = $value_var;
		$U_code = str_replace(" ", "", $Code_hulp);
	}

	if (substr($key_var, 0, 8) == "poule_nr")	//uit Scorebord_opvang.php
	{
		$Poule_nr = $value_var;
	}
}

//check
if ($bAkkoord == FALSE) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Toernooi programma</title>
		<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
		<meta name="Description" content="Toernooiprogramma" />
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//verder
$Max_beurten = fun_maxbeurten($Gebruiker_nr, $Toernooi_nr, $Path);	//kan 0 zijn
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Discipline = fun_nummerdis($Gebruiker_nr, $Toernooi_nr, $Path);
if ($Discipline == 3 || $Discipline == 4) {
	$En_nog = 3;
} else {
	$En_nog = 5;
}

//haal data op, bij geen record is 1e beurt
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_uitslag_hulp 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' ORDER BY brt DESC limit 1";

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
	} else		//in bj_uitslag_hulp geen record ! Dat betekent de eerste keer, dus gespeeld = 9 bij tp_uitslagen
	{
		//update
		$sql = "UPDATE tp_uitslagen SET gespeeld = '9'
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$U_code'";

		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		//verder
		$Beurten = 0;
		$Car_A_gem = 0;
		$Car_B_gem = 0;
		$Hs_A = 0;
		$Hs_B = 0;
		$Turn = 1;	//speler A aan de beurt
	}

	//gegevens spelers uit bj_partijen met code
	$sql = "SELECT * FROM tp_uitslagen 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND sp_poule = '$Poule_nr' AND sp_partcode = '$U_code'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Sp_nummer_1 = $resultaat['sp_nummer_1'];	//voor naam en avatar
		$Sp_A_car = $resultaat['sp1_car_tem'];
		$Sp_A_naam = substr(fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer_1, $Path), 0, 20) . " (" . $Sp_A_car . ")";

		$Sp_nummer_2 = $resultaat['sp_nummer_2'];	//voor naam en avatar
		$Sp_B_car = $resultaat['sp2_car_tem'];
		$Sp_B_naam = substr(fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer_2, $Path), 0, 20) . " (" . $Sp_B_car . ")";
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
$Hulp_A = "Avatars/Avatar_" . $Sp_nummer_1 . ".jpg";
if (file_exists($Hulp_A)) {
	$Avatar_A = $Hulp_A;
} else {
	$Avatar_A = "Avatars/Avatar_000000.jpg";
}

$Hulp_B = "Avatars/Avatar_" . $Sp_nummer_2 . ".jpg";
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
				<td height="10" width="130"><img src="../Figuren/Balk.jpg" width="125" height="10"></td>
				<td width="125"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="160"><img src="../Figuren/Balk.jpg" width="157" height="10"></td>
				<td width="126"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="200"><img src="../Figuren/Balk.jpg" width="197" height="10"></td>
				<td width="183"><img src="../Figuren/Balk.jpg" width="180" height="10"></td>
				<td width="183"><img src="../Figuren/Balk.jpg" width="180" height="10"></td>
				<td width="200"><img src="../Figuren/Balk.jpg" width="197" height="10"></td>
				<td width="123"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="161"><img src="../Figuren/Balk.jpg" width="157" height="10"></td>
				<td width="125"><img src="../Figuren/Balk.jpg" width="123" height="10"></td>
				<td width="137"><img src="../Figuren/Balk.jpg" width="125" height="10"></td>
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
								style="width:200px; height: 200px; font:Arial; font-size:96px; font-weight:bold; background-color:#FFD700; border:none; color:#F00; 
							text-align:center; vertical-align:middle;" readonly>
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
							<input type="text" name="ennog5B" id="ennog5B" value="<?php print("$RestB"); ?>" size="2"
								style="width:200px; height: 200px; font:Arial; font-size:96px; font-weight:bold; background-color:#FFD700; border:none; color:#F00; 
                                text-align:center; vertical-align:middle;" readonly>
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
				<td width="123">&nbsp;</td>
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
				<td width="123">&nbsp;</td>
				<td width="161" rowspan="2" align="center" valign="middle" bgcolor="#333333">
					<input type="text" name="scoreB" id="scoreB" value="<?php print("$SerieB"); ?>" data-max=<?php echo $RestB ?> height="140" size="2"
						style="width:160px; font:Arial; font-size:125px; font-weight:bold; background-color:#333; border:none; color:#FFF; text-align:center; vertical-align:middle;" readonly>
				</td>
			</tr>
			<tr>
				<td width="126" height="65">&nbsp;</td>
				<td width="123">&nbsp;</td>
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
					<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
					<input type="hidden" name="u_code" value="<?php print("$U_code"); ?>">
					<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
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
				<td width="123" align="center" valign="middle" bgcolor="#333333">
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