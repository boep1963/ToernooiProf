<?php
//© Hans Eekels, versie versie 16-12-2025
//Planning [scorebord koppelen toegevoegd]
//aantal tafels obv tafels org
//Car_sys
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Uitslagen = array();

$Copy = Date("Y");
$Time = Date("G:i:s");

/*
var_dump($_POST) geeft:
array(3) { 
["poule_nr"]=> string(1) "1" 
["t_nummer"]=> string(1) "3" 
["user_code"]=> string(10) "1000_KYZ@#" }
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
$Aantal_tafels = fun_aantaltafels($Code, $Path);

$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Aantal_spelers = fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Huidige_ronde, $Poule_nr, $Path);
if ($Aantal_spelers % 2 == 0) {
	//even
	$Aantal_ronden = $Aantal_spelers - 1;
	$Aantal_koppels = $Aantal_spelers / 2;
} else {
	//oneven
	$Aantal_ronden = $Aantal_spelers;
	$Aantal_koppels = ($Aantal_spelers - 1) / 2;
}

//data ophalen
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_uitslagen WHERE gebruiker_nr = '$Gebruiker_nr' AND  t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' ORDER BY p_ronde, koppel";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	if (mysqli_num_rows($res) == 0) {
		$Aantal_partijen = 0;
	} else {
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
			$teller++;
			$Uitslagen[$teller]['sp_nummer_1'] = $resultaat['sp_nummer_1'];
			$Uitslagen[$teller]['sp_naam_1']  = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Uitslagen[$teller]['sp_nummer_1'], $Path);
			$Uitslagen[$teller]['sp_cartem_1']  = $resultaat['sp1_car_tem'];
			$Uitslagen[$teller]['sp_nummer_2'] = $resultaat['sp_nummer_2'];
			$Uitslagen[$teller]['sp_naam_2']  = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Uitslagen[$teller]['sp_nummer_2'], $Path);
			$Uitslagen[$teller]['sp_cartem_2']  = $resultaat['sp2_car_tem'];
			$Uitslagen[$teller]['gespeeld']  = $resultaat['gespeeld'];		//0=nee, 1=ja, 8=gekoppeld aan scorebord, 9=bezig
			$Uitslagen[$teller]['tafel_nr'] = $resultaat['tafel_nr'];
		}
		$Aantal_uitslagen = $teller;
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
	<title>Planning</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			width: 1150px;
			background-color: #FFF;
		}

		.button:hover {
			border-color: #000;
		}

		div.scroll {
			background-color: #FFF;
			width: 1140px;
			height: 450px;
			overflow: auto;
		}
	</style>
	<script>
		function printDiv(divName) {
			const content = document.getElementById(divName).innerHTML;
			const printWindow = window.open('', '', 'width=800,height=600');

			printWindow.document.write(`
			<html>
				<head>
					<title>Print</title>
					<style>
						body { font-family: Arial, sans-serif; padding: 20px; }
						table { border-collapse: collapse; width: auto; margin: auto; }
						td, th { border: 1px solid #000; padding: 4px; }
						td[align="center"] { text-align: center; }
				td[align="right"]  { text-align: right; }
				td[align="left"]   { text-align: left; }
						img { max-width: 100%; height: auto; }
					</style>
				</head>
				<body>
					${content}
				</body>
			</html>
			`);
			printWindow.document.close();

			// Wacht tot alles geladen is, dan pas printen
			printWindow.onload = function() {
				printWindow.focus();
				printWindow.print();
				printWindow.close();
			};
		}

		function myFunction() {
			location.reload(true);
		}

		setInterval(function() {
			location.reload(true);
		}, 300000); // 300000 milliseconden = 5 minuten
	</script>
</head>

<body>
	<form name="nieuw" method="post" action="Kies_actie.php">
		<table width="1150" border="0">
			<tr>
				<td width="170" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
				<td width="800" align="center" valign="middle" bgcolor="#006600" class="grootwit">
					<h1>ToernooiProf Online</h1>
					<strong>Planning poule <?php print("$Poule_nr"); ?> in ronde <?php print("$Huidige_ronde"); ?></strong>
				</td>
				<td width="170" height="85" align="center" valign="middle" bgcolor="#006600">&nbsp;</td>
			</tr>
			<tr>
				<td height="40" align="center" valign="middle" bgcolor="#006600">
					<input type="button" value="Help algemeen" style="width:165px; height:40px; background-color:#F00; border:none; color:#FFF; font-size:16px;"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_planning.php','Help','width=520,height=590,scrollbars=no,toolbar=no,location=no'); return false" />
				</td>
				<td height="30" align="center" valign="middle" bgcolor="#006600" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
				<td height="40" align="center" valign="middle" bgcolor="#006600">
					<input type="button" value="Help scoreborden" style="width:165px; height:40px; background-color:#F00; border:none; color:#FFF; font-size:16px;"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_scoreborden.php','Help','width=450,height=320,scrollbars=no,toolbar=no,location=no'); return false" />
				</td>
			</tr>
			<tr>
				<td colspan="3" align="left" bgcolor="#FFFFFF" class="groot">
					<div class="scroll">
						<div id="printableArea">
							<table width="1120" border="1">
								<tr>
									<td colspan="9" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart">Voer een uitslag in met de groene knop (oranje knop bij wijzigen uitslag)</td>
									<td colspan="3" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart">Beheer scoreborden</td>
								</tr>
								<tr>
									<td colspan="9" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart">
										<strong>Planning poule <?php print("$Poule_nr"); ?> in ronde <?php print("$Huidige_ronde"); ?></strong>
									</td>
									<td colspan="3" align="center" valign="middle" bgcolor="#FFFFFF" class="grootzwart"><strong>Koppel partij</strong>
									</td>
								</tr>
								<tr>
									<td width="55" align="center" bgcolor="#FFFFFF" class="grootzwart">Ronde</td>
									<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart">Koppel</td>
									<td colspan="2" align="center" bgcolor="#FFFFFF" class="grootzwart">Uitslag</td>
									<td width="200" bgcolor="#FFFFFF">
										<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
										<input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
										<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
									</td>
									<td width="50" align="center" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="20" align="center" bgcolor="#FFFFFF" class="grootzwart">&nbsp;</td>
									<td width="200" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="50" align="center" bgcolor="#FFFFFF">&nbsp;</td>
									<td width="100" align="center" bgcolor="#FFFFFF" class="grootzwart">Kies tafel</td>
									<td width="100" align="center" bgcolor="#FFFFFF" class="grootzwart">Actie</td>
									<td width="50" bgcolor="#FFFFFF" class="grootzwart">Status</td>
								</tr>
								<tr>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart">&nbsp;</td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart">&nbsp;</td>
									<td width="50" align="center" bgcolor="#FFFFFF" class="grootzwart">Invoeren</td>
									<td width="50" align="center" bgcolor="#FFFFFF" class="grootzwart">Wijzigen</td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><strong>Speler A</strong></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><strong>Car</strong></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><strong>-</strong></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><strong>Speler B</strong></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><strong>Car</strong></td>
									<td align="center" bgcolor="#FFFFFF">&nbsp;</td>
									<td align="center" bgcolor="#FFFFFF">&nbsp;</td>
									<td align="center" bgcolor="#FFFFFF">&nbsp;</td>
								</tr>
								<?php
								$teller = 0;
								for ($R_teller = 1; $R_teller < $Aantal_ronden + 1; $R_teller++) {

									for ($K_teller = 1; $K_teller < $Aantal_koppels + 1; $K_teller++) {
										$teller++;
										$Nm_1 = $Uitslagen[$teller]['sp_naam_1'];
										$Cr_1 = $Uitslagen[$teller]['sp_cartem_1'];
										$Nm_2 = $Uitslagen[$teller]['sp_naam_2'];
										$Cr_2 = $Uitslagen[$teller]['sp_cartem_2'];
										$Code_knop_invoer = "i_" . $R_teller . "_" . $K_teller;
										$Code_knop_wijzig = "w_" . $R_teller . "_" . $K_teller;
										$Gespeeld = $Uitslagen[$teller]['gespeeld'];
										$Tafel_nr = $Uitslagen[$teller]['tafel_nr'];
										$Naam_select = "Tafel_" . $R_teller . "_" . $K_teller;
										$Naam_knop = "Knop_" . $R_teller . "_" . $K_teller;
										?>
										<tr>
											<?php
											if ($K_teller == 1) {
											?>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart"><strong><?php print("$R_teller"); ?></strong></td>
											<?php
											} else {
											?>
												<td align="center" bgcolor="#FFFFFF" class="zwart">&nbsp;</td>
											<?php
											}
											?>
											<td width="60" align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$K_teller"); ?></td>
											<?php
											if ($Gespeeld == 0) {
												//dan invoeren partij, koppelen mogelijk en tafelkiezen mogelijk (default op tafel 0)
											?>
												<td align="center" bgcolor="#CCCCCC">
													<input type="submit" class="submit-button" name="Invoer" value="<?php print("$Code_knop_invoer"); ?>"
														style="width:50px; height:20px; background-color:#090; color:#090;"
														onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
												</td>
												<td align="center" bgcolor="#FFFFFF">&nbsp;</td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_1"); ?></td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_1"); ?></td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart">-</td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_2"); ?></td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_2"); ?></td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart">
                                                <select name="<?php print("$Naam_select"); ?>">
                                                    <option value="0" selected>Op Alle tafels</option>
                                                    <?php
                                                    for ($tf = 1; $tf < $Aantal_tafels + 1; $tf++) {
                                                        $Nm = "Tafel_" . $tf;
                                                    ?>
                                                        <option value="<?php print("$tf"); ?>"><?php print("$Nm"); ?></option>
                                                    <?php
                                                    }
                                                    ?>
                                                </select>
												</td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart">
													<input type="submit" class="submit-button" name="<?php print("$Naam_knop"); ?>" value="Koppel"
														style="width:90px; height:20px; background-color:#090; color:#FFF; font-size:12px;"
														title="Koppel partij aan scorebord" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
												</td>
												<td align="center" bgcolor="#FFFFFF" class="grootzwart">
													<img src="../Figuren/Chain_rood.JPG" width="30" height="20" alt="ontkoppeld">
												</td>
											</tr>
											<?php
											}	//end if $Gespeeld == 0

											if ($Gespeeld == 1) {
												//uitslag wijzigen, dan niet meer koppelen en geen tafelkeuze
										?>
										<td align="center" bgcolor="#FFFFFF">&nbsp;</td>
										<td align="center" bgcolor="#CCCCCC">
											<input type="submit" class="submit-button" name="Wijzig" value="<?php print("$Code_knop_wijzig"); ?>"
												style="width:50px; height:20px; background-color:#F90; color:#F90"
												onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
										</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_1"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_1"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">-</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_2"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_2"); ?></td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">
											<?php print("Tafel $Tafel_nr"); ?>
										</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">&nbsp;</td>
										<td align="center" bgcolor="#FFFFFF" class="grootzwart">
											<img src="../Figuren/Chain_rood.JPG" width="30" height="20" alt="ontkoppeld">
										</td>
									</tr>
									<?php
									}	//end if gespeeld = 1

									if ($Gespeeld == 8) {
									//gekoppeld
									//geen uitslag invoer of wijzig, toon tafel, knop ontkoppelen, img gekoppeld
									?>
                                    <td width="50" align="center" bgcolor="#CCCCCC">&nbsp;</td>
                                    <td align="center" bgcolor="#FFFFFF">&nbsp;</td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_1"); ?></td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_1"); ?></td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart">-</td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_2"); ?></td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_2"); ?></td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart">
									<select name="<?php print("$Naam_select"); ?>">
									<?php
									if ($Tafel_nr == 0) {
										?>
										<option value="0" selected>Op Alle tafels</option>
										<?php
									} else {
									?>
										<option value="0">Op Alle tafels</option>
									<?php
									}

									for ($b = 1; $b < $Aantal_tafels + 1; $b++) {
										$Nm_taf = "Tafel_" . $b;
										if ($Tafel_nr == $b) {
										?>
										<option value="<?php print("$b"); ?>" selected><?php print("$Nm_taf"); ?></option>
										<?php
										} else {
										?>
										<option value="<?php print("$b"); ?>"><?php print("$Nm_taf"); ?></option>
										<?php
										}
									}
									?>
									</select>
                                    </td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart">
                                        <input type="submit" class="submit-button" name="<?php print("$Naam_knop"); ?>" value="Ontkoppel" 
                                        style="width:90px; height:20px; background-color:#090; color:#FFF; font-size:12px;"
                                        title="Ontkoppel partij van scorebord" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                                    </td>
                                    <td align="center" bgcolor="#FFFFFF" class="grootzwart">
                                        <img src="../Figuren/Chain_groen.JPG" width="30" height="20" alt="gekoppeld">
                                    </td>
                                    </tr>
                                	<?php
								}

								if ($Gespeeld == 9) {
								//bezig
								//geen uitslag invoer of wijzig, toon tafel, geen knop img gekoppeld
								?>
									<td width="50" align="center" bgcolor="#CCCCCC">&nbsp;</td>
									<td align="center" bgcolor="#FFFFFF">&nbsp;</td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_1"); ?></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_1"); ?></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart">-</td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Nm_2"); ?></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart"><?php print("$Cr_2"); ?></td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart">
										<?php print("Tafel $Tafel_nr"); ?>
									</td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart">
										<input type="submit" class="submit-button" name="<?php print("$Naam_knop"); ?>" value="Nood" 
                                        style="width:90px; height:20px; background-color:#F00; color:#FFF; font-size:12px;"
											title="Ontkoppel in geval van nood" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
									</td>
									</td>
									<td align="center" bgcolor="#FFFFFF" class="grootzwart">
										<img src="../Figuren/Chain_groen.JPG" width="30" height="20" alt="gekoppeld">
									</td>
									</tr>
									<?php
									}
								}	//end for $K_teller
								?>
								<tr>
								<td colspan="12" bgcolor="#CCCCCC">&nbsp;</td>
								</tr>
								<?php
							}	//end for $R_teller
							?>
						</table>
					</div>
				</div>
			</td>
		</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="../Toernooi_Beheer.php">
		<table width="1150">
			<tr>
				<td width="200" height="45" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Terug naar beheer spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
				<td width="200" align="center" bgcolor="#006600">
					<input type="button" style="width:150px; height:40px; background-color:#FFF; color:#000;"
						onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
				<td width="200" align="center" bgcolor="#006600">
					<input type="button" onClick="myFunction()" title="Refresh" value="Refresh" style="width:150px; height:40px; background-color:#FFF; color:#000;"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
				<td width="220" align="center" bgcolor="#006600">Laatste automatische refresh<br>
					<?php print("$Time"); ?></td>
				<td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
</body>

</html>