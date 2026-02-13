<?php
//© Hans Eekels, versie 05-11-2025
//Gewijzigde Toernooigegevens opslaan
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

/*
var_dump($_POST) geeft:
array(11) { 
["t_naam"]=> string(20) "Appelflappentoernooi" 
["t_datum"]=> string(12) "Seizoen 2025" 
["startdatum"]=> string(10) "2025-09-15" 
["einddatum"]=> string(10) "2025-12-31" 
['discipline']=> string(1) '1" 1-5
["moy_form"]=> string(1) "3" 
["punten_sys"]=> string(1) "1" 
["min_car"]=> string(1) "7" 
["max_beurten"]=> string(2) "30" 
["openbaar"]=> string(1) "2" 
["t_nummer"]=> string(1) "1" 
["user_code"]=> string(10) "1070_JFM@#" }
}
*/

$Copy = Date("Y");
$Spelers = array();

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

if (!isset($_POST['t_naam'])) {
  $bAkkoord = FALSE;
}

if (!isset($_POST['t_datum'])) {
  $bAkkoord = FALSE;
}

if (!isset($_POST['startdatum'])) {
  $bAkkoord = FALSE;
} else {
  $Start_datum = $_POST['startdatum'];
}

if (!isset($_POST['einddatum'])) {
  $bAkkoord = FALSE;
} else {
  $Eind_datum = $_POST['einddatum'];
}

if (!isset($_POST['discipline'])) {
  $bAkkoord = FALSE;
} else {
  $Discipline = $_POST['discipline'];
  if (filter_var($Discipline, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['moy_form'])) {
  $bAkkoord = FALSE;
} else {
  $Moy_form = $_POST['moy_form'];
  if (filter_var($Moy_form, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['punten_sys'])) {
  $bAkkoord = FALSE;
} else {
  $Punten_sys = $_POST['punten_sys'];
  if (filter_var($Punten_sys, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['min_car'])) {
  $bAkkoord = FALSE;
} else {
  $Min_car = $_POST['min_car'];
}

if (!isset($_POST['max_beurten'])) {
  $bAkkoord = FALSE;
} else {
  $Max_beurten = $_POST['max_beurten'];
}

if (!isset($_POST['openbaar'])) {
  $bAkkoord = FALSE;
} else {
  $Openbaar = $_POST['openbaar'];
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

//verder checks en data escapen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $Naam_hulp_1 = mysqli_real_escape_string($dbh, $_POST['t_naam']);
  $T_naam = htmlspecialchars($Naam_hulp_1, ENT_QUOTES);

  $Naam_hulp_1 = mysqli_real_escape_string($dbh, $_POST['t_datum']);
  $T_datum = htmlspecialchars($Naam_hulp_1, ENT_QUOTES);

  //opslaan
  $sql = "UPDATE tp_data SET t_naam = '$T_naam', t_datum = '$T_datum', datum_start = '$Start_datum', datum_eind = '$Eind_datum', discipline = '$Discipline', 
  t_moy_form = '$Moy_form', t_punten_sys = '$Punten_sys', t_min_car = '$Min_car', t_max_beurten = '$Max_beurten', openbaar = '$Openbaar'
	WHERE gebruiker_nr = '$Gebruiker_nr' AND  t_nummer = '$Toernooi_nr'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//Melding
$error_message = "Gewijzigde Toernooigegevens opgeslagen.<br>U keert terug naar de pagina beheer";
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Toernooigegevens gewijzigd</title>
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
        <h1>Melding</h1>
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
      <td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
        <form name="akkoord" method="post" action="../Spelers_Beheer.php">
          <input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
            title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>