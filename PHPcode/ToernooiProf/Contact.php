<?php
//© Hans Eekels, versie 22-06-2025
//Contact: vraag, suggestie, foutmelding
//Email from toegevoegd
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1002_CRJ@#" }

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

//email ophalen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //update in tp_gebruikers
  $sql = "SELECT tp_wl_email FROM tp_gebruikers WHERE gebruiker_nr = '$Gebruiker_nr' AND gebruiker_code = '$Code'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $email = $resultaat['tp_wl_email'];
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
  <title>Contact-formulier</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="ToernooiProf Online" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 700px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="nieuw" method="post" action="Contact02.php">
    <table width="700" border="0">
      <tr>
        <td width="210" height="75" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
        <td align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h1>ToernooiProf Online</h1>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600">
          <h1>Contactformulier</h1>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td align="left" valign="middle" bgcolor="#009900" class="grootwit">Kies onderwerp:</td>
        <td align="left" valign="middle" bgcolor="#009900">
          <select name="onderwerp">
            <option value="1" selected>Vraag algemeen</option>
            <option value="2">Suggestie voor verbetering of extra functionaliteit</option>
            <option value="3">Melding fout (graag melden bij welke functie of pagina)</option>
          </select>
        </td>
      </tr>
      <tr>
        <td height="200" align="left" valign="middle" bgcolor="#009900" class="grootwit">
          Uw tekst<br>(max 1000 tekens)
        </td>
        <td align="left" valign="top" bgcolor="#009900">
          <textarea id="bericht" onClick="this.select();" name="bericht" rows="13" cols="65" maxlength="1000">Type hier uw bericht</textarea>
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">Uw e-mail adres:</td>
        <td align="center" valign="middle" bgcolor="#009900"><?php print("$email"); ?></td>
      </tr>
      <tr>
        <td colspan="2" height="70" align="center" bgcolor="#009900" class="groot">
          <input type="submit" class="submit-button" value="Verzenden" style="width:200px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig naam" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="2">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="email" value="<?php print("$email"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Toernooi_start.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" style="width:150px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#006600">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
      </tr>
    </table>
  </form>
</body>

</html>