<?php
//© Hans Eekels, versie 14-09-2025
//Gewijzigde data gebruiker etc opslaan
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(10) { 
	["naam"]=> string(9) "Geen keus" 
	["tafels"]=> string(2) "12" 
	["nieuwsbrief"]=> string(1) "1" 
	["openbaar"]=> string(1) "1" 
		["loc_naam"]=> string(12) "Prinsenhof I" 
		["loc_straat"]=> string(14) "Beatrixlaan 54" 
		["loc_pc"]=> string(7) "1947 HS" 
		["loc_plaats"]=> string(9) "Beverwijk" 
	["toon_email"]=> string(1) "1" 
["user_code"]=> string(10) "1070_JFM@#" }
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

if (!isset($_POST['naam'])) {
  $bAkkoord = FALSE;
} else {
  $Hulp = $_POST['naam'];
  $Naam_nieuw = fun_test_input($Hulp);
}

if (!isset($_POST['tafels'])) {
  $bAkkoord = FALSE;
} else {
  $Aantal_tafels = $_POST['tafels'];
  if (filter_var($Aantal_tafels, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['nieuwsbrief'])) {
  $bAkkoord = FALSE;
} else {
  $Nieuwsbrief = $_POST['nieuwsbrief'];
}

if (!isset($_POST['openbaar'])) {
  $bAkkoord = FALSE;
} else {
  $Openbaar = $_POST['openbaar'];
}

if ($Openbaar == 1) {
  //rest data
  if (isset($_POST['loc_naam'])) {
    $hulp_1 = $_POST['loc_naam'];
    $Loc_naam = htmlspecialchars($hulp_1, ENT_QUOTES);
  } else {
    $bAkkoord = FALSE;
  }

  if (isset($_POST['loc_straat'])) {
    $hulp_1 = $_POST['loc_straat'];
    $Loc_straat = htmlspecialchars($hulp_1, ENT_QUOTES);
  } else {
    $bAkkoord = FALSE;
  }

  if (isset($_POST['loc_pc'])) {
    $hulp_1 = $_POST['loc_pc'];
    $Loc_pc = htmlspecialchars($hulp_1, ENT_QUOTES);
  } else {
    $bAkkoord = FALSE;
  }

  if (isset($_POST['loc_plaats'])) {
    $hulp_1 = $_POST['loc_plaats'];
    $Loc_plaats = htmlspecialchars($hulp_1, ENT_QUOTES);
  } else {
    $bAkkoord = FALSE;
  }

  if (isset($_POST['toon_email'])) {
    $Toon_email = $_POST['toon_email'];
  } else {
    $bAkkoord = FALSE;
  }
} else {
  $Loc_naam = "";
  $Loc_straat = "";
  $Loc_pc = "";
  $Loc_plaats = "";
  $Toon_email = 0;
}
//============

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

//verder, naam escapen  en updaten
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //update in tp_gebruikers
  $sql = "UPDATE tp_gebruikers SET 
  	openbaar = '$Openbaar', gebruiker_naam = '$Naam_nieuw', loc_naam = '$Loc_naam', loc_straat = '$Loc_straat', loc_pc = '$Loc_pc', loc_plaats = '$Loc_plaats', toon_email = '$Toon_email',
	aantal_tafels = '$Aantal_tafels', nieuwsbrief = '$Nieuwsbrief' 
	WHERE gebruiker_nr = '$Gebruiker_nr'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //aanpassen bj_bediening: bij meer tafels dan oud extra records, bij minder dan oud records delete.
  //bepaal aantal records
  $sql = "SELECT * FROM tp_bediening WHERE gebruiker_nr = '$Gebruiker_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $Aantal_records = mysqli_num_rows($res);

  if ($Aantal_records > $Aantal_tafels) {
    //verwijder record van tafel_nr > $Aantal_records
    $sql = "DELETE FROM tp_bediening WHERE gebruiker_nr = '$Gebruiker_nr' AND taf_nr > '$Aantal_tafels'";
    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }

  if ($Aantal_records < $Aantal_tafels) {
    $Verschil = intval($Aantal_tafels) - intval($Aantal_records);    //bij 4 records en 12 tafels is verschil is 8

    //toevoegen 
    for ($a = 1; $a < $Verschil + 1; $a++) {
      $Taf_nr = intval($Aantal_records) + $a;
      $sql = "INSERT INTO tp_bediening (gebruiker_nr, taf_nr, soort) VALUES ('$Gebruiker_nr', '$Taf_nr', '1')";
      $res = mysqli_query($dbh, $sql);
      if (!$res) {
        throw new Exception(mysqli_error($dbh));
      }
    }
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//Melding
$error_message = "Gewijzigde gegevens opgeslagen.<br>U keert terug naar de startpagina";
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Gewijzigde gegevens opgeslagen</title>
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
        <form name="akkoord" method="post" action="Toernooi_start.php">
          <input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
            title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
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