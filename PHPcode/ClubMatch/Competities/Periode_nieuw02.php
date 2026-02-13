<?php
//© Hans Eekels, versie 25-12-2025
//Nieuwe periode, verwerken
//gewijzigd 1-3-2025: spelers default NIET aangevinkt om moy aan te passen
//20-4-2025: geen mogelijkheid meer om behaald moy door te koppelen naar leden (is een aparte knop voor)
//Kop aangepast
//Logo refresh
//Nieuwe opzet bij niet gespeeld in deze periode en keuze moy => car
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();
$Uitslagen = array();

//var_dump($_POST) geeft: array(2) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }

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

$Periode_oud = fun_periode($Comp_nr, $Org_nr, $Path);
$Periode_nieuw = $Periode_oud + 1;
$Moy_form = fun_moyform($Org_nr, $Comp_nr, $Path);

$Car_min = fun_mincar($Org_nr, $Comp_nr, $Path);

//verder
//zoek spelers met startmoy en startcar huidige peruode en bepaal eind-moy en nieuw car volgende periode
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	//spelers
	$sql = "SELECT * FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$teller++;
		$Sp_nr = $resultaat['spc_nummer'];
		$Spelers[$teller]['spc_naam'] = fun_spelersnaam_competitie($Sp_nr, $Org_nr, $Comp_nr, $Periode_oud, 1, $Path);
		$Spelers[$teller]['spc_nummer'] = $Sp_nr;
		$Spelers[$teller]['moy_nieuw'] = 0;
		$Spelers[$teller]['car_nieuw'] = 0;
		$Spelers[$teller]['partijen'] = 0;

		switch ($Periode_oud) {
			case 1:
				$Spelers[$teller]['moy_start'] = $resultaat['spc_moyenne_1'];
				$Spelers[$teller]['car_start'] = $resultaat['spc_car_1'];
				break;
			case 2:
				$Spelers[$teller]['moy_start'] = $resultaat['spc_moyenne_2'];
				$Spelers[$teller]['car_start'] = $resultaat['spc_car_2'];
				break;
			case 3:
				$Spelers[$teller]['moy_start'] = $resultaat['spc_moyenne_3'];
				$Spelers[$teller]['car_start'] = $resultaat['spc_car_3'];
				break;
			case 4:
				$Spelers[$teller]['moy_start'] = $resultaat['spc_moyenne_4'];
				$Spelers[$teller]['car_start'] = $resultaat['spc_car_4'];
				break;
		}
		$Aantal_spelers = $teller;
	}

	//uitslag-array op 0 voor alle spelers
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_num = $Spelers[$a]['spc_nummer'];
		$Uitslagen[$Sp_num]['car'] = 0;
		$Uitslagen[$Sp_num]['brt'] = 0;
		$Uitslagen[$Sp_num]['partijen'] = 0;
	}

	//uitslagen voor eindmoy
	for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
		$Sp_nummer = $Spelers[$a]['spc_nummer'];

		//nu uitslagen
		$sql = "SELECT * FROM bj_uitslagen 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_oud' AND (sp_1_nr = '$Sp_nummer' OR sp_2_nr = '$Sp_nummer')";
		$res = mysqli_query($dbh, $sql);
		if (!$res) {
			throw new Exception(mysqli_error($dbh));
		}

		if (mysqli_num_rows($res) > 0) {
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$Sp_test = $resultaat['sp_1_nr'];
				$Uitslagen[$Sp_nummer]['partijen'] = $Uitslagen[$Sp_nummer]['partijen'] + 1;
				if ($Sp_test == $Sp_nummer) {
					$Uitslagen[$Sp_nummer]['car'] = $Uitslagen[$Sp_nummer]['car'] + $resultaat['sp_1_cargem'];
					$Uitslagen[$Sp_nummer]['brt'] = $Uitslagen[$Sp_nummer]['brt'] + $resultaat['brt'];
				} else {
					$Uitslagen[$Sp_nummer]['car'] = $Uitslagen[$Sp_nummer]['car'] + $resultaat['sp_2_cargem'];
					$Uitslagen[$Sp_nummer]['brt'] = $Uitslagen[$Sp_nummer]['brt'] + $resultaat['brt'];
				}
			}
		}	//end if rec=o
	}	//end for per speler

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//bereken moy en nieuw car
for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
	$Sp_nummer = $Spelers[$a]['spc_nummer'];
	$Car_tot = $Uitslagen[$Sp_nummer]['car'];
	$Brt_tot = $Uitslagen[$Sp_nummer]['brt'];
	$Part_tot = $Uitslagen[$Sp_nummer]['partijen'];
	$Spelers[$a]['partijen'] = $Part_tot;
	if ($Brt_tot > 0) {
		$Moy_hulp = number_format($Car_tot / $Brt_tot, 3);
		$Spelers[$a]['moy_nieuw'] = $Moy_hulp;
		$Spelers[$a]['car_nieuw'] = fun_car($Moy_hulp, $Comp_nr, $Org_nr, $Path);
	} else {
		$Spelers[$a]['moy_nieuw'] = $Spelers[$a]['moy_start'];
		$Spelers[$a]['car_nieuw'] = $Spelers[$a]['car_start'];
	}
}
//sorteren op naam
sort($Spelers);		//keystart = 0 !
//var_dump($Spelers);

//toon pagina
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Nieuwe periode</title>
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
	<script src="../PHP/script_competitie.js" defer></script>
	<style type="text/css">
		body {
			width: 900px;
			margin-top: 0px;
		}

		.button:hover {
			border-color: #FFF;
		}

		div.scroll {
			background-color: #FFF;
			width: 890px;
			height: 360px;
			overflow: auto;
		}

		input.large {
			width: 20px;
			height: 20px;
		}

		input.larger {
			width: 30px;
			height: 30px;
		}
	</style>
	<script>
	const Moy_form = <?php echo (int)$Moy_form; ?>;
	const Car_min  = <?php echo (int)$Car_min; ?>;
	
	function printDiv(divName) {
    const printElement = document.getElementById(divName);
    if (!printElement) return;

    // Synchroniseer de actuele waarden naar de HTML-attributen
    const inputs = printElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked) input.setAttribute('checked', 'checked');
            else input.removeAttribute('checked');
        } else if (input.tagName === 'SELECT') {
            const options = input.querySelectorAll('option');
            options.forEach(opt => {
                if (opt.selected) opt.setAttribute('selected', 'selected');
                else opt.removeAttribute('selected');
            });
        } else {
            // Dit is de cruciale stap voor jouw Moyenne en Carambole velden
            input.setAttribute('value', input.value);
        }
    });

    const content = printElement.innerHTML;
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
                    /* Optioneel: verberg input randen in de print als dat mooier is */
                    input { border: none; background: transparent; font-size: inherit; font-family: inherit; }
                </style>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `);
    printWindow.document.close();

    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
}
		
	</script>
</head>

<body>
	<form name="periode" method="post" action="Periode_nieuw03.php">
		<table width="900" border="0">
			<tr>
				<td height="5" width="170" bgcolor="#000000">&nbsp;</td>
				<td width="720" bgcolor="#000000">&nbsp;</td>
			</tr>
			<tr>
				<td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
				<td align="center" valign="middle" bgcolor="#009900" class="kop">
					ClubMatch Online<br>
					<font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
				</td>
			</tr>
			<tr>
				<td height="30" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
					<strong>Van Periode <?php print("$Periode_oud"); ?> naar Periode <?php print("$Periode_nieuw"); ?></strong>
				</td>
			</tr>
			<tr>
				<td align="left" colspan="2">
					<div class="scroll">
						<div id="printableArea">
							<table width="880" border="1">
								<tr>
									<td colspan="7" align="center" class="grootzwart"><strong><?php print("$Comp_naam"); ?></strong></td>
								</tr>
								<tr>
                                	<td colspan="2">&nbsp;</td>
                                    <td align="center" colspan="3" class="zwart"><strong>Resultaten huidige periode</strong></td>
                                    <td align="center" colspan="2" class="zwart"><strong>Voorstel of aanpassen nieuwe periode</strong></td>
                                </tr>
                                <tr>
									<td width="90" align="center" class="zwart"><strong>Aanpassen</strong></td>
									<td width="200" class="zwart"><strong>Speler</strong></td>
									<td width="70" class="zwart"><strong>Partijen</strong></td>
									<td width="100" class="zwart"><strong>Moy_start</strong></td>
									<td width="100" class="zwart"><strong>Car_start</strong></td>
									<td width="140" class="zwart"><strong>Moy_nieuw</strong></td>
									<td width="140" class="zwart"><strong>Car_nieuw</strong></td>
								</tr>
								<?php
								for ($a = 0; $a < $Aantal_spelers; $a++) {
									$Nummer = $Spelers[$a]['spc_nummer'];
									$Naam = $Spelers[$a]['spc_naam'];
									$Partijen = $Spelers[$a]['partijen'];
									$Moy_start = $Spelers[$a]['moy_start'];
									$Car_start = $Spelers[$a]['car_start'];
									$Moy_nieuw = $Spelers[$a]['moy_nieuw'];
									$Car_nieuw = $Spelers[$a]['car_nieuw'];
									
									$Nm_moy = "Moy_speler_" . $Nummer;
									$Nm_car = "Car_speler_" . $Nummer;
								?>
									<tr>
										<td align="center" class="zwart">
											<input type="checkbox" class="large" id="<?php print("$Nummer"); ?>" name="<?php print("$Nummer"); ?>" value="<?php print("$Nummer"); ?>">
										</td>
										<td class="zwart"><?php print("$Naam"); ?></td>
										<td class="zwart"><?php print("$Partijen"); ?></td>
										<td class="zwart"><?php print("$Moy_start"); ?></td>
										<td class="zwart"><?php print("$Car_start"); ?></td>
										<td class="zwart">
                                        <input type="text" 
                                               id="Moyenne_<?php echo $a; ?>" 
                                               name="<?php echo $Nm_moy; ?>" 
                                               value="<?php echo $Moy_nieuw; ?>" 
                                               onclick="this.select();" 
                                               oninput="fun_car(<?php echo $a; ?>);" 
                                               onblur="forceerMinimum(<?php echo $a; ?>);" 
                                               maxlength="7" 
                                               size="5" 
                                               pattern="[0-9]+(\.[0-9]{3})" 
                                               title="Moyenne met 3 decimalen na de punt" 
                                               style="font-size:16px;" 
                                               required />
                                        </td>
                                        
                                        <td class="zwart">
                                            <input type="text" 
                                                   id="Car_<?php echo $a; ?>" 
                                                   name="<?php echo $Nm_car; ?>" 
                                                   value="<?php echo $Car_nieuw; ?>" 
                                                   size="5" 
                                                   style="font-size:16px;" 
                                                   readonly />
                                        </td>
                                        </tr>
								<?php
								}
								?>
							</table>
						</div>
					</div>
				</td>
			</tr>
			<tr>
				<td height="45" colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
					Met een klik op Akkoord wordt er een nieuwe periode aangemaakt en worden de moyennes van de aangevinkte spelers verwerkt in de nieuwe periode.
				</td>
			</tr>
			<tr>
				<td height="50" colspan="2" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Verwerken" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="Competitie_beheer.php">
		<table width="900" border="0">
			<tr>
				<td width="245" align="center" height="45" bgcolor="#006600">
					<input type="submit" style="width:150px; height:40px; background-color:#CCC; color:#000;" class="submit-button" value="Cancel"
						title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
					<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
				</td>
				<td width="245" align="center" bgcolor="#006600">
					<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#000; color:#FFF;"
						onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
				<td width="245" align="center" bgcolor="#006600">
					<input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:24px; font-weight:bold;"
						name="help4" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
						onClick="window.open('../Help/Help_periode.php','Help','width=500,height=300,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
				</td>
				<td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
<script>
function fun_car(index) {
    try {
        const moyInput = document.getElementById("Moyenne_" + index);
        const carInput = document.getElementById("Car_" + index);

        if (!moyInput || !carInput) return;

        let ingevoerdMoy = parseFloat(moyInput.value);

        // Als het veld leeg is of geen getal, caramboles wissen
        if (isNaN(ingevoerdMoy)) {
            carInput.value = "";
            return;
        }

        // Gebruik 0.200 als bodem voor de berekening
        let rekenMoy = Math.max(ingevoerdMoy, 0.200);

        let Car;
        // Check of Moy_form bestaat om crashes te voorkomen
        let huidigeVorm = (typeof Moy_form !== 'undefined') ? Moy_form : 3; 

        switch (huidigeVorm) {
            case 1: Car = Math.round(rekenMoy * 15); break;
            case 2: Car = Math.round(rekenMoy * 20); break;
            case 3: Car = Math.round(rekenMoy * 25); break;
            case 4: Car = Math.round(rekenMoy * 30); break;
            case 5: Car = Math.round(rekenMoy * 40); break;
            case 6: Car = Math.round(rekenMoy * 50); break;
            case 7: Car = Math.round(rekenMoy * 60); break;
            default: Car = Math.round(rekenMoy * 25); break;
        }

        // Check of Car_min bestaat
        let minimumCar = (typeof Car_min !== 'undefined') ? Car_min : 15;
        if (Car < minimumCar) Car = minimumCar;

        carInput.value = Car;
        
    } catch (e) {
        console.error("Fout in fun_car:", e);
    }
}

function forceerMinimum(index) {
    const moyInput = document.getElementById("Moyenne_" + index);
    if (!moyInput) return;

    let val = parseFloat(moyInput.value);

    // Als de waarde lager is dan 0.200 (en het is een getal), corrigeer naar 0.200
    if (!isNaN(val) && val < 0.200) {
        moyInput.value = "0.200";
        // Herbereken caramboles nadat het veld visueel is aangepast
        fun_car(index);
    }
}
</script>
</body>

</html>