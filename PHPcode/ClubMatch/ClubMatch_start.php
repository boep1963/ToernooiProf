<?php
//© Hans Eekels, versie 2-12-2025
//Startpagina ClubMatch, kiezen, verwijderen
//toegevoegd slides uploaden/deleten
//toegevoegd avatars uploaden
//toegevoegd wijzig aantal tafels
//naar scorebord eruit (is verplaatst naar startpagina)
//inlogdatum registreren en gelijk reminder_send op 0
//toon inlog-code toggle
//Kop aangepast
//Refresh logo aangepast
require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('PHP/Functies_biljarten.php');

$Copy = Date("Y");

$Datum_nu = date('Y-m-d');    //voor inlog-datum

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1002_CRJ@#" }	//of leeg of wat anders

//tijdelijk
$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

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
      $Logo_naam = "Beheer/uploads/Logo_" . $Org_nr . ".jpg";
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
  $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";

  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_competitie.js" defer></script>
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
          <form name="cancel" method="post" action="../Start.php">
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

//inlogdatum opslaan en reminder_send op 0
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "UPDATE bj_organisaties SET date_inlog = '$Datum_nu', reminder_send = '0' WHERE org_nummer = '$Org_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//tijdelijk
/*
    $msg = "ClubMatch gestart met code $Org_nr en gebruiker $Org_naam";
    $headers = "From: info@specialsoftware.nl";
    // send email
    mail("hanseekels@gmail.com", "ClubMatch actief", $msg, $headers);
*/
//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ClubMatch</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 900px;
      margin-top: 10px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
  <script>
    function toggleCode() {
      const div = document.getElementById("toon_code");
      const btn = document.getElementById("Toon");

      if (div.style.display === "none") {
        div.style.display = "block";
        btn.value = "Verberg code";
      } else {
        div.style.display = "none";
        btn.value = "Toon code";
      }
    }

    // bij laden zorgen dat div verborgen is en button-tekst klopt
    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("toon_code").style.display = "none";
      document.getElementById("Toon").value = "Toon code";
    });
  </script>
</head>

<body>
  <table width="900" border="0" bgcolor="#006600">
    <tr>
      <td width="290" height="85" align="left" valign="middle" bgcolor="#006600">
      <img id="logoAfbeelding" src="<?php echo "$Logo_naam"; ?>" width="210" height="105" alt="Logo" />
      </td>
      <td colspan="2" align="center" valign="middle" bgcolor="#006600" class="kop">
        ClubMatch Online<br>
        <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
      </td>
    </tr>
    <tr>
      <td width="290" height="25" align="center" bgcolor="#003300" class="grootwit">
        <strong>Competities</strong>
      </td>
      <td width="290" align="center" bgcolor="#003300" class="grootwit">
        <strong>Leden</strong>
      </td>
      <td align="center" bgcolor="#003300" class="grootwit">
        <strong>Extra</strong>
      </td>
    </tr>
    <tr>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="kies" method="post" action="Competities/Competitie_kies.php">
          <input type="submit" class="submit-button" value="Kies bestaande competitie" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Kies een bestaande competitie" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="kies" method="post" action="Ledenbeheer/Leden_nieuw01.php">
          <input type="submit" class="submit-button" value="Maak nieuw lid aan" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Maak een nieuwlid aan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#003300" class="grootwit">
        <form name="maak" method="post" action="Beheer/logo_uploaden.php">
          <input type="submit" class="submit-button" value="Upload eigen logo" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Upload uw eigen logo" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="maak" method="post" action="Competities/Competitie_nieuw01.php">
          <input type="submit" class="submit-button" value="Maak nieuwe competitie" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Maak een nieuw competitie" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="maak" method="post" action="Ledenbeheer/Leden_wijzig01.php">
          <input type="submit" class="submit-button" value="Wijzig bestaand lid" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig bestaand lid" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#003300" class="grootwit">
        <form name="slideshow" method="post" action="Beheer/Beheer_slideshow.php">
          <input type="submit" class="submit-button" value="Beheer Slideshow" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Upload of verwijder slides" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="wijzig" method="post" action="Competities/Competitie_wijzig01.php">
          <input type="submit" class="submit-button" value="Wijzig bestaande competitie" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig bestaande competitie" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="delete" method="post" action="Ledenbeheer/Leden_overzicht.php">
          <input type="submit" class="submit-button" value="Overzicht leden" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Overzicht leden" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#003300">
        <form name="avatars" method="post" action="Beheer/avatars_start.php">
          <input type="submit" class="submit-button" value="Beheer foto's spelers" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="beheer foto's spelers op scoreborden" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="delete" method="post" action="Competities/Competitie_verwijder01.php">
          <input type="submit" class="submit-button" value="Verwijder competitie" style="width:230px; height:60px; background-color:#F00; color:#FFF; font-size:16px;"
            title="Verwijder bestaande competitie" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td height="70" align="center" valign="middle" bgcolor="#003300">
        <form name="delete" method="post" action="Ledenbeheer/Lid_verwijderen01.php">
          <input type="submit" class="submit-button" value="Verwijder lid" style="width:230px; height:60px; background-color:#F00; color:#FFF; font-size:16px;"
            title="Verwijder bestaand lid" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#003300">
        <form name="wijzignaam" method="post" action="Wijzig_naam01.php">
          <input type="submit" class="submit-button" value="Wijzig naam/tafels/nieuwsbrief" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig naam of aantal tafels" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="70" align="center" valign="middle" bgcolor="#006600">
        <table width="280" border="0">
          <tr>
            <td width="105">
              <input type="button" id="Toon" value="Toon code" style="width:100px; height:30px; background-color:#FC0; color:#000; font-size:14px;" onClick="toggleCode()">
            </td>
            <td width="165" class="grootwit">
              <div id="toon_code" style="display:none; margin:auto;">
                <?php print("$Code"); ?>
              </div>
            </td>
          </tr>
        </table>
      </td>
      <td align="center" valign="middle" bgcolor="#006600">
        <form name="contact" method="post" action="Contact.php">
          <input type="submit" class="submit-button" value="Naar contact" style="width:190px; height:40px; background-color:#FC0; color:#000; font-size:16px;"
            title="Naar contact" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#003300">
        <form name="bediening" method="post" action="Bediening01.php">
          <input type="submit" class="submit-button" value="Wijzig bediening scoreborden" style="width:230px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig bediening (muis of tablet) bij tafels" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="70" align="center" bgcolor="#006600">
        <input type="button" class="submit-button" style="width:230px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
          onClick="location='../Start.php'" title="Uitloggen" value="Uitloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
      </td>
      <td align="center" valign="middle" bgcolor="#006600">
        <input type="button" class="submit-button" style="width:190px; height:40px; background-color:#FC0; color:#000; font-size:16px;" name="help"
          value="Help algemeen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
          onClick="window.open('Help/Help.php','Help','width=1020,height=650,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" bgcolor="#003300">
        <form name="deleteaccount" method="post" action="Account_delete01.php">
          <input type="submit" class="submit-button" value="Verwijder uw account" style="width:230px; height:60px; background-color:#F00; color:#FFF; font-size:16px;"
            title="Verwijder uw account" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
  </table>
</body>

</html>