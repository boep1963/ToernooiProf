<?php
//© Hans Eekels, versie 17-09-2025
//Bestaand toernooi openen om te wijzigen
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Copy = Date("Y");
$Toernooien = array();

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

//haal toernooien op
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' ORDER BY t_nummer DESC";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $Aantal_toernooien = 0;
  } else {
    $teller = 0;
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $teller++;
      $Toernooien[$teller]['nummer'] = $resultaat['t_nummer'];
      $Nm = $resultaat['t_naam'];
      $Dt = $resultaat['t_datum'];
      $Toernooien[$teller]['naam'] = $Nm . " (" . $Dt . ")";
    }
    $Aantal_toernooien = $teller;
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
  <title>Toernooi openen</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
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
  <form name="nieuw" method="post" action="Toernooi_wijzig02.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
        <td width="434" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h1>ToernooiProf Online</h1>
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600">
          <h1>Kies bestaand toernooi</h1>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">Kies het gewenste toernooi in onderstaande lijst:</td>
      </tr>
      <?php
      if ($Aantal_toernooien > 0) {
      ?>
        <tr>
          <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="groot">
            <select name="toernooi" style="font-size:16px">
              <?php
              for ($a = 1; $a < $Aantal_toernooien + 1; $a++) {
                $Num = $Toernooien[$a]['nummer'];
                $Naam = $Toernooien[$a]['naam'];
                if ($a == 1) {
              ?>
                  <option value="<?php print($Num); ?>" selected><?php print($Naam); ?></option>
                <?php
                } else {
                ?>
                  <option value="<?php print($Num); ?>"><?php print($Naam); ?></option>
              <?php
                }
              }
              ?>
            </select>
          </td>
        </tr>
        <tr>
          <td colspan="2" height="40" align="left" valign="middle" bgcolor="#009900">&nbsp;</td>
        </tr>
        <tr>
          <td colspan="2" height="70" align="center" bgcolor="#009900" class="groot">
            <input type="submit" class="submit-button" value="Open gekozen toernooi" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
              title="Maak een nieuwtoernooi" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          </td>
        </tr>
      <?php
      } else {
      ?>
        <tr>
          <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
            Geen toernooien om te openen !<br>Maak eerst een nieuw toernooi aan.
          </td>
        </tr>
        <tr>
          <td colspan="2" height="40" align="left" valign="middle" bgcolor="#009900">&nbsp;</td>
        </tr>
      <?php
      }
      ?>
    </table>
  </form>
  <form name="cancel" method="post" action="Toernooi_start.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" style="width:150px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#006600">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
      </tr>
    </table>
  </form>
</body>

</html>