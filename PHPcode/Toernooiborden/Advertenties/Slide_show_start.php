<?php
//© Hans Eekels, 22-06-2025
//start slide-show op scorebord
//kies slides die gevonden zijn
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../../ToernooiProf/PHP/Functies_toernooi.php');

$Bestanden = array();

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
  $Toernooi_nr = intval($_POST['toernooi_nr']);
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
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
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//bestanden ophalen
$directory = "../../ToernooiProf/Beheer/slideshow/";
if (is_dir($directory)) {
  if ($dh = opendir($directory)) {
    $teller = 0;
    while (($file = readdir($dh)) !== false) {
      // Controleer of het een bestand is en geen directory
      if (is_file($directory . "/" . $file)) {
        // Haal de extensie van het bestand op
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        // Controleer of de extensie .jpg is
        if ($extension == "jpg" || $extension == "JPG") {
          //toevoegen aan $Bestanden
          $Hulp_1 = $file;    //Slide_1000_01 
          if (substr($Hulp_1, 0, 6) == "Slide_") {
            $Hulp_2 = substr($Hulp_1, 6, 4);  //gebr nr
            if (intval($Hulp_2) == $Gebruiker_nr) {
              $teller++;
              $Bestanden[$teller]['naam'] = $file;
            }  //end if = gebruiker
          }  //end if Slide_
        }  //end if is jpg
      }  //end if is dir
    }
    closedir($dh);
  }  //end if open dir
}  //end if dir

/*
var_dump($Bestanden) geeft:
array(4) { 
[1]=> array(1) { ["naam"]=> string(17) "Slide_1001_01.jpg" } 
[2]=> array(1) { ["naam"]=> string(17) "Slide_1001_02.jpg" } 
[3]=> array(1) { ["naam"]=> string(17) "Slide_1001_04.jpg" } 
[4]=> array(1) { ["naam"]=> string(17) "Slide_1001_03.jpg" } }
*/
$Aantal_slides = $teller;
if ($Aantal_slides > 20) {
  $Aantal_slides = 20;
}
$Aantal_regels = ceil($Aantal_slides / 4);

if ($Aantal_slides == 0) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
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
            <strong>Er zijn geen bestanden in de map Slide_show gevonden die getoond kunnen worden.<br>
              Ga terug naar Start.</strong>
          </div>
        </td>
      </tr>
      <tr>
        <td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
          <form name="cancel" method="post" action="../Kies_optie.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar keuze" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar keuze" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
            <input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
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
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Slide-show starten</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body,
    td,
    th {
      font-family: Verdana;
      font-size: 16px;
      color: #FFF;
    }

    h1 {
      font-size: 24px;
    }

    body {
      background-color: #000;
      width: 1200px;
      margin-top: 0px;
      margin-right: auto;
      margin-bottom: 0px;
      margin-left: auto;
    }
  </style>
</head>

<body>
  <form name="slide-show" method="post" action="Slide_show.php">
    <table width="1200" border="0">
      <tr>
        <td height="35" colspan="4" align="center">
          <h1>Slide-show starten</h1>
        </td>
      </tr>
      <tr>
        <td height="34" colspan="4" align="center" valign="middle" bgcolor="#333333">
          <strong>U kunt bij elke slide het vinkje weghalen als u niet wilt dat deze advertentie of tekst in de slide-show wordt meegenomen.<br>
            Onderaan de pagina kunt u aangeven hoeveel tijd (in seconden) tussen de slides moet zitten.</strong>
        </td>
      </tr>
      <?php
      $Teller_a = 0;
      $Teller_b = 0;

      for ($a = 1; $a < $Aantal_regels + 1; $a++) {
      ?>
        <tr>
          <?php
          for ($b = 1; $b < 5; $b++) {
            $Teller_a++;
            if ($Teller_a <= $Aantal_slides) {
              $Img = $Bestanden[$Teller_a]['naam'];
              $Pad = "../../ToernooiProf/Beheer/slideshow/" . $Img;
          ?>
              <td width="300" height="150" align="center" valign="middle"><img src="<?php print("$Pad"); ?>" width="300" height="150"></td>
            <?php
            } else {
            ?>
              <td align="center" valign="middle">&nbsp;</td>
          <?php
            }
          }
          ?>
        </tr>
        <tr>
          <?php
          for ($b = 1; $b < 5; $b++) {
            $Teller_b++;
            if ($Teller_b <= $Aantal_slides) {
          ?>
              <td width="300" bgcolor="#666666">
                <input type="checkbox" style="height:30px; width:30px; font-size:24px;" name="<?php print("$Teller_b"); ?>" checked>
              </td>
            <?php
            } else {
            ?>
              <td width="300" bgcolor="#666666">&nbsp;</td>
          <?php
            }
          }  //end for $b is 4 per regel
          ?>
        </tr>
      <?php
      }  //end for $a is aantal regels
      ?>
      <tr>
        <td height="35" valign="middle" bgcolor="#666666">Kies aantal seconden</td>
        <td bgcolor="#666666">
          <select name="seconden" id="seconden" style="font-size:18px;">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </td>
        <td bgcolor="#666666">
          <input type="hidden" id="str_var" name="str_var" value="<?php print base64_encode(serialize($Bestanden)); ?>" />
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
        </td>
        <td bgcolor="#666666">&nbsp;</td>
      </tr>
      <tr>
        <td colspan="2" align="center" valign="middle" bgcolor="#666666">
          <input type="submit" name="Start" style="height:60px; width:250px; background-color:#060; color:#FFF; font-size:24px;"
            title="Start slide-show" value="Start Slide-show" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
        </td>
        <td colspan="2" align="center" valign="middle" bgcolor="#666666">
          <input type="submit" name="Cancel" style="height:60px; width:250px; background-color:#060; color:#FFF; font-size:24px;"
            title="Cancel" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
        </td>
      </tr>
    </table>
  </form>
</body>

</html>