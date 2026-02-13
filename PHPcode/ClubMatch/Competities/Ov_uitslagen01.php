<?php
//© Hans Eekels, versie 04-12-2025
//Overzicht uitslagen: kies start- en einddatum
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

$bAkkoord = TRUE;
$error_message = "";

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

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Overzicht uitslagen</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <script src="../PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 600px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="speler" method="post" action="Ov_uitslagen02.php">
    <table width="600" border="0">
      <tr>
        <td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="4" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Comp_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <strong>Overzicht uitslagen op datum</strong></td>
      </tr>
      <tr>
        <td colspan="3" align="center" bgcolor="#009900" class="grootwit">
          
        </td>
      </tr>
      
       <tr>
        <td height="100" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Start- en einddatum</td>
        <td colspan="2" align="left" valign="middle" bgcolor="#009900">
          <label for="startdatum">&nbsp;Startdatum:</label>
          <input type="text" id="startdatum" name="startdatum" required>
          (klik voor kalender)<br>
          <br><br>
          <label for="einddatum">&nbsp;Einddatum:</label>&nbsp;
          <input type="text" id="einddatum" name="einddatum" required>
          (klik voor kalender)
        </td>
      </tr>
       <tr>
        <td height="10" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;
          
        </td>
      </tr>
      <tr>
        <td height="40" colspan="3" align="center" valign="middle" bgcolor="#009900">
        <input type="submit" class="submit-button" value="Naar overzicht" style="width:170px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
		title="Naar overzicht uitslagen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
		<input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
		<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Competitie_beheer.php">
    <table width="600" border="0">
      <tr>
        <td height="40" width="297" align="left" bgcolor="#009900">&nbsp;
          <input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;" title="Terug" value="Cancel"
            onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </td>
        <td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
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