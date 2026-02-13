<?php
//© Hans Eekels, versie 22-06-2025
//Speler zoeken
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Poules = array();
$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(2) { 
["speler_nr"]=> string(1) "2" 		//nummer speler
["t_nummer"]=> string(1) "3" }	//nummer toernooi
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

if (!isset($_POST['speler_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Speler_nr = $_POST['speler_nr'];
  if (filter_var($Speler_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_REQUEST) != 3) {
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
$Naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Speler_nr, $Path);

//zoek spelers-poule in elke ronde
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT * FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Speler_nr' ORDER BY ronde_nr";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $teller = 0;
  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $teller++;
    $Poules[$teller]['poule_nr'] = $resultaat['poule_nr'];
  }

  $Aantal_records = $teller;

  mysqli_free_result($res);

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
  <title>Zoek speler</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 500px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="cancel" method="post" action="../Toernooi_Beheer.php">
    <table width="500" border="0">
      <tr>
        <td width="170" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo" /></td>
        <td width="325" align="right" valign="middle" bgcolor="#006600">
          <?php
          if ($Naam == "Hans Eekels") {
          ?>
            <img src="../Figuren/HansEekels.jpg" width="85" height="85" alt="zoek speler">
          <?php
          } else {
          ?>
            <img src="../Figuren/zoek.jpg" width="85" height="85" alt="zoek speler">
          <?php
          }
          ?>
        </td>
      </tr>
      <tr>
        <td colspan="2" align="center" valign="middle" bgcolor="#009900">
          <h2><?php print("$Toernooi_naam"); ?></h2>
        </td>
      <tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900">
          <h2><?php print("$Naam"); ?></h2>
        </td>
      </tr>
      <tr>
        <td height="70" colspan="2" align="center" valign="top" bgcolor="#009900" class="groot">
          <table width="200" border="0">
            <tr>
              <td height="35" align="center" bgcolor="#009900">
                <h2>Ronde</h2>
              </td>
              <td align="center" bgcolor="#009900">
                <h2>Poule</h2>
              </td>
            </tr>
            <?php
            for ($a = 1; $a < $Aantal_records + 1; $a++) {
              $Pnr = $Poules[$a]['poule_nr'];
            ?>
              <tr>
                <td height="25" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$a"); ?></strong></td>
                <td align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Pnr"); ?></strong></td>
              </tr>
            <?php
            }
            ?>
          </table>
        </td>
      </tr>
      <tr>
        <td width="170" height="45" align="center" bgcolor="#006600">
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