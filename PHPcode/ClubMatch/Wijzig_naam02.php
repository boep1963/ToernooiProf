<?php
//© Hans Eekels, versie 02-12-2025
//Gewijzigde org_naam opslaan
//logo refresh
require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('PHP/Functies_biljarten.php');

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(4) { 
["naam"]=> string(21) "Voorbeeld Organisatie" 
["tafels"]=> string(2) "10" 
["nieuwsbrief"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" }
*/

//check en opslaan
$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

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

if (count($_REQUEST) != 4) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
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

//verder
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //update
  $sql = "UPDATE bj_organisaties SET org_naam = '$Naam_nieuw', aantal_tafels = '$Aantal_tafels', nieuwsbrief = '$Nieuwsbrief' WHERE org_nummer = '$Org_nr' AND org_code = '$Code'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //aanpassen bj_bediening: bij meer tafels dan oud extra records, bij minder dan oud records delete.
  //bepaal aantal records
  $sql = "SELECT * FROM bj_bediening WHERE org_nummer = '$Org_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $Aantal_records = mysqli_num_rows($res);

  if ($Aantal_records > $Aantal_tafels) {
    //verwijder record van tafel_nr > $Aantal_records
    $sql = "DELETE FROM bj_bediening WHERE org_nummer = '$Org_nr' AND tafel_nr > '$Aantal_tafels'";
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
      $sql = "INSERT INTO bj_bediening (org_nummer, tafel_nr, soort) VALUES ('$Org_nr', '$Taf_nr', '1')";
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
      <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
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
        <form name="cancel" method="post" action="ClubMatch_start.php">
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