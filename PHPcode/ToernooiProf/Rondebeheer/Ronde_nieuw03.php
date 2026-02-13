<?php
//© Hans Eekels, versie 16-12-2025
//Spelers in poule doorkoppelen
//spelers tonen obv stand in die poule
//geen spelers tonen die al zijn doorgekoppeld
//car_sys
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');
/*
var_dump($_POST) geeft:
array(3) { 
["poule_nr"]=> string(1) "3" 
["user_code"]=> string(10) "1001_CHR@#" 
["t_nummer"]=> string(1) "1" }
*/

$Copy = Date("Y");

$Spelers = array();
$Spelers2 = array();
$Uitslagen = array();
$Uitslagen2 = array();

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

if (!isset($_POST['poule_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Poule_nr = $_POST['poule_nr'];
	if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

if (count($_REQUEST) != 3) {
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
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Nieuwe_ronde = $Huidige_ronde + 1;
$Aantal_spelers = fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Huidige_ronde, $Poule_nr, $Path);
$Punten_sys = fun_puntensysteem($Gebruiker_nr, $Toernooi_nr, $Path);
$Car_sys = fun_carsys($Gebruiker_nr, $Toernooi_nr, $Path);

//initieren
for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
	$Sp_nummer = fun_spelersnummer($Gebruiker_nr, $Toernooi_nr, $Poule_nr, $Huidige_ronde, $a, $Path);
	$Sp_naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Path);

	$Uitslagen[$a]['punten'] = 0;			//op sorteren, nl punten of % punten
	$Uitslagen[$a]['per_car'] = 0;			//op sorteren, later toekennen
	$Uitslagen[$a]['hs'] = 0;				//op sorteren
	$Uitslagen[$a]['moy'] = 0;				//op sorteren
	$Uitslagen[$a]['naam'] = $Sp_naam;
	$Uitslagen[$a]['sp_nummer'] = $Sp_nummer;
	$Uitslagen[$a]['car_gem'] = 0;
	$Uitslagen[$a]['brt'] = 0;
	$Uitslagen[$a]['partijen'] = 0;
}

//uitslagen ophalen (eerst even moy-form en car-min
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");
	
	//$Moy_form en $Car_min voor functie car
	$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
		$Moy_form = $resultaat['t_moy_form'];	//kan 0 zijn bij $Car_sys == 2
		$Car_min = $resultaat['t_min_car'];
	}
	
	$sql = "SELECT * FROM tp_uitslagen WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND gespeeld = '1'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$bKan = FALSE;
	} else {
		$bKan = TRUE;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$Nr_1 = $resultaat['sp_volgnummer_1'];
			$Uitslagen[$Nr_1]['car_gem'] = $Uitslagen[$Nr_1]['car_gem'] + $resultaat['sp1_car_gem'];
			$Uitslagen[$Nr_1]['brt'] = $Uitslagen[$Nr_1]['brt'] + $resultaat['brt'];
			$Hs_1_hulp = $resultaat['sp1_hs'];
			if ($Hs_1_hulp > $Uitslagen[$Nr_1]['hs']) {
				$Uitslagen[$Nr_1]['hs'] = $Hs_1_hulp;
			}
			$Uitslagen[$Nr_1]['punten'] = $Uitslagen[$Nr_1]['punten'] + $resultaat['sp1_punt'];
			$Uitslagen[$Nr_1]['partijen'] = $Uitslagen[$Nr_1]['partijen'] + 1;

			$Nr_2 = $resultaat['sp_volgnummer_2'];
			$Uitslagen[$Nr_2]['car_gem'] = $Uitslagen[$Nr_2]['car_gem'] + $resultaat['sp2_car_gem'];
			$Uitslagen[$Nr_2]['brt'] = $Uitslagen[$Nr_2]['brt'] + $resultaat['brt'];
			$Hs_2_hulp = $resultaat['sp2_hs'];
			if ($Hs_2_hulp > $Uitslagen[$Nr_2]['hs']) {
				$Uitslagen[$Nr_2]['hs'] = $Hs_2_hulp;
			}
			$Uitslagen[$Nr_2]['punten'] = $Uitslagen[$Nr_2]['punten'] + $resultaat['sp2_punt'];
			$Uitslagen[$Nr_2]['partijen'] = $Uitslagen[$Nr_2]['partijen'] + 1;
		}
	}

	//%car toevoegen en dan sorteren
	if ($bKan == TRUE) {
		for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
			$Sp_nummer = $Uitslagen[$a]['sp_nummer'];
			$Car_tem_hulp = fun_carspeler($Gebruiker_nr, $Toernooi_nr, $Sp_nummer, $Huidige_ronde, $Path);
			$Nr_partijen = $Uitslagen[$a]['partijen'];
			$Car_tem_tot = $Car_tem_hulp * $Nr_partijen;
			if ($Car_tem_tot > 0) {
				$Uitslagen[$a]['per_car'] = number_format(($Uitslagen[$a]['car_gem'] / $Car_tem_tot) * 100, 3);
			} else {
				$Uitslagen[$a]['per_car'] = '0.000';
			}

			if ($Uitslagen[$a]['brt'] > 0) {
				$Uitslagen[$a]['moy'] = number_format($Uitslagen[$a]['car_gem'] / $Uitslagen[$a]['brt'], 3);
			} else {
				$Uitslagen[$a]['moy'] = '0.000';
			}
		}

		//stand obv %punten
		for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
			$Punten = $Uitslagen[$a]['punten'];
			$Partijen = $Uitslagen[$a]['partijen'];
			if ($Punten_sys == 1) {
				$Te_halen = $Partijen * 2;
			}
			if ($Punten_sys == 2) {
				$Te_halen = $Partijen * 10;
			}
			if ($Punten_sys == 3) {
				$Te_halen = $Partijen * 12;
			}

			if ($Te_halen > 0) {
				$Per_punt = number_format($Punten / $Te_halen * 100, 2);
			} else {
				$Per_punt = '0.000';
			}

			$Uitslagen[$a]['punten'] = $Per_punt;
		}
	}	//end if $bKan == TRUE

	//nu spelers eruit die al eerder zijn doorgekoppeld
	$sql = "SELECT * FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND ronde_nr = '$Nieuwe_ronde'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) > 0) {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Spelers2[$teller]['sp_nummer'] = $resultaat['sp_nummer'];
		}
		$Aantal_reedsgekoppeld = $teller;

		//deze spelers uit $Uitslagen
		$teller_nieuw = 0;
		for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
			$Sp_poule = $Uitslagen[$a]['sp_nummer'];
			$bGevonden = FALSE;
			for ($b = 1; $b < $Aantal_reedsgekoppeld + 1; $b++) {
				$Sp_gekoppeld = $Spelers2[$b]['sp_nummer'];

				if ($Sp_gekoppeld == $Sp_poule) {
					$bGevonden = TRUE;
					break;
				}
			}

			if ($bGevonden == FALSE) {
				$teller_nieuw++;
				$Uitslagen2[$teller_nieuw]['punten'] = $Uitslagen[$a]['punten'];
				$Uitslagen2[$teller_nieuw]['per_car'] = $Uitslagen[$a]['per_car'];
				$Uitslagen2[$teller_nieuw]['hs'] = $Uitslagen[$a]['hs'];
				$Uitslagen2[$teller_nieuw]['moy'] = $Uitslagen[$a]['moy'];
				$Uitslagen2[$teller_nieuw]['naam'] = $Uitslagen[$a]['naam'];
				$Uitslagen2[$teller_nieuw]['sp_nummer'] = $Uitslagen[$a]['sp_nummer'];
				$Uitslagen2[$teller_nieuw]['car_gem'] = $Uitslagen[$a]['car_gem'];
				$Uitslagen2[$teller_nieuw]['brt'] = $Uitslagen[$a]['brt'];
				$Uitslagen2[$teller_nieuw]['partijen'] = $Uitslagen[$a]['partijen'];
			}
		}

		$Aantal_spelers_nieuw = $teller_nieuw;

		rsort($Uitslagen2);		//key-start = 0;
	} else		//geen reeds gekoppelde spelers
	{
		//$Uitslagen naar $Uitslagen2
		rsort($Uitslagen);		//key-start = 0;
		$Uitslagen2 = $Uitslagen;
		$Aantal_spelers_nieuw = $Aantal_spelers;
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
	<title>Overzicht poule</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			width: 950px;
		}

		.button:hover {
			border-color: #000;
		}

		div.scroll {
			background-color: #FFF;
			width: auto;
			height: 320px;
			overflow: auto;
		}
	</style>
    <script>
	const Moy_form = <?php echo (int)$Moy_form; ?>;
	const Car_min  = <?php echo (int)$Car_min; ?>;
  </script>
</head>

<body>
	<form name="nieuw" method="post" action="Ronde_nieuw04.php">
		<table width="950" border="0">
			<tr>
				<td width="170" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo" /></td>
				<td align="center" valign="middle" bgcolor="#006600" class="grootwit">
					<h1>ToernooiProf Online</h1>
					<strong><?php print("$Gebruiker_naam"); ?></strong>
				</td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
			</tr>
			<tr>
				<td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Spelers koppelen naar ronde <?php print("$Nieuwe_ronde"); ?></strong></td>
			</tr>
			<tr>
				<td colspan="2" align="left" bgcolor="#009900" class="groot">
					<div class="scroll">
						<table width="920" border="1">
							<tr>
								<td colspan="7" align="center" class="grootzwart">
									<strong>Overzicht Spelers in poule <?php print("$Poule_nr"); ?> in ronde <?php print("$Huidige_ronde"); ?> op volgorde in stand (% punten)</strong>
								</td>
							</tr>
							<tr>
								<td width="230" align="left" class="grootzwart"><strong>Naam</strong></td>
								<td width="90" align="center" class="grootzwart"><strong>Car_start</strong></td>
								<td width="100" align="center" class="grootzwart"><strong>Moy_start</strong></td>
								<td width="100" align="center" class="grootzwart"><strong>Moy_huidig</strong></td>
								<td width="100" align="center" class="grootzwart"><strong>Moy_nieuw</strong></td>
                                <td width="100" align="center" class="grootzwart"><strong>Car_nieuw</strong></td>
								<td width="175" align="center" class="grootzwart"><strong>Nieuwe poule</strong></td>
							</tr>
							<?php
							if ($Aantal_spelers_nieuw > 0) {
								for ($a = 0; $a < $Aantal_spelers_nieuw; $a++) {
									$Naam_p = $Uitslagen2[$a]['naam'];
									$Nummer_p = $Uitslagen2[$a]['sp_nummer'];
									$Car_p = fun_carspeler($Gebruiker_nr, $Toernooi_nr, $Nummer_p, $Huidige_ronde, $Path);	//car_start
									$Moy_s = fun_moyspeler($Gebruiker_nr, $Toernooi_nr, $Nummer_p, $Huidige_ronde, $Path);	//moy_start
									$Moy_p = $Uitslagen2[$a]['moy'];
									$Nm_select = "Poule_speler_" . $Nummer_p;
									$Nm_moy = "Moy_speler_" . $Nummer_p;
									$Nm_car = "Car_speler_" . $Nummer_p;
									?>
									<tr>
										<td align="left" class="grootzwart"><?php print("$Naam_p"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Car_p"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Moy_s"); ?></td>
										<td align="center" class="grootzwart"><?php print("$Moy_p"); ?></td>
										<?php
										if ($Car_sys == 1)
										{
											?>
                                            <td align="center" class="grootzwart">
                                                <input type="text" onClick="this.select();" oninput="fun_car(<?php echo $a; ?>);" id="Moyenne_<?php echo $a; ?>" name="<?php print("$Nm_moy"); ?>" 
                                                maxlength="7" size="5" 
                                                pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="<?php print("$Moy_s"); ?>" required />
                                            </td>
                                            <td align="center" class="grootzwart">
                                                <input type="text" id="Car_<?php echo $a; ?>" name="<?php print("$Nm_car"); ?>" size="5" value="<?php print("$Car_p"); ?>" style="font-size:16px;" readonly />
                                            </td>
											<?php
										}
										else
										{
                                         	?>   
                                            <td align="center" class="grootzwart">
                                                <input type="text" onClick="this.select();" name="<?php print("$Nm_moy"); ?>" maxlength="7" size="5" pattern="[0-9]+(\.[0-9]{3})" 
                                                title="Moyenne met 3 decimalen na de punt" value="<?php print("$Moy_s"); ?>" />
                                            </td>
                                            <td align="center" class="grootzwart">
                                                <input type="text" onClick="this.select();" name="<?php print("$Nm_car"); ?>" maxlength="7" size="5" pattern="[0-9]+"
                                                title="Aantal caramboles" value="<?php print("$Car_p"); ?>" />
                                            </td>
                                        	<?php
										}
										?>
                                        <td class="grootzwart">
											<select name="<?php print("$Nm_select"); ?>" style="font-size:16px;">
												<option value="0" selected>Niet doorkoppelen</option>
												<option value="1">Poule 1</option>
												<option value="2">Poule 2</option>
												<option value="3">Poule 3</option>
												<option value="4">Poule 4</option>
												<option value="5">Poule 5</option>
												<option value="6">Poule 6</option>
												<option value="7">Poule 7</option>
												<option value="8">Poule 8</option>
												<option value="9">Poule 9</option>
												<option value="10">Poule 10</option>
												<option value="11">Poule 11</option>
												<option value="12">Poule 12</option>
												<option value="13">Poule 13</option>
												<option value="14">Poule 14</option>
												<option value="15">Poule 15</option>
												<option value="16">Poule 16</option>
												<option value="17">Poule 17</option>
												<option value="18">Poule 18</option>
												<option value="19">Poule 19</option>
												<option value="20">Poule 20</option>
												<option value="21">Poule 21</option>
												<option value="22">Poule 22</option>
												<option value="23">Poule 23</option>
												<option value="24">Poule 24</option>
												<option value="25">Poule 25</option>
											</select>
										</td>
									</tr>
								<?php
								}	//end for per speler
							} else {
								?>
								<tr>
									<td colspan="7" align="center" class="grootzwart">Geen spelers om door te koppelen !</td>
								</tr>
							<?php
							}
							?>
						</table>
					</div>
					<?php
					if ($Aantal_spelers > 0) {
					?>
						<table width="920" border="0">
							<tr>
								<td align="center" class="grootwit" bgcolor="#FF0000">
								<?php	
                                if ($Car_sys == 1)
								{
									?>
                                    <strong>Let op ! U kunt hier, bij elke speler die u wilt doorkoppelen, het moyenne aanpassen voor de volgende ronde. 
                                    Wijzig daarvoor het moyenne in de kolom Moy_nieuw !!</strong>
									<?php
								}
								else
								{
									?>
                                    <strong>Let op ! U kunt hier, bij elke speler die u wilt doorkoppelen, het moyenne en/of het aantal car aanpassen voor de volgende ronde. 
                                    Wijzig daarvoor het moyenne in de kolom Moy_nieuw en het aantal car in de kolom Car_nieuw !!</strong>
									<?php	
								}
                                ?>
                                </td>
							</tr>
							<tr>
								<td align="center">
									<input type="submit" class="submit-button" value="Doorkoppelen" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
										title="Spelers doorkoppelen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
									<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
									<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
									<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
								</td>
							<tr>
						</table>
					<?php
					}
					?>
				</td>
			</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="Ronde_nieuw01.php">
		<table width="950" border="0">
			<tr>
				<td width="300" height="45" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Cancel" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Terug naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
				</td>
				<td width="300" align="center" valign="middle" bgcolor="#006600">
					<input type="button" value="Help" style="width:165px; height:40px; background-color:#F00; border:none; color:#FFF; font-size:16px;"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_doorkoppelen.php','Help','width=510,height=590,scrollbars=no,toolbar=no,location=no'); return false" />
				</td>
				<td bgcolor="#006600" align="right">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
<script>
	function fun_car(index) {
    // Gebruik de index om het specifieke element te vinden
    const moyInput = document.getElementById("Moyenne_" + index);
    const carInput = document.getElementById("Car_" + index);

    if (!moyInput || !carInput) return;

    const Moy = parseFloat(moyInput.value.replace(',', '.'));

    if (isNaN(Moy)) {
        carInput.value = "";
        return;
    }

    let Car;
    // Moy_form en Car_min zijn globaal, dus die blijven werken
    switch (Moy_form) {
        case 1: Car = Math.round(Moy * 20); break;
        case 2: Car = Math.round(Moy * 25); break;
        case 3: Car = Math.round(Moy * 30); break;
        case 4: Car = Math.round(Moy * 40); break;
        case 5: Car = Math.round(Moy * 50); break;
        case 6: Car = Math.round(Moy * 60); break;
        default: Car = Math.round(Moy * 25); break;
    }

    if (Car < Car_min) Car = Car_min;

    carInput.value = Car;
}
</script>
</body>

</html>