<?php
//© Hans Eekels, versie 22-06-2025
//Naam Speler wijzigen tijdens toernooi: kies speler
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");

$Spelers = array();

/*
var_dump($_POST) geeft:
array(2) { 
["t_nummer"]=> string(1) "1" 
["user_code"]=> string(10) "1000_KYZ@#" }
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

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
      $Logo_naam = "../Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['t_nummer'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['t_nummer'];
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_REQUEST) != 2) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../PHP/script_toernooi.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
          <form name="partijen" method="post" action="../../Start.php">
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
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);

//haal spelers op
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT * FROM tp_spelers WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' ORDER BY sp_naam";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $Aantal_spelers = 0;
  } else {
    $teller = 0;
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $teller++;
      $Spelers[$teller]['sp_nummer'] = $resultaat['sp_nummer'];
      $Spelers[$teller]['naam'] = $resultaat['sp_naam'];
    }
    $Aantal_spelers = $teller;
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
  <title>Kies speler</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
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
  <form name="kies" method="post" action="Naam_wijzigen01.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
        <td width="434" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h1>ToernooiProf Online</h1>
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Kies de gewenste speler in onderstaande lijst:</strong></td>
      </tr>
      <?php
      if ($Aantal_spelers > 0) {
      ?>
        <tr>
          <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
            <select name="speler_nr">
              <?php
              for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
                $Num = $Spelers[$a]['sp_nummer'];
                $Naam = $Spelers[$a]['naam'];
                if ($a == 1) {
              ?>
                  <option value="<?php print("$Num"); ?>" selected><?php print("$Naam"); ?></option>
                <?php
                } else {
                ?>
                  <option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
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
            <input type="submit" class="submit-button" value="Kies speler" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
              title="Kies speler" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
            <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          </td>
        </tr>
      <?php
      } else {
      ?>
        <tr>
          <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
            Geen spelers om te kiezen !<br>
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
  <form name="cancel" method="post" action="../Toernooi_Beheer.php">
    <table width="700">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Terug naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </td>
        <td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>