<?php
//© Hans Eekels, versie 25-12-2025
//Nieuwe competitie invoeren
//Vast aantal beurten toegevoegd, min car uitgebreid
//voorkeur sorteren
//Kop aangepast
//Logo refresh
//Min-car op 3
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

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

if (count($_POST) != 1) {
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

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Nieuwe competitie aanmaken</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      margin-top: 10px;
      width: 900px;
    }

    h2 {
      font-size: 28px;
    }

    input.large {
      width: 20px;
      height: 20px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
  <script>
    function toggleDiv() {
      const select = document.getElementById("Punten");
      const div = document.getElementById("punten_sys");
      const vastbrt = document.getElementById("Vastbrt");

      if (select.value === "1") {
        div.style.display = "";
        vastbrt.style.display = "";
        toggleCheckboxes(); // meteen goedzetten binnenin
      } else {
        div.style.display = "none";
        vastbrt.style.display = "none";
      }
    }

    function toggleCheckboxes() {
      const keuze = document.querySelector('input[name="keuze"]:checked').value;
      const row = document.getElementById("checkboxRow");
      row.style.display = (keuze === "Ja") ? "" : "none";
    }

    // bij laden alles correct zetten
    document.addEventListener("DOMContentLoaded", () => {
      toggleDiv();
    });
  </script>
</head>

<body>
  <form name="competitie" method="post" action="Competitie_nieuw02.php">
    <table width="900" border="0">
      <tr>
        <td width="170" height="75" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="4" align="center" valign="middle" bgcolor="#009900" style="font-size:24px; font-weight:bold">
          Nieuwe competitie aanmaken
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Naam:</strong></td>
        <td colspan="2" align="left" bgcolor="#009900">
          <input type="text" name="Naam" minlength="3" maxlength="30" size="30" title="Max 30 letters" required value="" autofocus tabindex="1" />
        </td>
        <td width="120" align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help1"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_naam.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Datum:</strong></td>
        <td colspan="2" align="left" valign="middle" bgcolor="#009900">
          <input type="text" name="Datum" size="25" minlength="3" maxlength="30" title="Datum of seizoen" required value="" tabindex="2">
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help2"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_datum.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Discipline:</strong></td>
        <td colspan="2" align="left" valign="middle" bgcolor="#009900">
          <select name="Discipline" tabindex="3">
            <option value="1" selected>Libre</option>
            <option value="2">Bandstoten</option>
            <option value="3">Driebanden klein</option>
            <option value="4">Driebanden groot</option>
            <option value="5">Kader</option>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help3"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_discipline.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td width="170" height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Puntentelling:</strong></td>
        <td width="262" align="left" valign="middle" bgcolor="#009900">
          <select id="Punten" name="Punten" tabindex="4" onChange="toggleDiv()">
            <option value="1" selected>Winst 2, Remise 1, Verlies 0</option>
            <option value="2">10 punten systeem</option>
            <option value="3">Belgisch systeem</option>
          </select>
        </td>
        <td height="100" width="330" valign="TOP" align="center" bgcolor="#009900">
          <div id="punten_sys">
            <table width="320" border="1">
              <tr>
                <td align="center" colspan="4">
                  <strong>Extra punt bij spelen boven moyenne?</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <input type="radio" name="keuze" value="Nee" checked onClick="toggleCheckboxes()">
                  <label>Nee</label>
                </td>
                <td colspan="3">Geen extra punten</td>
              </tr>
              <tr>
                <td>
                  <input type="radio" name="keuze" value="Ja" onClick="toggleCheckboxes()">
                  <label>Ja</label>
                </td>
                <td>Bij winst</td>
                <td>Bij remise</td>
                <td>Bij verlies</td>
              </tr>
              <tr id="checkboxRow">
                <td align="center">(vink aan)</td>
                <td align="center" valign="middle">
                  <input type="checkbox" class="large" name="Winst" value="Winst" checked disabled>
                </td>
                <td align="center" valign="middle">
                  <input type="checkbox" class="large" name="Remise" value="Remise">
                </td>
                <td align="center" valign="middle">
                  <input type="checkbox" class="large" name="Verlies" value="Verlies">
                </td>
              </tr>
            </table>
          </div>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help3"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_punten.php','Help','width=520,height=400,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Moy formule</strong></td>
        <td colspan="2" align="left" bgcolor="#009900">
          <select name="Moyform" tabindex="5">
            <option value="1">Aantal te maken car = Moyenne x 15</option>
            <option value="2">Aantal te maken car = Moyenne x 20</option>
            <option value="3">Aantal te maken car = Moyenne x 25</option>
            <option value="4" selected>Aantal te maken car = Moyenne x 30</option>
            <option value="5">Aantal te maken car = Moyenne x 40</option>
            <option value="6">Aantal te maken car = Moyenne x 50</option>
            <option value="7">Aantal te maken car = Moyenne x 60</option>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help4"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_moyform.php','Help','width=420,height=205,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Min aantal car</strong></td>
        <td colspan="2" align="left" bgcolor="#009900">
          <select name="Mincar" tabindex="6">
            <option value="3" selected>3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help5"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_mincar.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Max aantal beurten:</strong></td>
        <td colspan="2" align="left" bgcolor="#009900">
          <select name="Maxbrt" tabindex="7">
            <option value="0">Geen</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="30">30</option>
            <option value="35">35</option>
            <option value="40">40</option>
            <option value="45">45</option>
            <option value="50">50</option>
            <option value="55">55</option>
            <option value="60">60</option>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help6"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_maxbrt.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Vast aantal beurten:</strong></td>
        <td colspan="2" align="left" bgcolor="#009900">
          <select id="Vastbrt" name="Vastbrt" tabindex="8">
            <option value="0">Nee</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="30">30</option>
            <option value="35">35</option>
            <option value="40">40</option>
            <option value="50">50</option>
            <option value="60">60</option>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help6"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_vastbrt.php','Help','width=720,height=550,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="35" align="left" valign="middle" bgcolor="#009900"><strong>&nbsp;Namen sorteren:</strong></td>
        <td colspan="2" align="left" valign="middle" bgcolor="#009900">
          <select name="Sorteren" tabindex="9">
            <option value="1" selected>Op voornaam</option>
            <option value="2">Op achternaam</option>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help6"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_sorteren.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>

      <tr>
        <td height="45" colspan="4" align="center" valign="middle" bgcolor="#009900" class="klein">
          <input type="submit" class="submit-button" value="Opslaan" style="width:120px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            title="Gegevens opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="8">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="../ClubMatch_start.php">
    <table width="900">
      <tr>
        <td width="170" height="30" align="center" bgcolor="#009900">
          <input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="9">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?></td>
      </tr>
    </table>
  </form>
</body>

</html>