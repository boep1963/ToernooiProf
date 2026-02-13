<?php
//© Hans Eekels, versie16-12-2025
//Uitslag check
//Car_sys
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(13) { 
["car_1_gem"]=> string(2) "30" ["car_2_gem"]=> string(2) "25" 
["brt"]=> string(2) "12" 
["hs_1"]=> string(1) "7" ["hs_2"]=> string(1) "1" 
["user_code"]=> string(10) "1000_KYZ@#"
["t_nummer"]=> string(1) "1" 
["poule_nr"]=> string(1) "1" 
["speler_1"]=> string(1) "1" ["speler_2"]=> string(2) "12" 
["car_1_tem"]=> string(2) "30" ["car_2_tem"]=> string(2) "32" 
["uitslag_code"]=> string(3) "3_1" }
*/

//check 
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

if (!isset($_POST['speler_1'])) {
  $bAkkoord = FALSE;
} else {
  $Sp_nummer_1 = $_POST['speler_1'];
  if (filter_var($Sp_nummer_1, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['speler_2'])) {
  $bAkkoord = FALSE;
} else {
  $Sp_nummer_2 = $_POST['speler_2'];
  if (filter_var($Sp_nummer_2, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
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

if (!isset($_POST['car_1_gem'])) {
  $bAkkoord = FALSE;
} else {
  $Car_1_gem = $_POST['car_1_gem'];
  if (filter_var($Car_1_gem, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['car_2_gem'])) {
  $bAkkoord = FALSE;
} else {
  $Car_2_gem = $_POST['car_2_gem'];
  if (filter_var($Car_2_gem, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['car_1_tem'])) {
  $bAkkoord = FALSE;
} else {
  $Car_1_tem = $_POST['car_1_tem'];
  if (filter_var($Car_1_tem, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}
if (!isset($_POST['car_2_tem'])) {
  $bAkkoord = FALSE;
} else {
  $Car_2_tem = $_POST['car_2_tem'];
  if (filter_var($Car_2_tem, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['brt'])) {
  $bAkkoord = FALSE;
} else {
  $Brt = $_POST['brt'];
}

if (!isset($_POST['hs_1'])) {
  $bAkkoord = FALSE;
} else {
  $Hs_1 = $_POST['hs_1'];
  if ($Hs_1 > 0) {
    if (filter_var($Hs_1, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  }
}

if (!isset($_POST['hs_2'])) {
  $bAkkoord = FALSE;
} else {
  $Hs_2 = $_POST['hs_2'];
  if ($Hs_2 > 0) {
    if (filter_var($Hs_2, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  }
}

if (!isset($_POST['uitslag_code'])) {
  $bAkkoord = FALSE;
} else {
  $Uitslag_code = $_POST['uitslag_code'];
}

if (count($_REQUEST) != 13) {
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
//toernooinaam
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
//bepaal ronde
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
//beurtenlimiet ?
$Max_beurten = fun_maxbeurten($Gebruiker_nr, $Toernooi_nr, $Path);

if ($Max_beurten > 0) {
  $bLimiet = TRUE;
} else {
  $bLimiet = FALSE;
}
//namen
$Naam_1 = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer_1, $Path);
$Naam_2 = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp_nummer_2, $Path);

//check uitslag
$bAkkoord = TRUE;
$error_message = "";

if ($bLimiet == TRUE && $Brt > $Max_beurten) {
  $bAkkoord = FALSE;
  $error_message .= "Aantal gebruikte beurten is meer dan de beurtenlimiet die van toepassing is !<br>
	U keert terug om de uitslag te corrigeren.<br><br>";
}

if ($Brt == 0) {
  $bAkkoord = FALSE;
  $error_message .= "Aantal beurten kan niet 0 zijn !<br>
	U keert terug om de uitslag te corrigeren.<br><br>";
}

if ($Car_1_gem > $Car_1_tem) {
  $bAkkoord = FALSE;
  $error_message .= "Aantal gemaakte caramboles van  speler $Naam_1 is meer dan deze speler moet maken !<br>
	U keert terug om de uitslag te corrigeren.<br><br>";
}

if ($Car_2_gem > $Car_2_tem) {
  $bAkkoord = FALSE;
  $error_message .= "Aantal gemaakte caramboles van  speler $Naam_2 is meer dan deze speler moet maken !<br>
	U keert terug om de uitslag te corrigeren.<br><br>";
}

if ($Hs_1 > $Car_1_gem || $Hs_1 * $Brt < $Car_1_gem) {
  $bAkkoord = FALSE;
  $error_message .= "Hoogste serie van  speler $Naam_1 klopt niet !<br>
	U keert terug om de uitslag te corrigeren.<br><br>";
}

if ($Hs_2 > $Car_2_gem || $Hs_2 * $Brt < $Car_2_gem) {
  $bAkkoord = FALSE;
  $error_message .= "Hoogste serie van  speler $Naam_2 klopt niet !<br>
	U keert terug om de uitslag te corrigeren.<br><br>";
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#006600"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
        <td width="340" align="center" valign="middle" bgcolor="#006600">
          <h1>Fout Melding</h1>
        </td>
      </tr>
      <tr>
        <td height="100" colspan="2" bgcolor="#006600">
          <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px;">
            <?php print("$error_message"); ?>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
          <form name="terug" method="post" action="Uitslag_wijzigen01.php">
            <input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
            <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
            <input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
            <input type="hidden" name="car_1_gem" value="<?php print("$Car_1_gem"); ?>">
            <input type="hidden" name="car_2_gem" value="<?php print("$Car_2_gem"); ?>">
            <input type="hidden" name="brt" value="<?php print("$Brt"); ?>">
            <input type="hidden" name="hs_1" value="<?php print("$Hs_1"); ?>">
            <input type="hidden" name="hs_2" value="<?php print("$Hs_2"); ?>">
            <input type="hidden" name="speler_1" value="<?php print("$Sp_nummer_1"); ?>">
            <input type="hidden" name="speler_2" value="<?php print("$Sp_nummer_2"); ?>">
            <input type="hidden" name="uitslag_code" value="<?php print("$Uitslag_code"); ?>">
          </form>
        </td>
      </tr>
      <tr>
        <td height="30" colspan="2" align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//verder
$Moy_1 = number_format(floor($Car_1_gem / $Brt * 1000) / 1000, 3);
$Moy_2 = number_format(floor($Car_2_gem / $Brt * 1000) / 1000, 3);
$PerCar_1 = number_format(($Car_1_gem / $Car_1_tem) * 100, 3);
$PerCar_2 = number_format(($Car_2_gem / $Car_2_tem) * 100, 3);

//punten
$Punten = fun_punten($Gebruiker_nr, $Toernooi_nr, $Car_1_tem, $Car_1_gem, $Car_2_tem, $Car_2_gem, $Path);
$Punten_1 = $Punten[1];
$Punten_2 = $Punten[2];

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Uitslag controleren</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href=".../Figuren/eekels.ico" type="image/x-icon" />
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
  <form name="opslaan" method="post" action="Uitslag_wijzigen03.php">
    <table width="500" border="0">
      <tr>
        <td colspan="4" align="center" valign="middle" bgcolor="#006600">
          <h1>Uitslag controleren</h1>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="4" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="40" colspan="4" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Poule <?php print("$Poule_nr"); ?></strong></td>
      </tr>
      <tr>
        <td height="30" colspan="2" align="center" valign="middle" bgcolor="#009900"><strong><?php print("$Naam_1"); ?></strong></td>
        <td colspan="2" align="center" valign="middle" bgcolor="#009900"><strong><?php print("$Naam_2"); ?></strong></td>
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
          <?php print("$Car_1_gem"); ?>
        </td>
        <td bgcolor="#009900">Car gemaakt</td>
        <td bgcolor="#009900">
          <?php print("$Car_2_gem"); ?>
        </td>
      </tr>
      <tr>
        <td height="30" bgcolor="#009900">Beurten</td>
        <td bgcolor="#009900">
          <?php print("$Brt"); ?>
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
          <?php print("$Hs_1"); ?>
        </td>
        <td bgcolor="#009900">HS</td>
        <td bgcolor="#009900">
          <?php print("$Hs_2"); ?>
        </td>
      </tr>
      <tr>
        <td height="30" bgcolor="#009900">Moyenne</td>
        <td bgcolor="#009900">
          <?php print("$Moy_1"); ?>
        </td>
        <td bgcolor="#009900">Moyenne</td>
        <td bgcolor="#009900">
          <?php print("$Moy_2"); ?>
        </td>
      </tr>
      <tr>
        <td height="30" bgcolor="#009900">Punten</td>
        <td bgcolor="#009900">
          <?php print("$Punten_1"); ?>
        </td>
        <td bgcolor="#009900">Punten</td>
        <td bgcolor="#009900">
          <?php print("$Punten_2"); ?>
        </td>
      </tr>
      <tr>
        <td colspan="4" height="70" align="center" bgcolor="#009900" class="groot">
          <input type="submit" class="submit-button" value="Opslaan" style="width:220px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Uitslag opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
          <input type="hidden" name="car_1_gem" value="<?php print("$Car_1_gem"); ?>">
          <input type="hidden" name="car_2_gem" value="<?php print("$Car_2_gem"); ?>">
          <input type="hidden" name="brt" value="<?php print("$Brt"); ?>">
          <input type="hidden" name="hs_1" value="<?php print("$Hs_1"); ?>">
          <input type="hidden" name="hs_2" value="<?php print("$Hs_2"); ?>">
          <input type="hidden" name="speler_1" value="<?php print("$Sp_nummer_1"); ?>">
          <input type="hidden" name="speler_2" value="<?php print("$Sp_nummer_2"); ?>">
          <input type="hidden" name="punten_1" value="<?php print("$Punten_1"); ?>">
          <input type="hidden" name="punten_2" value="<?php print("$Punten_2"); ?>">
          <input type="hidden" name="uitslag_code" value="<?php print("$Uitslag_code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Uitslag_wijzigen01.php">
    <table width="500">
      <tr>
        <td width="250" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Terug naar uitslag" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
          <input type="hidden" name="car_1_gem" value="<?php print("$Car_1_gem"); ?>">
          <input type="hidden" name="car_2_gem" value="<?php print("$Car_2_gem"); ?>">
          <input type="hidden" name="brt" value="<?php print("$Brt"); ?>">
          <input type="hidden" name="hs_1" value="<?php print("$Hs_1"); ?>">
          <input type="hidden" name="hs_2" value="<?php print("$Hs_2"); ?>">
          <input type="hidden" name="speler_1" value="<?php print("$Sp_nummer_1"); ?>">
          <input type="hidden" name="speler_2" value="<?php print("$Sp_nummer_2"); ?>">
          <input type="hidden" name="uitslag_code" value="<?php print("$Uitslag_code"); ?>">
        </td>
        <td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>