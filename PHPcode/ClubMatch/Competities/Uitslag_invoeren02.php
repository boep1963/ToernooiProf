<?php
//© Hans Eekels, versie 04-12-2025
//[check op bezig op scorebord]
//aantal brt invullen bij vast aantal
//Uitslag invoeren stap 2
//Kop gewijzigd
//Keuze datum toegevoegd
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(5) { 
["periode_keuze"]=> string(1) "1" 
["speler_A"]=> string(1) "4" 
["speler_B"]=> string(1) "7" 
["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" }
*/

//optioneel terug uit Uitslag_invoeren03
if (isset($_POST['car_1'])) {
  $Car_1 = intval($_POST['car_1']);
} else {
  $Car_1 = "";
}
if (isset($_POST['car_2'])) {
  $Car_2 = intval($_POST['car_2']);
} else {
  $Car_2 = "";
}
if (isset($_POST['hs_1'])) {
  $Hs_1 = intval($_POST['hs_1']);
} else {
  $Hs_1 = "";
}
if (isset($_POST['hs_2'])) {
  $Hs_2 = intval($_POST['hs_1']);
} else {
  $Hs_2 = "";
}
//beurten hierna

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

if (!isset($_POST['speler_A'])) {
  $bAkkoord = FALSE;
} else {
  $Speler_A = intval($_POST['speler_A']);
  if ($Speler_A > 0) {
    if (filter_var($Speler_A, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  } else {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['speler_B'])) {
  $bAkkoord = FALSE;
} else {
  $Speler_B = intval($_POST['speler_B']);
  if ($Speler_B > 0) {
    if (filter_var($Speler_B, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  } else {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['periode_keuze'])) {
  $bAkkoord = FALSE;
} else {
  $Periode_keuze = intval($_POST['periode_keuze']);
  if ($Periode_keuze > 0) {
    if (filter_var($Periode_keuze, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
      $error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";
    }
  } else {
    $bAkkoord = FALSE;
  }
}

//Beurten
$Brt_sys = fun_vastaantalbeurten($Org_nr, $Comp_nr, $Path);
if ($Brt_sys == 0) {
  $bVastAantalBeurten = FALSE;
  $Brt = "";
} else {
  $bVastAantalBeurten = TRUE;
  $Brt = $Brt_sys;
}

if (isset($_POST['brt'])) {
  $Brt = intval($_POST['brt']);
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

//test op gelijke spelers en test op al tegen elkaar gespeeld
$bKan = TRUE;   //wordt FALSE bij al tegen elkaar gespeeld

//zelfde spelers ?
if ($Speler_A === $Speler_B) {
  $bKan = FALSE;
  $error_message = "U heeft 2 keer dezelfde speler geselecteerd !<br>U keert terug naar de pagina.<br>";
}

//bepaal uitslagcode voor check op bestaan record in bj_uitslag_hulp (dus bezig op scorebord)
//bepaal uitslagcode is periode-spnr1-spnr2
if (strlen($Speler_A) == 1) {
  $A = "00" . $Speler_A;
}
if (strlen($Speler_A) == 2) {
  $A = "0" . $Speler_A;
}
if (strlen($Speler_B) == 1) {
  $B = "00" . $Speler_B;
}
if (strlen($Speler_B) == 2) {
  $B = "0" . $Speler_B;
}

$Uitslag_code_1 = $Periode_keuze . "_" . $A . "_" . $B;
//ook uitslagcode 2
//Uitleg: partij kan begonnen zijn op scorebord met code A-B, doch spelers gewisseld en dan code B-A en toen afgebroken;
//Dus beide Uitslag_codes kunnen gebruikt zijn en beide worden gebruikt om records te vinden
$Uitslag_code_2 = $Periode_keuze . "_" . $B . "_" . $A;

//al tegen elkaar gespeeld ?
//zoeken in uitslagen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //spelers
  $sql = "SELECT * FROM bj_uitslagen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) > 0) {
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $Sp1 = $resultaat['sp_1_nr'];
      $Sp2 = $resultaat['sp_2_nr'];

      if (($Sp1 == $Speler_A && $Sp2 == $Speler_B) || ($Sp2 == $Speler_A && $Sp1 == $Speler_B)) {
        $bKan = FALSE;
        $error_message = "Deze spelers hebben in deze periode al tegen elkaar gespeeld !<br>Kies een andere partij.";
        break;
      }
    }
  }

  //nu check op bezig op scorebord
  $sql = "SELECT * FROM bj_uitslag_hulp 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code_1' OR uitslag_code = '$Uitslag_code_2')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) > 0) {
    $bKan = FALSE;
    $error_message = "Deze partij is al aangemaakt en kan nu niet worden ingevuld !<br>Wacht tot de partij is gespeeld of verwijder de partij via Uitslag verwijderen.";
  }
  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

if ($bKan == FALSE) {
	$Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
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
          <form name="terug" method="post" action="Uitslag_invoeren.php">
            <input type="submit" class="submit-button" value="Terug naar invoer" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
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
$Spelers_naam_1 = fun_spelersnaam_competitie($Speler_A, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);
$Spelers_naam_2 = fun_spelersnaam_competitie($Speler_B, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Uitslag invoeren</title>
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
  <form name="uitslag" method="post" action="Uitslag_invoeren03.php">
    <table width="600" border="0">
      <tr>
        <td width="220" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="4" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Comp_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="40" colspan="4" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <strong>Uitslag invoeren stap 2&nbsp;&nbsp;(Periode <?php print("$Periode_keuze"); ?>)</strong>
        </td>
      </tr>
      <tr>
      	<td height="40" colspan="4" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <label for="speeldatum">&nbsp;Speeldatum:</label>
          <input type="text" id="speeldatum" name="speeldatum" required>
          (klik voor kalender)
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Spelers_naam_1"); ?></strong></td>
        <td colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Spelers_naam_2"); ?></strong></td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Car gemaakt:&nbsp;</td>
        <td width="71" height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">
          <input type="text" name="car_1" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$Car_1"); ?>" tabindex="1" autofocus>
        </td>
        <td align="left" width="218" bgcolor="#009900" class="grootwit">&nbsp;Car gemaakt:&nbsp;</td>
        <td align="left" width="73" bgcolor="#009900" class="grootwit">
          <input type="text" name="car_2" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$Car_2"); ?>" tabindex="4">
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Beurten:&nbsp;</td>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">
          <input type="text" name="brt" size="5" pattern="[0-9]+" min="1" title="Getal" required value="<?php print("$Brt"); ?>" tabindex="2">
        </td>
        <td align="left" bgcolor="#009900">
          <?php
          if ($bVastAantalBeurten == TRUE) {
            print(" (Vast aantal beurten $Brt_sys)");
          }
          ?>
        </td>
        <td align="left" bgcolor="#009900">
          <input type="hidden" name="speler_A" value="<?php print("$Speler_A"); ?>">
          <input type="hidden" name="speler_B" value="<?php print("$Speler_B"); ?>">
          <input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;HS:&nbsp;</td>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">
          <input type="text" name="hs_1" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$Hs_1"); ?>" tabindex="3">
        </td>
        <td align="left" bgcolor="#009900" class="grootwit">&nbsp;HS:&nbsp;</td>
        <td align="left" bgcolor="#009900" class="grootwit">
          <input type="text" name="hs_2" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$Hs_2"); ?>" tabindex="5">
        </td>
      </tr>
      <tr>
        <td height="40" colspan="4" align="center" valign="middle" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Akkoord" style="width:150px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            title="Naar stap 3" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="6">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Competitie_beheer.php">
    <table width="600" border="0">
      <tr>
        <td height="40" width="295" align="left" bgcolor="#009900">&nbsp;
          <input type="submit" class="submit-button" style="width:150px; height:30px; font-size:16px;" title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td width="295" align="right" bgcolor="#009900" class="klein">&copy;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
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

      let startPicker;

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

      // Speeldatum
      startPicker = flatpickr("#speeldatum", {
        ...commonOptions,
	defaultDate: "today"
	});
    })();
  </script>
</body>

</html>