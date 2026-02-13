<?php
//© Hans Eekels, versie 15-12-2025
//Bestaand toernooi wijzigen
//aangepast aan systeem_car
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');
/*
var_dump($_POST) geeft:
array(2) { 
["toernooi"]=> string(1) "1" 
["user_code"]=> string(10) "1070_JFM@#" }
*/

$Copy = Date("Y");

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

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
      $Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['toernooi'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['toernooi'];
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
}
/*
if ($bAkkoord == FALSE) {
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_toernooi.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
          <form name="partijen" method="post" action="../Start.php">
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
*/
//kijk of openbaar op ja staat
//bij ja, dan hier nogmaals keuze openbaar geven
//bij nee, melding
$Openbaar = fun_openbaar($Code, $Path);
$Toernooi_openbaar = $Openbaar[1];      //1 = ja, 2 = nee
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

//toernooigegevens
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
    $T_naam = $resultaat['t_naam'];
    $T_datum = $resultaat['t_datum'];
    $T_start = $resultaat['datum_start'];
    $T_eind = $resultaat['datum_eind'];
	$T_discipline = $resultaat['discipline'];
    $T_systeem = $resultaat['t_car_sys'];
	if ($Toernooi_openbaar == 1) {
      $T_openbaar = $resultaat['openbaar'];
    }

    $Gestart = $resultaat['t_gestart'];
    if ($Gestart == 0) {
      //aanvullend wijzigen mogelijk
	  if ($T_systeem == 1)
	  {
		  $T_moyform = $resultaat['t_moy_form'];
	  }
      $T_punten = $resultaat['t_punten_sys'];
      $T_maxbeurten = $resultaat['t_max_beurten'];
	  $T_mincar = $resultaat['t_min_car'];
    }
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Toernooi wijzigen</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 700px;
    }

    h1 {
      font-size: 30px;
    }

    h2 {
      font-size: 24px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="nieuw" method="post" action="Toernooi_wijzig03.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="75" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
        <td width="434" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h2>ToernooiProf Online</h2>
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600">
          <h2>Wijzig bestaand toernooi</h2>
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Naam (vrije invoer)</td>
        <td align="left" valign="middle" bgcolor="#009900" >
          <input type="text" name="t_naam" size="30" minlength="5" maxlength="30" value="<?php echo $T_naam; ?>" required tabindex="1">
          &nbsp;(min 5 en max 30 tekens)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Datum (vrije invoer)</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <input type="text" name="t_datum" size="30" minlength="5" maxlength="30" value="<?php echo $T_datum; ?>" required tabindex="2">
          &nbsp;(min 5 en max 30 tekens)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Start- en einddatum</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <label for="startdatum">&nbsp;Startdatum:</label>
          <input type="text" id="startdatum" name="startdatum" value="<?php echo $T_start; ?>" required>
          (klik voor kalender)<br>
          <br>
          <label for="einddatum">&nbsp;Einddatum:</label>&nbsp;
          <input type="text" id="einddatum" name="einddatum" value="<?php echo $T_eind; ?>" required>
          (klik voor kalender)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Discipline</td>
        <td align="left" valign="middle" bgcolor="#009900">
        <select name="discipline">
          <?php
          if ($T_discipline == 1) {
          ?>
            <option value="1" selected>Libre</option>
            <option value="2">Bandstoten</option>
            <option value="3">Driebanden klein</option>
            <option value="4">Driebanden groot</option>
            <option value="5">Kader</option>
          <?php
          }
          if ($T_discipline == 2) {
          ?>
           <option value="1">Libre</option>
            <option value="2" selected>Bandstoten</option>
            <option value="3">Driebanden klein</option>
            <option value="4">Driebanden groot</option>
            <option value="5">Kader</option>
          <?php
          }
		  if ($T_discipline == 3) {
		  ?>
			<option value="1">Libre</option>
			<option value="2">Bandstoten</option>
			<option value="3" selected>Driebanden klein</option>
			<option value="4">Driebanden groot</option>
			<option value="5">Kader</option>
		  <?php
		  }
		  if ($T_discipline == 4) {
		  ?>
		   <option value="1">Libre</option>
			<option value="2">Bandstoten</option>
			<option value="3">Driebanden klein</option>
			<option value="4" selected>Driebanden groot</option>
			<option value="5">Kader</option> 
		  <?php
		  }
		  if ($T_discipline == 5) {
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
      <?php
      if ($Gestart == 0)
	  {
      	if ($T_systeem == 1)
		{
			?>
			<tr>
            <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Moyenne-formule</td>
            <td align="left" valign="middle" bgcolor="#009900">
              <select name="moy_form">
              <?php
                if ($T_moyform == 1)
                {
                	?>
                    <option value="1" selected>Aantal car = moyenne x 20</option>
                    <?php
                }
                else
                {
                	?>
					<option value="1">Aantal car = moyenne x 20</option>
                    <?php
                }
                if ($T_moyform == 2)
                {
                	?>
                    <option value="2" selected>Aantal car = moyenne x 25</option>
                    <?php
                }
                else
                {
                	?>
					<option value="2">Aantal car = moyenne x 25</option>
                    <?php
                }
				if ($T_moyform == 3)
                {
                	?>
                    <option value="3" selected>Aantal car = moyenne x 30</option>
                    <?php
                }
                else
                {
                	?>
					<option value="3">Aantal car = moyenne x 30</option>
                    <?php
                }
				if ($T_moyform == 4)
                {
                	?>
                    <option value="4" selected>Aantal car = moyenne x 40</option>
                    <?php
                }
                else
                {
                	?>
					<option value="4">Aantal car = moyenne x 40</option>
                    <?php
                }
				if ($T_moyform == 5)
                {
                	?>
                    <option value="5" selected>Aantal car = moyenne x 50</option>
                    <?php
                }
                else
                {
                	?>
					<option value="5">Aantal car = moyenne x 50</option>
                    <?php
                }
				if ($T_moyform == 6)
                {
                	?>
                    <option value="6" selected>Aantal car = moyenne x 60</option>
                    <?php
                }
                else
                {
                	?>
					<option value="6">Aantal car = moyenne x 60</option>
                    <?php
                }
                ?>
			 </select>
              &nbsp;(Maak uw keuze)
            </td>
          </tr>
          <?php
		}
        //verder
        ?>
        <tr>
          <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Punten-systeem</td>
          <td align="left" valign="middle" bgcolor="#009900">
            <select name="punten_sys">
              <?php
              if ($T_punten == 1) {
              ?>
                <option value="1" selected>Winst 2, Remise 1, Verlies 0</option>
                <option value="2">1 punt per 10% caramboles</option>
                <option value="3">Belgisch systeem</option>
              <?php
              }
              if ($T_punten == 2) {
              ?>
                <option value="1">Winst 2, Remise 1, Verlies 0</option>
                <option value="2" selected>1 punt per 10% caramboles</option>
                <option value="3">Belgisch systeem</option>
              <?php
              }
              if ($T_punten == 3) {
              ?>
                <option value="1">Winst 2, Remise 1, Verlies 0</option>
                <option value="2">1 punt per 10% caramboles</option>
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
                    if ($T_mincar == 5) {
                    ?>
                        <option value="5" selected>Minimaal 5</option>
                        <option value="7">Minimaal 7</option>
                        <option value="10">Minimaal 10</option> <?php
					}
					if ($T_mincar == 7) {
						?>
                        <option value="5">Minimaal 5</option>
                        <option value="7" selected>Minimaal 7</option>
                        <option value="10">Minimaal 10</option>
                    <?php
					}
					if ($T_mincar == 10) {
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

				if ($Key_nr == $T_maxbeurten) {
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
      <?php
      }	//end if al gestar
      ?>

      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Stand openbaar ?</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <?php
          if ($Toernooi_openbaar == 1) {
          ?>
            <select name="openbaar">
              <?php
              if ($T_openbaar == 1) {
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
        <td height="50" align="center" bgcolor="#009900">
          <input type="button" class="submit-button" style="width:150px; height:40px; background-color:#F00; color:#FFF; font-size:14px; border-radius: 8px;" name="help"
            value="Help bij keuzes" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('Help/Help_keuzes.php','Help','width=620,height=600,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
        <td align="center" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Wijzig toernooigegevens" style="width:220px; height:40px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Wijzig gegevens" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="toernooi" value="<?php print("$Toernooi_nr"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Toernooi_start.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" style="width:150px; height:40px; background-color:#666; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#006600">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
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