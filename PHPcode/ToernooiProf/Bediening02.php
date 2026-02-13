<?php
//© Hans Eekels, versie 15-09-2025
//Bediening scoreborden opslaan
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Copy = Date("Y");
$Bediening = array();
/*
var_dump($_POST) geeft:
array(9) { ["taf_1"]=> string(1) "2" ["taf_2"]=> string(1) "1" ["taf_3"]=> string(1) "2" ["taf_4"]=> string(1) "1" ["taf_5"]=> string(1) "1" ["taf_6"]=> string(1) "1" ["taf_7"]=> string(1) "1" ["taf_8"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }
*/

//check en opslaan
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
      $Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ToernooiProf</title>
    <meta name="Keywords" content="Biljarten, Competitie, Toernooi, Hans Eekels" />
    <meta name="Description" content="ToernooiProf" />
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
            <input type="submit" class="submit-button" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//keuze per tafel verwerken en daarna updaten in bj_bediening
$Aantal_tafels = fun_aantaltafels($Code, $Path);
for ($a = 1; $a < $Aantal_tafels + 1; $a++) {
  $Hulp = "taf_" . $a;
  $Bediening[$a]['soort'] = $_POST[$Hulp];
}

//verder
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  for ($a = 1; $a < $Aantal_tafels + 1; $a++) {
    $Soort = $Bediening[$a]['soort'];
    //update
    $sql = "UPDATE tp_bediening SET soort = '$Soort' WHERE gebruiker_nr = '$Gebruiker_nr' AND taf_nr = '$a'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//Melding
$error_message = "Bediening per tafel aangepast.<br>U keert terug naar de startpagina";
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ToernooiProf</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ToernooiProf" />
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
        <h1>Melding !</h1>
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
        <form name="cancel" method="post" action="Toernooi_start.php">
          <input type="submit" class="submit-button" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
            title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>