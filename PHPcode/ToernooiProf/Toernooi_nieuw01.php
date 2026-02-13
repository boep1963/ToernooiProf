<?php
//© Hans Eekels, versie 14-12-2025
//Nieuw toernooi aanmaken
//Dataprikker toegevoegd voor start- en einddatum
//moy_form uitgebreid met moy*50 en moy*60
//systeem car_vrij toegevoegd
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Openbaar = array();
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

if (count($_POST) != 1) {
  $bAkkoord = FALSE;
}

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

//kijk of openbaar op ja staat
//bij ja, dan hier nogmaals keuze openbaar geven
//bij nee, melding
$Openbaar = fun_openbaar($Code, $Path);
$Toernooi_openbaar = $Openbaar[1];      //1 = ja, 2 = nee	(NB $Openbaar[2] betreft email zichtbaar of niet)

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Toernooi aanmaken</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
		margin-top:0px;
	  width: 900px;
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
  <form name="nieuw" method="post" action="Toernooi_nieuw02.php">
    <table width="900" border="0">
      <tr>
        <td width="256" height="75" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
        <td align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h2>ToernooiProf Online</h2>
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="25" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <strong>Maak nieuw toernooi aan</strong>
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Naam (vrije invoer)</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <input type="text" name="t_naam" size="30" minlength="5" maxlength="30" required tabindex="1">
          &nbsp;(min 5 en max 30 tekens)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Datum (vrije invoer)</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <input type="text" name="t_datum" size="30" minlength="5" maxlength="30" required tabindex="2">
          &nbsp;(min 5 en max 30 tekens)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Start- en einddatum</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <label for="startdatum">&nbsp;Startdatum:</label>
          <input type="text" id="startdatum" name="startdatum" required>
          (klik voor kalender)<br>
          <br>
          <label for="einddatum">&nbsp;Einddatum:</label>&nbsp;
          <input type="text" id="einddatum" name="einddatum" required>
          (klik voor kalender)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Discipline:</td>
        <td align="left" valign="middle" bgcolor="#009900">
            <select name="discipline" tabindex="3">
              <option value="1" selected>Libre</option>
              <option value="2">Bandstoten</option>
              <option value="3">Driebanden klein</option>
              <option value="4">Driebanden groot</option>
              <option value="5">Kader</option>
            </select>
        &nbsp;(Maak uw keuze)
        </td>
      </tr>
      <tr>
        <td height="80" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Kies systeem om aantal<br>
        &nbsp;te maken caramboles bij<br>&nbsp;spelers te bepalen</td>
        <td align="left" valign="top" bgcolor="#009900">
        <table width="630" border="1">
        	<tr>
            	<td width="320" height="35" bgcolor="#FF0000">
                <input type="radio" id="formule" name="keuze_sys" value="1" checked>
				<label for="formule">Automatisch op basis van te kiezen formule</label>
                </td>
                <td bgcolor="#FF0000">
                <input type="radio" id="vrij" name="keuze_sys" value="2">
				Te maken
				<label for="vrij">Car: vrij invoeren</label>
                
              per speler</td>
            </tr>
            <tr>
              <td height="40" bgcolor="#009900">
               <div id="moy_form_container">
                <select name="moy_form" id="moy_form">
                <option value="1" selected>Aantal car = moyenne x 20</option>
                <option value="2">Aantal car = moyenne x 25</option>
                <option value="3">Aantal car = moyenne x 30</option>
                <option value="4">Aantal car = moyenne x 40</option>
                <option value="5">Aantal car = moyenne x 50</option>
                <option value="6">Aantal car = moyenne x 60</option>
              	</select>
              	&nbsp;(Maak uw keuze)
                </div>
                </td>
                <td align="center" bgcolor="#009900">Aantal te maken car invoeren per speler</td>
            </tr>
        </table>
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Punten-systeem</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <select name="punten_sys">
            <option value="1" selected>Winst 2, Remise 1, Verlies 0</option>
            <option value="2">1 punt per 10% caramboles</option>
            <option value="3">Belgisch systeem</option>
          </select>
          &nbsp;(Maak uw keuze)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Minimaal aantal caramboles</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <select name="min_car">
            <option value="5">Minimaal 5</option>
            <option value="7" selected>Minimaal 7</option>
            <option value="10">Minimaal 10</option>
          </select>
          &nbsp;(Maak uw keuze)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Maximaal aantal beurten</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <select name="max_beurten">
            <option value="0" selected>Geen maximum</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
            <option value="60">60</option>
          </select>
          &nbsp;(Maak uw keuze)
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Stand openbaar ?</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <?php
          if ($Toernooi_openbaar == 1) {
          ?>
            <select name="openbaar">
              <option value="2">Nee, stand alleen op eigen computer zichtbaar</option>
              <option value="1" selected>Ja, stand kan door iedereen opgevraagd worden</option>
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
          <input type="submit" class="submit-button" value="Maak nieuw toernooi aan" style="width:220px; height:40px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Maak een nieuwtoernooi" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Toernooi_start.php">
    <table width="900" border="0">
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
	
        // 1. Haal de elementen op
        const formuleRadio = document.getElementById('formule');
        const vrijRadio = document.getElementById('vrij');
        // Voor een betere controle van de layout, schakelen we de hele container
        const selectContainer = document.getElementById('moy_form_container'); 
        
        // 2. Functie om de zichtbaarheid te bepalen
        function toggleSelectVisibility() {
            // Controleer of de 'formule'-radiobutton is aangevinkt
            if (formuleRadio.checked) {
                // Toon het element (display: block of display: '')
                selectContainer.style.display = 'block'; 
            } else {
                // Verberg het element (display: none)
                selectContainer.style.display = 'none';
            }
        }
        
        // 3. Event Listeners toevoegen aan beide radiobuttons
        // Zorgt ervoor dat de functie wordt aangeroepen bij elke wijziging
        formuleRadio.addEventListener('change', toggleSelectVisibility);
        vrijRadio.addEventListener('change', toggleSelectVisibility);
        
        // 4. Roep de functie initieel aan
        // Dit is essentieel omdat 'formule' standaard 'checked' is
        // en we willen dat de juiste staat (zichtbaar) direct wordt ingesteld bij het laden van de pagina.
        toggleSelectVisibility();
        
        // Optioneel: Je kunt ook de 'selectContainer' direct verbergen via CSS 
        // en de 'toggleSelectVisibility' functie de weergave laten bepalen op basis van de default 'checked' staat.
        
  </script>
</body>

</html>