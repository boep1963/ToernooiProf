<?php
//© Hans Eekels, 22-06-2025
//verwijder slides
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

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
      $Logo_naam = "uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (count($_POST) != 1) {
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
$directory = "slideshow/";
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
              $Bestanden[$teller]['nummer'] = substr($file, 11, 2);
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
$Aantal_regels = ceil($Aantal_slides / 5);

if ($Aantal_slides == 0) {
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
          <form name="cancel" method="post" action="Beheer_slideshow.php">
            <input type="submit" class="submit-button" value="Terug naar keuze" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar keuze" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
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
  <title>Slide verwijderen</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
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
      width: 1000px;
      margin-top: 0px;
      margin-right: auto;
      margin-bottom: 0px;
      margin-left: auto;
    }
  </style>
</head>

<body>
  <form name="verwijderen" method="post" action="advertentie_delete02.php">
    <table width="1000" border="0">
      <tr>
        <td width="195" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo" /></td>
        <td colspan="4" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h1>ToernooiProf Online</h1>
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td height="35" colspan="5" align="center" bgcolor="#006600" class="grootwit"><strong>Slides verwijderen: vink de slide(s) aan die verwijderd dienen te worden<strong></td>
      </tr>
      <?php
      $Teller_a = 0;
      $Teller_b = 0;

      for ($a = 1; $a < $Aantal_regels + 1; $a++) {
      ?>
        <tr>
          <?php
          for ($b = 1; $b < 6; $b++) {
            $Teller_a++;
            if ($Teller_a <= $Aantal_slides) {
              $Img = $Bestanden[$Teller_a]['naam'];
              $Pad = "slideshow/" . $Img;
          ?>
              <td width="195" height="97" align="center" valign="middle"><img src="<?php print("$Pad"); ?>" width="195" height="97"></td>
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
          for ($b = 1; $b < 6; $b++) {
            $Teller_b++;
            if ($Teller_b <= $Aantal_slides) {
              $Nummer = $Bestanden[$Teller_b]['nummer'];
          ?>
              <td width="195" bgcolor="#666666">
                <input type="checkbox" style="height:30px; width:30px; font-size:24px;" name="<?php print("$Nummer"); ?>">
              </td>
            <?php
            } else {
            ?>
              <td width="451" bgcolor="#666666">&nbsp;</td>
          <?php
            }
          }  //end for $b is 5 per regel
          ?>
        </tr>
      <?php
      }  //end for $a is aantal regels
      ?>
      <tr>
        <td height="50" colspan="5" align="center" valign="middle" bgcolor="#666666">
          <input type="submit" style="height:40px; width:170px; background-color:#060; color:#FFF; font-size:16px;"
            title="Verwijderen" value="Verwijder slides" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Beheer_slideshow.php">
    <table width="1000">
      <tr>
        <td height="50" colspan="3" align="left" valign="middle" bgcolor="#666666">&nbsp;
          <input type="submit" style="height:40px; width:170px; background-color:#060; color:#FFF; font-size:16px;"
            title="Cancel" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
</body>

</html>