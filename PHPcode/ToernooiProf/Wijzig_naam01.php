<?php
//© Hans Eekels, versie 14-09-2025
//Wijzig naam organisatie, tafels, nieuwsbrief, openbaar
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

/*
var_dump($_POST) geeft:
array(1) { ["user_code"]=> string(10) "1070_JFM@#" }
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

$Aantal_tafels = fun_aantaltafels($Code, $Path);
$Nieuwsbrief = fun_nieuwsbrief($Code, $Path);

//haal gegevens op mbt openbaarheid
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT * FROM tp_gebruikers WHERE gebruiker_nr = '$Gebruiker_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Openbaar = $resultaat['openbaar'];
    $Loc_naam = $resultaat['loc_naam'];
    $Loc_straat = $resultaat['loc_straat'];
    $Loc_pc = $resultaat['loc_pc'];
    $Loc_plaats = $resultaat['loc_plaats'];
    $Toon_email = $resultaat['toon_email'];
    $Aantal_tafels = $resultaat['aantal_tafels'];
    $Nieuwsbrief = $resultaat['nieuwsbrief'];
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Diversen wijzigen</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 900px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
  <script>
    function toggleOpenbaar() {
      const select = document.getElementById("openbaar");
      const div = document.getElementById("toon_openbaar");
      const inputs = div.querySelectorAll("input");

      if (select.value === "1") {
        div.style.display = "";
        inputs.forEach(inp => inp.setAttribute("required", "")); // verplicht maken
      } else {
        div.style.display = "none";
        inputs.forEach(inp => inp.removeAttribute("required")); // verplichting weg
      }
    }

    // bij laden meteen goed zetten
    document.addEventListener("DOMContentLoaded", toggleOpenbaar);
  </script>
</head>

<body>
  <form name="nieuw" method="post" action="Wijzig_naam02.php">
    <table width="900" border="0">
      <tr>
        <td width="270" height="10" bgcolor="#000000" class="klein">&nbsp;</td>
        <td width="259" bgcolor="#000000" class="klein">&nbsp;</td>
        <td width="357" bgcolor="#000000" class="klein">&nbsp;</td>
      </tr>
      <tr>
        <td height="75" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
        <td colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h2>ToernooiProf Online</h2>
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td colspan="3" height="40" align="center" valign="middle" bgcolor="#006600">
          <h2>Wijzig gegevens</h2>
        </td>
      </tr>
      <tr>
        <td width="270" height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">
          Nieuwe naam organisatie</td>
        <td width="259" align="left" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="naam" style="font-size:16px;"
            minlength="3" maxlength="30" size="25" value="<?php print("$Gebruiker_naam"); ?>" required autofocus>
        </td>
        <td bgcolor="#009900">
          Naam (3 -30 tekens) is verplicht, maar wordt alleen voor contact gebruikt
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">Nieuw aantal tafels:</td>
        <td align="left" bgcolor="#009900">
          <select name="tafels" style="font-size:18px;">
            <?php
            for ($a = 1; $a < 13; $a++) {
              if ($a == $Aantal_tafels) {
            ?>
                <option value="<?php print("$a"); ?>" selected><?php print("$a"); ?></option>
              <?php
              } else {
              ?>
                <option value="<?php print("$a"); ?>"><?php print("$a"); ?></option>
            <?php
              }
            }
            ?>
          </select>
        </td>
        <td align="left" bgcolor="#009900">
          Als u straks partijen gaat toekennen aan tafelnummers, dan wordt het hier opgegeven aantal tafels gebruikt
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">Nieuwsbrief ontvangen ?</td>
        <td align="left" bgcolor="#009900">
          <select name="nieuwsbrief" style="font-size:18px;">
            <?php
            if ($Nieuwsbrief == 1) {
            ?>
              <option value="1" selected>Ja</option>
              <option value="0">Nee</option>
            <?php
            } else {
            ?>
              <option value="1">Ja</option>
              <option value="0" selected>Nee</option>
            <?php
            }
            ?>
          </select>
        </td>
        <td align="left" bgcolor="#009900">
          SpecialSoftware stuurt af en toe een Nieuwsbrief met belangrijke wijzigingen in de programma's
        </td>
      </tr>
      <tr>
        <td width="270" height="170" valign="top" bgcolor="#00CC00">
          <br>
          <select id="openbaar" name="openbaar" tabindex="4" style="font-size:16px;" onChange="toggleOpenbaar()">
            <?php
            if ($Openbaar == 1) {
            ?>
              <option value="1" selected>Toernooi kan openbaar</option>
              <option value="2">Toernooi nooit openbaar</option>
            <?php
            } else {
            ?>
              <option value="1">Toernooi kan openbaar</option>
              <option value="2" selected>Toernooi nooit openbaar</option>
            <?php
            }
            ?>
          </select>
          <br><br><br>
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help4"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('Help/Help_kiesopenbaar.php','Help','width=620,height=500,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
        <td colspan="2" align="center" valign="middle" bgcolor="#00CC00">
          <div id="toon_openbaar">
            <table width="610">
              <tr>
                <td height="25" width="258" bgcolor="#FF3300" class="grootwit">Naam Lokaliteit:</td>
                <td width="340" bgcolor="#FF3300"><input type="text" name="loc_naam" minlength="3" maxlength="30" size="30" value="<?php print("$Loc_naam"); ?>"></td>
              </tr>
              <tr>
                <td height="25" bgcolor="#FF3300" class="grootwit">Straat en nr Lokaliteit:</td>
                <td bgcolor="#FF3300"><input type="text" name="loc_straat" minlength="3" maxlength="30" size="30" value="<?php print("$Loc_straat"); ?>"></td>
              </tr>
              <tr>
                <td height="25" bgcolor="#FF3300" class="grootwit">Postcode Lokaliteit:</td>
                <td bgcolor="#FF3300"><input type="text" name="loc_pc" minlength="6" maxlength="7" size="10" value="<?php print("$Loc_pc"); ?>"></td>
              </tr>
              <tr>
                <td height="25" bgcolor="#FF3300" class="grootwit">Plaats Lokaliteit:</td>
                <td bgcolor="#FF3300"><input type="text" name="loc_plaats" minlength="3" maxlength="30" size="30" value="<?php print("$Loc_plaats"); ?>"></td>
              </tr>
              <tr>
                <td bgcolor="#FF3300" class="grootwit">Toon email van wedstrijdleider voor informatie: </td>
                <td bgcolor="#FF3300">
                  <select id="toon_email" name="toon_email" style="font-size:16px;">
                    <?php
                    if ($Toon_email == 1) {
                    ?>
                      <option value="1" selected>Ja</option>
                      <option value="0">Nee</option>
                    <?php
                    } else {
                    ?>
                      <option value="1">Ja</option>
                      <option value="0" selected>Nee</option>
                    <?php
                    }
                    ?>
                  </select>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
      <tr>
        <td bgcolor="#009900">&nbsp;</td>
        <td colspan="2" height="50" align="center" bgcolor="#009900" class="groot">
          <input type="submit" class="submit-button" value="Wijzigingen akkoord" style="width:250px; height:40px; background-color:#000; color:#FFF; font-size:24px; border-radius: 8px;"
            title="Wijzig gegevens" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="2">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>

      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Toernooi_start.php">
    <table width="900" border="0">
      <tr>
        <td width="270" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px; font-size:24px; border-radius: 8px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td width="620" align="right" bgcolor="#006600">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
      </tr>
    </table>
  </form>
</body>

</html>