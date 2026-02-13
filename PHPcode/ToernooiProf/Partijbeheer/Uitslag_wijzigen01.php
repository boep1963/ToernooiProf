<?php
//© Hans Eekels, versie versie 16-12-2025
//Uitslag (handmatig) wijzigen in Planning.php
//Car_sys
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");


/*
var_dump($_POST) geeft bij eerste keer:
array(4 { 
["user_code"]=> string(10) "1000_KYZ@#" 
["t_nummer"]=> string(1) "1" 
["poule_nr"]=> string(1) "1" 
["uitslag_code"]=> string(3) "3_2" }

var_dump($_POST) geeft bij terugkeer:
array(11) { 
["user_code"]=> string(10) "1000_KYZ@#" 
["t_nummer"]=> string(1) "2" 
["poule_nr"]=> string(1) "1" 
["car_1_gem"]=> string(2) "10" ["car_2_gem"]=> string(2) "24" 
["brt"]=> string(2) "30" 
["hs_1"]=> string(1) "2" ["hs_2"]=> string(1) "5" 
["speler_1"]=> string(1) "2" 
["speler_2"]=> string(1) "3" 
["uitslag_code"]=> string(3) "1_1" }

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

if (!isset($_POST['poule_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Poule_nr = $_POST['poule_nr'];
  if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['uitslag_code'])) {
  $bAkkoord = FALSE;
} else {
  $Uitslag_code = $_POST['uitslag_code'];
}

if (isset($_POST['car_1_gem'])) {
  $Car_1_gem = $_POST['car_1_gem'];
}

if (isset($_POST['car_2_gem'])) {
  $Car_2_gem = $_POST['car_2_gem'];
}

if (isset($_POST['brt'])) {
  $Brt = $_POST['brt'];
}

if (isset($_POST['hs_1'])) {
  $HS_1 = $_POST['hs_1'];
}

if (isset($_POST['hs_2'])) {
  $HS_2 = $_POST['hs_2'];
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
//toernooinaam
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
//bepaal ronde
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
//bepaal max beurten
$Max_beurten = fun_maxbeurten($Gebruiker_nr, $Toernooi_nr, $Path);

//haal data op als er geen data zijn doorgegeven (bij terugkeer na fout in controle)
//we checken of er beurten zijn doorgegeven; zo ja dan is er teruggekeerd naar deze pagina
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT * FROM tp_uitslagen WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$Uitslag_code'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    //altijd namen en car_tem
    $Sp_nummer_1 = $resultaat['sp_nummer_1'];
    $Car_1_tem  = $resultaat['sp1_car_tem'];
    $Sp_nummer_2 = $resultaat['sp_nummer_2'];
    $Car_2_tem  = $resultaat['sp2_car_tem'];

    if (!isset($_POST['brt'])) {
      //ook car-gem, brt en hs
      $Car_1_gem = $resultaat['sp1_car_gem'];
      $HS_1 = $resultaat['sp1_hs'];
      $Brt = $resultaat['brt'];
      $Car_2_gem = $resultaat['sp2_car_gem'];
      $HS_2 = $resultaat['sp2_hs'];
    }
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//namen
$Naam_1 = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer_1, $Path);
$Naam_2 = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer_2, $Path);

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Uitslag wijzigen</title>
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
  <form name="uitslag" method="post" action="Uitslag_wijzigen02.php">
    <table width="500" border="0">
      <tr>
        <td colspan="4" align="center" valign="middle" bgcolor="#006600">
          <h1>Uitslag wijzigen</h1>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="4" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="40" colspan="4" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Poule <?php print("$Poule_nr"); ?></strong></td>
      </tr>
      <tr>
        <td height="30" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Naam_1"); ?></strong></td>
        <td colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Naam_2"); ?></strong></td>
      </tr>
      <tr>
        <td height="30" width="126" bgcolor="#009900">Car te maken</td>
        <td width="115" bgcolor="#009900">
          <?php print("$Car_1_tem"); ?>
        </td>
        <td width="126" bgcolor="#009900">Car te maken</td>
        <td width="115" bgcolor="#009900">
          <?php print("$Car_2_tem"); ?>
        </td>
      </tr>
      <tr>
        <td height="30" bgcolor="#009900">Car gemaakt</td>
        <td bgcolor="#009900">
          <input type="text" name="car_1_gem" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$Car_1_gem"); ?>" tabindex="1" autofocus>
        </td>
        <td bgcolor="#009900">Car gemaakt</td>
        <td bgcolor="#009900">
          <input type="text" name="car_2_gem" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$Car_2_gem"); ?>" tabindex="2">
        </td>
      </tr>
      <tr>
        <td height="30" bgcolor="#009900">Beurten</td>
        <td bgcolor="#009900">
          <input type="text" name="brt" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$Brt"); ?>" tabindex="3">
        </td>
        <?php
        if ($Max_beurten > 0) {
        ?>
          <td colspan="2" bgcolor="#009900"><?php print("Max aantal beurten $Max_beurten"); ?></td>
        <?php
        } else {
        ?>
          <td colspan="2" bgcolor="#009900">Geen beurten-limiet</td>
        <?php
        }
        ?>
      </tr>
      <tr>
        <td height="30" bgcolor="#009900">HS</td>
        <td bgcolor="#009900">
          <input type="text" name="hs_1" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$HS_1"); ?>" tabindex="4">
        </td>
        <td bgcolor="#009900">HS</td>
        <td bgcolor="#009900">
          <input type="text" name="hs_2" size="5" pattern="[0-9]+" title="Getal" required value="<?php print("$HS_2"); ?>" tabindex="5">
        </td>
      </tr>
      <tr>
        <td colspan="4" height="70" align="center" bgcolor="#009900" class="groot">
          <input type="submit" class="submit-button" value="Check uitslag" tabindex="6" style="width:220px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Uitslag checken" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
          <input type="hidden" name="speler_1" value="<?php print("$Sp_nummer_1"); ?>">
          <input type="hidden" name="speler_2" value="<?php print("$Sp_nummer_2"); ?>">
          <input type="hidden" name="car_1_tem" value="<?php print("$Car_1_tem"); ?>">
          <input type="hidden" name="car_2_tem" value="<?php print("$Car_2_tem"); ?>">
          <input type="hidden" name="uitslag_code" value="<?php print("$Uitslag_code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Planning.php">
    <table width="500">
      <tr>
        <td width="250" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" value="Cancel" tabindex="7" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Terug naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
        </td>
        <td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>