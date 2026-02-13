<?php
//© Hans Eekels, versie 03-12-2025
//Startpagina voor Toernooi maken, kiezen, verwijderen
//toegevoegd slides uploaden/deleten; code zichtbaar
//scorebord toegnang er uit (naar startscherm verplaatst)
//naast inlogdatum ook reminder_send op 0
//Logo refresh
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Copy = Date("Y");
$Datum_nu = date('Y-m-d');    //voor inlog-datum

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1000_KYZ@#" }	//of leeg of wat anders

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
          <form name="cancel" method="post" action="../Start.php">
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
//inlogdatum opslaan en reminder_send op 0
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "UPDATE tp_gebruikers SET date_inlog = '$Datum_nu', reminder_send = '0' WHERE gebruiker_nr = '$Gebruiker_nr'";
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
    $msg = "ToernooiProf gestart met code $Gebruiker_nr en gebruiker $Gebruiker_naam";
    $headers = "From: info@specialsoftware.nl";
    // send email
    mail("hanseekels@gmail.com", "ToernooiProf actief", $msg, $headers);
*/
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
      width: 1200px;
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
  <table width="1200" border="0">
    <tr>
      <td width="236" height="100" align="center" valign="middle" bgcolor="#006600"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="200" height="100" alt="Logo" /></td>
      <td colspan="3" align="center" valign="middle" bgcolor="#006600">
        <h1>ToernooiProf Online</h1>
      </td>
    </tr>
    <tr>
      <td width="236" height="50" align="center" valign="middle" bgcolor="#006600">
        <form name="contact" method="post" action="Contact.php">
          <input type="submit" value="Naar contact" style="width:200px; height:40px; background-color:#FC0; color:#000; font-size:16px;"
            title="Naar contact" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td width="590" align="center" bgcolor="#006600">
        <h2><?php print("$Gebruiker_naam"); ?></h2>
      </td>
      <td width="127" align="center" valign="middle" bgcolor="#006600">
        <input type="button"
          id="Toon"
          value="Toon code"
          style="width:120px; height:30px; background-color:#FC0; color:#000; font-size:16px;"
          onclick="toggleCode()">
      </td>
      <td width="229" align="center" bgcolor="#006600" class="grootwit">
        <div id="toon_code" style="display:none; margin:auto;">
          Uw code: <?php print("$Code"); ?>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="4" align="center" bgcolor="#006600">
        <table width="1190" border="0">
          <tr>
            <td height="30" colspan="2" align="center" bgcolor="#003300" class="grootwit"><strong>Beheer toernooien</strong></td>
            <td colspan="2" align="center" bgcolor="#009900" class="grootwit"><strong>Beheer programma</strong></td>
          </tr>
          <tr>
            <td width="230" height="70" align="center" valign="middle" bgcolor="#003300">
              <form name="kies" method="post" action="Toernooi_open01.php">
                <input type="submit" class="submit-button" value="Kies bestaand toernooi" style="width:210px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Kies een bestaand toernooi" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td width="356" align="left" valign="middle" bgcolor="#003300" class="grootwit">Kies een eerder aangemaakt toernooi uit de lijst, om verder te gaan met dit toernooi </td>
            <td width="230" align="center" valign="middle" bgcolor="#009900" class="grootwit">
              <form name="maak" method="post" action="Beheer/logo_uploaden.php">
                <input type="submit" class="submit-button" value="Upload eigen logo" style="width:210px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Upload uw eigen logo" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td width="356" align="left" valign="middle" bgcolor="#009900" class="grootwit">Upload eigen logo</td>
          </tr>
          <tr>
            <td height="70" align="center" valign="middle" bgcolor="#003300">
              <form name="maak" method="post" action="Toernooi_nieuw01.php">
                <input type="submit" class="submit-button" value="Maak nieuw toernooi" style="width:210px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Maak een nieuwtoernooi" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td align="left" valign="middle" bgcolor="#003300" class="grootwit">Maak een nieuw toernooi aan en verdeel de deelnemers over een aantal poules</td>
            <td align="center" valign="middle" bgcolor="#009900" class="grootwit">
              <form name="slideshow" method="post" action="Beheer/Beheer_slideshow.php">
                <input type="submit" class="submit-button" value="Beheer Slideshow" style="width:210px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Upload of verwijder slides" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td align="left" valign="middle" bgcolor="#009900" class="grootwit">
              Beheer slideshow
              (een serie mededelingen of advertenties op de scoreborden)</td>
          </tr>
          <tr>
            <td height="70" align="center" valign="middle" bgcolor="#003300">
              <form name="wijzig" method="post" action="Toernooi_wijzig01.php">
                <input type="submit" class="submit-button" value="Wijzig bestaand toernooi" style="width:210px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Wijzig een bestaand toernooi" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td align="left" valign="middle" bgcolor="#003300" class="grootwit">U kunt hier een paar gegevens wijzigen van een toernooi dat al is aangemaakt
            </td>
            <td align="center" valign="middle" bgcolor="#009900">
              <form name="wijzignaam" method="post" action="Wijzig_naam01.php">
                <input type="submit" class="submit-button" value="Wijzigen diversen" style="width:210px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Wijzig naam organisatie of clubnaam" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td align="left" valign="middle" bgcolor="#009900" class="grootwit">
              Wijzig adresgegevens, het aantal tafels, de openbaarheid van uw toernooien en of u de Nieuwsbrief wilt ontvangen
            </td>
          </tr>
          <tr>
            <td height="70" align="center" valign="middle" bgcolor="#003300">
              <form name="delete" method="post" action="Toernooi_delete01.php">
                <input type="submit" class="submit-button" value="Verwijder toernooi" style="width:210px; height:60px; background-color:#F00; color:#FFF; font-size:16px;"
                  title="Verwijder bestaand toernooi" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td align="left" valign="middle" bgcolor="#003300" class="grootwit">
              Verwijder een eerder aangemaakt en afgesloten toernooi<br>
              (NB: u krijgt eerst nog een waarschuwing)
            </td>
            <td align="center" valign="middle" bgcolor="#009900">
              <form name="bediening" method="post" action="Bediening01.php">
                <input type="submit" class="submit-button" value="Wijzig bediening scoreborden" style="width:210px; height:60px; background-color:#000; color:#FFF; font-size:14px;"
                  title="Wijzig bediening (muis of tablet) bij tafels" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td align="left" valign="middle" bgcolor="#009900" class="grootwit">
              Wijzig de bediening van de scoreborden:<br>Met de muis of met een tablet
            </td>
          </tr>
          <tr>
            <td height="70" align="center" valign="middle" bgcolor="#006600">
              <input type="button" style="width:210px; height:60px; background-color:#666; color:#FFF; font-size:16px;"
                onClick="location='../Start.php'" title="Uitloggen" value="Uitloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            </td>
            <td align="center" valign="middle" bgcolor="#006600" class="grootwit">
              <input type="button" style="width:210px; height:60px; background-color:#FC0; color:#000; font-size:16px;" name="help"
                value="Help algemeen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
                onClick="window.open('Help/Help.php','Help','width=1020,height=580,scrollbars=no,toolbar=no,location=no'); return false" />
            </td>
            <td align="center" valign="middle" bgcolor="#009900">
              <form name="deleteaccount" method="post" action="Account_delete01.php">
                <input type="submit" class="submit-button" value="Verwijder account" style="width:210px; height:60px; background-color:#F00; color:#FFF; font-size:16px;"
                  title="Verwijder uw account" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td align="left" valign="middle" bgcolor="#009900" class="grootwit">
              Verwijder uw account<br>
              (NB: u krijgt eerst nog een waarschuwing)
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</script>
</body>

</html>