<?php
//© Hans Eekels, versie 14-11-2025
//Nieuw toernooi, data controle en opslaan (met controle op dubbele opslag)
//2 car systemen toegevoegd
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');
$Copy = Date("Y");
/*
nieuw
array(12) { 
["t_naam"]=> string(6) "test 3" 
["t_datum"]=> string(12) "seizoen 2025" 
["startdatum"]=> string(10) "2025-12-01" 
["einddatum"]=> string(10) "2025-12-02" 
["discipline"]=> string(1) "1" 

["keuze_sys"]=> string(1) "1" 
["moy_form"]=> string(1) "1" 

["punten_sys"]=> string(1) "1" 
["min_car"]=> string(1) "7" 
["max_beurten"]=> string(1) "0" 
["openbaar"]=> string(1) "1"
["user_code"]=> string(10) "1024_AHS@#" }

oud
var_dump($_POST) geeft:
array(11) { 
["t_naam"]=> string(18) "Oliebollentoernooi" 
["t_datum"]=> string(12) "Seizoen 2025" 
["startdatum"]=> string(10) "2025-09-15" 
["einddatum"]=> string(10) "2025-09-30" 
['discipline"] => string() "1"
["moy_form"]=> string(1) "3" 
["punten_sys"]=> string(1) "1" 
["min_car"]=> string(1) "7" 
["max_beurten"]=> string(1) "0" 
["openbaar"]=> string(1) "1" 				//bij niet openbaar 2
["user_code"]=> string(10) "1070_JFM@#" }

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
      $Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['t_naam'])) {
  $bAkkoord = FALSE;
} else {
  if (strlen($_POST['t_naam']) < 5) {
    $bAkkoord = FALSE;
    $error_message = "Naam moet uit minimaal 5 tekens bestaan !";
  }
}

if (!isset($_POST['t_datum'])) {
  $bAkkoord = FALSE;
} else {
  if (strlen($_POST['t_datum']) < 5) {
    $bAkkoord = FALSE;
    $error_message = "Datum moet uit minimaal 5 tekens bestaan !";
  }
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

if (!isset($_POST['keuze_sys'])) {
  $bAkkoord = FALSE;
} else {
  $Keuze_sys = $_POST['keuze_sys'];
  if (filter_var($Keuze_sys, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if ($Keuze_sys == 1)	//moy form
{
	if (!isset($_POST['moy_form'])) {
	  $bAkkoord = FALSE;
	} else {
	  $Moy_form = $_POST['moy_form'];
	  if (filter_var($Moy_form, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	  }
	}
}
else
{
	//vrije invoer
	$Moy_form = 0;	//wordt niet gebruikt
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

  //bepaal toernooinummer
  $sql = "SELECT t_nummer FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' ORDER BY t_nummer DESC limit 1";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $Toernooi_nr = 1;
  } else {
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $Toernooi_nr = $resultaat['t_nummer'] + 1;
    }
  }

  //check
  $sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    //opslaan
    $sql = "INSERT INTO tp_data (gebruiker_nr, t_nummer, t_naam, t_datum, datum_start, datum_eind, discipline, t_car_sys, t_moy_form, t_punten_sys, t_min_car, t_max_beurten, t_gestart, t_ronde, openbaar) 
	  VALUES ('$Gebruiker_nr', '$Toernooi_nr', '$T_naam', '$T_datum', '$Start_datum', '$Eind_datum', '$Discipline', '$Keuze_sys', '$Moy_form', '$Punten_sys', '$Min_car', '$Max_beurten', '0', '0', '$Openbaar')";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }  //end if num_rows == 0

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//Melding
$error_message = "Toernooigegevens opgeslagen.<br>U kunt nu spelers gaan invoeren.";
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
        <form name="akkoord" method="post" action="Spelers_Beheer.php">
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