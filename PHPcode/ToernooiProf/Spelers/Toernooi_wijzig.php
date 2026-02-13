<?php
//© Hans Eekels, versie 05-11-2025
//Toernooi_data wijzigen voor start
//moy_form uitgebreid
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Toernooi = array();
$Beurten = array();
$Openbaar = array();

$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(2) { ["t_nummer"]=> string(1) "3" ["user_code"]=> string(10) "1000_KYZ@#" }
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

if (count($_REQUEST) != 2) {
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

$Openbaar = fun_openbaar($Code, $Path);
$Toernooi_openbaar = $Openbaar[1];			//1 = ja, 2 = nee

//vul max beurten-array
$Beurten[1]['key_nr'] = 0;
$Beurten[1]['val_nr'] = "Geen maximum";
$Beurten[2]['key_nr'] = "10";
$Beurten[2]['val_nr'] = "10";
$Beurten[3]['key_nr'] = "15";
$Beurten[3]['val_nr'] = "15";
$Beurten[4]['key_nr'] = "20";
$Beurten[4]['val_nr'] = "20";
$Beurten[5]['key_nr'] = "25";
$Beurten[5]['val_nr'] = "25";
$Beurten[6]['key_nr'] = "30";
$Beurten[6]['val_nr'] = "30";
$Beurten[7]['key_nr'] = "40";
$Beurten[7]['val_nr'] = "40";
$Beurten[8]['key_nr'] = "50";
$Beurten[8]['val_nr'] = "50";
$Beurten[9]['key_nr'] = "60";
$Beurten[9]['val_nr'] = "60";

//haal data op
try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
		$Toernooi['t_naam'] = $resultaat['t_naam'];
		$Toernooi['t_datum'] = $resultaat['t_datum'];
		$Toernooi['datum_start'] = $resultaat['datum_start'];
		$Toernooi['datum_eind'] = $resultaat['datum_eind'];
		$Toernooi['discipline'] = $resultaat['discipline'];
		$Toernooi['t_moy_form'] = $resultaat['t_moy_form'];
		$Toernooi['t_punten_sys'] = $resultaat['t_punten_sys'];
		$Toernooi['t_min_car'] = $resultaat['t_min_car'];
		$Toernooi['t_max_beurten'] = $resultaat['t_max_beurten'];
		$Toernooi['openbaar'] = $resultaat['openbaar'];
	}

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

//pagain
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Toernooi gegevens wijzigen</title>
	<meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
	<meta name="Description" content="Toernooiprogramma" />
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />

	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

	<script src="../PHP/script_toernooi.js" defer></script>
	<style type="text/css">
		body {
			margin-top:0px;
			width: 700px;
		}

		.button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<form name="wijzig" method="post" action="Toernooi_wijzig01.php">
		<table width="700" border="0">
			<tr>
				<td width="256" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
				<td width="434" align="center" valign="middle" bgcolor="#006600">
					<h1>Toernooi-wijzigen</h1>
				</td>
			</tr>
			<tr>
				<td colspan="2" align="center" bgcolor="#009900" class="grootwit">
					U kunt, voordat u het toernooi hebt gestart, alle onderstaande uitgangspunten aanpassen.</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Naam (vrije invoer)</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<input type="text" onClick="this.select();" name="t_naam" size="30" minlength="5" maxlength="30" tabindex="1" value="<?php print("{$Toernooi['t_naam']}"); ?>">
					&nbsp;(min 5 en max 30 tekens)
				</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Datum (vrije invoer)</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<input type="text" onClick="this.select();" name="t_datum" size="30" minlength="5" maxlength="30" value="<?php print("{$Toernooi['t_datum']}"); ?>" tabindex="1">
					&nbsp;(min 5 en max 30 tekens)
				</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Start- en einddatum</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<label for="startdatum">&nbsp;Startdatum:</label>
					<input type="text" id="startdatum" name="startdatum" value="<?php print("{$Toernooi['datum_start']}"); ?>" required>
					(klik voor kalender)<br>
					<br>
					<label for="einddatum">&nbsp;Einddatum:</label>&nbsp;
					<input type="text" id="einddatum" name="einddatum" value="<?php print("{$Toernooi['datum_eind']}"); ?>" required>
					(klik voor kalender)
				</td>
			</tr>
			<tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Discipline</td>
        <td align="left" valign="middle" bgcolor="#009900">
        <select name="discipline">
          <?php
          if ($Toernooi['discipline'] == 1) {
          ?>
            <option value="1" selected>Libre</option>
            <option value="2">Bandstoten</option>
            <option value="3">Driebanden klein</option>
            <option value="4">Driebanden groot</option>
            <option value="5">Kader</option>
          <?php
          }
          if ($Toernooi['discipline'] == 2) {
          ?>
           <option value="1">Libre</option>
            <option value="2" selected>Bandstoten</option>
            <option value="3">Driebanden klein</option>
            <option value="4">Driebanden groot</option>
            <option value="5">Kader</option>
          <?php
          }
		  if ($Toernooi['discipline'] == 3) {
		  ?>
			<option value="1">Libre</option>
			<option value="2">Bandstoten</option>
			<option value="3" selected>Driebanden klein</option>
			<option value="4">Driebanden groot</option>
			<option value="5">Kader</option>
		  <?php
		  }
		  if ($Toernooi['discipline'] == 4) {
		  ?>
		   <option value="1">Libre</option>
			<option value="2">Bandstoten</option>
			<option value="3">Driebanden klein</option>
			<option value="4" selected>Driebanden groot</option>
			<option value="5">Kader</option> 
		  <?php
		  }
		  if ($Toernooi['discipline'] == 5) {
		  ?>
			<option value="1">Libre</option>
			<option value="2">Bandstoten</option>
			<option value="3">Driebanden klein</option>
			<option value="4">Driebanden groot</option>
			<option value="5" selected>Kader</option>
		  <?php
		  }
		  ?>
		</select>
		&nbsp;(Maak uw keuze)
	  </td>
	</tr>
            
            <tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Moyenne-formule</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<select name="moy_form">
						<?php
						if ($Toernooi['t_moy_form'] == 1) {
						?>
							<option value="1" selected>Aantal car = moyenne x 20</option>
							<option value="2">Aantal car = moyenne x 25</option>
							<option value="3">Aantal car = moyenne x 30</option>
							<option value="4">Aantal car = moyenne x 40</option>
							<option value="5">Aantal car = moyenne x 50</option>
							<option value="6">Aantal car = moyenne x 60</option>
						<?php
						}
						if ($Toernooi['t_moy_form'] == 2) {
						?>
							<option value="1">Aantal car = moyenne x 20</option>
							<option value="2" selected>Aantal car = moyenne x 25</option>
							<option value="3">Aantal car = moyenne x 30</option>
							<option value="4">Aantal car = moyenne x 40</option>
							<option value="5">Aantal car = moyenne x 50</option>
							<option value="6">Aantal car = moyenne x 60</option>
						<?php
						}
						if ($Toernooi['t_moy_form'] == 3) {
						?>
							<option value="1">Aantal car = moyenne x 20</option>
							<option value="2">Aantal car = moyenne x 25</option>
							<option value="3" selected>Aantal car = moyenne x 30</option>
							<option value="4">Aantal car = moyenne x 40</option>
							<option value="5">Aantal car = moyenne x 50</option>
							<option value="6">Aantal car = moyenne x 60</option>
						<?php
						}
						if ($Toernooi['t_moy_form'] == 4) {
						?>
							<option value="1">Aantal car = moyenne x 20</option>
							<option value="2">Aantal car = moyenne x 25</option>
							<option value="3">Aantal car = moyenne x 30</option>
							<option value="4" selected>Aantal car = moyenne x 40</option>
							<option value="5">Aantal car = moyenne x 50</option>
							<option value="6">Aantal car = moyenne x 60</option>
						<?php
						}
						if ($Toernooi['t_moy_form'] == 5) {
						?>
							<option value="1">Aantal car = moyenne x 20</option>
							<option value="2">Aantal car = moyenne x 25</option>
							<option value="3">Aantal car = moyenne x 30</option>
							<option value="4">Aantal car = moyenne x 40</option>
							<option value="5" selected>Aantal car = moyenne x 50</option>
							<option value="6">Aantal car = moyenne x 60</option>
						<?php
						}
						if ($Toernooi['t_moy_form'] == 6) {
						?>
							<option value="1">Aantal car = moyenne x 20</option>
							<option value="2">Aantal car = moyenne x 25</option>
							<option value="3">Aantal car = moyenne x 30</option>
							<option value="4">Aantal car = moyenne x 40</option>
							<option value="5">Aantal car = moyenne x 50</option>
							<option value="6" selected>Aantal car = moyenne x 60</option>
						<?php
						}
						?>
					</select>
					&nbsp;(Maak uw keuze)
				</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Punten-systeem</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<select name="punten_sys">
						<?php
						if ($Toernooi['t_punten_sys'] == 1) {
						?>
							<option value="1" selected>Winst 2, Remise 1, Verlies 0</option>
							<option value="2">1 punt per 10% car</option>
							<option value="3">Belgisch systeem</option>
						<?php
						}
						if ($Toernooi['t_punten_sys'] == 2) {
						?>
							<option value="1">Winst 2, Remise 1, Verlies 0</option>
							<option value="2" selected>1 punt per 10% car</option>
							<option value="3">Belgisch systeem</option>
						<?php
						}
						if ($Toernooi['t_punten_sys'] == 3) {
						?>
							<option value="1">Winst 2, Remise 1, Verlies 0</option>
							<option value="2">1 punt per 10% car</option>
							<option value="3" selected>Belgisch systeem</option>
						<?php
						}
						?>
					</select>
					&nbsp;(Maak uw keuze)
				</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Minimaal aantal caramboles</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<select name="min_car">
						<?php
						if ($Toernooi['t_min_car'] == 5) {
						?>
							<option value="5" selected>Minimaal 5</option>
							<option value="7">Minimaal 7</option>
							<option value="10">Minimaal 10</option> <?php
																}
																if ($Toernooi['t_min_car'] == 7) {
																	?>
							<option value="5">Minimaal 5</option>
							<option value="7" selected>Minimaal 7</option>
							<option value="10">Minimaal 10</option>
						<?php
																}
																if ($Toernooi['t_min_car'] == 10) {
						?>
							<option value="5">Minimaal 5</option>
							<option value="7">Minimaal 7</option>
							<option value="10" selected>Minimaal 10</option>
						<?php
																}
						?>
					</select>
					&nbsp;(Maak uw keuze)
				</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Maximaal aantal beurten</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<select name="max_beurten">
						<?php
						for ($a = 1; $a < 10; $a++) {
							$Key_nr = $Beurten[$a]['key_nr'];
							$Val_nr = $Beurten[$a]['val_nr'];

							if ($Key_nr == $Toernooi['t_max_beurten']) {
						?>
								<option value="<?php print("$Key_nr"); ?>" selected><?php print("$Val_nr"); ?></option>
							<?php
							} else {
							?>
								<option value="<?php print("$Key_nr"); ?>"><?php print("$Val_nr"); ?></option>
						<?php
							}
						}
						?>
					</select>
					&nbsp;(Maak uw keuze)
				</td>
			</tr>
			<tr>
				<td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Stand openbaar ?</td>
				<td align="left" valign="middle" bgcolor="#009900">
					<?php
					if ($Toernooi_openbaar == 1)	//betreft organisatie-keuze nooit openbaar (2) of mogelijk als dat hier wordt gekozen (1)
					{
					?>
						<select name="openbaar">
							<?php
							if ($Toernooi['openbaar'] == 1) {
							?>
								<option value="2">Nee, stand alleen op eigen computer zichtbaar</option>
								<option value="1" selected>Ja, stand kan door iedereen opgevraagd worden</option>
							<?php
							} else {
							?>
								<option value="2" selected>Nee, stand alleen op eigen computer zichtbaar</option>
								<option value="1">Ja, stand kan door iedereen opgevraagd worden</option>
							<?php
							}
							?>
						</select>
					<?php
					} else {
						print("Nee, omdat u eerder bij uw organisatie-gegevens hebt aangegeven dat toernooien niet openbaar zijn. 
						  Dat kunt u daar alsnog wijzigen en dan dit toernooi alsnog ook openbaar maken met de knop 'Stand Openbaar ?' in het Toernooi Beheersscherm nadat u dit toernooi hebt opgeslagen.");
					?>
						<input type="hidden" name="openbaar" value="2">
					<?php
					}
					?>
				</td>
			</tr>
			<tr>
				<td colspan="2" height="70" align="center" bgcolor="#009900">
					<input type="submit" class="submit-button" value="Wijzig gegevens" style="width:220px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Wijzig de toernooige gevens" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
			</tr>
		</table>
	</form>
	<form name="cancel" method="post" action="../Spelers_Beheer.php">
		<table width="700">
			<tr>
				<td height="45" align="center" bgcolor="#006600">
					<input type="submit" class="submit-button" value="Cancel" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
						title="Terug naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
					<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
					<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
				</td>
				<td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</form>
	<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
	<script>
		(function() {
			function keepInView(instance) {
				const cal = instance.calendarContainer;
				if (!cal) return;
				requestAnimationFrame(() => {
					const input = instance.input;
					const iRect = input.getBoundingClientRect();
					const cRect = cal.getBoundingClientRect();
					const vw = document.documentElement.clientWidth || window.innerWidth;
					const margin = 8;

					let left = iRect.left + window.scrollX;
					if (left + cRect.width > vw - margin + window.scrollX) {
						left = Math.max(margin, vw - cRect.width - margin) + window.scrollX;
					}
					const top = iRect.bottom + window.scrollY;

					cal.style.position = 'absolute';
					cal.style.left = left + 'px';
					cal.style.top = top + 'px';
					cal.style.maxWidth = (vw - margin * 2) + 'px';
					cal.style.boxSizing = 'border-box';
				});
			}

			// Nederlandstalige locale
			const nlLocale = {
				weekdays: {
					shorthand: ["zo", "ma", "di", "wo", "do", "vr", "za"],
					longhand: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"]
				},
				months: {
					shorthand: ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
					longhand: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"]
				},
				firstDayOfWeek: 1 // maandag
			};

			let startPicker, endPicker;

			const commonOptions = {
				dateFormat: "Y-m-d",
				locale: nlLocale,
				appendTo: document.body,
				onOpen: function(sel, str, inst) {
					keepInView(inst);
				},
				onReady: function(sel, str, inst) {
					keepInView(inst);
				},
				onMonthChange: function() {
					keepInView(this);
				},
				onYearChange: function() {
					keepInView(this);
				},
				onValueUpdate: function() {
					keepInView(this);
				}
			};

			// Startdatum
			startPicker = flatpickr("#startdatum", {
				...commonOptions,
				onChange: function(selectedDates) {
					if (selectedDates.length) {
						// Einddatum mag niet vóór startdatum
						endPicker.set('minDate', selectedDates[0]);
						if (endPicker.selectedDates[0] && endPicker.selectedDates[0] < selectedDates[0]) {
							endPicker.clear();
						}
					}
				}
			});

			// Einddatum
			endPicker = flatpickr("#einddatum", {
				...commonOptions,
				onChange: function(selectedDates) {
					if (selectedDates.length) {
						// Startdatum mag niet ná einddatum
						startPicker.set('maxDate', selectedDates[0]);
						if (startPicker.selectedDates[0] && startPicker.selectedDates[0] > selectedDates[0]) {
							startPicker.clear();
						}
					}
				}
			});
		})();
	</script>

</body>

</html>