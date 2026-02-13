<?php
//© Hans Eekels, versie 23-06-2025
//Kies bediening tablet of muis
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../../ToernooiProf/PHP/Functies_toernooi.php');

//array(3) { ["user_code"]=> string(10) "1002_CRJ@#" ["toernooi_nr"]=> string(1) "1" ["tafel_nr"]=> string(1) "5" }

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
      $Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['toernooi_nr'];
  $Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['tafel_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Tafel_nr = $_POST['tafel_nr'];
}

if (count($_POST) != 3) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ToernooiProf</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="Toernooi" />
    <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
          <form name="cancel" method="post" action="../../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&nbsp;&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//soort tafel, 1=muis, 2=tablet
$Soort_tafel = fun_soorttafel($Gebruiker_nr, $Tafel_nr, $Path);

if ($Soort_tafel == 1) {
  //naar regulier Toon_tafel met lijst partijen bedienen met muis
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta charset="UTF-8">
    <title>Redirect</title>
    <script type="text/javascript">
      window.onload = function() {
        document.forms[0].submit();
      }
    </script>
  </head>

  <body style="background-color:#333; margin:0;">
    <form method="post" action="Toon_tafel.php">
      <input type="hidden" name="user_code" value="<?php echo $Code; ?>">
      <input type="hidden" name="toernooi_nr" value="<?php echo $Toernooi_nr; ?>">
      <input type="hidden" name="tafel_nr" value="<?php echo $Tafel_nr; ?>">
    </form>
  </body>

  </html>
<?php
  exit;
} else {
  //naar modus wachten op bediening door tablet
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta charset="UTF-8">
    <title>Redirect</title>
    <script type="text/javascript">
      window.onload = function() {
        document.forms[0].submit();
      }
    </script>
  </head>

  <body style="background-color:#333; margin:0;">
    <form method="post" action="Remote/Modus_wachten.php">
      <input type="hidden" name="user_code" value="<?php echo $Code; ?>">
      <input type="hidden" name="toernooi_nr" value="<?php echo $Toernooi_nr; ?>">
      <input type="hidden" name="tafel_nr" value="<?php echo $Tafel_nr; ?>">
    </form>
  </body>

  </html>
<?php
  exit;
}
?>